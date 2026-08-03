import { createHash, randomBytes } from "crypto";
import { WebSocket } from "ws";

/**
 * Minimal client for Microsoft Edge's "read aloud" speech endpoint.
 *
 * Vendored rather than taken from a package so the Chromium version below is
 * ours to bump. Synthesis happens entirely in memory — no temp files.
 */

/**
 * Microsoft rejects the WebSocket handshake with a 403 unless the client
 * identifies as a recent Chromium build. When they raise the minimum, every
 * request fails at once and the only user-visible symptom is silence.
 *
 * If speech stops working, bump this to a current Edge/Chromium release
 * (https://chromiumdash.appspot.com/releases?platform=Windows) — that is
 * almost always the entire fix.
 */
export const EDGE_CHROMIUM_VERSION = "143.0.3650.75";

/** Public token Edge itself uses; not a secret and not account-linked. */
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";

const SYNTHESIS_HOST = "speech.platform.bing.com";
const SYNTHESIS_PATH = "/consumer/speech/synthesize/readaloud/edge/v1";
const EDGE_EXTENSION_ORIGIN = "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold";
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

/** Seconds between the Unix epoch and the Windows FILETIME epoch. */
const WINDOWS_FILE_TIME_EPOCH_SECONDS = 11644473600;

// BigInt(...) rather than `n` literals: this project compiles at an ES2017 target.
/** 100-nanosecond ticks per second — the FILETIME unit. */
const TICKS_PER_SECOND = BigInt(10_000_000);
/** Tokens are valid for a 5-minute window; ticks are rounded down to it. */
const TOKEN_WINDOW_TICKS = BigInt(3_000_000_000);

const DEFAULT_TIMEOUT_MS = 15000;

export interface SynthesisOptions {
  text: string;
  voice: string;
  lang: string;
  /** SSML prosody values, e.g. "-20%", "default". */
  rate?: string;
  pitch?: string;
  volume?: string;
  timeoutMs?: number;
}

export class EdgeTtsError extends Error {
  /**
   * True when the handshake was refused outright — nearly always a stale
   * EDGE_CHROMIUM_VERSION rather than anything wrong with the request.
   */
  readonly isHandshakeRejected: boolean;

  constructor(message: string, options: { isHandshakeRejected?: boolean; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "EdgeTtsError";
    this.isHandshakeRejected = options.isHandshakeRejected ?? false;
  }
}

/**
 * Build the Sec-MS-GEC token: SHA-256 of the current time as Windows FILETIME
 * ticks, rounded down to a 5-minute window, concatenated with the client token.
 *
 * A machine clock more than ~5 minutes off will produce a token the server
 * rejects.
 */
function generateSecMsGecToken(): string {
  const ticks =
    BigInt(Math.floor(Date.now() / 1000 + WINDOWS_FILE_TIME_EPOCH_SECONDS)) * TICKS_PER_SECOND;
  const roundedTicks = ticks - (ticks % TOKEN_WINDOW_TICKS);

  return createHash("sha256")
    .update(`${roundedTicks}${TRUSTED_CLIENT_TOKEN}`, "ascii")
    .digest("hex")
    .toUpperCase();
}

function buildSynthesisUrl(): string {
  const params = new URLSearchParams({
    TrustedClientToken: TRUSTED_CLIENT_TOKEN,
    "Sec-MS-GEC": generateSecMsGecToken(),
    "Sec-MS-GEC-Version": `1-${EDGE_CHROMIUM_VERSION}`,
  });

  return `wss://${SYNTHESIS_HOST}${SYNTHESIS_PATH}?${params.toString()}`;
}

function buildUserAgent(): string {
  const major = EDGE_CHROMIUM_VERSION.split(".")[0];

  return (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    `Chrome/${major}.0.0.0 Safari/537.36 Edg/${major}.0.0.0`
  );
}

/** Escape text before interpolating it into SSML, so `&` and `<` can't break the document. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml({ text, voice, lang, rate, pitch, volume }: Required<
  Omit<SynthesisOptions, "timeoutMs">
>): string {
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${voice}">` +
    `<prosody rate="${rate}" pitch="${pitch}" volume="${volume}">${escapeXml(text)}</prosody>` +
    `</voice></speak>`
  );
}

/**
 * Extract the audio payload from a binary frame.
 *
 * Frame layout: a 2-byte big-endian header length, the ASCII headers, then the
 * raw audio. Frames that aren't audio (or are truncated) yield null.
 */
function extractAudioPayload(frame: Buffer): Buffer | null {
  if (frame.length < 2) return null;

  const headerLength = frame.readUInt16BE(0);
  const headerEnd = 2 + headerLength;
  if (headerEnd > frame.length) return null;

  const headers = frame.subarray(2, headerEnd).toString("ascii");
  if (!headers.includes("Path:audio")) return null;

  return frame.subarray(headerEnd);
}

/** Synthesize `text` to MP3 bytes. Rejects with EdgeTtsError on any failure. */
export function synthesizeSpeech(options: SynthesisOptions): Promise<Buffer> {
  const {
    text,
    voice,
    lang,
    rate = "default",
    pitch = "default",
    volume = "default",
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  return new Promise<Buffer>((resolve, reject) => {
    const socket = new WebSocket(buildSynthesisUrl(), {
      host: SYNTHESIS_HOST,
      origin: EDGE_EXTENSION_ORIGIN,
      headers: { "User-Agent": buildUserAgent() },
    });

    const chunks: Buffer[] = [];
    let settled = false;

    const finish = (error: EdgeTtsError | null, audio?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.close();

      if (error) reject(error);
      else resolve(audio as Buffer);
    };

    const timer = setTimeout(
      () => finish(new EdgeTtsError(`Speech synthesis timed out after ${timeoutMs}ms`)),
      timeoutMs
    );

    socket.on("open", () => {
      socket.send(
        "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n" +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: "false",
                    wordBoundaryEnabled: "false",
                  },
                  outputFormat: OUTPUT_FORMAT,
                },
              },
            },
          })
      );

      const requestId = randomBytes(16).toString("hex");
      socket.send(
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n` +
          buildSsml({ text, voice, lang, rate, pitch, volume })
      );
    });

    socket.on("message", (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        const payload = extractAudioPayload(data);
        if (payload) chunks.push(payload);
        return;
      }

      if (data.toString().includes("Path:turn.end")) {
        const audio = Buffer.concat(chunks);
        if (audio.length === 0) {
          finish(new EdgeTtsError("Speech service returned no audio"));
          return;
        }
        finish(null, audio);
      }
    });

    socket.on("error", (error: Error) => {
      // ws surfaces a refused handshake as "Unexpected server response: 403".
      const isHandshakeRejected = /Unexpected server response: (401|403)/.test(error.message);

      finish(
        new EdgeTtsError(
          isHandshakeRejected
            ? `Speech service refused the connection (${error.message}). ` +
              `EDGE_CHROMIUM_VERSION (${EDGE_CHROMIUM_VERSION}) is probably out of date.`
            : `Speech service connection failed: ${error.message}`,
          { isHandshakeRejected, cause: error }
        )
      );
    });

    socket.on("close", () => {
      finish(new EdgeTtsError("Speech service closed the connection before finishing"));
    });
  });
}
