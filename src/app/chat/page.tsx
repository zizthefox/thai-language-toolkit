"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  const [showSceneIntro, setShowSceneIntro] = useState(true);
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
      setShowSceneIntro(true);

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

  // Hide scene intro after first message from user
  useEffect(() => {
    if (messages.length > 1) {
      setShowSceneIntro(false);
    }
  }, [messages]);

  const handleSpeak = async (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: scenario.voice }),
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
    <div className="flex flex-col h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={scenario.background}
          alt={scenario.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back
            </Link>

            {/* Character Info */}
            <button
              onClick={() => setShowScenarios(!showScenarios)}
              className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                <Image
                  src={scenario.character.avatar}
                  alt={scenario.character.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {scenario.character.name}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {scenario.character.thaiName} • {scenario.character.role}
                </p>
              </div>
              <span className="text-gray-400 ml-1">▼</span>
            </button>

            <div className="w-16" />
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

        {/* Scene Intro */}
        {showSceneIntro && messages.length <= 1 && (
          <div className="bg-gradient-to-b from-black/60 to-transparent px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/90 text-center italic text-sm">
                {scenario.sceneIntro}
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-white/80 py-8">
                <p className="text-lg mb-2">Starting conversation...</p>
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
                  avatar={message.role === "assistant" ? scenario.character.avatar : undefined}
                />
              ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-lg">
                    <Image
                      src={scenario.character.avatar}
                      alt={scenario.character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur rounded-2xl rounded-tl-md px-4 py-3">
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
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <footer className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-gray-200 dark:border-zinc-800 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              placeholder="Speak or type in Thai or English..."
            />
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Tap the mic to speak • Press Enter to send
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
