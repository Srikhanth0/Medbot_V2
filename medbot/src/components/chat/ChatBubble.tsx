import * as React from "react";
import { cn } from "@/utils/cn";
import { CitationItem } from "@/types/chat";
import { CitationCard } from "./CitationCard";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  citations?: CitationItem[];
  confidence?: 'high' | 'medium' | 'low';
}

export function ChatBubble({ message, isUser, timestamp, citations, confidence }: ChatBubbleProps) {
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm",
          isUser
            ? "bg-[#478768] text-white rounded-tr-sm"
            : "bg-[#DDD4D8] text-[#11222C] rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message}</div>
        
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-4 border-t border-[#11222C]/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs uppercase tracking-wider text-[#11222C]/70">Sources</span>
              {confidence && <ConfidenceBadge confidence={confidence} />}
            </div>
            <div className="flex flex-col gap-2">
              {citations.map((citation, idx) => (
                <CitationCard key={citation.chunk_id || idx} citation={citation} index={idx} />
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            "mt-2 text-[10px] opacity-70 flex",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}
