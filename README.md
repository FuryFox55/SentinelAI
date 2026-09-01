# SentinelAI 🛡️

> **AI-Assisted Fraud Detection & Security Operations Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

**SentinelAI** is an **AI-Assisted Fraud Detection & Security Operations Platform** designed to detect, analyze, score, and respond to digital fraud, phishing, vishing (voice cloning), malicious QR code VPAs, and document forgery.

SentinelAI bridges two critical operational workflows:
1. **Citizen & User Protection**: Multi-modal threat scanner for instant message, URL, QR, voice, and document file inspection with explainable risk scores (0–100).
2. **Security Operations Center (SOC)**: High-density incident triage console for security analysts with evidence correlation, threat activity timelines, and emergency dispatching.

---

## 🚀 Quick Recruiter Evaluation (3-Minute Demo)

1. **Launch App**: Open `http://localhost:3000` to inspect the technical SaaS homepage.
2. **Threat Inspection**: Navigate to **`/protection`**, select **URL Phishing Scan** or **SMS Analysis**, and submit a sample threat payload.
3. **SOC Command Center**: Open **`/command-center`** to triage incident tickets (`INC-0248`) and view risk distribution metrics.
4. **Security Copilot**: Open **`/assistant`** and click *"Why was INC-0248 classified as critical?"* for contextual AI breakdown.

---

## 🔄 End-to-End Threat Pipeline

```text
    DETECT              ANALYZE             SCORE             EXPLAIN           RESPOND
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Multi-Modal │ ──> │ OCR, Voice  │ ──> │ Weighted    │ ──> │ Evidence    │ ──> │ SOC Ticket  │
│ Signals     │     │ & Heuristic │     │ Fraud Index │     │ Breakdown   │     │ Triage &    │
│ Ingestion   │     │ Extraction  │     │ (0-100)     │     │ Metrics     │     │ Dispatch    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 📊 Core Capabilities Matrix

| Capability Module | Functionality & Engineering Implementation |
| :--- | :--- |
| **🔍 Multi-Modal Threat Inspection** | Scans **Messages & SMS**, **Phishing URLs**, **QR Code VPAs**, **Voice Audio**, and **Document OCR**. |
| **⚖️ Fraud Confidence Engine** | Weighted risk scoring algorithm (0–100) aggregating structural heuristics, acoustic clone probability, and threat indicators. |
| **🖥️ Security Operations Center (SOC)** | Operations console featuring live incident queues, severity triage, and system health status. |
| **🤖 Sentinel AI Copilot** | Security-focused conversational assistant providing evidence summaries and analyst investigation prompts. |
| **🚨 Emergency Escalation Dispatch** | One-tap emergency escalation notifying trusted contacts and logging high-priority incident records. |
| **🛡️ Resilient Offline Fallback** | Transparent Supabase proxy client auto-switching to an in-memory mock store when database credentials are offline. |

---

## 🏗️ System Architecture

```text
                                +-----------------------------------+
                                |     User / Telephony Signals      |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |   Client Layer (Next.js 16 App)   |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |  Multi-Modal Extraction Services  |
                                |  (OCR, Text, Voice, URLs, QR)     |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |  Fraud Confidence Scoring Engine  |
                                |  (0-100 Weighted Risk Calculation)|
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

## ⚙️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework & Runtime** | Next.js 16 (App Router, Turbopack) & React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 with custom design tokens (`@theme inline`) |
| **State Management** | Zustand with persistent storage |
| **Database & Auth** | Supabase (PostgreSQL, Auth, RLS Policies, Realtime) |
| **AI & LLM Pipeline** | Grok (xAI) API & Sentinel Multi-Modal Extractor Pipeline |

---

## 🌟 Project Status Matrix

| Module | Status | Notes |
| :--- | :--- | :--- |
| **Authentication & User Profile** | `Implemented` | Supabase Auth + RLS policies + Local state sync |
| **Multi-Modal Threat Scanner** | `Implemented` | Text, URL, QR, Voice, and Document extraction |
| **Fraud Confidence Engine** | `Implemented` | Pure deterministic scoring function with 100% test coverage |
| **SOC Incident Command Center** | `Implemented` | Incident queue, risk distribution, and severity triage |
| **Sentinel AI Copilot** | `Implemented` | Grok xAI API with security analyst prompt templates |
| **Telemetry Ingestion Feeds** | `Simulated / Demo` | Interactive telephony and threat feed simulators |

---

## 🧪 Verification & Quality Control

```bash
# TypeScript type check
npx tsc --noEmit

# ESLint validation
npm run lint

# Run unit tests
npm test

# Production build
npm run build
```

---

## 📄 Engineering Documentation Suite

* 🏗️ [System Architecture Specification](docs/architecture.md)
* 🔄 [Telemetry Data-Flow Architecture](docs/data-flow.md)
* 🧮 [Fraud Confidence Risk Scoring Algorithm](docs/risk-scoring.md)
* 🗄️ [Database & RLS Specifications](docs/database.md)
* 🛡️ [Security Threat Model](docs/threat-model.md)
* 🛠️ [Architecture & Engineering Decisions](docs/engineering-decisions.md)
* ❓ [Technical Interview Guide](docs/interview-guide.md)
* 📈 [Scalability Analysis](docs/scalability.md)
* 📊 [Production Readiness Gap Analysis](docs/production-readiness.md)
* ⏱️ [3-Minute Recruiter Demo Walkthrough](docs/demo.md)
* 🔐 [Security Policy](SECURITY.md) | 🤝 [Contributing](CONTRIBUTING.md) | 📜 [MIT License](LICENSE)

---

## 👤 Author & Maintainer

Developed by **[Sai Ram (FuryFox55)](https://github.com/FuryFox55)**.
