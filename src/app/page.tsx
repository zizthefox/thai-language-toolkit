import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Thai Language Toolkit
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Practice Thai conversation with AI-powered scenarios
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Conversation Practice */}
          <Link
            href="/chat"
            className="group p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500"
          >
            <div className="text-4xl mb-4">🗣️</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Conversation Practice
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Practice real-world scenarios like ordering food, shopping at
              markets, or taking a taxi. Get corrections and suggestions in
              real-time.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Restaurant
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Market
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Taxi
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Cafe
              </span>
            </div>
          </Link>

          {/* Pronunciation Practice - Coming Soon */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 opacity-75">
            <div className="text-4xl mb-4">🎤</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Pronunciation Practice
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Record yourself speaking Thai and get feedback on your
              pronunciation. Compare with native speakers and improve your
              tones.
            </p>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
              Coming Soon
            </span>
          </div>

          {/* Flashcards - Link to Streamlit */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Flashcards
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Study vocabulary with flashcards. Import/export decks, track your
              progress, and master the 100 most common Thai words.
            </p>
            <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
              Available in Streamlit App
            </span>
          </div>

          {/* Text Breakdown - Link to Streamlit */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Text Breakdown
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Analyze Thai text with word segmentation, romanization, POS
              tagging, and translation. Powered by PyThaiNLP.
            </p>
            <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
              Available in Streamlit App
            </span>
          </div>
        </div>

        {/* Features list */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What makes this special
          </h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  Thai + Romanization + English
                </strong>{" "}
                - Every response includes all three formats
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  Real-time corrections
                </strong>{" "}
                - Get gentle feedback on your Thai mistakes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  Text-to-speech
                </strong>{" "}
                - Hear how native speakers would say each phrase
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  Practical scenarios
                </strong>{" "}
                - Practice situations you'll actually encounter in Thailand
              </span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Built with Next.js, OpenAI, and ElevenLabs</p>
        </footer>
      </main>
    </div>
  );
}
