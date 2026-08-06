import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CitationItem } from '../../types/chat';

interface CitationCardProps {
  citation: CitationItem;
  index: number;
}

export function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden mb-2 last:mb-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-sm text-left hover:bg-zinc-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-xs">
            [{index + 1}]
          </span>
          <span className="truncate">
            {citation.document_name || 'Unknown Document'}
            {citation.page_number ? `, p. ${citation.page_number}` : ''}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="p-3 pt-0 text-sm">
          {citation.section && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-zinc-700/50 text-zinc-300 text-xs rounded-md">
                Section: {citation.section}
              </span>
            </div>
          )}
          <blockquote className="border-l-2 border-emerald-500/50 pl-3 text-zinc-400 italic">
            "{citation.evidence_quote}"
          </blockquote>
        </div>
      )}
    </div>
  );
}
