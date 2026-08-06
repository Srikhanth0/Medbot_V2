import React from 'react';
import { motion } from 'framer-motion';
import { CharacterViewer } from '@/components/model/CharacterViewer';
import { ModelControlPanel } from '@/components/model/ModelControlPanel';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/stores/chatStore';

/**
 * Main Home / Chat Dashboard Page
 * Refined 2-Column layout with upward position shift, compact container heights,
 * and dedicated 3D Model Control Panel.
 */
export const Dashboard: React.FC = () => {
  const { messages, isTyping } = useChatStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col -mt-2 space-y-3"
    >
      {/* Compact Header Greeting */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-wide">
            MedCore AI Clinical Workspace
          </h1>
          <p className="text-xs text-gray-400 font-medium">Real-time physiological telemetry & AI diagnosis</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0891B2]/20 text-[#0891B2] border border-[#0891B2]/30">
          <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse" />
          3D Telemetry Active
        </span>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Column - 3D Character Viewer + Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between h-[480px] lg:h-[540px]">
          {/* 3D Character Card */}
          <div className="flex-1 bg-[#63676B] rounded-2xl p-3 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <div className="flex-1 w-full h-full relative z-10">
              <CharacterViewer />
            </div>
          </div>

          {/* Model Control Panel */}
          <ModelControlPanel />
        </div>

        {/* Right Column - AI Chat Assistant */}
        <div className="lg:col-span-7 h-[480px] lg:h-[540px] flex flex-col bg-[#DDD4D8] rounded-2xl p-5 shadow-xl overflow-hidden border-t-4 border-[#0891B2]">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-3">
            <h2 className="text-[#11222C] font-bold text-lg tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              AI Assistant Chat
            </h2>
            <span className="text-xs font-mono font-bold text-gray-500">Live Context</span>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto pr-2 mb-3 space-y-2.5">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.content}
                isUser={msg.role === 'user'}
                timestamp={msg.timestamp}
                citations={msg.citations}
                confidence={msg.confidence}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-[#478768] font-medium text-sm p-2.5 bg-white/50 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-[#478768] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#478768] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#478768] animate-bounce delay-200" />
                <span className="ml-1 text-xs">MedBot is analyzing...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="mt-auto pt-1">
            <ChatInput />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
