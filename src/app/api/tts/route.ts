import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Thai voices available in Edge TTS (same as Streamlit app!)
const THAI_VOICES = {
  female1: "th-TH-PremwadeeNeural",
  female2: "th-TH-AcharaNeural",
  male: "th-TH-NiwatNeural",
};

// Add natural pauses for Thai speech
function addNaturalPauses(text: string): string {
  // Add pauses after common Thai sentence endings and punctuation
  let processed = text
    // Add pause after polite particles (common sentence endings)
    .replace(/(ค่ะ|ครับ|คะ|นะคะ|นะครับ)(\s|$)/g, "$1 ... $2")
    // Add pause after Thai question marks and exclamation
    .replace(/([?!？！])/g, "$1 ... ")
    // Add pause after Thai period-equivalents (spaces often act as breaks)
    .replace(/(\s{2,})/g, " ... ");

  return processed;
}

export async function POST(req: NextRequest) {
  const tempFile = join(tmpdir(), `tts-${randomUUID()}.mp3`);

  try {
    const { text, voice = "female1" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const selectedVoice = THAI_VOICES[voice as keyof typeof THAI_VOICES] || THAI_VOICES.female1;

    // Add natural pauses for learner-friendly speech
    const processedText = addNaturalPauses(text);

    // Use Edge TTS - same natural Thai voices as your Streamlit app!
    const tts = new EdgeTTS({
      voice: selectedVoice,
      lang: "th-TH",
      rate: "-20%",   // Slower for beginners to follow along
      pitch: "default",
    });

    // Generate audio to temp file
    await tts.ttsPromise(processedText, tempFile);

    // Read the file
    const audioBuffer = await readFile(tempFile);

    // Clean up temp file
    await unlink(tempFile).catch(() => {});

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempFile).catch(() => {});

    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
