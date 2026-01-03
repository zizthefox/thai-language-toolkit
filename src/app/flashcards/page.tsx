"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Volume2,
  Loader2,
  ArrowLeft,
  Layers,
  Check,
  X,
  Utensils,
  Plane,
  Smile,
  Hash,
  ShoppingBag,
  MessageCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";

interface FlashcardWord {
  thai: string;
  romanization: string;
  english: string;
}

interface AnswerRecord {
  word: FlashcardWord;
  userAnswer: string;
  isCorrect: boolean;
}

const CATEGORIES = [
  { id: "food", name: "Food", icon: Utensils, color: "red" },
  { id: "travel", name: "Travel", icon: Plane, color: "blue" },
  { id: "greetings", name: "Greetings", icon: Smile, color: "amber" },
  { id: "numbers", name: "Numbers", icon: Hash, color: "purple" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "green" },
  { id: "common", name: "Common Phrases", icon: MessageCircle, color: "cyan" },
];

const CARD_COUNTS = [5, 10, 15, 20];

export default function FlashcardsPage() {
  // Config state
  const [cardCount, setCardCount] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Quiz state
  const [phase, setPhase] = useState<"setup" | "quiz" | "results">("setup");
  const [words, setWords] = useState<FlashcardWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  // Answer state
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Score tracking
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // Loading & TTS
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSpeak = async (text: string) => {
    if (playingText === text) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPlayingText(text);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingText(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingText(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setPlayingText(null);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: selectedCategories,
          count: cardCount,
          usedWords: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();

      if (!data.words || data.words.length === 0) {
        throw new Error("No words generated");
      }

      setWords(data.words);
      setUsedWords(data.words.map((w: FlashcardWord) => w.thai));
      setCurrentIndex(0);
      setScore(0);
      setAnswers([]);
      setPhase("quiz");
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeAnswer = (text: string): string => {
    return text.toLowerCase().trim().replace(/[.,!?]/g, "");
  };

  const checkAnswer = () => {
    const correctAnswer = normalizeAnswer(words[currentIndex].english);
    const userInput = normalizeAnswer(userAnswer);

    // Flexible matching
    const isMatch =
      correctAnswer === userInput ||
      correctAnswer.includes(userInput) ||
      userInput.includes(correctAnswer) ||
      (userInput.length > 2 && correctAnswer.startsWith(userInput)) ||
      (userInput.length > 2 && correctAnswer.endsWith(userInput));

    setIsCorrect(isMatch);
    if (isMatch) setScore((prev) => prev + 1);

    setAnswers((prev) => [
      ...prev,
      {
        word: words[currentIndex],
        userAnswer: userAnswer,
        isCorrect: isMatch,
      },
    ]);

    setShowResult(true);
  };

  const handleNext = () => {
    setUserAnswer("");
    setShowResult(false);

    if (currentIndex + 1 >= words.length) {
      setPhase("results");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showResult) {
        handleNext();
      } else if (userAnswer.trim()) {
        checkAnswer();
      }
    }
  };

  const handleNewQuiz = () => {
    setPhase("setup");
    setWords([]);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setUsedWords([]);
    setUserAnswer("");
    setShowResult(false);
  };

  const handlePracticeMissed = () => {
    const missedWords = answers.filter((a) => !a.isCorrect).map((a) => a.word);

    if (missedWords.length === 0) {
      handleNewQuiz();
      return;
    }

    setWords(missedWords);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setUserAnswer("");
    setShowResult(false);
    setPhase("quiz");
  };

  const currentWord = words[currentIndex];
  const scorePercentage = words.length > 0 ? Math.round((score / words.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Flashcards
          </h1>
          {phase === "quiz" && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {words.length}
            </span>
          )}
          {phase !== "quiz" && <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="space-y-8">
            {/* Card Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How many cards?
              </label>
              <div className="flex gap-2">
                {CARD_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setCardCount(count)}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                      cardCount === count
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 ${
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <p
                        className={`font-medium ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {cat.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={selectedCategories.length === 0 || isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Cards...
                </span>
              ) : (
                "Start Quiz"
              )}
            </button>

            {selectedCategories.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Select at least one category to start
              </p>
            )}
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && currentWord && (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Score: {score} correct
              </span>
            </div>

            {/* Flashcard */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-zinc-700">
              <p className="text-4xl font-medium text-gray-900 dark:text-white mb-3">
                {currentWord.thai}
              </p>
              <p className="text-lg text-blue-600 dark:text-blue-400 italic mb-6">
                {currentWord.romanization}
              </p>
              <button
                onClick={() => handleSpeak(currentWord.thai)}
                disabled={playingText === currentWord.thai}
                className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                title="Listen to pronunciation"
              >
                {playingText === currentWord.thai ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>

            {/* Answer Section */}
            {!showResult ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What does this mean in English?
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Display */}
                <div
                  className={`p-6 rounded-xl border-2 ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCorrect ? (
                      <>
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Correct!
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <span className="font-semibold text-red-700 dark:text-red-300">
                          Incorrect
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Answer:</span>{" "}
                    {currentWord.english}
                  </p>
                  {!isCorrect && (
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-medium">You wrote:</span> {userAnswer}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {currentIndex + 1 >= words.length ? "See Results" : "Next Card"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && (
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {score} / {words.length}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {scorePercentage}% correct
              </p>
            </div>

            {/* Answer Review */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <h3 className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 font-medium text-gray-900 dark:text-white">
                Review Answers
              </h3>
              <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    {answer.isCorrect ? (
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {answer.word.thai}{" "}
                        <span className="text-blue-600 dark:text-blue-400 text-sm italic">
                          ({answer.word.romanization})
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {answer.word.english}
                        {!answer.isCorrect && (
                          <span className="text-red-500 dark:text-red-400">
                            {" "}
                            (you wrote: {answer.userAnswer})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSpeak(answer.word.thai)}
                      disabled={playingText === answer.word.thai}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {playingText === answer.word.thai ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleNewQuiz}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                New Quiz
              </button>
              {answers.some((a) => !a.isCorrect) && (
                <button
                  onClick={handlePracticeMissed}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
                >
                  Practice Missed ({answers.filter((a) => !a.isCorrect).length})
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
