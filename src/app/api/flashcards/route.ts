import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a Thai language vocabulary generator for flashcard learning.

Generate unique Thai vocabulary words based on the requested categories.

Categories and their scope:
- food: food items, drinks, restaurant vocabulary, cooking terms
- travel: transportation, directions, places, hotels, airports
- greetings: hello, goodbye, polite expressions, social phrases
- numbers: numbers 1-100, counting words, ordinals
- shopping: prices, bargaining phrases, store vocabulary, payment terms
- common: everyday verbs, common adjectives, useful phrases

For each word provide:
1. thai: The Thai word or short phrase
2. romanization: Standard Thai romanization (lowercase, use common systems)
3. english: Clear, concise English meaning (1-4 words)

CRITICAL RULES:
1. Generate EXACTLY the requested number of words
2. DO NOT include any words from the "already used" list provided
3. Each word must be unique within your response (no duplicates)
4. Focus on practical, commonly-used vocabulary
5. Mix single words and short phrases appropriately
6. Return ONLY valid JSON, no markdown or extra text

Return format:
{"words": [{"thai": "สวัสดี", "romanization": "sawatdee", "english": "hello"}, ...]}`;

export async function POST(req: Request) {
  try {
    const { categories, count, usedWords = [] } = await req.json();

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "At least one category is required" },
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Count must be between 1 and 50" },
        { status: 400 }
      );
    }

    const usedWordsText = usedWords.length > 0
      ? `\n\nALREADY USED WORDS (DO NOT repeat any of these): ${usedWords.join(", ")}`
      : "";

    const userPrompt = `Generate exactly ${count} Thai vocabulary words.
Categories to include: ${categories.join(", ")}
Distribute words roughly evenly across the selected categories.${usedWordsText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
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

    // Filter out any words that might still be in usedWords (safety check)
    if (usedWords.length > 0 && result.words) {
      result.words = result.words.filter(
        (word: { thai: string }) => !usedWords.includes(word.thai)
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
