import * as React from "react";
import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#DDD4D8] px-4 py-3 shadow-sm">
        <motion.div
          className="h-2 w-2 rounded-full bg-gray-500"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-gray-500"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-gray-500"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
