// TODO Phase 2: Connect to real LLM backend
export const mockChatService = {
  generateReply: async (message: string): Promise<string> => {
    return new Promise((resolve) => {
      const delay = Math.random() * 1000 + 500; // 500ms - 1500ms
      setTimeout(() => {
        if (message.toLowerCase().includes('headache')) {
          resolve("I'm sorry to hear you have a headache. Make sure you're well-hydrated and consider resting in a quiet, dark room. If it persists, please consult your primary doctor.");
        } else if (message.toLowerCase().includes('appointment')) {
          resolve("I can help you schedule an appointment. When would you like to see Dr. Chen?");
        } else {
          resolve("I understand. Based on your profile, your vitals are currently stable. Is there anything specific you would like me to check?");
        }
      }, delay);
    });
  }
};
