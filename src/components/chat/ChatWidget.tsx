// src/components/chat/ChatWidget.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { useChatSession } from "./useChatSession";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, isLoading, send, clearConversation } = useChatSession();

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95"
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
        </button>
      )}

      {open && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={send}
          onClear={clearConversation}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
