"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth-guard";
import {
  createConversationApi,
  getConversationsApi,
  sendMessageApi,
  getMessagesApi,
  deleteConversationApi,
  renameConversationApi,
} from "@/services/assistant-service";
import { renderParsedItinerary } from "@/lib/itinerary-parser";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
  timestamp: string;
}

interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  isPinned?: boolean;
}

const QUICK_SUGGESTIONS = [
  {
    title: "Plan a Trip to Komodo",
    desc: "Rencanakan liburan 4 hari ke Pulau Komodo dengan budget IDR 15.000.000",
  },
  {
    title: "Japan Budget Breakdown",
    desc: "Berapa estimasi biaya liburan 5 hari ke Jepang untuk 2 orang?",
  },
  {
    title: "East Java Hidden Gems",
    desc: "Rekomendasi destinasi wisata alam dan kuliner terbaik di Jawa Timur",
  },
  {
    title: "Travel Requirements",
    desc: "Dokumen dan syarat perjalanan apa saja yang perlu disiapkan?",
  },
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; convId: string | null }>({
    isOpen: false,
    convId: null,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConvId, activeConv?.messages, isLoading]);

  // Load conversations from backend on mount
  useEffect(() => {
    async function initConversations() {
      try {
        const convs = await getConversationsApi();
        if (convs && convs.length > 0) {
          const mapped: ConversationItem[] = convs.map((c) => ({
            id: c.id.toString(),
            title: c.title || "New Conversation",
            timestamp: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            messages: [],
          }));
          setConversations(mapped);
          setActiveConvId(mapped[0].id);
        } else {
          const created = await createConversationApi();
          const newId = created.conversation_id.toString();
          setConversations([
            {
              id: newId,
              title: "New Conversation",
              timestamp: "Just now",
              messages: [],
            },
          ]);
          setActiveConvId(newId);
        }
      } catch (err: any) {
        console.error("Failed to load conversations from backend:", err);
      }
    }
    initConversations();
  }, []);

  // Fetch messages from backend when activeConvId changes
  useEffect(() => {
    if (!activeConvId || isLoading) return;
    const numericId = parseInt(activeConvId, 10);
    if (isNaN(numericId)) return;

    async function loadMessages() {
      try {
        const msgs = await getMessagesApi(numericId);
        const mappedMsgs: ChatMessage[] = msgs.map((m) => ({
          id: m.id.toString(),
          sender: m.role as "user" | "assistant",
          text: m.content,
          source: m.source,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConvId) {
              // Prevent overwriting optimistic user messages while server is processing
              if (mappedMsgs.length === 0 && c.messages.length > 0) {
                return c;
              }
              if (c.messages.length > mappedMsgs.length) {
                return c;
              }
              return { ...c, messages: mappedMsgs };
            }
            return c;
          })
        );
      } catch (err) {
        console.error("Failed to load messages for conversation:", err);
      }
    }
    loadMessages();
  }, [activeConvId, isLoading]);

  const handleNewChat = async () => {
    try {
      const created = await createConversationApi();
      const newId = created.conversation_id.toString();
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const newConv: ConversationItem = {
        id: newId,
        title: "New Conversation",
        timestamp: `${dateStr}, ${nowStr}`,
        messages: [],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newId);
      setInputText("");
      setError(null);
    } catch (err: any) {
      setError("Gagal membuat chat baru di database.");
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    let targetConvId = activeConvId;
    let numericConvId = parseInt(targetConvId, 10);

    if (isNaN(numericConvId)) {
      try {
        const created = await createConversationApi();
        targetConvId = created.conversation_id.toString();
        numericConvId = created.conversation_id;
        setActiveConvId(targetConvId);
      } catch (err) {
        setError("Gagal membuat percakapan di database server.");
        return;
      }
    }

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: userTime,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          const isNewTitle = c.title === "New Conversation" || c.messages.length === 0;
          return {
            ...c,
            title: isNewTitle ? textToSend.trim() : c.title,
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      })
    );

    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      // Call backend memory API endpoint!
      const botMsgApi = await sendMessageApi(numericConvId, textToSend.trim());
      const botTime = new Date(botMsgApi.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const botMsg: ChatMessage = {
        id: botMsgApi.id.toString(),
        sender: "assistant",
        text: botMsgApi.content,
        source: botMsgApi.source,
        timestamp: botTime,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            // Check if userMsg is present, then append botMsg cleanly
            const existingMessages = c.messages.some((m) => m.text === textToSend.trim())
              ? c.messages
              : [...c.messages, userMsg];
            return {
              ...c,
              messages: [...existingMessages, botMsg],
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi AI Assistant. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const onRequestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalState({ isOpen: true, convId: id });
  };

  const confirmDeleteConversation = async () => {
    const id = deleteModalState.convId;
    if (!id) return;

    setDeleteModalState({ isOpen: false, convId: null });

    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      try {
        await deleteConversationApi(numericId);
      } catch (err) {
        console.error(`Failed to delete conversation ${id} from database:`, err);
      }
    }

    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeConvId === id) {
        if (updated.length > 0) {
          setActiveConvId(updated[0].id);
        } else {
          const newId = `conv-${Date.now()}`;
          const newConv: ConversationItem = {
            id: newId,
            title: "New Conversation",
            timestamp: "Just now",
            messages: [],
          };
          setActiveConvId(newId);
          return [newConv];
        }
      }
      return updated;
    });
  };

  const handleSaveRename = async (convId: string) => {
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    const numericId = parseInt(convId);
    if (!isNaN(numericId)) {
      try {
        await renameConversationApi(numericId, editingTitle.trim());
      } catch (err) {
        console.error(`Failed to rename conversation ${convId}:`, err);
      }
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, title: editingTitle.trim() } : c))
    );
    setEditingConvId(null);
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <AuthGuard>
      <div className="fixed inset-0 pt-[84px] pb-5 px-4 sm:px-6 bg-[#f0f3f8] text-[#141413] font-[family-name:var(--font-outfit)] flex gap-4 overflow-hidden z-0">
        {/* Left Sidebar (Conversations List) */}
        <aside className="w-72 sm:w-80 bg-[#edf1f7] border border-[#cbd5e1]/60 rounded-2xl flex flex-col p-4 shrink-0 justify-between shadow-2xs">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* + New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full bg-[#2589f5] hover:bg-[#1c7ae4] text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-base font-bold">+</span>
              <span>New Chat</span>
            </button>

            {/* Conversation History Items */}
            <div className="space-y-2 pt-1">
              {sortedConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-2 ${
                      isActive
                        ? "bg-white border border-[#e2e8f0] shadow-2xs"
                        : "hover:bg-[#e2e8f0]/60 text-[#475569]"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {conv.isPinned && (
                          <span title="Pinned" className="shrink-0 flex items-center">
                            <svg className="w-3.5 h-3.5 text-[#2589f5]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                            </svg>
                          </span>
                        )}
                        {editingConvId === conv.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveRename(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(conv.id);
                              if (e.key === "Escape") setEditingConvId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs font-bold text-[#0f172a] bg-white border border-[#2589f5] rounded px-1.5 py-0.5 focus:outline-hidden"
                          />
                        ) : (
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive ? "text-[#2589f5]" : "text-[#1e293b]"
                            }`}
                          >
                            {conv.title}
                          </p>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5 font-medium">
                        {conv.timestamp}
                      </p>
                    </div>

                    {/* Action Buttons: Rename, Pin & Delete */}
                    <div
                      className={`flex items-center gap-1 shrink-0 ${
                        isActive || conv.isPinned
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      } transition-opacity`}
                    >
                      {/* Rename Pencil Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvId(conv.id);
                          setEditingTitle(conv.title);
                        }}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#2589f5] hover:bg-[#cbd5e1]/40 transition-colors"
                        title="Rename conversation"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Pin / Unpin Button */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(conv.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-[#cbd5e1]/40 transition-colors ${
                          conv.isPinned
                            ? "text-[#2589f5]"
                            : "text-[#94a3b8] hover:text-[#1e293b]"
                        }`}
                        title={conv.isPinned ? "Unpin conversation" : "Pin conversation"}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill={conv.isPinned ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => onRequestDelete(conv.id, e)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete conversation"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Nav back to Trips */}
          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
            <Link href="/trips" className="hover:text-[#1e293b] font-medium transition-colors">
              ← Back to Trips
            </Link>
            <span className="text-[11px] text-[#94a3b8]">KelanaAI v1.0</span>
          </div>
        </aside>

        {/* Right Main Chat Section */}
        <section className="flex-1 flex flex-col bg-white border border-[#cbd5e1]/60 rounded-2xl h-full relative overflow-hidden shadow-2xs">
          {(!activeConv || !activeConv.messages.some((m) => m.sender === "user")) ? (
            /* ChatGPT-style Centered Home Screen Layout */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-white overflow-y-auto">
              <div className="max-w-2xl w-full space-y-8 animate-fadeIn my-auto">
                {/* Large Centered Title */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                    What&apos;s on your mind today?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#64748b] font-medium max-w-md mx-auto">
                    KelanaAI Travel Assistant siap membantu merencanakan liburan, rekomendasi destinasi, dan estimasi anggaran Anda.
                  </p>
                </div>

                {/* Main Centered Input Bar */}
                <form
                  onSubmit={handleSubmit}
                  className="bg-[#edf1f7] border border-[#cbd5e1]/60 rounded-2xl p-3 sm:p-4 shadow-2xs focus-within:border-[#2589f5] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2589f5]/10 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-[#94a3b8] ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask anything about your next trip..."
                    disabled={isLoading}
                    style={{ backgroundColor: "transparent" }}
                    className="flex-1 !bg-transparent text-sm font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none border-none outline-none ring-0"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="bg-[#2589f5] hover:bg-[#1c7ae4] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:bg-[#cbd5e1] disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs flex items-center gap-2"
                  >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </form>

                {/* Quick Suggestion Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  {QUICK_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.desc)}
                      className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#2589f5]/50 hover:shadow-xs transition-all text-left group cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0f172a] group-hover:text-[#2589f5] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation View with Messages and Bottom Input */
            <>
              {/* Header Bar */}
              <header className="px-6 py-3.5 border-b border-[#e2e8f0] bg-white flex items-center justify-between shrink-0 shadow-2xs">
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-[#0f172a] truncate max-w-[600px]">
                    {activeConv?.title || "KelanaAI Travel Assistant"}
                  </h1>
                  <p className="text-[11px] text-[#64748b] font-medium">
                    KelanaAI Travel Assistant
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-[#64748b] font-medium hidden sm:inline">
                    Bedrock RAG Active
                  </span>
                </div>
              </header>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {activeConv?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } animate-fadeIn`}
                  >
                    {msg.sender === "user" ? (
                      /* User Bubble (Blue Pill) */
                      <div className="max-w-[85%] sm:max-w-[75%] bg-[#2589f5] text-white rounded-2xl rounded-tr-xs px-5 py-3 shadow-xs space-y-1">
                        <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-[10px] text-blue-100 text-right">{msg.timestamp}</p>
                      </div>
                    ) : (
                      /* Assistant Chat Bubble (Clean, rounded chat message) */
                      <div className="max-w-[92%] sm:max-w-[85%] bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-2xs space-y-3">
                        <div className="text-xs sm:text-sm text-[#1e293b] leading-relaxed">
                          {renderParsedItinerary(msg.text)}
                        </div>

                        {/* Source Badge Citation */}
                        {msg.source && (
                          <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
                            <span className="text-[11px] font-semibold text-[#2589f5] bg-[#2589f5]/10 border border-[#2589f5]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-mono">
                              ▤ {msg.source}
                            </span>
                            <span className="text-[10px] text-[#94a3b8] italic">
                              Grounded Amazon Bedrock KB
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-3 animate-fadeIn p-4 border border-[#e2e8f0] rounded-xl bg-[#f8fafc]">
                    <div className="w-6 h-6 rounded-full bg-[#2589f5]/10 text-[#2589f5] flex items-center justify-center text-[10px] shrink-0 font-bold">
                      AI
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748b] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2589f5] animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2589f5] animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2589f5] animate-bounce [animation-delay:0.4s]"></div>
                      <span className="pl-1">Generasi rekomendasi travel...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="font-bold underline">
                      Dismiss
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Chat Input Bar */}
              <div className="p-4 sm:px-6 py-4 pb-6 sm:pb-8 border-t border-[#e2e8f0] bg-white shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="bg-[#edf1f7] border border-[#cbd5e1]/60 rounded-2xl p-3 sm:p-4 shadow-2xs focus-within:border-[#2589f5] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2589f5]/10 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-[#94a3b8] ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    style={{ backgroundColor: "transparent" }}
                    className="flex-1 !bg-transparent text-sm font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none border-none outline-none ring-0"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="bg-[#2589f5] hover:bg-[#1c7ae4] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:bg-[#cbd5e1] disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs flex items-center gap-2"
                  >
                    <span>Send</span>
                    {isLoading ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal Pop-up */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#cbd5e1] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Hapus Percakapan?</h3>
                <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">
                  Tindakan ini akan menghapus riwayat chat ini dari database secara permanen.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, convId: null })}
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#cbd5e1]/70 text-[#334155] hover:text-[#0f172a] text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform active:scale-95 shadow-2xs hover:shadow-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-none outline-none"
              >
                <span>Ya, Hapus</span>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
