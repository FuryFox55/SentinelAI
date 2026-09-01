# SentinelAI — Fraud Confidence Risk Scoring Specification

This document details the mathematical model and algorithm implemented in `src/lib/services/scoring.ts` to calculate the **Fraud Confidence Index (0–100)**.

---

## 🧮 Algorithm Overview

The scoring algorithm is a **pure, deterministic function** designed to produce predictable risk scores without external API latency or stochastic variability.

```typescript
export function evaluateFraudConfidence(
  indicators: string[],
  cloneProbability: number = 0
): FraudConfidenceResult
```

---

## ⚖️ Weight & Threshold Matrix

### 1. Base Feature Weights

| Feature Indicator | Weight | Description |
| :--- | :--- | :--- |
| **High-Risk Extortion Phrasing** | `+40` | Keywords matching law enforcement coercion (`CBI`, `Digital Arrest`, `Police`) |
| **Credential Harvesting Solicit** | `+35` | Direct requests for `OTP`, `PIN`, `Password`, or `VPA Payee Confirmation` |
| **Voice Cloning Signature** | `+50 * Prob` | Scaled acoustic deepfake probability (`cloneProbability` 0.00–1.00) |
| **Malicious URL Typosquatting** | `+30` | Domain spoofing patterns or direct IP hosting |
| **Urgency Social Engineering** | `+15` | Timed coercion language (`immediate`, `account suspended`, `within 2 hours`) |

---

## 📊 Threat Level Mapping

The aggregated score is clamped to `[0, 100]` and mapped to semantic severity categories:

$$\text{Score} = \min\left(100, \sum \text{Weights} + (50 \times \text{CloneProb})\right)$$

| Score Range | Threat Level | Required Operator Action |
| :--- | :--- | :--- |
| **`85 – 100`** | **Critical** | Immediate SOC incident creation & emergency escalation alert |
| **`65 – 84`** | **High** | Queue for analyst triage & automated destination domain block |
| **`40 – 64`** | **Medium** | Display user warning banner & prompt secondary verification |
| **`15 – 39`** | **Low** | Log security event record for background trend correlation |
| **`0 – 14`** | **None** | Mark telemetry signal as benign |

---

## 🧪 Unit Test Coverage

The scoring engine is validated via native Node.js test runner (`src/lib/services/__tests__/scoring.test.ts`):
* `npm test` enforces 100% deterministic test pass across safe, suspicious, and high-clone-probability test payloads.
