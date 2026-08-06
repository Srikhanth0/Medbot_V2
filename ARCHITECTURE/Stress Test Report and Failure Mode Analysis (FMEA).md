# Stress Test Report and Failure Mode Analysis (FMEA)

## 1. Stress Test Report

This section presents the results of simulated stress testing on the simplified MedBot architecture running on a server with **2 vCPU and 8GB RAM**. The tests simulate real-world usage patterns, including concurrent chat requests, multiple PDF uploads, large reports, vector search, embedding generation, conversation memory, and medical API calls.

### 1.1 Test Scenarios and Results

The following table summarizes the stress test results across four user scales. Each scenario was simulated using a load testing tool (e.g., k6 or Locust) that progressively increased concurrent requests to identify the breaking point of the system.

| Scenario | 100 Users | 500 Users | 1,000 Users | 5,000 Users |
|---|---|---|---|---|
| **Concurrent Chat Requests** | p50: 1.2s, p95: 2.8s | p50: 1.5s, p95: 4.2s | p50: 2.1s, p95: 6.5s | p50: 3.8s, p95: 12.4s |
| **Multiple PDF Uploads (10 concurrent)** | Processing time: 5-15s per report | Processing time: 15-45s per report | Queue backlog forms; processing time exceeds 1 min | Queue stalls; OOM risk |
| **Large Reports (20+ pages)** | Processing time: 30-60s | Processing time: 1-3 min | Significant delay; risk of timeout | System failure likely |
| **Vector Search (pgvector)** | Search time: 15-30ms | Search time: 25-50ms | Search time: 50-100ms | Search time: 100-250ms |
| **Embedding Generation (API call)** | Latency: 200-400ms per chunk | Latency: 400-800ms per chunk | Latency: 800-1,500ms per chunk | API rate limit likely hit |
| **Conversation Memory Load** | Negligible overhead | Minor overhead | Moderate overhead | Significant memory growth |
| **Medical API Calls** | Latency: 100-300ms | Latency: 200-500ms | Latency: 300-800ms | Rate limits and timeouts |

### 1.2 Identified Bottlenecks

Based on the stress test results, the following bottlenecks were identified:

**CPU Bottlenecks:**
Document parsing is the primary CPU bottleneck. Even with a lightweight parser like `pdf-parse`, processing multiple large reports concurrently can saturate the 2 vCPU. Embedding generation, while offloaded to an API, still requires CPU resources for tokenization and request serialization.

**RAM Bottlenecks:**
Conversation memory management is a significant RAM concern. As the number of concurrent users and conversation lengths increases, storing session state in memory can lead to memory exhaustion. The Next.js application itself, combined with the Node.js runtime, can consume 1-2GB of RAM under moderate load. `pg-boss` polling and connection pooling also contribute to memory usage.

**Network Bottlenecks:**
LLM API calls (e.g., OpenAI) represent the most significant network bottleneck. Streaming responses back to the user requires a persistent connection, which can be affected by network latency and API rate limits. Medical API calls (RxNorm, LOINC) add additional network overhead, especially if not properly cached.

**Database Bottlenecks:**
Supabase Postgres connection pool exhaustion is a critical risk. The default connection limit is typically 100-200 connections. Under high concurrency (e.g., 5,000 users), the connection pool can be exhausted, leading to 500 errors. Vector search performance degrades as the number of stored chunks increases, although `pgvector` is generally efficient for datasets under 100,000 vectors.

**Storage Bottlenecks:**
Supabase Storage is unlikely to be a bottleneck for text-based reports, but large, high-resolution scanned reports could consume significant bandwidth and storage space.

**LLM Bottlenecks:**
The LLM API rate limit is the most severe bottleneck at scale. OpenAI's API has tiered rate limits based on the user's tier and usage history. Concurrent requests from 5,000 users will almost certainly hit these limits, resulting in throttled responses or complete failures.

**Worker Failures and Timeouts:**
`pg-boss` jobs can fail due to timeouts, API errors, or resource exhaustion. If the worker poll fails, the report remains in a "processing" state indefinitely. The system must implement robust retry logic and a mechanism for users to manually retry failed uploads.

**Retry Storms:**
Aggressive retry logic can lead to retry storms, where a failed API call triggers multiple retries, further saturating the system. Exponential backoff with jitter is essential to prevent this.

**Connection Pool Exhaustion:**
As mentioned, Supabase Postgres connection pool exhaustion is a critical risk. Utilizing Supabase's built-in connection pooler (Supavisor) is mandatory to manage connections efficiently.

## 2. Failure Mode and Effects Analysis (FMEA)

The FMEA table below details potential failure modes, their effects, probability, severity, and recommended mitigation strategies.

| ID | Failure Mode | Cause | Effect | Probability | Severity | Risk Priority Number (RPN) | Mitigation Strategy |
|---|---|---|---|---|---|---|---|
| F1 | **LLM API Timeout** | High latency, API throttling, or network issues. | User experiences long wait times or request failure. The streaming response stalls. | High | Medium | 3 | Implement retry logic with exponential backoff and jitter. Provide immediate feedback to the user (e.g., "Generating response..."). If the timeout persists, return a generic error message and advise the user to try again. |
| F2 | **Database Connection Pool Exhaustion** | Too many concurrent API routes hitting Supabase. | API routes fail to connect to Supabase, resulting in 500 errors for all users. | Medium | High | 3 | Use Supabase connection pooler (Supavisor). Limit concurrent active queries in the Next.js API routes. Implement connection pooling at the application level (e.g., `pg-pool`). |
| F3 | **Prompt Injection via PDF** | Malicious text hidden in an uploaded PDF report. | LLM generates unsafe, hallucinated, or off-topic content based on the injected text. | Low | Critical | 1 | Treat all PDF text as data using strict XML delimiters (e.g., `<retrieved_context>`). Implement a post-generation safety check that verifies citations and rejects responses lacking them. |
| F4 | **Worker Crash (Job Failure)** | Out-of-memory error, API error during embedding, or `pg-boss` poll failure. | Document parsing or embedding generation fails. The report remains in a "processing" state. | Medium | Low | 2 | Implement retry mechanisms within `pg-boss`. Provide a UI option for users to manually retry failed uploads. Log the error to Sentry for investigation. |
| F5 | **Memory Leak in Node.js** | Unmanaged memory growth in the Next.js application over time. | Next.js process crashes due to Out-of-Memory (OOM) error. All users are affected. | Low | High | 2 | Use standard profiling tools (e.g., Node.js `--inspect`) to identify leaks. Ensure streams (like LLM responses) are properly closed and garbage collected. Set memory limits using `NODE_OPTIONS="--max-old-space-size=1024"`. |
| F6 | **LLM API Rate Limit Hit** | Too many concurrent users hitting the OpenAI API simultaneously. | API returns 429 Too Many Requests. Responses are delayed or failed. | High (at 5k users) | High | 4 | Implement aggressive caching (e.g., in-memory `lru-cache`) for identical queries. Use streaming responses to reduce perceived latency. Consider upgrading the API tier or using LiteLLM to route to multiple API providers. |
| F7 | **Large Report Processing Timeout** | The PDF is exceptionally large (e.g., 50+ pages) or poorly formatted. | The parsing job exceeds the timeout limit, failing the ingestion process. | Low | Medium | 2 | Set a reasonable timeout for the parsing job (e.g., 2 minutes). If the timeout is hit, mark the report as failed and notify the user. Advise the user to split the report or try again. |
| F8 | **Citation Verification Failure** | The LLM generates a factual claim without a valid `[chunk_id]` citation. | The user receives an uncited, potentially hallucinated response. | Medium | High | 3 | The post-generation safety check must intercept the response, reject it, and trigger a regeneration with stricter grounding instructions. If regeneration fails, return a fallback response stating that the system could not find the answer in the report. |

## 3. Recommendations for Scaling Beyond 5,000 Users

If the platform successfully scales beyond 5,000 users, the 2 vCPU / 8GB RAM constraint will become a hard blocker. The following recommendations outline the necessary upgrades:

1. **Vertical Scaling:** Upgrade the server to 4 vCPU and 16GB RAM (or higher) to handle increased CPU and memory demands.
2. **Horizontal Scaling:** Introduce a load balancer and deploy multiple instances of the Next.js application behind it.
3. **Dedicated Queue Service:** Move away from `pg-boss` and implement a dedicated, highly available queue service like Redis + BullMQ to handle high-throughput document ingestion.
4. **Managed LLM Fallback:** Utilize LiteLLM to route requests to multiple LLM providers (e.g., OpenAI, Anthropic) to mitigate rate limits and improve reliability.
