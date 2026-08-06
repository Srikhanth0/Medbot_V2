# MedBot Architecture Validation & Simplification Analysis

## 1. Hard Constraints Check

The provided architecture document, while comprehensive and well-thought-out for a well-funded team, directly conflicts with several of the project's hard constraints. The following table outlines the validation results against the strict requirements.

| Constraint | Current Architecture Status | Validation Result | Required Action |
|---|---|---|---|
| No Kubernetes | Proposes k3s for staging and managed Kubernetes for production. | **Violates Constraint** | Eliminate all Kubernetes manifests and Helm charts. Rely exclusively on Docker Compose or managed services. |
| No Microservices | Separates the system into BFF, Ingestion Workers, Embedding Workers, Inference Tier, and Observability tiers. | **Violates Constraint** | Consolidate components. Move away from separate worker services and inference tiers to a monolithic Next.js API structure or a single Python worker container. |
| 2 vCPU and 8GB RAM | Requires running Qdrant, Redis, Langfuse, Prometheus, Grafana, and potentially vLLM concurrently. | **Violates Constraint** | Drastically reduce memory footprint. Replace Qdrant with `pgvector`. Drop Prometheus and Grafana. Use API-based LLMs instead of self-hosted inference. |
| Low Operational Complexity | Introduces multiple complex subsystems (Prometheus metrics, multi-tiered caching, queue separation). | **Violates Constraint** | Simplify the stack. Remove redundant monitoring layers. Rely on managed services for infrastructure management. |
| Production Ready but MVP Friendly | Includes dual-parser cross-checks, complex re-ranking strategies, and extensive ADRs. | **Violates Constraint** | Focus on the simplest viable implementation. Defer advanced parsing and re-ranking to a future iteration. |
| Easy for one developer to maintain | Demands expertise in Python backend, Node.js frontend, Kubernetes, Docker, and ML ops. | **Violates Constraint** | Reduce the stack to a single primary language (Next.js/Node.js or Python FastAPI) to simplify context switching. |

## 2. Component Simplification Strategy

To create a simplified, production-grade architecture that a solo developer can realistically build and maintain within the 2 vCPU and 8GB RAM constraint, the system must be radically simplified. The goal is to leverage managed services to offload infrastructure overhead.

### Frontend and Authentication
The frontend stack of Next.js, React, and Tailwind CSS paired with Clerk for authentication is solid and should be retained. Next.js API routes can serve as the Backend for Frontend (BFF), providing a unified deployment target.

### Database and Storage Strategy
The current architecture proposes Supabase Postgres alongside a separate Qdrant vector database and Storj object storage. For a solo developer on limited hardware, maintaining three separate database/storage providers introduces unnecessary complexity.

The optimal simplification is to consolidate data storage into **Supabase**. Supabase provides a managed Postgres instance that supports the `pgvector` extension. This eliminates the need for a separate Qdrant container, significantly reducing RAM consumption and operational overhead. For object storage, Supabase Storage can replace Storj, further reducing the number of external dependencies.

### RAG Pipeline and Orchestration
The document recommends using both LangGraph and LlamaIndex. While LlamaIndex excels at data ingestion, LangGraph is superior for the explicit state machine required to enforce medical safety gates and refusal policies.

For the MVP, **LangGraph** should be the sole orchestration framework. To simplify the RAG pipeline, the architecture should drop the dedicated re-ranking service (e.g., BGE-reranker). A simple similarity search using `pgvector` with a defined limit (e.g., `LIMIT 10`) is sufficient for the initial release. 

Furthermore, the complex document parsing pipeline involving Docling and VLMs should be simplified. For the MVP, a standard Node.js library like `pdf-parse` or a lightweight Python equivalent is adequate. Advanced OCR can be deferred.

### Medical APIs and External Integrations
The medical API enrichments (RxNorm, LOINC, etc.) should not be implemented as separate microservices. Instead, they should be integrated as simple, cached HTTP fetch functions directly within the Next.js API routes or a single Python FastAPI worker.

### Observability and Monitoring
The proposed observability stack (Prometheus, Grafana, Sentry, Langfuse) is too heavy for a solo developer. Prometheus and Grafana should be removed entirely. **Sentry** should be retained for error tracking. **Langfuse** should be used via its managed cloud tier rather than self-hosted, to save RAM and maintenance effort.

### Queue and Worker Necessity
The original architecture proposes Redis and BullMQ for handling document ingestion. For a 2 vCPU environment, running a separate Redis container and worker process is inefficient. 

The necessity of a separate queue can be eliminated by using a **database-backed job queue** such as `pg-boss` (for PostgreSQL). This allows background jobs (like document parsing and embedding generation) to be managed directly within the existing Supabase Postgres instance, eliminating the need for Redis and separate worker containers.

## 3. Hallucination and Safety Mitigation

The core mandate of the platform is medical understanding, not diagnosis. The simplified architecture must enforce strict safety boundaries without the heavy computational overhead of the original design.

The primary defense against hallucinations is a **grounded RAG approach**. The system prompt must explicitly instruct the LLM to only state facts present in the retrieved report chunks. If information is missing, the model must state so explicitly.

Citation enforcement must be structural. The LLM should be required to output inline citations (e.g., `[chunk_id]`). A post-processing step in the API route must verify that all factual claims are supported by citations. If citations are missing, the response should be rejected and regenerated.

To prevent prompt injection from malicious or poorly formatted uploaded reports, all extracted text must be treated strictly as data. It should be wrapped in clearly delimited XML tags or similar structures within the prompt, with an explicit instruction that this content is data to be analyzed, not instructions to be followed.

## 4. Stress Test Analysis (2 vCPU, 8GB RAM)

Running this simplified stack on a 2 vCPU, 8GB RAM server requires careful resource management. The following analysis identifies potential bottlenecks at various user scales.

| User Scale | Primary Bottlenecks | Mitigation Strategy |
|---|---|---|
| **100 Users** | **RAM:** Running Next.js, Postgres connections, and Langfuse SDK concurrently can consume memory. | Optimize Next.js memory usage. Ensure `pg-boss` does not poll too frequently. |
| **500 Users** | **CPU:** Concurrent document parsing (even lightweight parsing) will spike CPU usage. | Implement strict rate limiting on uploads. Queue heavy parsing tasks efficiently using `pg-boss`. |
| **1000 Users** | **Database:** Connection pool exhaustion on Supabase Postgres. | Rely on Supabase's built-in connection pooler (Supavisor). Implement caching for frequent queries. |
| **5000 Users** | **Network & API Limits:** Hitting rate limits on OpenAI/LLM APIs during concurrent chat requests. | Implement aggressive caching (Redis or in-memory cache like `lru-cache`) for identical queries. Use streaming responses to reduce perceived latency. |

## 5. Failure Mode and Effects Analysis (FMEA)

The following table outlines potential failure modes in the simplified architecture and their respective mitigations.

| Failure Mode | Effect | Probability | Severity | Mitigation Strategy |
|---|---|---|---|---|
| **LLM API Timeout** | User experiences long wait times or request failure. | Medium | Medium | Implement retry logic with exponential backoff. Provide immediate feedback to the user while waiting. |
| **Database Connection Pool Exhaustion** | API routes fail to connect to Supabase, resulting in 500 errors. | Medium | High | Use Supabase connection pooler. Limit concurrent active queries in the Next.js API routes. |
| **Prompt Injection via PDF** | LLM generates unsafe or hallucinated content based on malicious text in a report. | Low | Critical | Treat all PDF text as data using strict delimiters. Implement a post-generation safety check that verifies citations. |
| **Worker Crash (Job Failure)** | Document parsing or embedding generation fails, leaving the report in a "processing" state. | Medium | Low | Implement retry mechanisms within `pg-boss`. Provide a UI option for users to manually retry failed uploads. |
| **Memory Leak in Node.js** | Next.js process crashes due to unmanaged memory growth over time. | Low | High | Use standard profiling tools. Ensure streams (like LLM responses) are properly closed and garbage collected. |

## 6. Security Audit

The simplified architecture must maintain high security standards, especially when handling medical documents.

**Encryption and Access Control:**
All data in transit must be encrypted via TLS. Supabase handles encryption at rest for the Postgres database. Row-Level Security (RLS) policies must be enforced on all database tables to ensure users can only access their own data.

**Authentication and Authorization:**
Clerk handles authentication. Authorization is enforced via Supabase RLS. The Next.js API routes must verify the user's session token before making any database queries or LLM calls.

**Data Retention and Privacy:**
Implement a clear data retention policy. Users must be able to delete their accounts and all associated data (reports, chat history) easily. Ensure that any text sent to the LLM API is not stored permanently by the provider (adhering to their enterprise privacy terms).

## 7. CI/CD Pipeline and Deployment Guide

### CI/CD Pipeline
The CI/CD pipeline should be straightforward, utilizing GitHub Actions.

1. **Lint and Test:** Run ESLint and unit tests (Jest/Vitest) on push.
2. **Build:** Ensure the Next.js application builds successfully.
3. **Deploy:** If deploying to a managed platform (e.g., Vercel, Render, or DigitalOcean App Platform), use the platform's native GitHub integration for automatic deployments. If deploying via Docker Compose on a VPS, the pipeline can SSH into the server, pull the latest image, and restart the containers.

### Deployment Guide (Docker Compose)
For deployment on a single VPS (2 vCPU, 8GB RAM), the following `docker-compose.yml` structure is recommended:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - LANGFUSE_PUBLIC_KEY=${LANGFUSE_PUBLIC_KEY}
      - LANGFUSE_SECRET_KEY=${LANGFUSE_SECRET_KEY}
    restart: always
```

This single-container approach (assuming Supabase is managed externally) minimizes RAM usage and operational complexity, perfectly aligning with the solo developer constraint.
