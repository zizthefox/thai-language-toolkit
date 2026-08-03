"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Voice = "female" | "male";

const GENERIC_ERROR = "Could not play pronunciation audio. Please try again.";

/**
 * Shared text-to-speech playback for the practice pages.
 *
 * Owns the audio element, the "which text is playing" state, and — importantly
 * — the error message. TTS failures are server-side and invisible otherwise:
 * without this, a broken speech service just looks like a button that does
 * nothing.
 */
export function useTTS() {
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const releaseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Don't leave audio playing or object URLs leaked when the page unmounts.
  useEffect(() => releaseAudio, [releaseAudio]);

  const stop = useCallback(() => {
    releaseAudio();
    setPlayingText(null);
  }, [releaseAudio]);

  const clearError = useCallback(() => setError(null), []);

  const speak = useCallback(
    async (text: string, voice: Voice = "female") => {
      if (playingText === text) return;

      releaseAudio();
      setError(null);
      setPlayingText(text);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
        });

        if (!response.ok) {
          const message = await response
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);

          throw new Error(message || GENERIC_ERROR);
        }

        const audioUrl = URL.createObjectURL(await response.blob());
        objectUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => stop();
        audio.onerror = () => {
          setError(GENERIC_ERROR);
          stop();
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        setError(err instanceof Error ? err.message : GENERIC_ERROR);
        stop();
      }
    },
    [playingText, releaseAudio, stop]
  );

  return {
    speak,
    stop,
    playingText,
    isPlaying: playingText !== null,
    error,
    clearError,
  };
}
