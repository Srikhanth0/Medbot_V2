import type { ChatMessage } from "@/types/chat";

export const mockMessages: ChatMessage[] = [
  { id: "1", role: "bot", content: "Heyy, How May I Help You!", timestamp: "10:30 AM" },
  { id: "2", role: "user", content: "Hello!", timestamp: "10:31 AM" },
];
