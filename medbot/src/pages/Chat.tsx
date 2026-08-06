import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';

/**
 * Dedicated AI Chat Page connected to Python RAG Backend
 */
const Chat: React.FC = () => {
  const { messages, isTyping, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex gap-6"
    >
      {/* Left: Chat History */}
      <div className="w-64 hidden xl:flex flex-col bg-[#DDD4D8] rounded-2xl text-gray-900 overflow-hidden shadow-lg border-t-4 border-[#0891B2]">
        <div className="p-4 border-b border-gray-300 font-bold">History</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {['Headache consultation', 'Diet plan analysis', 'ECG Report reading'].map((item, i) => (
            <div key={i} className="p-3 hover:bg-white rounded-xl cursor-pointer transition-colors text-sm font-medium border border-transparent hover:border-gray-200">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 rounded-2xl border border-gray-800 overflow-hidden relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-[#11222C]/80 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center font-bold text-white">M</div>
             <span className="font-semibold text-white">MedBot — Medical RAG Session</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
             <span className="text-xs text-gray-400">Python RAG Active</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-4">
                {msg.role === 'user' ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">U</div>
                    <div className="flex-1 bg-[#233544] p-4 rounded-2xl rounded-tl-sm text-gray-100 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#0891B2] flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">M</div>
                    <div className="flex-1 bg-transparent text-gray-100 space-y-3 whitespace-pre-wrap leading-relaxed">
                      {msg.content ? (
                        <div>{msg.content}</div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 italic">
                          <span className="animate-pulse">Analyzing query with LangGraph...</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#11222C]">
          <div className="max-w-3xl mx-auto flex items-end gap-2 bg-[#233544] p-2 rounded-xl border border-gray-700">
            <button className="p-2 text-gray-400 hover:text-[#0891B2] transition"><span className="text-xl">📎</span></button>
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MedBot about lab reports, medical terms, or health values..."
              className="flex-1 bg-transparent outline-none resize-none py-2 text-gray-100 placeholder-gray-500 max-h-32"
            />
            <button className="p-2 text-gray-400 hover:text-[#16A34A] transition"><span className="text-xl">🎤</span></button>
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-lg bg-[#0891B2] text-white flex items-center justify-center hover:bg-[#067a96] transition-colors ml-2 disabled:opacity-50 cursor-pointer"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Right: Mini Viewer */}
      <div className="w-72 hidden lg:block bg-black/40 rounded-2xl border border-gray-800 overflow-hidden relative">
         <div className="p-4 border-b border-gray-800 text-sm font-semibold text-gray-400 uppercase tracking-wider bg-[#11222C]/80">Snapshot</div>
         <div className="aspect-square bg-gray-900 border-b border-gray-800 flex items-center justify-center text-gray-600 flex-col">
            <span className="text-3xl mb-2">🩺</span>
            <span className="text-xs">MedBot Active</span>
         </div>
         <div className="p-4 space-y-3">
           <div className="flex justify-between text-sm"><span className="text-gray-400">Model</span><span className="text-white font-medium">NVIDIA Inkling</span></div>
           <div className="flex justify-between text-sm"><span className="text-gray-400">RAG Engine</span><span className="text-[#16A34A] font-medium">LangGraph</span></div>
         </div>
      </div>
    </motion.div>
  );
};

export default Chat;
