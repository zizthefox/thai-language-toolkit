import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

const openai = new OpenAI();

function getSystemPrompt(gender: "male" | "female") {
  const isMale = gender === "male";
  const pronoun = isMale ? "ผม (phom)" : "ฉัน (chan)";
  const particle = isMale ? "ครับ (khrap)" : "ค่ะ (kha)";
  const examplePronoun = isMale ? "ผม" : "ฉัน";
  const examplePronounRoman = isMale ? "phom" : "chan";
  const exampleParticle = isMale ? "ครับ" : "ค่ะ";
  const exampleParticleRoman = isMale ? "khrap" : "kha";
  const genderLabel = isMale ? "male" : "female";

  return `You are a Thai language expert and teacher. Your task is to analyze text, break it down word by word, and explain how Thai sentence structure differs from English.

IMPORTANT: The speaker is ${genderLabel}. Use ${pronoun} for "I" and ${particle} for polite particles.

IMPORTANT: The input can be in Thai OR English.
- If the input is in English, first translate it to natural Thai using ${genderLabel}-appropriate pronouns and particles, then break down that Thai text.
- If the input is in Thai, break it down directly.

For each word, provide:
1. thai: The Thai word
2. romanization: Standard Thai romanization (use common systems like RTGS)
3. pos: Part of speech (noun, verb, adjective, adverb, particle, classifier, pronoun, preposition, conjunction, etc.)
4. english: English translation

Also provide a structure comparison to help learners understand how Thai differs from English.

Return your response as valid JSON with this exact structure:
{
  "inputWasThai": false,
  "thaiSentence": "${examplePronoun}อยากกินผัดไทย${exampleParticle}",
  "sentenceRomanization": "${examplePronounRoman} yak kin phat thai ${exampleParticleRoman}",
  "words": [
    {"thai": "${examplePronoun}", "romanization": "${examplePronounRoman}", "pos": "pronoun", "english": "I (${genderLabel})"},
    {"thai": "อยาก", "romanization": "yak", "pos": "verb", "english": "want"},
    {"thai": "กิน", "romanization": "kin", "pos": "verb", "english": "eat"},
    {"thai": "ผัดไทย", "romanization": "phat thai", "pos": "noun", "english": "pad thai"},
    {"thai": "${exampleParticle}", "romanization": "${exampleParticleRoman}", "pos": "particle", "english": "(polite particle, ${genderLabel})"}
  ],
  "fullTranslation": "I want to eat pad thai (polite, ${genderLabel} speaker)",
  "structureComparison": {
    "english": "I want to eat pad thai",
    "literal": "I want eat pad-thai (polite)",
    "wordOrder": [
      {"english": "I", "thai": "${examplePronoun}", "romanization": "${examplePronounRoman}", "pos": "pronoun"},
      {"english": "want", "thai": "อยาก", "romanization": "yak", "pos": "verb"},
      {"english": "eat", "thai": "กิน", "romanization": "kin", "pos": "verb"},
      {"english": "pad thai", "thai": "ผัดไทย", "romanization": "phat thai", "pos": "noun"},
      {"english": "(polite)", "thai": "${exampleParticle}", "romanization": "${exampleParticleRoman}", "pos": "particle"}
    ]
  }
}

IMPORTANT RULES:
1. Set inputWasThai to true if the original input was Thai, false if it was English
2. thaiSentence should contain the Thai version (original if Thai input, translated if English input)
3. Segment the Thai text into individual words properly (Thai has no spaces between words)
4. Include particles, classifiers, and function words as separate entries
5. Use lowercase for romanization
6. Keep POS tags simple and consistent (noun, verb, adjective, adverb, particle, classifier, pronoun, preposition, conjunction, interjection, number)
7. For the fullTranslation, provide a natural English translation
8. The structureComparison wordOrder MUST:
   - Be in the EXACT same order as the words array (Thai word order)
   - Have one entry for each word in the words array
   - Include "romanization" field with the pronunciation for each Thai word (matching the words array)
   - The "english" field should be the literal word-by-word translation of each Thai word
   - When all wordOrder.english values are read in sequence, they should form the "literal" string
9. The "literal" field should be constructed by joining all wordOrder.english values (the word-by-word translation following Thai structure)
10. Return ONLY valid JSON, no markdown or extra formatting
11. CRITICAL: When the input contains "I" or first-person references, use ${examplePronoun} (${examplePronounRoman}) for the ${genderLabel} speaker
12. CRITICAL: When adding polite particles, use ${exampleParticle} (${exampleParticleRoman}) for the ${genderLabel} speaker`;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("[Breakdown API] Request received");

  try {
    const { text, gender = "male" } = await req.json();
    console.log("[Breakdown API] Input:", { textLength: text?.length, gender });

    if (!text || !text.trim()) {
      console.log("[Breakdown API] Error: Empty text");
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const validGender = gender === "female" ? "female" : "male";

    console.log("[Breakdown API] Calling OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(validGender) },
        { role: "user", content: text.trim() },
      ],
      temperature: 0.3,
    });
    console.log("[Breakdown API] OpenAI response received in", Date.now() - startTime, "ms");

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error("[Breakdown API] Error: No content in OpenAI response");
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Breakdown API] Error: Could not parse JSON from response:", content.substring(0, 200));
      throw new Error("Invalid response format");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("[Breakdown API] Success in", Date.now() - startTime, "ms");

    return NextResponse.json(result);
  } catch (error) {
    const elapsed = Date.now() - startTime;

    // Type guard for OpenAI errors
    const err = error as { status?: number; message?: string; code?: string };

    console.error("[Breakdown API] Error after", elapsed, "ms:", {
      message: err.message,
      status: err.status,
      code: err.code,
      name: (error as Error).name,
    });

    // Return specific error messages based on error type
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (err.status === 401) {
      return NextResponse.json(
        { error: "API authentication failed. Please check the API key." },
        { status: 401 }
      );
    }

    if (err.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "API quota exceeded. Please check your OpenAI billing." },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze text. Please try again." },
      { status: 500 }
    );
  }
}
