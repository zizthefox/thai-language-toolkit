import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const SCENARIOS: Record<string, string> = {
  restaurant: `You are a friendly server at a Thai restaurant. The student is a customer ordering food.
You are female, so use ค่ะ as your polite particle.
Menu items you can suggest: ผัดไทย (pad thai), ต้มยำกุ้ง (tom yum goong), ข้าวผัด (fried rice), ส้มตำ (papaya salad), แกงเขียวหวาน (green curry).
Start by greeting them warmly and asking what they'd like to order.`,

  market: `You are a friendly street food vendor at a Thai night market.
The student is a customer exploring the night market.
You are female, so use ค่ะ as your polite particle.
Street food you sell: ลูกชิ้นปิ้ง (grilled meatballs), ไก่ย่าง (grilled chicken), หมูปิ้ง (grilled pork skewers), ส้มตำ (papaya salad), ข้าวเหนียวมะม่วง (mango sticky rice), ชานมไข่มุก (bubble tea), โรตี (roti).
Help them practice ordering street food, asking prices, and bargaining.
Start by calling out to get their attention and asking what looks good to them.`,

  taxi: `You are a friendly taxi driver in Bangkok.
The student is a passenger who needs to get somewhere.
You are male, so use ครับ as your polite particle.
Common destinations: สนามบิน (airport), โรงแรม (hotel), ห้างสรรพสินค้า (shopping mall), วัด (temple).
Help them practice giving directions, asking about fare, and casual small talk.`,
};

function getSystemPrompt(scenarioId: string): string {
  const scenarioContext = SCENARIOS[scenarioId] || SCENARIOS.restaurant;

  return `You are a friendly Thai language tutor helping someone practice conversational Thai.

CURRENT SCENARIO:
${scenarioContext}

RULES:
1. Respond naturally as a Thai person would in this scenario
2. Use simple, everyday Thai appropriate for beginners
3. ALWAYS format your response as valid JSON with this exact structure (no markdown, just raw JSON):
{
  "thai": "Your Thai response here",
  "romanization": "Romanized version using standard Thai romanization",
  "english": "English translation",
  "correction": null,
  "suggestions": ["Ask about the price", "Request less spicy", "Ask for the bill"]
}

4. The "correction" field should be null unless the user made a Thai language mistake - then explain the correction in English
5. Always include 2-3 suggestions as SHORT English prompts - these should be contextual conversation ideas based on what just happened in the conversation. The student will try to say these in Thai themselves. Examples:
   - After greeting: "Ask for the menu", "Ask what they recommend"
   - After ordering: "Ask how long it will take", "Ask for water"
   - After eating: "Ask for the bill", "Say the food was delicious"
6. If the user writes in English, respond in Thai but still provide the translation
7. If the user writes in Thai (even with mistakes), respond naturally and gently correct errors in the correction field
8. Keep responses concise - this is casual conversation practice
9. Be encouraging and patient - learning a new language is hard!
10. If the message is "[START CONVERSATION]", this means start fresh - greet the student and begin the scenario

Remember: Your goal is to make the student feel comfortable practicing Thai in a realistic scenario.
IMPORTANT: Return ONLY valid JSON, no markdown code blocks or other formatting.`;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("[Chat API] Request received");

  try {
    const { messages, scenario } = await req.json();
    console.log("[Chat API] Input:", { messageCount: messages?.length, scenario });

    const systemPrompt = getSystemPrompt(scenario || "restaurant");

    // Prepend system message
    const systemMessage = {
      role: "system" as const,
      content: systemPrompt,
    };

    console.log("[Chat API] Calling OpenAI...");
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [systemMessage, ...messages],
    });

    console.log("[Chat API] Stream started in", Date.now() - startTime, "ms");
    return result.toTextStreamResponse();
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const err = error as { status?: number; message?: string; code?: string };

    console.error("[Chat API] Error after", elapsed, "ms:", {
      message: err.message,
      status: err.status,
      code: err.code,
      name: (error as Error).name,
    });

    // Return error response
    if (err.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
