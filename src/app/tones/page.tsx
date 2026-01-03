"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { recordToneSession } from "@/lib/progress";
import {
  Volume2,
  Loader2,
  ArrowLeft,
  Mic,
  Check,
  X,
  Headphones,
  MessageCircle,
  RotateCcw,
  Trophy,
  Info,
  Square,
} from "lucide-react";

type ThaiTone = "mid" | "low" | "high" | "falling" | "rising";
type PracticeMode = "listen" | "speak";
type Phase = "setup" | "practice" | "results";
type RecordingState = "idle" | "recording" | "transcribing";

interface ToneWord {
  thai: string;
  romanization: string;
  tone: ThaiTone;
  meaning: string;
  toneExplanation: string;
}

interface ToneSet {
  baseSound: string;
  words: ToneWord[];
}

interface ListenAnswer {
  set: ToneSet;
  targetWord: ToneWord;
  selectedTone: ThaiTone | null;
  isCorrect: boolean;
}

interface SpeakAnswer {
  targetWord: ToneWord;
  set: ToneSet;
  transcription: string;
  isCorrect: boolean;
  feedback: string;
}

const TONE_INFO: Record<ThaiTone, { name: string; thai: string; description: string; color: string }> = {
  mid: {
    name: "Mid",
    thai: "สามัญ",
    description: "Flat, neutral pitch - like speaking normally",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
  },
  low: {
    name: "Low",
    thai: "เอก",
    description: "Start and stay at a low pitch - like mumbling",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 dark:border-blue-700"
  },
  high: {
    name: "High",
    thai: "ตรี",
    description: "Start and stay at a high pitch - like surprise",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700"
  },
  falling: {
    name: "Falling",
    thai: "โท",
    description: "Start high, drop down - like disappointment",
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700"
  },
  rising: {
    name: "Rising",
    thai: "จัตวา",
    description: "Start low, rise up - like asking a question",
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700"
  }
};

const TONES: ThaiTone[] = ["mid", "low", "high", "falling", "rising"];
const ROUND_COUNTS = [5, 10, 15];

export default function TonesPage() {
  // Setup state
  const [mode, setMode] = useState<PracticeMode>("listen");
  const [roundCount, setRoundCount] = useState<number>(5);

  // Practice state
  const [phase, setPhase] = useState<Phase>("setup");
  const [toneSets, setToneSets] = useState<ToneSet[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen mode state
  const [selectedTone, setSelectedTone] = useState<ThaiTone | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [listenAnswers, setListenAnswers] = useState<ListenAnswer[]>([]);

  // Speak mode state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [speakFeedback, setSpeakFeedback] = useState<string | null>(null);
  const [speakIsCorrect, setSpeakIsCorrect] = useState<boolean | null>(null);
  const [speakAnswers, setSpeakAnswers] = useState<SpeakAnswer[]>([]);

  // Audio state
  const [playingAudio, setPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Computed values
  const score = mode === "listen"
    ? listenAnswers.filter(a => a.isCorrect).length
    : speakAnswers.filter(a => a.isCorrect).length;

  const currentSet = toneSets[currentRoundIndex];
  const currentTargetWord = currentSet?.words[Math.floor(Math.random() * currentSet.words.length)] || currentSet?.words[0];

  // For listen mode, we need a consistent target word per round
  const [listenTargets, setListenTargets] = useState<ToneWord[]>([]);
  const listenTargetWord = listenTargets[currentRoundIndex];

  // For speak mode, cycle through words
  const [speakTargets, setSpeakTargets] = useState<ToneWord[]>([]);
  const speakTargetWord = speakTargets[currentRoundIndex];

  const playTTS = async (text: string) => {
    if (playingAudio) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPlayingAudio(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setPlayingAudio(false);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: roundCount, usedSets: [] }),
      });

      if (!response.ok) throw new Error("Failed to load tone sets");

      const data = await response.json();

      if (!data.sets || data.sets.length === 0) {
        throw new Error("No tone sets available");
      }

      setToneSets(data.sets);

      // Pre-select target words for each round
      if (mode === "listen") {
        const targets = data.sets.map((set: ToneSet) =>
          set.words[Math.floor(Math.random() * set.words.length)]
        );
        setListenTargets(targets);
        setListenAnswers([]);
      } else {
        const targets = data.sets.map((set: ToneSet) =>
          set.words[Math.floor(Math.random() * set.words.length)]
        );
        setSpeakTargets(targets);
        setSpeakAnswers([]);
      }

      setCurrentRoundIndex(0);
      setSelectedTone(null);
      setShowAnswer(false);
      setTranscription(null);
      setSpeakFeedback(null);
      setSpeakIsCorrect(null);
      setPhase("practice");
    } catch (err) {
      setError("Failed to load tone practice. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListenCheck = () => {
    if (!selectedTone || !listenTargetWord || !currentSet) return;

    const isCorrect = selectedTone === listenTargetWord.tone;

    setListenAnswers(prev => [...prev, {
      set: currentSet,
      targetWord: listenTargetWord,
      selectedTone,
      isCorrect
    }]);

    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentRoundIndex + 1 >= toneSets.length) {
      setPhase("results");
    } else {
      setCurrentRoundIndex(prev => prev + 1);
      setSelectedTone(null);
      setShowAnswer(false);
      setTranscription(null);
      setSpeakFeedback(null);
      setSpeakIsCorrect(null);
    }
  };

  // Recording functions for speak mode
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAndCheck(audioBlob);
      };

      mediaRecorder.start();
      setRecordingState("recording");
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("transcribing");
    }
  };

  const transcribeAndCheck = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");

      const { text } = await response.json();
      setTranscription(text || "");

      // Compare with target
      if (speakTargetWord && currentSet) {
        const result = compareToneWord(speakTargetWord, text || "", currentSet);
        setSpeakIsCorrect(result.isMatch);
        setSpeakFeedback(result.feedback);

        setSpeakAnswers(prev => [...prev, {
          targetWord: speakTargetWord,
          set: currentSet,
          transcription: text || "",
          isCorrect: result.isMatch,
          feedback: result.feedback
        }]);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setSpeakFeedback("Could not hear clearly. Please try again.");
      setSpeakIsCorrect(false);
    } finally {
      setRecordingState("idle");
    }
  };

  const compareToneWord = (target: ToneWord, transcription: string, toneSet: ToneSet): { isMatch: boolean; feedback: string } => {
    // Clean transcription: remove punctuation, ellipsis, whitespace
    const cleanTranscription = transcription
      .trim()
      .replace(/[.…,!?。、！？\s]+$/g, "") // Remove trailing punctuation
      .replace(/^[.…,!?。、！？\s]+/g, "") // Remove leading punctuation
      .trim();

    if (!cleanTranscription) {
      return { isMatch: false, feedback: "Could not hear clearly. Please try again." };
    }

    // Exact match
    if (cleanTranscription === target.thai) {
      return { isMatch: true, feedback: "You pronounced it correctly!" };
    }

    // Check if user said a different word from the same tone set
    const matchedVariant = toneSet.words.find(
      w => w.thai === cleanTranscription && w.thai !== target.thai
    );

    if (matchedVariant) {
      return {
        isMatch: false,
        feedback: `You said "${matchedVariant.thai}" (${TONE_INFO[matchedVariant.tone].name} tone) = "${matchedVariant.meaning}". The target was "${target.thai}" (${TONE_INFO[target.tone].name} tone) = "${target.meaning}".`
      };
    }

    // Partial match or completely different
    return {
      isMatch: false,
      feedback: `You said "${cleanTranscription}" but the target was "${target.thai}" (${TONE_INFO[target.tone].name} tone). Try focusing on the tone: ${target.toneExplanation}`
    };
  };

  const handleMicClick = () => {
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "recording") {
      stopRecording();
    }
  };

  const handleNewPractice = () => {
    setPhase("setup");
    setToneSets([]);
    setCurrentRoundIndex(0);
    setListenAnswers([]);
    setSpeakAnswers([]);
    setSelectedTone(null);
    setShowAnswer(false);
    setTranscription(null);
    setSpeakFeedback(null);
    setSpeakIsCorrect(null);
  };

  const handlePracticeMissed = () => {
    const missedSets = mode === "listen"
      ? listenAnswers.filter(a => !a.isCorrect).map(a => a.set)
      : speakAnswers.filter(a => !a.isCorrect).map(a => a.set);

    if (missedSets.length === 0) {
      handleNewPractice();
      return;
    }

    // Create new targets for missed sets
    if (mode === "listen") {
      const targets = missedSets.map(set =>
        set.words[Math.floor(Math.random() * set.words.length)]
      );
      setListenTargets(targets);
      setListenAnswers([]);
    } else {
      const targets = missedSets.map(set =>
        set.words[Math.floor(Math.random() * set.words.length)]
      );
      setSpeakTargets(targets);
      setSpeakAnswers([]);
    }

    setToneSets(missedSets);
    setCurrentRoundIndex(0);
    setSelectedTone(null);
    setShowAnswer(false);
    setTranscription(null);
    setSpeakFeedback(null);
    setSpeakIsCorrect(null);
    setPhase("practice");
  };

  const totalRounds = toneSets.length;
  const scorePercentage = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;

  // Record progress when practice ends
  useEffect(() => {
    if (phase === "results" && totalRounds > 0) {
      const answers = mode === "listen" ? listenAnswers : speakAnswers;
      recordToneSession({
        mode,
        score,
        total: answers.length,
        answers: answers.map((a) => ({
          targetTone: a.targetWord.tone,
          targetThai: a.targetWord.thai,
          baseSound: a.set.baseSound,
          isCorrect: a.isCorrect,
        })),
      });
    }
  }, [phase, mode, score, totalRounds, listenAnswers, speakAnswers]);

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
            <Mic className="w-5 h-5" />
            Tone Practice
          </h1>
          {phase === "practice" && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentRoundIndex + 1} / {totalRounds}
            </span>
          )}
          {phase !== "practice" && <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="space-y-8">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Practice Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("listen")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === "listen"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                  }`}
                >
                  <Headphones className={`w-6 h-6 mb-2 ${mode === "listen" ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`font-medium ${mode === "listen" ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                    Listen & Identify
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hear a word, pick the tone
                  </p>
                </button>

                <button
                  onClick={() => setMode("speak")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === "speak"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                  }`}
                >
                  <MessageCircle className={`w-6 h-6 mb-2 ${mode === "speak" ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`font-medium ${mode === "speak" ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                    Speak & Check
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Say a word, get feedback
                  </p>
                </button>
              </div>
            </div>

            {/* Round Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How many rounds?
              </label>
              <div className="flex gap-2">
                {ROUND_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setRoundCount(count)}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                      roundCount === count
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Info */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Thai has 5 tones
                  </p>
                  <div className="space-y-1 text-sm">
                    {TONES.map((tone) => (
                      <div key={tone} className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${TONE_INFO[tone].color}`}>
                          {TONE_INFO[tone].name}
                        </span>
                        <span className="text-amber-700 dark:text-amber-300">
                          {TONE_INFO[tone].description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                "Start Practice"
              )}
            </button>
          </div>
        )}

        {/* Listen & Identify Practice */}
        {phase === "practice" && mode === "listen" && listenTargetWord && currentSet && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Score: {score} correct
              </span>
            </div>

            {/* Audio Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-zinc-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Listen to the word and identify the tone
              </p>
              <button
                onClick={() => playTTS(listenTargetWord.thai)}
                disabled={playingAudio}
                className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 mx-auto"
              >
                {playingAudio ? (
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <Volume2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                )}
              </button>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Base sound: <span className="font-medium">"{currentSet.baseSound}"</span>
              </p>
            </div>

            {/* Tone Selection */}
            {!showAnswer && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  What tone did you hear?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedTone === tone
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                      }`}
                    >
                      <span className={`block font-medium ${selectedTone === tone ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                        {TONE_INFO[tone].name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {TONE_INFO[tone].thai}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleListenCheck}
                  disabled={!selectedTone}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Check Answer
                </button>
              </div>
            )}

            {/* Answer Reveal */}
            {showAnswer && (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl border-2 ${
                  listenAnswers[listenAnswers.length - 1]?.isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {listenAnswers[listenAnswers.length - 1]?.isCorrect ? (
                      <>
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-6 h-6 text-red-600" />
                        <span className="font-semibold text-red-700 dark:text-red-300">Incorrect</span>
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {listenTargetWord.thai}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 italic">
                      {listenTargetWord.romanization}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      "{listenTargetWord.meaning}"
                    </p>
                  </div>

                  <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${TONE_INFO[listenTargetWord.tone].color}`}>
                    {TONE_INFO[listenTargetWord.tone].name} tone ({TONE_INFO[listenTargetWord.tone].thai})
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {listenTargetWord.toneExplanation}
                  </p>
                </div>

                {/* Other tone variants */}
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Other "{currentSet.baseSound}" tones:
                  </p>
                  <div className="space-y-2">
                    {currentSet.words.filter(w => w.thai !== listenTargetWord.thai).map((word, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{word.thai}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${TONE_INFO[word.tone].color}`}>
                            {TONE_INFO[word.tone].name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{word.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {currentRoundIndex + 1 >= totalRounds ? "See Results" : "Next Round"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Speak & Check Practice */}
        {phase === "practice" && mode === "speak" && speakTargetWord && currentSet && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Score: {score} correct
              </span>
            </div>

            {/* Target Word Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-zinc-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Say this word with the correct tone:
              </p>
              <p className="text-4xl font-medium text-gray-900 dark:text-white mb-2">
                {speakTargetWord.thai}
              </p>
              <p className="text-lg text-blue-600 dark:text-blue-400 italic mb-2">
                {speakTargetWord.romanization}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "{speakTargetWord.meaning}"
              </p>

              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${TONE_INFO[speakTargetWord.tone].color} mb-3`}>
                {TONE_INFO[speakTargetWord.tone].name} tone
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {speakTargetWord.toneExplanation}
              </p>

              {/* Listen to example */}
              <button
                onClick={() => playTTS(speakTargetWord.thai)}
                disabled={playingAudio}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors mx-auto"
              >
                {playingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span className="text-sm">Listen to example</span>
              </button>
            </div>

            {/* Recording Section */}
            {speakIsCorrect === null && (
              <div className="text-center">
                <button
                  onClick={handleMicClick}
                  disabled={recordingState === "transcribing"}
                  className={`p-6 rounded-full transition-all ${
                    recordingState === "recording"
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : recordingState === "transcribing"
                      ? "bg-gray-400 cursor-wait"
                      : "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  }`}
                >
                  {recordingState === "transcribing" ? (
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                  ) : recordingState === "recording" ? (
                    <Square className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {recordingState === "recording"
                    ? "Recording... Click to stop"
                    : recordingState === "transcribing"
                    ? "Processing..."
                    : "Click to record"}
                </p>
              </div>
            )}

            {/* Feedback */}
            {speakIsCorrect !== null && (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl border-2 ${
                  speakIsCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {speakIsCorrect ? (
                      <>
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">Great match!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-6 h-6 text-red-600" />
                        <span className="font-semibold text-red-700 dark:text-red-300">Not quite right</span>
                      </>
                    )}
                  </div>

                  {transcription && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-medium">You said:</span> "{transcription}"
                    </p>
                  )}

                  <p className="text-gray-600 dark:text-gray-400">
                    {speakFeedback}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {currentRoundIndex + 1 >= totalRounds ? "See Results" : "Next Round"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Practice Complete!
              </h2>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {score} / {totalRounds}
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
                {mode === "listen" ? (
                  listenAnswers.map((answer, index) => (
                    <div key={index} className="px-4 py-3 flex items-center gap-3">
                      {answer.isCorrect ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {answer.targetWord.thai}{" "}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${TONE_INFO[answer.targetWord.tone].color}`}>
                            {TONE_INFO[answer.targetWord.tone].name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {answer.targetWord.meaning}
                          {!answer.isCorrect && answer.selectedTone && (
                            <span className="text-red-500"> (you picked: {TONE_INFO[answer.selectedTone].name})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  speakAnswers.map((answer, index) => (
                    <div key={index} className="px-4 py-3 flex items-center gap-3">
                      {answer.isCorrect ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {answer.targetWord.thai}{" "}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${TONE_INFO[answer.targetWord.tone].color}`}>
                            {TONE_INFO[answer.targetWord.tone].name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {answer.targetWord.meaning}
                          {!answer.isCorrect && answer.transcription && (
                            <span className="text-red-500"> (you said: {answer.transcription})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleNewPractice}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                New Practice
              </button>
              {(mode === "listen" ? listenAnswers : speakAnswers).some(a => !a.isCorrect) && (
                <button
                  onClick={handlePracticeMissed}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
                >
                  Practice Missed ({(mode === "listen" ? listenAnswers : speakAnswers).filter(a => !a.isCorrect).length})
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
