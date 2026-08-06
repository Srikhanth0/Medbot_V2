import * as React from "react";
import { Paperclip, Send, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";

interface ChatInputProps {
  onSend?: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = React.useState("");
  const sendMessage = useChatStore((state) => state.sendMessage);

  const handleSend = () => {
    if (text.trim()) {
      if (onSend) {
        onSend(text);
      } else {
        sendMessage(text);
      }
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-[#49565C] px-4 py-3 shadow-md">
      <button
        type="button"
        title="Attach File"
        className="flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
      >
        <Paperclip className="h-5 w-5" />
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ENTER HERE...."
        className="flex-1 bg-transparent text-white placeholder-gray-400 font-bold uppercase text-sm outline-none border-none focus:ring-0"
      />
      <button
        type="button"
        title="Voice Input"
        className="flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
      >
        <Mic className="h-5 w-5" />
      </button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!text.trim()}
        title="Send Message"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-white disabled:opacity-50 transition-all cursor-pointer shadow-sm"
      >
        <Send className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

export default ChatInput;
