import * as React from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { useChatStore } from "@/stores/chatStore";

export function ChatContainer() {
  const { messages, isTyping, sendMessage } = useChatStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto rounded-3xl bg-[#11222C] border border-gray-800 p-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar">
        {messages.map((msg) => (
          <ChatBubble 
            key={msg.id} 
            message={msg.content} 
            isUser={msg.role === 'user'} 
            timestamp={new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
            citations={msg.citations}
            confidence={msg.confidence}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <div className="mt-2 shrink-0">
        <SuggestedPrompts onSelect={handleSend} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatContainer;
