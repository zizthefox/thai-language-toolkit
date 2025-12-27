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
  character: {
    name: string;
    thaiName: string;
    role: string;
    avatar: string;
  };
  background: string;
  sceneIntro: string;
  voice: "female" | "male";
}

export const SCENARIOS: Scenario[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Order food at a Thai restaurant",
    icon: "🍜",
    character: {
      name: "Nong Fah",
      thaiName: "น้องฟ้า",
      role: "Server",
      avatar: "/images/avatars/restaurant.png",
    },
    background: "/images/backgrounds/restaurant.jpg",
    sceneIntro: "You walk into a cozy Thai restaurant. The smell of fresh herbs and spices fills the air. A friendly server approaches your table...",
    voice: "female",
    systemPrompt: `You are a friendly server at a Thai restaurant. The student is a customer ordering food.
Start by greeting them warmly and asking what they'd like to order.
You are female, so use ค่ะ as your polite particle.
Menu items you can suggest: ผัดไทย (pad thai), ต้มยำกุ้ง (tom yum goong), ข้าวผัด (fried rice), ส้มตำ (papaya salad), แกงเขียวหวาน (green curry).`,
  },
  {
    id: "market",
    name: "Night Market",
    description: "Explore a Thai night market",
    icon: "🏮",
    character: {
      name: "Pa Som",
      thaiName: "ป้าส้ม",
      role: "Street Food Vendor",
      avatar: "/images/avatars/market.png",
    },
    background: "/images/backgrounds/market.jpg",
    sceneIntro: "The sun has set and the night market comes alive. Colorful lights hang above rows of food stalls. The smell of grilled satay and pad thai fills the air. A friendly vendor calls out to you...",
    voice: "female",
    systemPrompt: `You are a friendly street food vendor at a Thai night market.
The student is a customer exploring the night market.
You are female, so use ค่ะ as your polite particle.
You sell popular street food: ลูกชิ้นปิ้ง (grilled meatballs), ไก่ย่าง (grilled chicken), ส้มตำ (papaya salad), ข้าวเหนียวมะม่วง (mango sticky rice), ชานมไข่มุก (bubble tea).
Help them practice ordering food, asking prices, and bargaining.`,
  },
  {
    id: "taxi",
    name: "Taxi",
    description: "Take a taxi ride in Bangkok",
    icon: "🚕",
    character: {
      name: "Lung Somchai",
      thaiName: "ลุงสมชาย",
      role: "Taxi Driver",
      avatar: "/images/avatars/taxi.png",
    },
    background: "/images/backgrounds/taxi.jpg",
    sceneIntro: "You flag down a bright pink taxi on a busy Bangkok street. The driver rolls down the window with a friendly smile...",
    voice: "male",
    systemPrompt: `You are a friendly taxi driver in Bangkok.
The student is a passenger who needs to get somewhere.
You are male, so use ครับ as your polite particle.
Help them practice giving directions, asking about fare, and casual small talk.`,
  },
  ];
