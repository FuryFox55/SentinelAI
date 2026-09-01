# SentinelAI — System Data-Flow Architecture

This document specifies the end-to-end data pipeline for **SentinelAI**, tracing threat telemetry from initial ingestion to analyst resolution.

---

## 🔄 Telemetry Data-Flow Diagram

```text
  [ User / Signal Input ]
             │
             ▼
 ┌───────────────────────┐
 │ Input Validation Layer│ (Zod / Type Guards)
 └───────────────────────┘
             │
             ▼
 ┌───────────────────────┐
 │ Multi-Modal Extractor │ (Text, URL, QR, Acoustic, OCR)
 └───────────────────────┘
             │
             ▼
 ┌───────────────────────┐
 │ Fraud Confidence      │ (Pure Deterministic Scoring Algorithm)
 │ Engine (scoring.ts)   │
 └───────────────────────┘
             │
             ├──► [ Grok (xAI) LLM Contextual Analysis ]
             │
             ▼
 ┌───────────────────────┐
 │ Supabase Persistence  │ (PostgreSQL + RLS + Offline Proxy)
 └───────────────────────┘
             │
             ▼
 ┌───────────────────────┐
 │ SOC Incident Creation │ (Incident Ticket Queue INC-xxxx)
 └───────────────────────┘
             │
             ▼
 ┌───────────────────────┐
 │ Security Copilot      │ (Analyst Investigation Workspace)
 └───────────────────────┘
```

---

## 📋 Pipeline Stage Breakdown

### 1. Ingestion & Input Validation
* **Inputs**: Plain text messages, URLs, uploaded QR images, audio voice clips, or document PDFs.
* **Validation**: Input size sanitization (max 10MB file, max 10,000 char text), MIME type verification, and URL protocol parsing (`http:`, `https:`).
* **Failure Mode**: Rejects malformed or oversized payloads with HTTP 400 (`BAD_REQUEST`) before hitting downstream LLM APIs.

---

### 2. Multi-Modal Feature Extraction
* **Module**: `src/lib/services/extractor.ts`
* **Processing**:
  * **Text/SMS**: Regex indicator extraction for extortion keywords (`digital arrest`, `OTP`, `CBI`, `customs`, `urgent`).
  * **URLs**: Domain typosquatting inspection, IP host verification, and registration age metadata lookup.
  * **Voice**: Acoustic signature analysis estimating voice cloning probability (0.00 – 1.00).
* **Failure Mode**: If OCR or audio parsing fails, extractor degrades gracefully by processing partial metadata without crashing the scoring engine.

---

### 3. Deterministic Risk Scoring
* **Module**: `src/lib/services/scoring.ts`
* **Function**: `evaluateFraudConfidence(indicators, cloneProbability)`
* **Output**: `FraudConfidenceResult` containing:
  * `score` (0–100)
  * `threatLevel` (`Critical`, `High`, `Medium`, `Low`, `None`)
  * `indicatorsFound` (array of flagged rules)
* **Failure Mode**: Deterministic execution guarantees instant execution without network dependency.

---

### 4. Persistence & Incident Escalation
* **Module**: `src/lib/supabase.ts`
* **Processing**: Stores telemetry records in `security_events` table and generates `incidents` record if `score >= 70`.
* **Failure Mode**: Transparent proxy wrapper switches to `MockSupabaseClient` if database parameters are unconfigured or offline.
