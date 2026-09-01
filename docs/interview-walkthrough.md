# SentinelAI — Technical Interview Walkthrough

This document outlines key technical interview questions, architecture trade-offs, and design rationale for **SentinelAI**.

---

## 🏛️ Architecture & Component Boundaries

### 1. How is the frontend and backend structured?
* **Answer**: SentinelAI uses Next.js 16 (App Router) with React 19 and TypeScript. Frontend views (`/`, `/protection`, `/command-center`, `/assistant`) communicate with server-side API routes (`/api/analyze/*`, `/api/assistant/chat`). Server-side logic handles LLM API key authorization and database operations to keep credentials safe from browser bundles.

---

### 2. How does the risk scoring engine work?
* **Answer**: Risk scoring is executed by `evaluateFraudConfidence` in `src/lib/services/scoring.ts`. It is a pure, deterministic function that aggregates weighted indicators (`+40` extortion phrasing, `+35` credential requests, `+50 * CloneProb` deepfake audio) into a normalized Fraud Confidence Index (0–100).

---

### 3. How do you prevent prompt injection attacks?
* **Answer**: Analyzed text payloads are treated strictly as untrusted data strings. Input payloads are passed inside isolated text arguments, while system instructions enforce strict JSON schema boundaries in Grok xAI API requests.

---

### 4. How does database security & offline failover work?
* **Answer**: Database access is protected by PostgreSQL Row-Level Security (RLS) policies checking `auth.uid() = user_id`. If remote database credentials are missing or offline, the Proxy wrapper (`src/lib/supabase.ts`) auto-switches to an in-memory mock client to maintain 100% demo resilience.
