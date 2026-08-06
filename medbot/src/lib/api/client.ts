/**
 * MedBot Backend API Client
 * Connects the React SPA frontend to the Python FastAPI RAG backend.
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Array<{ chunk_id: string; source_text?: string }>;
  confidence?: "low" | "medium" | "high";
  safetyEvent?: string;
}

export interface ReportUploadResult {
  report_id: string;
  status: string;
}

export interface ReportStatus {
  id: string;
  status: "processing" | "ready" | "failed";
  report_type?: string;
  created_at: string;
}

export class ApiClient {
  private static async getHeaders(token?: string): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Health check endpoint
   */
  static async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (!res.ok) throw new Error("Backend unavailable");
    return res.json();
  }

  /**
   * Create a new chat session
   */
  static async createConversation(
    token: string,
    reportId?: string
  ): Promise<{ id: string }> {
    const headers = await this.getHeaders(token);
    const res = await fetch(`${BACKEND_URL}/api/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify({ report_id: reportId || null }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  }

  /**
   * Stream a chat response via SSE
   */
  static async streamMessage(
    conversationId: string,
    message: string,
    token: string,
    onToken: (tokenText: string) => void,
    onDone: (citations: any[], confidence?: 'high' | 'medium' | 'low', recommendedExercise?: any) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: message }),
        }
      );

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          let trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            while (trimmed.startsWith("data:")) {
              trimmed = trimmed.substring(5).trim();
            }
            try {
              const payload = JSON.parse(trimmed);
              if (payload.event === "token") {
                onToken(payload.data);
              } else if (payload.event === "done") {
                onDone(payload.citations || [], payload.confidence, payload.recommended_exercise);
              } else if (payload.event === "error") {
                onError(new Error(payload.detail || "Stream error"));
              }
            } catch (e) {
              console.warn("Error parsing SSE JSON payload:", e, "raw line:", line);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err);
    }
  }

  /**
   * Upload a medical PDF report
   */
  static async uploadReport(
    file: File,
    token: string
  ): Promise<ReportUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BACKEND_URL}/api/reports`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }

    return res.json();
  }

  /**
   * Poll report status
   */
  static async getReportStatus(
    reportId: string,
    token: string
  ): Promise<ReportStatus> {
    const headers = await this.getHeaders(token);
    const res = await fetch(`${BACKEND_URL}/api/reports/${reportId}`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to get report status");
    return res.json();
  }
}

export default ApiClient;
