import { create } from 'zustand';
import { ChatMessage, ExerciseData } from '../types';
import ApiClient from '../lib/api/client';

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  activeAnimation: 'idle' | 'talking' | 'exercise';
  activeExercise: ExerciseData | null;
  conversationId: string | null;
  setConversationId: (id: string) => void;
  setActiveExercise: (exercise: ExerciseData | null) => void;
  sendMessage: (text: string, token?: string) => Promise<void>;
  addBotResponse: (text: string) => void;
  clearChat: () => void;
}

const initialMessages: ChatMessage[] = [
  { 
    id: '1', 
    role: 'bot', 
    content: 'Hello. I am MedBot, your Medical Understanding Assistant. How can I help you understand your health reports today?', 
    timestamp: new Date().toISOString() 
  }
];

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: initialMessages,
  isTyping: false,
  activeAnimation: 'idle',
  activeExercise: null,
  conversationId: null,
  setConversationId: (id) => set({ conversationId: id }),
  setActiveExercise: (exercise) => set({ 
    activeExercise: exercise, 
    activeAnimation: exercise ? 'exercise' : 'idle' 
  }),

  sendMessage: async (text: string, userToken?: string) => {
    const userMsgId = Date.now().toString();
    const botMsgId = (Date.now() + 1).toString();
    const token = userToken || "dev_auth_token";

    console.log(`[MedBot Client] Sending message to Python backend (${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}):`, text);

    // 1. Add User message & set typing indicator
    set((state) => ({
      messages: [
        ...state.messages,
        { id: userMsgId, role: 'user', content: text, timestamp: new Date().toISOString() }
      ],
      isTyping: true,
      activeAnimation: 'talking'
    }));

    try {
      let convId = get().conversationId;
      if (!convId) {
        console.log('[MedBot Client] Creating new conversation session on Python backend...');
        const convRes = await ApiClient.createConversation(token);
        convId = convRes.id;
        set({ conversationId: convId });
        console.log('[MedBot Client] Session created with ID:', convId);
      }

      // Add empty bot placeholder message for streaming
      set((state) => ({
        messages: [
          ...state.messages,
          { id: botMsgId, role: 'bot', content: '', timestamp: new Date().toISOString() }
        ]
      }));

      // Stream SSE tokens from Python backend
      await ApiClient.streamMessage(
        convId,
        text,
        token,
        (chunk) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === botMsgId ? { ...m, content: m.content + chunk } : m
            )
          }));
        },
        (citations, confidence, recommendedExercise) => {
          console.log('[MedBot Client] SSE Stream completed. Citations:', citations, 'Confidence:', confidence, 'Recommended Exercise:', recommendedExercise);
          const validConfidence = (['high', 'medium', 'low'].includes(confidence as string) ? confidence : undefined) as 'high' | 'medium' | 'low' | undefined;
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === botMsgId ? { ...m, citations, confidence: validConfidence, recommendedExercise, isStreaming: false } : m
            ),
            isTyping: false, 
            activeExercise: recommendedExercise || null,
            activeAnimation: recommendedExercise ? 'exercise' : 'idle' 
          }));
        },
        (err) => {
          console.error('[MedBot Client] Backend SSE connection error:', err);
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === botMsgId && !m.content
                ? { 
                    ...m, 
                    content: "MedBot backend server is starting or unreachable. Please ensure the Python FastAPI backend is running at http://localhost:8000." 
                  }
                : m
            ),
            isTyping: false,
            activeAnimation: 'idle'
          }));
        }
      );
    } catch (err) {
      console.error('[MedBot Client] Failed to reach Python FastAPI backend:', err);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === botMsgId
            ? { ...m, content: "Could not connect to Python RAG backend. Please verify http://localhost:8000 is online." }
            : m
        ),
        isTyping: false,
        activeAnimation: 'idle'
      }));
    }
  },

  addBotResponse: (text) => set((state) => ({
    messages: [
      ...state.messages,
      { id: Date.now().toString(), role: 'bot', content: text, timestamp: new Date().toISOString() }
    ],
    isTyping: false,
    activeAnimation: 'idle'
  })),

  clearChat: () => set({ messages: initialMessages, conversationId: null })
}));

export default useChatStore;
