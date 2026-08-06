# Security Audit, CI/CD Pipeline, and Deployment Guide

## 1. Security Audit

Handling medical reports requires a stringent security posture, even if the application is not a formally covered entity under HIPAA. The simplified architecture must ensure data privacy, secure authentication, and robust access control.

### 1.1 Data Encryption and Privacy
All data transmitted between the client, the Next.js API, and external services (Supabase, OpenAI) must be encrypted in transit using TLS. Supabase automatically handles encryption at rest for the Postgres database and object storage.

When sending report data to the LLM (e.g., OpenAI API), it is crucial to adhere to the provider's enterprise privacy terms. The API calls must be configured to ensure that user data is not retained by the provider for model training. A clear data retention policy must be implemented, allowing users to easily delete their accounts and all associated data (reports, chat history).

### 1.2 Authentication and Authorization
Authentication is handled by Clerk, which provides secure session management and JWTs. The Next.js API routes must verify the user's session token before processing any request.

Authorization is enforced at the database level using Supabase's Row-Level Security (RLS). Every table containing user data (e.g., `reports`, `messages`, `report_chunks`) must have an RLS policy that restricts access to rows where the `user_id` matches the authenticated user's ID. This defense-in-depth approach ensures that even if an application-layer bug occurs, cross-user data leaks are prevented.

### 1.3 Prompt Injection Defense
As previously outlined, prompt injection is a significant risk when processing user-uploaded documents. The security audit confirms that all extracted text from PDFs must be treated strictly as data. The prompt construction logic must wrap this text in clearly delimited XML tags and explicitly instruct the LLM not to follow any commands contained within the text.

### 1.4 Rate Limiting
To prevent abuse and denial-of-service (DoS) attacks, rate limiting must be implemented on all public API routes. This can be achieved using middleware in the Next.js application, potentially backed by Redis or an in-memory cache, to limit the number of requests a user can make within a specific timeframe.

## 2. CI/CD Pipeline

The Continuous Integration and Continuous Deployment (CI/CD) pipeline is designed to be simple, automated, and secure, utilizing GitHub Actions.

### 2.1 Pipeline Stages

The pipeline consists of the following stages, triggered on every push to the `main` branch:

1. **Lint and Format:** Run ESLint and Prettier to ensure code quality and consistent formatting.
2. **Unit and Integration Tests:** Execute the test suite (using Jest or Vitest) to verify that the core logic, including parsing, embedding generation, and safety checks, functions correctly.
3. **Security Scans:** Run dependency scanning tools (e.g., `npm audit`) to identify and block vulnerabilities in third-party packages.
4. **Build:** Compile the Next.js application to ensure there are no build errors.
5. **Deploy:** Deploy the application to the hosting platform.

### 2.2 GitHub Actions Workflow

The following YAML configuration outlines the GitHub Actions workflow:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run tests
        run: npm run test

  build-and-deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to VPS
        # Add specific deployment steps here (e.g., SSH into VPS, pull Docker image, restart)
        run: echo "Deploying to production..."
```

## 3. Deployment Guide

The deployment guide focuses on running the simplified architecture on a single Virtual Private Server (VPS) with the specified constraints: 2 vCPU and 8GB RAM.

### 3.1 Infrastructure Setup

1. **Provision VPS:** Set up a Linux server (e.g., Ubuntu 22.04) with 2 vCPU and 8GB RAM.
2. **Install Dependencies:** Install Docker and Docker Compose on the server.
3. **Configure Supabase:** Create a Supabase project and enable the `pgvector` extension. Set up the necessary database tables and RLS policies.
4. **Configure Clerk:** Set up a Clerk application and configure the necessary environment variables (e.g., `CLERK_SECRET_KEY`).
5. **Configure OpenAI:** Generate an API key and configure the environment variable.
6. **Configure Langfuse:** Create a Langfuse project (using the cloud tier) and configure the environment variables.

### 3.2 Docker Compose Configuration

The application is deployed using a single Docker container for the Next.js application, relying on managed services for the database and LLM.

Create a `Dockerfile` in the root of the Next.js project:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create a `docker-compose.yml` file on the VPS:

```yaml
version: '3.8'
services:
  medbot-app:
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

### 3.3 Deployment Process

1. **Build and Push:** Build the Docker image locally and push it to a container registry (e.g., Docker Hub, GitHub Container Registry).
2. **Pull and Run:** SSH into the VPS, pull the latest image from the registry, and start the container using Docker Compose:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
3. **Reverse Proxy (Optional but Recommended):** Configure a reverse proxy (e.g., Nginx or Caddy) to handle TLS termination and route traffic to the Docker container on port 3000. This improves security and performance.

### 3.4 Monitoring and Maintenance

While the simplified architecture avoids complex monitoring stacks, basic monitoring is still essential.

- **Sentry:** Use the Sentry SDK in the Next.js application to capture and report errors in real-time.
- **Uptime Monitoring:** Use a free tier of an uptime monitoring service (e.g., Uptime Robot) to track the availability of the application.
- **Log Management:** Use Docker's built-in logging or a simple log rotation tool to manage application logs on the VPS.

This deployment strategy ensures a highly reliable, secure, and easy-to-maintain application that perfectly aligns with the solo developer constraint.
