// src/components/chat/Message.tsx
"use client";

import { FileText, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, Citation } from "@/types/chat";

function filenameFromUri(uri: string): string {
  try {
    const parts = uri.split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || uri);
  } catch {
    return uri;
  }
}

// function CitationChips({ citations }: { citations: Citation[] }) {
//   const unique = Array.from(
//   new Map(citations.map((c) => [c.document_uri, c])).values());
//   if (!unique.length) return null;
//   return (
//     <div className="mt-2 flex flex-wrap gap-1.5">
//       {unique.map((c, i) => {
//         const label = filenameFromUri(c.document_uri);
//         return (
//           <span
//             key={`${c.document_uri}-${i}`}
//             title={c.snippet ?? label}
//             className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
//           >
//             <FileText className="h-3 w-3 shrink-0" aria-hidden />
//             <span className="max-w-[200px] truncate">{label}</span>
//           </span>
//         );
//       })}
//     </div>
//   );
// }

function CitationChips({ citations }: { citations: Citation[] }) {
  const unique = Array.from(
    new Map(citations.map((c) => [c.document_uri, c])).values()
  );
  if (!unique.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {unique.map((c, i) => {
        const label = filenameFromUri(c.document_uri);
        const inner = (
          <>
            <FileText className="h-3 w-3 shrink-0" aria-hidden />
            <span className="max-w-[200px] truncate">{label}</span>
            {c.preview_url && (
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            )}
          </>
        );
        if (c.preview_url) {
          return (
            <a
              key={`${c.document_uri}-${i}`}
              href={c.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              title={c.snippet ?? label}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100">
              {inner}
            </a>
          );
        }
        return (
          <span
            key={`${c.document_uri}-${i}`}
            title={c.snippet ?? label}
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
}

export function Message({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const isError = message.role === "error";
  const bubbleClasses = isError
    ? "bg-red-50 text-red-900 border border-red-200"
    : "bg-gray-100 text-gray-900";

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[85%] break-words rounded-2xl rounded-bl-md px-4 py-2.5 text-sm ${bubbleClasses}`}
      >
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-1 prose-ul:my-1 prose-ol:my-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        {message.citations && message.citations.length > 0 && (
          <CitationChips citations={message.citations} />
        )}
      </div>
    </div>
  );
}
