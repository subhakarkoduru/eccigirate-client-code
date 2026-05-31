// src/components/chat/useChatSession.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage, ChatApiError } from "@/lib/chat-api";
import type { ChatMessage } from "@/types/chat";

const SESSION_KEY = "vape_chat_session_id";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate session id from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) sessionIdRef.current = stored;
    } catch {
      /* localStorage unavailable — ignore */
    }
    return () => abortRef.current?.abort();
  }, []);

  const persistSession = useCallback((id: string | null) => {
    sessionIdRef.current = id;
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    persistSession(null);
  }, [persistSession]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const attempt = async (useSession: boolean) =>
        sendChatMessage(
          {
            message: text,
            ...(useSession && sessionIdRef.current
              ? { session_id: sessionIdRef.current }
              : {}),
          },
          controller.signal
        );

      try {
        let res;
        try {
          res = await attempt(true);
        } catch (err) {
          // Stale session: clear and retry once without session_id
          if (err instanceof ChatApiError && err.status === 410) {
            persistSession(null);
            res = await attempt(false);
          } else {
            throw err;
          }
        }

        persistSession(res.session_id);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: res.answer,
            citations: res.citations,
          },
        ]);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        const message =
          err instanceof ChatApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "error", content: message },
        ]);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, persistSession]
  );

  return { messages, isLoading, send, clearConversation };
}
