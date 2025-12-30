"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface WordBreakdown {
  thai: string;
  romanization: string;
  pos: string;
  english: string;
}

interface WordOrderItem {
  english: string;
  thai: string;
  pos: string;
  romanization: string;
}

interface StructureComparison {
  english: string;
  literal: string;
  wordOrder: WordOrderItem[];
}

interface BreakdownResult {
  words: WordBreakdown[];
  fullTranslation: string;
  inputWasThai?: boolean;
  thaiSentence?: string;
  sentenceRomanization?: string;
  structureComparison?: StructureComparison;
}

const POS_COLORS: Record<string, string> = {
  noun: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  verb: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  adjective: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
  adverb: "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300",
  particle: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
  classifier: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300",
  pronoun: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300",
  preposition: "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300",
  conjunction: "bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300",
  interjection: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
  number: "bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300",
};

function getPosColor(pos: string): string {
  const normalizedPos = pos.toLowerCase();
  return POS_COLORS[normalizedPos] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
}

export default function BreakdownPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<BreakdownResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async (text: string) => {
    if (playingText === text) return;

    // Stop any currently playing audio
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

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze text");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze text. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Text Breakdown
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter text to analyze (Thai or English)
          </label>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type in Thai or English..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to analyze • Try: &quot;I want to eat pad thai&quot; or ผมอยากกินผัดไทย
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Thai Sentence with TTS */}
            {result.thaiSentence && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                  {result.inputWasThai ? "Thai" : "In Thai"}
                </p>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-2xl text-gray-900 dark:text-white mb-1">
                      {result.thaiSentence}
                    </p>
                    {result.sentenceRomanization && (
                      <p className="text-blue-600 dark:text-blue-400 italic">
                        {result.sentenceRomanization}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSpeak(result.thaiSentence!)}
                    disabled={playingText === result.thaiSentence}
                    className="p-2 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Listen to pronunciation"
                  >
                    {playingText === result.thaiSentence ? (
                      <span className="text-xl">⏳</span>
                    ) : (
                      <span className="text-xl">🔊</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Full Translation */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                {result.inputWasThai ? "English Translation" : "Meaning"}
              </p>
              <p className="text-lg text-gray-900 dark:text-white">
                {result.fullTranslation}
              </p>
            </div>

            {/* Word-by-word breakdown table */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Word-by-Word Breakdown
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Thai
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pronunciation
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Meaning
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">
                        Listen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {result.words.map((word, index) => (
                      <tr
                        key={index}
                        className="bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xl font-medium text-gray-900 dark:text-white">
                            {word.thai}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 dark:text-blue-400 italic">
                            {word.romanization}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPosColor(
                              word.pos
                            )}`}
                          >
                            {word.pos}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-600 dark:text-gray-400">
                            {word.english}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSpeak(word.thai)}
                            disabled={playingText === word.thai}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Listen to pronunciation"
                          >
                            {playingText === word.thai ? (
                              <span className="text-lg">⏳</span>
                            ) : (
                              <span className="text-lg">🔊</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Structure Comparison */}
            {result.structureComparison && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thai vs English Structure
                </h2>

                {/* Side by side comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      English
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {result.structureComparison.english}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                      Thai (literal)
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {result.structureComparison.literal}
                    </p>
                  </div>
                </div>

                {/* Word order mapping with POS colors */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thai Sentence Structure
                  </p>
                  <p className="text-center text-sm font-mono text-gray-600 dark:text-gray-400 mb-4">
                    {result.structureComparison.wordOrder
                      .map((item) => item.pos.charAt(0).toUpperCase() + item.pos.slice(1))
                      .join(" + ")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center items-end">
                    {result.structureComparison.wordOrder.map((item, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 min-w-[80px] ${getPosColor(item.pos).replace('text-', 'border-').split(' ')[0]} ${getPosColor(item.pos)}`}
                      >
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.thai}
                        </span>
                        {item.romanization && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 italic">
                            {item.romanization}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {item.english}
                        </span>
                        <span className="text-[10px] font-medium mt-1 opacity-75">
                          {item.pos}
                        </span>
                        <button
                          onClick={() => handleSpeak(item.thai)}
                          disabled={playingText === item.thai}
                          className="mt-2 p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                          title="Listen to pronunciation"
                        >
                          {playingText === item.thai ? (
                            <span className="text-sm">⏳</span>
                          ) : (
                            <span className="text-sm">🔊</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* POS Legend */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Part of Speech Legend
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(POS_COLORS).map(([pos, colorClass]) => (
                  <span
                    key={pos}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                  >
                    {pos}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Analyze Thai Text
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter any Thai text above to see it broken down word by word with
              romanization, part of speech, and English translation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
