"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth-guard";
import { askAssistant } from "@/services/assistant-service";
import { renderParsedItinerary } from "@/lib/itinerary-parser";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "Do I need a visa to visit Japan?",
  "What are the short-term stay requirements for visiting Japan?",
  "What documents are required for tourist visa processing?",
  "What are the general customs rules for foreign visitors?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "assistant",
    text: "Halo! Saya **KelanaAI Travel Assistant** 🤖\n\nSilakan tanyakan seputar dokumen perjalanan, persyaratan visa, atau panduan destinasi. Semua jawaban saya didapatkan langsung dari dokumen terpercaya di Amazon Bedrock Knowledge Base!",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await askAssistant(textToSend.trim());
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        source: res.source,
        timestamp: botTime,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi Knowledge Base. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
        {/* Centered Minimalist Chat Container */}
        <main className="pt-26 sm:pt-28 pb-52 px-4 sm:px-6 max-w-[800px] mx-auto w-full flex-grow flex flex-col">
          {/* Top Header Bar */}
          <div className="py-4 mb-6 border-b border-[#cccbc8]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <h1 className="text-lg font-bold text-[#141413] tracking-tight">
                  KelanaAI Assistant
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-[#87867f] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Bedrock Knowledge Base (RAG)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
              >
                Reset Chat
              </button>
              <Link
                href="/trips"
                className="text-xs font-medium text-[#87867f] hover:text-[#141413] transition-colors"
              >
                ← Trips
              </Link>
            </div>
          </div>

          {/* Clean Message Stream (No Box Containers) */}
          <div className="flex-1 space-y-6 my-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                {msg.sender === "user" ? (
                  /* User Bubble (Dark Minimal Pill) */
                  <div className="max-w-[85%] sm:max-w-[75%] bg-[#141413] text-[#faf9f5] rounded-2xl rounded-tr-xs px-5 py-3 shadow-2xs space-y-1">
                    <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                    <p className="text-[10px] text-gray-400 text-right">{msg.timestamp}</p>
                  </div>
                ) : (
                  /* Assistant Bubble (Clean Open Text, No Wrapping Card Box) */
                  <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-[#d97757]/10 text-[#d97757] flex items-center justify-center text-xs shrink-0 mt-0.5 border border-[#d97757]/20">
                      🤖
                    </div>
                    <div className="space-y-2 pt-0.5">
                      {/* Direct Clean Text Rendering (Card Box Removed) */}
                      <div className="text-xs sm:text-sm text-[#141413] leading-relaxed">
                        {renderParsedItinerary(msg.text)}
                      </div>

                      {/* Minimalist Citation Badge */}
                      {msg.source && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-medium text-[#d97757] bg-[#d97757]/10 border border-[#d97757]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-mono">
                            ▤ {msg.source}
                          </span>
                          <span className="text-[10px] text-[#87867f] italic">Grounded source</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 animate-fadeIn">
                <div className="w-7 h-7 rounded-full bg-[#d97757]/10 text-[#d97757] flex items-center justify-center text-xs shrink-0 border border-[#d97757]/20">
                  🤖
                </div>
                <div className="flex items-center gap-2 text-xs text-[#87867f] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-bounce [animation-delay:0.4s]"></div>
                  <span className="pl-1">Searching Knowledge Base...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)} className="font-bold underline">
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Bottom Controls Panel (Input + Suggestions) */}
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[800px] px-4 sm:px-6 z-30 bg-[#faf9f5]/95 backdrop-blur-md pt-3 pb-3 border-t border-[#cccbc8]/30">
            {/* Quick Prompt Chips */}
            <div className="mb-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#87867f] shrink-0">
                Suggestions:
              </span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="text-[11px] font-medium bg-white hover:bg-[#141413] text-[#565550] hover:text-white border border-[#cccbc8] px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer shadow-2xs disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Pill Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#cccbc8] rounded-full p-1.5 shadow-md flex items-center gap-2 pl-5 pr-2 transition-all focus-within:border-[#d97757]"
            >
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a travel question..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-[#141413] placeholder-[#87867f] focus:outline-none"
              />

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-9 h-9 rounded-full bg-[#141413] hover:bg-[#d97757] text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shrink-0 shadow-2xs"
                title="Send message"
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-xs">➔</span>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
