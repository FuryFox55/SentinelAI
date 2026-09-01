# SentinelAI — Architecture & Engineering Decisions

This document outlines key technical decisions, architectural trade-offs, and design rationale for **SentinelAI**.

---

## 🛠️ Key Architectural Decisions

### 1. Framework: Next.js 16 (App Router) + React 19
* **Rationale**: Combines server-side rendering (SSR), API route endpoints, and React Server Components (RSC) into a single TypeScript repository, avoiding cross-repo CORS overhead.
* **Trade-off**: Requires strict discipline regarding client/server code boundaries (`'use client'` directives).

---

### 2. Database & Auth: Supabase (PostgreSQL + RLS)
* **Rationale**: Provides instant PostgreSQL database capabilities, built-in user authentication, and Row-Level Security (RLS) policies out of the box.
* **Resilient Fallback**: Implemented a Proxy wrapper around `createClient` (`src/lib/supabase.ts`) that seamlessly auto-switches to an in-memory mock store when database credentials are offline or unconfigured.

---

### 3. AI Pipeline: Grok (xAI API) + Pure Scoring Engine
* **Rationale**: Grok xAI provides fast contextual threat reasoning for the Security Copilot. To ensure sub-millisecond risk evaluation, scoring is decoupled into a pure deterministic TypeScript algorithm (`evaluateFraudConfidence`).
* **Trade-off**: Protects application latency while providing rich AI explanations.

---

### 4. Styling & Tokens: Tailwind CSS v4
* **Rationale**: Utility-first CSS with CSS variables (`@theme inline`) guarantees high visual consistency, instant dark mode switching, and small bundle footprints.
