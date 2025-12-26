"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SCENARIOS, Scenario, ChatMessage as ChatMessageType } from "@/lib/types";
import Link from "next/link";

export default function ChatPage() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start conversation when scenario changes
  useEffect(() => {
    const initConversation = async () => {
      setMessages([]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "[START CONVERSATION]" }],
            scenario: scenario.id,
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              fullContent += decoder.decode(value);
            }
          }

          if (fullContent) {
            setMessages([{ role: "assistant", content: fullContent }]);
          }
        }
      } catch (error) {
        console.error("Failed to start conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [scenario]);

  const handleSpeak = async (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
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

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlaying(false);
    }
  };

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: ChatMessageType = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scenario: scenario.id,
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullContent += decoder.decode(value);
          }
        }

        if (fullContent) {
          setMessages([
            ...updatedMessages,
            { role: "assistant", content: fullContent },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioChange = (newScenario: Scenario) => {
    setScenario(newScenario);
    setShowScenarios(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back
          </Link>
          <div className="text-center">
            <button
              onClick={() => setShowScenarios(!showScenarios)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-xl">{scenario.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {scenario.name}
              </span>
              <span className="text-gray-400">▼</span>
            </button>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Scenario dropdown */}
        {showScenarios && (
          <div className="max-w-2xl mx-auto mt-3">
            <ScenarioSelector
              selected={scenario}
              onSelect={handleScenarioChange}
            />
          </div>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-lg mb-2">Starting conversation...</p>
              <p className="text-sm">
                Practice ordering at a {scenario.name.toLowerCase()}
              </p>
            </div>
          )}

          {messages
            .filter((m) => m.content !== "[START CONVERSATION]")
            .map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                onSpeak={message.role === "assistant" ? handleSpeak : undefined}
                isPlaying={isPlaying}
              />
            ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Type in Thai or English..."
          />
          <p className="text-xs text-center text-gray-400 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </footer>
    </div>
  );
}
