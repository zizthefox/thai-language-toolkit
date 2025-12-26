export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parsed?: ParsedResponse;
}

export interface Suggestion {
  thai: string;
  romanization: string;
}

export interface ParsedResponse {
  thai: string;
  romanization: string;
  english: string;
  correction: string | null;
  suggestions?: (Suggestion | string)[];  // Support both new and old format
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Order food at a Thai restaurant",
    icon: "🍜",
    systemPrompt: `You are a friendly server at a Thai restaurant. The student is a customer ordering food.
Start by greeting them warmly and asking what they'd like to order.
You are female, so use ค่ะ as your polite particle.
Menu items you can suggest: ผัดไทย (pad thai), ต้มยำกุ้ง (tom yum goong), ข้าวผัด (fried rice), ส้มตำ (papaya salad), แกงเขียวหวาน (green curry).`,
  },
  {
    id: "market",
    name: "Market",
    description: "Shop at a local Thai market",
    icon: "🛒",
    systemPrompt: `You are a friendly vendor at a Thai market selling fruits and vegetables.
The student is a customer looking to buy produce.
You are female, so use ค่ะ as your polite particle.
Help them practice bargaining, asking prices, and buying quantities.`,
  },
  {
    id: "taxi",
    name: "Taxi",
    description: "Take a taxi ride in Bangkok",
    icon: "🚕",
    systemPrompt: `You are a friendly taxi driver in Bangkok.
The student is a passenger who needs to get somewhere.
You are male, so use ครับ as your polite particle.
Help them practice giving directions, asking about fare, and casual small talk.`,
  },
  {
    id: "cafe",
    name: "Cafe",
    description: "Order drinks at a coffee shop",
    icon: "☕",
    systemPrompt: `You are a barista at a Thai coffee shop.
The student is a customer ordering drinks.
You are female, so use ค่ะ as your polite particle.
Help them order coffee, tea, smoothies, and snacks. Practice sizes and customizations.`,
  },
];
