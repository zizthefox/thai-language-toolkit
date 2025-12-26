"use client";

import { useState } from "react";
import { ParsedResponse } from "@/lib/types";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  parsed?: ParsedResponse;
  onSpeak?: (text: string) => void;
  isPlaying?: boolean;
}

export function ChatMessage({
  role,
  content,
  parsed,
  onSpeak,
  isPlaying,
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
        <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] space-y-2">
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
                  <span className="text-lg">⏳</span>
                ) : (
                  <span className="text-lg">🔊</span>
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
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-medium">💡 Tip:</span>{" "}
                {displayParsed.correction}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {displayParsed.suggestions && displayParsed.suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Try saying:
              </p>
              <div className="flex flex-col gap-2">
                {displayParsed.suggestions.map((suggestion, i) => {
                  // Handle both old format (string) and new format (object)
                  const thai = typeof suggestion === "string" ? suggestion : suggestion.thai;
                  const romanization = typeof suggestion === "string" ? null : suggestion.romanization;

                  return (
                    <div
                      key={i}
                      className="bg-gray-200 dark:bg-zinc-700 px-3 py-2 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {thai}
                      </p>
                      {romanization && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                          {romanization}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Plain text fallback
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
