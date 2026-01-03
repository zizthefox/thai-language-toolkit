import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  MessageCircle,
  FileText,
  Mic,
  Layers,
  GraduationCap,
  Check,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      {/* Subtle top accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Banner Image */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Image
            src="/images/banner.jpg"
            alt="Thai Language Classroom"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Thai Language Toolkit
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-400 italic mb-4">
            สวัสดี — Welcome
          </p>
          <div className="max-w-xl mx-auto">
            <p className="text-slate-600 dark:text-slate-400">
              Learn to speak Thai through real conversations and practical
              lessons with AI-powered guidance.
            </p>
          </div>

          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            View Your Progress
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600" />
        </div>

        {/* Lessons Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Your Lessons
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Conversation Practice */}
            <Link
              href="/chat"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 dark:from-amber-900/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Conversation Practice
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Interactive roleplay scenarios
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Practice real-world scenarios like ordering food, shopping, or
                  taking a taxi. Speak or type — get corrections in real-time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium">
                    🍜 Restaurant
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium">
                    🏮 Night Market
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    🚕 Taxi
                  </span>
                </div>
              </div>
            </Link>

            {/* Text Breakdown */}
            <Link
              href="/breakdown"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 dark:from-amber-900/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                    <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Text Breakdown
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sentence analysis tool
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Type any sentence in English or Thai. See how it breaks down
                  word-by-word with pronunciation and grammar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                    Word Segmentation
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                    Sentence Structure
                  </span>
                </div>
              </div>
            </Link>

            {/* Flashcards */}
            <Link
              href="/flashcards"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 dark:from-amber-900/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                    <Layers className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Flashcards
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Vocabulary quiz
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Test your vocabulary with AI-generated flashcards. Choose
                  categories and quiz yourself on Thai words.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium">
                    Food
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    Travel
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium">
                    Numbers
                  </span>
                </div>
              </div>
            </Link>

            {/* Pronunciation Practice */}
            <Link
              href="/tones"
              className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 dark:from-amber-900/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                    <Mic className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Tone Practice
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Master the 5 Thai tones
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Listen and identify tones, or speak and get feedback.
                  Learn to distinguish words like "mai" with 5 different meanings.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                    Mid
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    Low
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md text-xs font-medium">
                    High
                  </span>
                  <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium">
                    Falling
                  </span>
                  <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                    Rising
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-8 border border-slate-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            What You&apos;ll Learn
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Speak naturally
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Learn how Thai people actually talk
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Hear pronunciation
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Native Thai voices for every phrase
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Understand structure
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  See how Thai sentences are built
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Get corrections
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gentle feedback on your mistakes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Built with Next.js & OpenAI
          </p>
        </footer>
      </main>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />
    </div>
  );
}
