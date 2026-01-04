"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Layers,
  Mic,
  MessageCircle,
  Sparkles,
  Loader2,
  Flame,
  Target,
  AlertCircle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import {
  getProgress,
  getFlashcardAccuracy,
  getOverallToneAccuracy,
  getToneAccuracy,
  getWeakWords,
  getWeakTones,
  hasProgress,
  resetProgress,
  type AllProgress,
} from "@/lib/progress";

interface Recommendation {
  priority: number;
  message: string;
  action: string;
  actionLabel: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  encouragement: string;
}

const TONE_NAMES: Record<string, string> = {
  mid: "Mid",
  low: "Low",
  high: "High",
  falling: "Falling",
  rising: "Rising",
};

export default function DashboardPage() {
  const [progress, setProgress] = useState<AllProgress | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
  }, []);

  const fetchRecommendations = async (progressData: AllProgress) => {
    setLoadingRecs(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progressData }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleReset = () => {
    resetProgress();
    setProgress(getProgress());
    setRecommendations(null);
    setShowResetConfirm(false);
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const flashcardAccuracy = getFlashcardAccuracy();
  const toneAccuracy = getOverallToneAccuracy();
  const weakWords = getWeakWords(5);
  const weakTones = getWeakTones(5);
  const userHasProgress = hasProgress();

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
            <LayoutDashboard className="w-5 h-5" />
            Learning Dashboard
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* No Progress State */}
        {!userHasProgress && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl mb-4">
              <Target className="w-12 h-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Progress Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Start learning to see your progress here! Try flashcards, tone practice, or conversation practice.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/flashcards"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Flashcards
              </Link>
              <Link
                href="/tones"
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Try Tones
              </Link>
            </div>
          </div>
        )}

        {/* Progress Content */}
        {userHasProgress && (
          <div className="space-y-8">
            {/* Streak Banner */}
            {progress.overall.currentStreak > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                    <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      {progress.overall.currentStreak} day streak!
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {progress.overall.totalSessions} total sessions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="font-semibold text-purple-800 dark:text-purple-200">
                  AI Recommendations
                </h2>
              </div>

              {loadingRecs && (
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing your progress...</span>
                </div>
              )}

              {!loadingRecs && recommendations && (
                <div className="space-y-4">
                  {recommendations.encouragement && (
                    <p className="text-purple-700 dark:text-purple-300 font-medium">
                      {recommendations.encouragement}
                    </p>
                  )}
                  <div className="space-y-3">
                    {recommendations.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/60 dark:bg-zinc-800/60 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {rec.message}
                          </p>
                        </div>
                        <Link
                          href={`/${rec.action}`}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          {rec.actionLabel}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loadingRecs && !recommendations && (
                <button
                  onClick={() => fetchRecommendations(progress)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Get AI Recommendations
                </button>
              )}
            </div>

            {/* Feature Progress Cards */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Your Progress
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Flashcards Progress */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Flashcards</span>
                  </div>
                  {progress.flashcards.totalSessions > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {flashcardAccuracy}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {progress.flashcards.totalCards} cards studied
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {progress.flashcards.totalSessions} sessions
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Not started yet</p>
                  )}
                </div>

                {/* Tones Progress */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <Mic className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Tones</span>
                  </div>
                  {progress.tones.totalSessions > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {toneAccuracy}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {progress.tones.totalRounds} rounds practiced
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {progress.tones.totalSessions} sessions
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Not started yet</p>
                  )}
                </div>

                {/* Chat Progress */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Chat</span>
                  </div>
                  {progress.chat.totalSessions > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {progress.chat.totalSessions}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        conversations
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {progress.chat.messagesExchanged} messages
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Not started yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Weak Areas */}
            {(weakWords.length > 0 || weakTones.length > 0) && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas to Improve
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Weak Words */}
                  {weakWords.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <p className="font-medium text-red-800 dark:text-red-200 mb-3">
                        Vocabulary to Review ({weakWords.length})
                      </p>
                      <div className="space-y-2">
                        {weakWords.slice(0, 5).map((word, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {word.thai}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {word.english}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/flashcards"
                        className="mt-3 inline-block text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Practice these words →
                      </Link>
                    </div>
                  )}

                  {/* Weak Tones */}
                  {weakTones.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                      <p className="font-medium text-orange-800 dark:text-orange-200 mb-3">
                        Tones to Practice
                      </p>
                      <div className="space-y-2">
                        {Object.entries(progress.tones.accuracyByTone)
                          .filter(([, data]) => data.total > 0 && (data.correct / data.total) < 0.7)
                          .slice(0, 5)
                          .map(([tone, data]) => (
                            <div key={tone} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {TONE_NAMES[tone] || tone} tone
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {Math.round((data.correct / data.total) * 100)}% accuracy
                              </span>
                            </div>
                          ))}
                      </div>
                      <Link
                        href="/tones"
                        className="mt-3 inline-block text-sm text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        Practice tones →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reset Progress */}
            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset all progress
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure? This cannot be undone.
                  </span>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Yes, reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
