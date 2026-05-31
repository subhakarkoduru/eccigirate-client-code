// src/types/chat.ts

export interface Citation {
  document_uri: string;
  snippet?: string;
  preview_url?: string;
}

export interface ChatResponse {
  answer: string;
  session_id: string;
  citations?: Citation[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export type MessageRole = "user" | "assistant" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
}
