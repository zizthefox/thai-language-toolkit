"use client";

import { VolumeX, X } from "lucide-react";

interface TTSErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

/**
 * Floating notice for text-to-speech failures. Renders nothing when there is no
 * error, so pages can drop it in unconditionally.
 */
export function TTSErrorToast({ message, onDismiss }: TTSErrorToastProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(28rem,calc(100vw-2rem))]"
    >
      <div className="flex items-start gap-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/90 backdrop-blur px-4 py-3 shadow-lg">
        <VolumeX className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
        <p className="flex-1 text-sm text-red-800 dark:text-red-200">{message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded p-0.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
