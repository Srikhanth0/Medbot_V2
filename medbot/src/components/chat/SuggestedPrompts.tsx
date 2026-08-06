import * as React from "react";
import { motion } from "framer-motion";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  "Check my blood pressure trend",
  "Explain glucose levels",
  "Schedule next checkup",
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {prompts.map((prompt, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-gray-600 bg-[#122B36] px-4 py-1.5 text-xs text-gray-300 hover:bg-[#1A3A4A] hover:text-white transition-colors"
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
