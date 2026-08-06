import React from 'react';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const styles = {
    high: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  );
}
