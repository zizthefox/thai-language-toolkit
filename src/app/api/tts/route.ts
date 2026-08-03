import { NextRequest, NextResponse } from "next/server";
import { EdgeTtsError, synthesizeSpeech } from "@/lib/edge-tts";

export const maxDuration = 30;

// Thai voices available in Edge TTS
const THAI_VOICES = {
  female: "th-TH-PremwadeeNeural",
  male: "th-TH-NiwatNeural",
};

// Add natural pauses for Thai speech
function addNaturalPauses(text: string): string {
  // Add pauses after common Thai sentence endings and punctuation
  const processed = text
    // Add pause after polite particles (common sentence endings)
    .replace(/(ค่ะ|ครับ|คะ|นะคะ|นะครับ)(\s|$)/g, "$1 ... $2")
    // Add pause after Thai question marks and exclamation
    .replace(/([?!？！])/g, "$1 ... ")
    // Add pause after Thai period-equivalents (spaces often act as breaks)
    .replace(/(\s{2,})/g, " ... ");

  return processed;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "female" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const selectedVoice = THAI_VOICES[voice as keyof typeof THAI_VOICES] || THAI_VOICES.female;

    // Add natural pauses for learner-friendly speech
    const processedText = addNaturalPauses(text);

    const audioBuffer = await synthesizeSpeech({
      text: processedText,
      voice: selectedVoice,
      lang: "th-TH",
      rate: "-20%", // Slower for beginners to follow along
    });

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);

    if (error instanceof EdgeTtsError) {
      // Surface something the UI can show instead of failing silently.
      return NextResponse.json(
        {
          error: error.isHandshakeRejected
            ? "The speech service rejected this app's client version. Pronunciation is unavailable until it's updated."
            : "Could not generate pronunciation audio. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
