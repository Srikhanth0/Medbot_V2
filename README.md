# 🩺 MedBot — AI Health & Medical Citation RAG System

MedBot is a production-grade **Medical Understanding & Physical Rehabilitation Platform** combining **Retrieval-Augmented Generation (RAG)** with **verifiable medical citations**, **safety guardrails**, and **interactive 3D exercise visualizations**.

---

## ⚡ Tech Stack & Architecture

### Frontend
- [React 19](https://react.dev/) — Component-driven user interface architecture
- [TypeScript](https://www.typescriptlang.org/) — End-to-end static type safety
- [Vite 8](https://vitejs.dev/) — Lightning-fast build tooling and HMR
- [Three.js](https://threejs.org/) & [React Three Fiber (R3F)](https://r3f.docs.pmnd.rs/) — Real-time 3D character rendering & FBX exercise animations
- [TailwindCSS v4](https://tailwindcss.com/) — Modern utility-first styling with HSL color tokens
- [Zustand](https://zustand.docs.pmnd.rs/) — Light, fast state management for chat & 3D model controls
- [Lucide React](https://lucide.dev/) — Clean, consistent UI icon library

### Backend & AI Pipeline
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework for async streaming APIs
- [LangGraph](https://langchain-ai.github.io/langgraph/) — Stateful multi-agent RAG workflow engine
- [NVIDIA NIM Microservices](https://www.nvidia.com/en-us/ai-data-science/foundation-models/) — High-throughput LLM generation (`thinkingmachines/inkling`)
- [OpenAI API](https://platform.openai.com/docs/) — Automatic failover LLM provider (GPT-4o / GPT-4o-mini)
- [Supabase PostgreSQL](https://supabase.com/docs) & [pgvector](https://github.com/pgvector/pgvector) — Vector embeddings, HNSW similarity search, hybrid full-text ranking
- [SSE-Starlette](https://github.com/sysid/sse-starlette) — Server-Sent Events for real-time response token streaming

---

## 🤸 3D Exercise Model Catalog

MedBot features interactive 3D exercise models powered by Three.js/R3F. When a user asks for workout guidance, mobility stretches, or physical rehab, the **Intent Router** automatically identifies exercise intent, selects the optimal model, and streams the structured payload to animate the 3D viewer in real-time.

| Animation ID | Exercise Title | Target Area | Difficulty | 3D Asset Path |
|---|---|---|---|---|
| `jumping_jacks` | Jumping Jacks | Full Body & Cardio | Easy | `/models/Jumping_Jacks.fbx` |
| `kettlebell_swing` | Kettlebell Swing | Posterior Chain & Core | Intermediate | `/models/Kettlebell_Swing.fbx` |
| `pike_walk` | Pike Walk / Inchworm | Core, Shoulders & Hamstrings | Intermediate | `/models/Pike_Walk.fbx` |
| `pistol` | Pistol Squat | Quadriceps, Glutes & Balance | Advanced | `/models/Pistol.fbx` |
| `situps` | Sit-Ups | Abdominals & Hip Flexors | Easy | `/models/Situps.fbx` |

---

## 🛠️ Project Structure

```text
setup-medcore-ai-agent/
├── backend/
│   ├── app/
│   │   ├── db/                 # Supabase client, queries & migration SQL
│   │   ├── langgraph/          # LangGraph state machine & processing nodes
│   │   │   ├── nodes/          # safety_gate, intent_router, retrieval, post_check, generation
│   │   │   ├── graph.py        # Workflow graph compilation
│   │   │   └── state.py        # GraphState dataclass & IntentCategory enum
│   │   ├── llm/                # Provider abstraction (NVIDIA NIM primary + OpenAI fallback)
│   │   ├── models/             # Pydantic schemas (CitationItem, MessageResponse, etc.)
│   │   ├── routers/            # FastAPI API endpoints (conversations, messages, exercises, reports)
│   │   ├── main.py             # FastAPI entry point & HTTP request logger middleware
│   │   └── config.py           # Environment settings & configuration
│   └── requirements.txt
├── medbot/
│   ├── public/
│   │   └── models/             # 3D FBX exercise animation assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # ChatBubble, CitationCard, ConfidenceBadge, ChatInput
│   │   │   └── model/          # CharacterViewer (3D Canvas), ModelControlPanel, AnimationController
│   │   ├── lib/api/client.ts   # Backend API client & SSE event parser
│   │   ├── stores/             # chatStore (Zustand) & modelStore
│   │   └── types/              # ChatMessage, CitationItem, ExerciseData types
│   └── package.json
├── .gitignore                  # Git exclusion rules
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- PostgreSQL Database with `pgvector` enabled (e.g. Supabase)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example or create .env with your keys:
# NVIDIA_API_KEY=nvapi-...
# OPENAI_API_KEY=sk-...
# SUPABASE_URL=https://your-supabase-id.supabase.co
# SUPABASE_KEY=your-service-role-key
# DATABASE_URL=postgresql://user:pass@host:5432/postgres

# Run database migration in Supabase SQL Editor:
# backend/app/db/migrations/001_core_schema.sql

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd medbot

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Key Features & Pipeline Flow

1. **Safety Gate**: Scans user query for emergency signals or direct diagnostic requests. Reframes safely with medical disclaimers if required.
2. **Intent Router**: Classifies queries into `casual_chat`, `memory_chat`, `document_lookup`, or `exercise`. Bypasses vector retrieval when RAG is unneeded for ultra-low latency response times.
3. **Hybrid Vector Search**: Combines cosine similarity on 1024-dimensional embeddings with PostgreSQL `tsvector` full-text search.
4. **LLM Provider Abstraction**: Connects to NVIDIA NIM as primary inference engine with automated failover to OpenAI GPT-4o.
5. **Verifiable Source Citations**: Post-check validator verifies inline `[chunk_id]` tags and enriches response with document names, page numbers, section headers, and exact evidence quotes.
6. **Dynamic 3D Exercise Engine**: Renders 3D character models in React Three Fiber with customizable camera controls (X, Y, Zoom) and automatic exercise animation playback.

---

## 🛡️ License

Educational & Research Purpose Only. MedBot does not diagnose conditions or prescribe treatments.
