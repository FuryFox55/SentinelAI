# SentinelAI — System Architecture & Design Specification

## Overview

**SentinelAI** is structured as an **AI-Assisted Security Operations Center (SOC) Platform**. It combines zero-friction background telemetry, multi-modal threat extraction, heuristic scoring, and LLM reasoning to provide real-time scam and fraud protection.

---

## 1. High-Level Architecture

```text
                                +-----------------------------------+
                                |     User / Telephony Signals      |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |    Application Shell & UI Engine  |
                                |  (Next.js 16 App Router / React)  |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |   Sentinel Multi-Modal Pipeline   |
                                | (Voice, OCR, URLs, QR, Chat)      |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |   Fraud Confidence Scoring Engine |
                                |   (0-100 Weighted Risk Scoring)   |
                                +-----------------------------------+
                                       |                     |
                                       v                     v
                        +----------------------+    +--------------------+
                        |  Grok (xAI) LLM Node |    | Supabase DB & Sync |
                        +----------------------+    +--------------------+
                                                             |
                                                             v
                                                    +--------------------+
                                                    | SOC Operator Hub   |
                                                    +--------------------+
```

---

## 2. Core Subsystems

### A. Presentation Layer (Frontend App Router)
- **Framework**: Next.js 16 with App Router (`src/app/`)
- **UI State**: Zustand global store (`src/lib/store.ts`)
- **Theme Engine**: Light & Dark mode design tokens (`src/theme/`)

### B. Service & Extraction Layer (`src/lib/services/`)
- `scoring.ts`: Weighted scoring algorithm calculating Fraud Confidence Index (0-100).
- `extractor.ts`: Multi-modal parser for text, audio strings, QR signatures, and document bytes.
- `ai.ts`: Integration client for Grok AI threat evaluation.

### C. Data & Auth Resilience (`src/lib/supabase.ts`)
- Intelligent proxy pattern wrapping `createClient`.
- Automatic transparent fallback to `MockSupabaseClient` on schema/network connectivity issues.
