// src/lib/chat-api.ts
import type { ChatRequest, ChatResponse } from "@/types/chat";

const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAT_ENDPOINT ?? "/api/chat";

export class ChatApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
    this.body = body;
  }
}

export async function sendChatMessage(
  payload: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  let res: Response;
  try {
    res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ChatApiError(
      "Network error — could not reach the assistant.",
      0
    );
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const msg =
      (body as { message?: string })?.message ??
      `Request failed with status ${res.status}`;
    throw new ChatApiError(msg, res.status, body);
  }

  return (await res.json()) as ChatResponse;
}
