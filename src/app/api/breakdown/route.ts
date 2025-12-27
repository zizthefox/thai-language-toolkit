import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a Thai language expert. Your task is to analyze text and break it down word by word in Thai.

IMPORTANT: The input can be in Thai OR English.
- If the input is in English, first translate it to natural Thai, then break down that Thai text.
- If the input is in Thai, break it down directly.

For each word, provide:
1. thai: The Thai word
2. romanization: Standard Thai romanization (use common systems like RTGS)
3. pos: Part of speech (noun, verb, adjective, adverb, particle, classifier, pronoun, preposition, conjunction, etc.)
4. english: English translation

Return your response as valid JSON with this exact structure:
{
  "inputWasThai": false,
  "thaiSentence": "ผมอยากกินผัดไทยครับ",
  "sentenceRomanization": "phom yak kin phat thai khrap",
  "words": [
    {"thai": "ผม", "romanization": "phom", "pos": "pronoun", "english": "I (male)"},
    {"thai": "อยาก", "romanization": "yak", "pos": "verb", "english": "want"},
    {"thai": "กิน", "romanization": "kin", "pos": "verb", "english": "eat"},
    {"thai": "ผัดไทย", "romanization": "phat thai", "pos": "noun", "english": "pad thai"},
    {"thai": "ครับ", "romanization": "khrap", "pos": "particle", "english": "(polite particle, male)"}
  ],
  "fullTranslation": "I want to eat pad thai (polite, male speaker)"
}

IMPORTANT RULES:
1. Set inputWasThai to true if the original input was Thai, false if it was English
2. thaiSentence should contain the Thai version (original if Thai input, translated if English input)
3. Segment the Thai text into individual words properly (Thai has no spaces between words)
4. Include particles, classifiers, and function words as separate entries
5. Use lowercase for romanization
6. Keep POS tags simple and consistent
7. For the fullTranslation, provide a natural English translation
8. Return ONLY valid JSON, no markdown or extra formatting`;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.trim() },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Breakdown error:", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 }
    );
  }
}
