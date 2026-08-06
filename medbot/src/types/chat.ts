export type ChatRole = 'user' | 'bot';

export interface CitationItem {
  chunk_id: string;
  document_name?: string;
  page_number?: number;
  section?: string;
  evidence_quote: string;
  score?: number;
}

export interface ExerciseData {
  animation_id: string;
  title: string;
  target_area: string;
  description: string;
  difficulty: string;
  fbx_path: string;
  contraindications: string[];
  instructions: string[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  isStreaming?: boolean;
  citations?: CitationItem[];
  confidence?: 'high' | 'medium' | 'low';
  safetyEvent?: string;
  recommendedExercise?: ExerciseData;
}

export interface StreamTokenEvent {
  event: 'token';
  data: string;
}

export interface StreamDoneEvent {
  event: 'done';
  citations: CitationItem[];
  confidence: 'high' | 'medium' | 'low';
  safety_event?: string;
  recommended_exercise?: ExerciseData;
}

export interface StreamErrorEvent {
  event: 'error';
  detail: string;
}

export type StreamEvent = StreamTokenEvent | StreamDoneEvent | StreamErrorEvent;
