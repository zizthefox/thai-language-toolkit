import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      {/* Decorative Thai pattern bar */}
      <div className="h-2 bg-gradient-to-r from-red-700 via-amber-500 to-red-700" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Banner Image */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8">
          <Image
            src="/images/banner.jpg"
            alt="Thai Language Classroom"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            สวัสดีค่ะ
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-300 italic mb-4">
            sawatdi kha — Welcome!
          </p>
          <div className="max-w-xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to your Thai classroom. Learn to speak Thai through
              real conversations and practical lessons.
            </p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
          <span className="text-amber-500">✦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {/* Classroom Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-lg">📚</span>
            Your Lessons
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Conversation Practice */}
            <Link
              href="/chat"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 dark:from-amber-900/30 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🗣️</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Conversation Practice
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      ฝึกพูดภาษาไทย
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Practice real-world scenarios like ordering food, shopping, or
                  taking a taxi. Speak or type — get corrections in real-time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                    🍜 Restaurant
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                    🏮 Night Market
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                    🚕 Taxi
                  </span>
                </div>
              </div>
            </Link>

            {/* Text Breakdown */}
            <Link
              href="/breakdown"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 dark:from-amber-900/30 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Text Breakdown
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      วิเคราะห์ประโยค
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Type any sentence in English or Thai. See how it breaks down
                  word-by-word with pronunciation and grammar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                    Word Segmentation
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                    Sentence Structure
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-lg">🔜</span>
            Coming Soon
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Pronunciation Practice */}
            <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 opacity-75">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl grayscale">🎤</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    Pronunciation Practice
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ฝึกออกเสียง
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Record yourself and compare with native speakers. Master the 5
                Thai tones.
              </p>
            </div>

            {/* Flashcards */}
            <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 opacity-75">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl grayscale">🃏</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    Flashcards
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    บัตรคำศัพท์
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Study vocabulary with spaced repetition. Master the most common
                Thai words.
              </p>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
            <span>🎓</span>
            What You&apos;ll Learn
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 mt-1">✦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Speak naturally
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn how Thai people actually talk
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 mt-1">✦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Hear pronunciation
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Native Thai voices for every phrase
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 mt-1">✦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Understand structure
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See how Thai sentences are built
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 mt-1">✦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Get corrections
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gentle feedback on your mistakes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-amber-700 dark:text-amber-400 font-medium mb-1">
            ขอให้โชคดี — Good luck!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Built with Next.js & OpenAI
          </p>
        </footer>
      </main>

      {/* Bottom decorative bar */}
      <div className="h-2 bg-gradient-to-r from-red-700 via-amber-500 to-red-700" />
    </div>
  );
}
