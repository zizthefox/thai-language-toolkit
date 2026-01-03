import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

const openai = new OpenAI();

// Hardcoded fallback tone sets for reliability
const FALLBACK_TONE_SETS = [
  {
    baseSound: "mai",
    words: [
      { thai: "ไม่", romanization: "mai", tone: "falling", meaning: "no, not", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "ใหม่", romanization: "mai", tone: "low", meaning: "new", toneExplanation: "Start and stay at a low pitch - like mumbling" },
      { thai: "ไม้", romanization: "mai", tone: "high", meaning: "wood, stick", toneExplanation: "Start and stay at a high pitch - like surprise" },
      { thai: "ไหม้", romanization: "mai", tone: "falling", meaning: "burn", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "ไหม", romanization: "mai", tone: "rising", meaning: "question particle", toneExplanation: "Start low, rise up - like asking a question" },
    ]
  },
  {
    baseSound: "khao",
    words: [
      { thai: "เข้า", romanization: "khao", tone: "falling", meaning: "to enter", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "ข้าว", romanization: "khao", tone: "falling", meaning: "rice", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "เขา", romanization: "khao", tone: "rising", meaning: "he/she/they, mountain", toneExplanation: "Start low, rise up - like asking a question" },
      { thai: "ขาว", romanization: "khao", tone: "rising", meaning: "white", toneExplanation: "Start low, rise up - like asking a question" },
    ]
  },
  {
    baseSound: "ma",
    words: [
      { thai: "มา", romanization: "ma", tone: "mid", meaning: "to come", toneExplanation: "Flat, neutral pitch - like speaking normally" },
      { thai: "หมา", romanization: "ma", tone: "rising", meaning: "dog", toneExplanation: "Start low, rise up - like asking a question" },
      { thai: "ม้า", romanization: "ma", tone: "high", meaning: "horse", toneExplanation: "Start and stay at a high pitch - like surprise" },
    ]
  },
  {
    baseSound: "kao",
    words: [
      { thai: "เก้า", romanization: "kao", tone: "falling", meaning: "nine", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "เกา", romanization: "kao", tone: "mid", meaning: "to scratch", toneExplanation: "Flat, neutral pitch - like speaking normally" },
      { thai: "ก้าว", romanization: "kao", tone: "falling", meaning: "step", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "เก่า", romanization: "kao", tone: "low", meaning: "old", toneExplanation: "Start and stay at a low pitch - like mumbling" },
    ]
  },
  {
    baseSound: "naa",
    words: [
      { thai: "หน้า", romanization: "na", tone: "falling", meaning: "face, front, next", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "นา", romanization: "na", tone: "mid", meaning: "rice field", toneExplanation: "Flat, neutral pitch - like speaking normally" },
      { thai: "หนา", romanization: "na", tone: "rising", meaning: "thick", toneExplanation: "Start low, rise up - like asking a question" },
      { thai: "น่า", romanization: "na", tone: "falling", meaning: "should, worthy of", toneExplanation: "Start high, drop down - like expressing disappointment" },
    ]
  },
  {
    baseSound: "suai",
    words: [
      { thai: "สวย", romanization: "suai", tone: "rising", meaning: "beautiful", toneExplanation: "Start low, rise up - like asking a question" },
      { thai: "ซวย", romanization: "suai", tone: "mid", meaning: "unlucky", toneExplanation: "Flat, neutral pitch - like speaking normally" },
    ]
  },
  {
    baseSound: "klai",
    words: [
      { thai: "ใกล้", romanization: "klai", tone: "falling", meaning: "near", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "ไกล", romanization: "klai", tone: "mid", meaning: "far", toneExplanation: "Flat, neutral pitch - like speaking normally" },
    ]
  },
  {
    baseSound: "sii",
    words: [
      { thai: "สี่", romanization: "si", tone: "low", meaning: "four", toneExplanation: "Start and stay at a low pitch - like mumbling" },
      { thai: "สี", romanization: "si", tone: "rising", meaning: "color", toneExplanation: "Start low, rise up - like asking a question" },
    ]
  },
  {
    baseSound: "paa",
    words: [
      { thai: "ป่า", romanization: "pa", tone: "low", meaning: "forest", toneExplanation: "Start and stay at a low pitch - like mumbling" },
      { thai: "ป้า", romanization: "pa", tone: "falling", meaning: "aunt (older)", toneExplanation: "Start high, drop down - like expressing disappointment" },
      { thai: "ปา", romanization: "pa", tone: "mid", meaning: "to throw", toneExplanation: "Flat, neutral pitch - like speaking normally" },
    ]
  },
  {
    baseSound: "phan",
    words: [
      { thai: "พัน", romanization: "phan", tone: "mid", meaning: "thousand", toneExplanation: "Flat, neutral pitch - like speaking normally" },
      { thai: "ผัน", romanization: "phan", tone: "rising", meaning: "to vary", toneExplanation: "Start low, rise up - like asking a question" },
    ]
  },
];

const SYSTEM_PROMPT = `You are a Thai language tone practice generator.

Generate sets of Thai words that share the same base sound but have different tones.
Thai has 5 tones: mid, low, high, falling, rising.

For each set provide words with their tone variations. Good examples include:
- mai: ไม่ (falling, no), ใหม่ (low, new), ไม้ (high, wood), ไหม (rising, question)
- khao: เข้า (falling, enter), ข้าว (falling, rice), เขา (rising, he/she), ขาว (rising, white)
- ma: มา (mid, come), หมา (rising, dog), ม้า (high, horse)

Return JSON with this exact structure:
{
  "sets": [
    {
      "baseSound": "mai",
      "words": [
        {
          "thai": "ไม่",
          "romanization": "mai",
          "tone": "falling",
          "meaning": "no, not",
          "toneExplanation": "Start high, drop down - like expressing disappointment"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
1. Each set must have at least 2 words with DIFFERENT tones
2. Use common, practical vocabulary
3. Tone must be exactly one of: mid, low, high, falling, rising
4. toneExplanation should be a simple description of how to produce the tone
5. Return ONLY valid JSON, no markdown`;

export async function POST(req: Request) {
  try {
    const { count = 5, usedSets = [] } = await req.json();

    // Filter out already used sets from fallbacks
    const availableFallbacks = FALLBACK_TONE_SETS.filter(
      (set) => !usedSets.includes(set.baseSound)
    );

    // If we have enough fallback sets, use them (more reliable)
    if (availableFallbacks.length >= count) {
      const shuffled = [...availableFallbacks].sort(() => Math.random() - 0.5);
      return NextResponse.json({ sets: shuffled.slice(0, count) });
    }

    // Otherwise, try to generate with OpenAI
    try {
      const usedSetsText = usedSets.length > 0
        ? `\n\nDO NOT use these base sounds (already used): ${usedSets.join(", ")}`
        : "";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate ${count} tone practice sets with different base sounds.${usedSetsText}` },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validate and filter the response
      if (result.sets && Array.isArray(result.sets)) {
        const validSets = result.sets.filter(
          (set: { baseSound: string; words: unknown[] }) =>
            set.baseSound &&
            Array.isArray(set.words) &&
            set.words.length >= 2 &&
            !usedSets.includes(set.baseSound)
        );

        if (validSets.length > 0) {
          return NextResponse.json({ sets: validSets.slice(0, count) });
        }
      }

      // Fall back to hardcoded sets if OpenAI response is invalid
      throw new Error("Invalid OpenAI response structure");
    } catch (aiError) {
      console.error("OpenAI error, using fallback sets:", aiError);
      // Use fallback sets
      const shuffled = [...availableFallbacks].sort(() => Math.random() - 0.5);
      return NextResponse.json({ sets: shuffled.slice(0, Math.min(count, shuffled.length)) });
    }
  } catch (error) {
    console.error("Tones API error:", error);
    return NextResponse.json(
      { error: "Failed to generate tone practice sets" },
      { status: 500 }
    );
  }
}
