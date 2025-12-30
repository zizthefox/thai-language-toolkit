"use client";

import Image from "next/image";
import { Volume2, Loader2, Lightbulb } from "lucide-react";
import { ParsedResponse } from "@/lib/types";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  parsed?: ParsedResponse;
  onSpeak?: (text: string) => void;
  isPlaying?: boolean;
  avatar?: string;
}

export function ChatMessage({
  role,
  content,
  parsed,
  onSpeak,
  isPlaying,
  avatar,
}: ChatMessageProps) {
  const isUser = role === "user";

  // Try to parse JSON from assistant messages
  let displayParsed = parsed;
  if (!displayParsed && !isUser) {
    try {
      // Look for JSON in the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        displayParsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Not valid JSON, display as plain text
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  // Assistant message with parsed Thai response
  if (displayParsed) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-3">
          {avatar && (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-lg">
              <Image
                src={avatar}
                alt="Character"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur rounded-2xl rounded-tl-md px-4 py-3 max-w-[75%] space-y-2">
          {/* Thai text with speaker button */}
          <div className="flex items-start gap-2">
            <p className="text-2xl font-medium text-gray-900 dark:text-white">
              {displayParsed.thai}
            </p>
            {onSpeak && (
              <button
                onClick={() => onSpeak(displayParsed.thai)}
                disabled={isPlaying}
                className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                title="Listen to pronunciation"
              >
                {isPlaying ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>

          {/* Romanization */}
          <p className="text-sm text-blue-600 dark:text-blue-400 italic">
            {displayParsed.romanization}
          </p>

          {/* English translation */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {displayParsed.english}
          </p>

          {/* Correction if any */}
          {displayParsed.correction && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{displayParsed.correction}</span>
              </p>
            </div>
          )}

          {/* Suggestions - conversation prompts */}
          {displayParsed.suggestions && displayParsed.suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                What you could say next:
              </p>
              <div className="flex flex-wrap gap-2">
                {displayParsed.suggestions.map((suggestion, i) => {
                  const text = typeof suggestion === "string" ? suggestion : suggestion.thai;

                  return (
                    <div
                      key={i}
                      className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full"
                    >
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  // Plain text fallback
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        {avatar && (
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-lg">
            <Image
              src={avatar}
              alt="Character"
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur rounded-2xl rounded-tl-md px-4 py-2 max-w-[75%]">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
