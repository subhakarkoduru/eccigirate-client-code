// src/components/chat/ChatPanel.tsx
"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import type { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const SUGGESTIONS = [
  "How does the detector identify vaping?",
  "What areas are monitored?",
  "How do I review past alerts?",
];

function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
        <div className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <MessageCircle className="h-6 w-6 text-blue-600" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">
        Vape Detector Assistant
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Ask a question to get started.
      </p>
      <div className="mt-4 flex w-full flex-col gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  isLoading,
  onSend,
  onClear,
  onClose,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:bottom-20 sm:right-6 sm:h-[600px] sm:w-[380px] sm:rounded-2xl"
      role="dialog"
      aria-label="Vape Detector Assistant chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-none bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white sm:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold">Vape Detector Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear conversation"
            className="rounded-md p-1.5 transition-colors hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-md p-1.5 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={onSend} />
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}
        {isLoading && <LoadingDots />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
