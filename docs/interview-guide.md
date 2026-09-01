# SentinelAI — Technical Interview Guide

This guide prepares developers to answer technical interview questions regarding **SentinelAI**.

---

## ❓ Technical Questions & Authoritative Answers

### Q1: How does SentinelAI calculate threat risk scores?
**Answer**: Risk scoring is handled by `evaluateFraudConfidence` in `src/lib/services/scoring.ts`. It is a pure, deterministic function that aggregates weighted feature indicators (e.g., `+40` for extortion keywords, `+35` for OTP requests, `+50 * CloneProb` for acoustic voice deepfakes) to produce a normalized Fraud Confidence Index (0–100).

---

### Q2: How do you prevent prompt injection when analyzing malicious text?
**Answer**: User payloads submitted to the threat scanner are treated strictly as untrusted data strings. Payload content is passed inside isolated data parameters rather than system instructions. System prompts enforced in Grok xAI API calls instruct the model to analyze text objectively without executing embedded commands.

---

### Q3: What happens if the remote Supabase database or AI provider goes down?
**Answer**: SentinelAI implements a resilient Proxy pattern (`src/lib/supabase.ts`). When remote database parameters are unconfigured or unreachable, calls failover transparently to `MockSupabaseClient` (an in-memory store), maintaining full application availability without displaying unhandled errors.

---

### Q4: How is database access secured between different users?
**Answer**: Database access is governed by PostgreSQL Row-Level Security (RLS) policies. Every query checks `auth.uid() = user_id`, ensuring users can only read and mutate their own security profile and incident records.
