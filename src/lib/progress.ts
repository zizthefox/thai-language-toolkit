// Progress tracking utilities using localStorage

// Types
export interface WeakWord {
  thai: string;
  romanization: string;
  english: string;
  category: string;
  incorrectCount: number;
  correctStreak: number;
  lastPracticed: string;
}

export interface WeakToneSet {
  baseSound: string;
  targetTone: string;
  targetThai: string;
  incorrectCount: number;
  correctStreak: number;
  lastPracticed: string;
}

export interface FlashcardProgress {
  totalSessions: number;
  totalCards: number;
  correctAnswers: number;
  categoriesUsed: Record<string, number>;
  weakWords: WeakWord[];
  lastSessionDate: string;
  lastSessionScore: number;
  lastSessionTotal: number;
}

export interface ToneProgress {
  totalSessions: number;
  totalRounds: number;
  correctAnswers: number;
  modeUsage: { listen: number; speak: number };
  accuracyByTone: Record<string, { correct: number; total: number }>;
  weakToneSets: WeakToneSet[];
  lastSessionDate: string;
  lastSessionScore: number;
  lastSessionTotal: number;
}

export interface ChatProgress {
  totalSessions: number;
  scenariosUsed: Record<string, number>;
  correctionsReceived: number;
  messagesExchanged: number;
  lastScenario: string;
  lastSessionDate: string;
}

export interface OverallProgress {
  totalSessions: number;
  firstSessionDate: string;
  lastSessionDate: string;
  currentStreak: number;
}

export interface AllProgress {
  flashcards: FlashcardProgress;
  tones: ToneProgress;
  chat: ChatProgress;
  overall: OverallProgress;
}

// Storage key
const STORAGE_KEY = "thai-toolkit-progress";

// Default state factory
function createDefaultProgress(): AllProgress {
  return {
    flashcards: {
      totalSessions: 0,
      totalCards: 0,
      correctAnswers: 0,
      categoriesUsed: {},
      weakWords: [],
      lastSessionDate: "",
      lastSessionScore: 0,
      lastSessionTotal: 0,
    },
    tones: {
      totalSessions: 0,
      totalRounds: 0,
      correctAnswers: 0,
      modeUsage: { listen: 0, speak: 0 },
      accuracyByTone: {},
      weakToneSets: [],
      lastSessionDate: "",
      lastSessionScore: 0,
      lastSessionTotal: 0,
    },
    chat: {
      totalSessions: 0,
      scenariosUsed: {},
      correctionsReceived: 0,
      messagesExchanged: 0,
      lastScenario: "",
      lastSessionDate: "",
    },
    overall: {
      totalSessions: 0,
      firstSessionDate: "",
      lastSessionDate: "",
      currentStreak: 0,
    },
  };
}

// Check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Core functions
export function getProgress(): AllProgress {
  if (!isBrowser()) {
    return createDefaultProgress();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultProgress();
    }
    return JSON.parse(stored) as AllProgress;
  } catch {
    console.error("Failed to read progress from localStorage");
    return createDefaultProgress();
  }
}

export function saveProgress(progress: AllProgress): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.error("Failed to save progress to localStorage");
  }
}

export function resetProgress(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Failed to reset progress");
  }
}

// Helper to update streak
function updateStreak(progress: AllProgress): void {
  const today = new Date().toISOString().split("T")[0];
  const lastDate = progress.overall.lastSessionDate?.split("T")[0];

  if (!lastDate) {
    // First session ever
    progress.overall.currentStreak = 1;
    progress.overall.firstSessionDate = new Date().toISOString();
  } else if (lastDate === today) {
    // Already practiced today, streak unchanged
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayStr) {
      // Practiced yesterday, increment streak
      progress.overall.currentStreak += 1;
    } else {
      // Missed a day, reset streak
      progress.overall.currentStreak = 1;
    }
  }

  progress.overall.lastSessionDate = new Date().toISOString();
  progress.overall.totalSessions += 1;
}

// Flashcard session recording
export interface FlashcardSessionResult {
  score: number;
  total: number;
  categories: string[];
  answers: Array<{
    word: { thai: string; romanization: string; english: string };
    isCorrect: boolean;
  }>;
}

export function recordFlashcardSession(result: FlashcardSessionResult): void {
  const progress = getProgress();
  const now = new Date().toISOString();

  // Update flashcard stats
  progress.flashcards.totalSessions += 1;
  progress.flashcards.totalCards += result.total;
  progress.flashcards.correctAnswers += result.score;
  progress.flashcards.lastSessionDate = now;
  progress.flashcards.lastSessionScore = result.score;
  progress.flashcards.lastSessionTotal = result.total;

  // Update category usage
  for (const cat of result.categories) {
    progress.flashcards.categoriesUsed[cat] =
      (progress.flashcards.categoriesUsed[cat] || 0) + 1;
  }

  // Update weak words
  for (const answer of result.answers) {
    const existingIndex = progress.flashcards.weakWords.findIndex(
      (w) => w.thai === answer.word.thai
    );

    if (answer.isCorrect) {
      // Correct answer
      if (existingIndex >= 0) {
        const weak = progress.flashcards.weakWords[existingIndex];
        weak.correctStreak += 1;
        weak.lastPracticed = now;

        // Remove if mastered (3 correct in a row)
        if (weak.correctStreak >= 3) {
          progress.flashcards.weakWords.splice(existingIndex, 1);
        }
      }
    } else {
      // Incorrect answer
      if (existingIndex >= 0) {
        // Already weak, increment count and reset streak
        progress.flashcards.weakWords[existingIndex].incorrectCount += 1;
        progress.flashcards.weakWords[existingIndex].correctStreak = 0;
        progress.flashcards.weakWords[existingIndex].lastPracticed = now;
      } else {
        // Add to weak words
        progress.flashcards.weakWords.push({
          thai: answer.word.thai,
          romanization: answer.word.romanization,
          english: answer.word.english,
          category: result.categories[0] || "mixed",
          incorrectCount: 1,
          correctStreak: 0,
          lastPracticed: now,
        });
      }
    }
  }

  // Update overall streak
  updateStreak(progress);

  saveProgress(progress);
}

// Tone session recording
export interface ToneSessionResult {
  mode: "listen" | "speak";
  score: number;
  total: number;
  answers: Array<{
    targetTone: string;
    targetThai: string;
    baseSound: string;
    isCorrect: boolean;
  }>;
}

export function recordToneSession(result: ToneSessionResult): void {
  const progress = getProgress();
  const now = new Date().toISOString();

  // Update tone stats
  progress.tones.totalSessions += 1;
  progress.tones.totalRounds += result.total;
  progress.tones.correctAnswers += result.score;
  progress.tones.lastSessionDate = now;
  progress.tones.lastSessionScore = result.score;
  progress.tones.lastSessionTotal = result.total;
  progress.tones.modeUsage[result.mode] += 1;

  // Update accuracy by tone
  for (const answer of result.answers) {
    const tone = answer.targetTone;
    if (!progress.tones.accuracyByTone[tone]) {
      progress.tones.accuracyByTone[tone] = { correct: 0, total: 0 };
    }
    progress.tones.accuracyByTone[tone].total += 1;
    if (answer.isCorrect) {
      progress.tones.accuracyByTone[tone].correct += 1;
    }

    // Update weak tones
    const existingIndex = progress.tones.weakToneSets.findIndex(
      (w) => w.baseSound === answer.baseSound && w.targetTone === answer.targetTone
    );

    if (answer.isCorrect) {
      if (existingIndex >= 0) {
        const weak = progress.tones.weakToneSets[existingIndex];
        weak.correctStreak += 1;
        weak.lastPracticed = now;

        if (weak.correctStreak >= 3) {
          progress.tones.weakToneSets.splice(existingIndex, 1);
        }
      }
    } else {
      if (existingIndex >= 0) {
        progress.tones.weakToneSets[existingIndex].incorrectCount += 1;
        progress.tones.weakToneSets[existingIndex].correctStreak = 0;
        progress.tones.weakToneSets[existingIndex].lastPracticed = now;
      } else {
        progress.tones.weakToneSets.push({
          baseSound: answer.baseSound,
          targetTone: answer.targetTone,
          targetThai: answer.targetThai,
          incorrectCount: 1,
          correctStreak: 0,
          lastPracticed: now,
        });
      }
    }
  }

  updateStreak(progress);
  saveProgress(progress);
}

// Chat session recording
export interface ChatSessionResult {
  scenario: string;
  messageCount: number;
  correctionsReceived: number;
}

export function recordChatSession(result: ChatSessionResult): void {
  const progress = getProgress();
  const now = new Date().toISOString();

  progress.chat.totalSessions += 1;
  progress.chat.messagesExchanged += result.messageCount;
  progress.chat.correctionsReceived += result.correctionsReceived;
  progress.chat.lastScenario = result.scenario;
  progress.chat.lastSessionDate = now;

  progress.chat.scenariosUsed[result.scenario] =
    (progress.chat.scenariosUsed[result.scenario] || 0) + 1;

  updateStreak(progress);
  saveProgress(progress);
}

// Getters for weak items
export function getWeakWords(limit?: number): WeakWord[] {
  const progress = getProgress();
  const sorted = [...progress.flashcards.weakWords].sort(
    (a, b) => b.incorrectCount - a.incorrectCount
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getWeakTones(limit?: number): WeakToneSet[] {
  const progress = getProgress();
  const sorted = [...progress.tones.weakToneSets].sort(
    (a, b) => b.incorrectCount - a.incorrectCount
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

// Get accuracy percentage for a specific tone
export function getToneAccuracy(tone: string): number {
  const progress = getProgress();
  const data = progress.tones.accuracyByTone[tone];
  if (!data || data.total === 0) return 0;
  return Math.round((data.correct / data.total) * 100);
}

// Get overall flashcard accuracy
export function getFlashcardAccuracy(): number {
  const progress = getProgress();
  if (progress.flashcards.totalCards === 0) return 0;
  return Math.round(
    (progress.flashcards.correctAnswers / progress.flashcards.totalCards) * 100
  );
}

// Get overall tone accuracy
export function getOverallToneAccuracy(): number {
  const progress = getProgress();
  if (progress.tones.totalRounds === 0) return 0;
  return Math.round(
    (progress.tones.correctAnswers / progress.tones.totalRounds) * 100
  );
}

// Check if user has any progress
export function hasProgress(): boolean {
  const progress = getProgress();
  return progress.overall.totalSessions > 0;
}
