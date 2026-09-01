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

**SentinelAI** is an **AI-Assisted Fraud Detection & Security Operations Platform** designed to detect, analyze, score, and respond to modern digital fraud, phishing, vishing (voice cloning), malicious QR codes, and document forgery.

SentinelAI bridges two critical operational workflows:
1. **Citizen & User Protection**: Multi-modal threat scanner for instant message, URL, QR, voice, and file inspection with explainable risk scores (0–100).
2. **Security Operations Center (SOC)**: High-density incident triage console for security analysts with evidence correlation, threat activity timelines, and emergency dispatching.

---

## ✨ Key Features & Capabilities

| Feature Module | Capabilities & Functionality |
| :--- | :--- |
| **🔍 Multi-Modal Threat Inspection** | Scans **Messages & SMS**, **Phishing URLs**, **QR Code VPAs**, **Voice Audio Streams**, and **Document OCR Text**. |
| **⚖️ Fraud Confidence Engine** | Weighted risk scoring algorithm (0–100) aggregating structural heuristics, acoustic clone probability, and threat indicators. |
| **🖥️ Security Operations Center (SOC)** | High-density operations dashboard featuring live incident queues, risk distribution charts, and system node health indicators. |
| **🤖 Sentinel AI Copilot** | Security-focused conversational assistant providing evidence summaries, threat explanations, and analyst investigation prompts. |
| **🚨 Emergency Contact Dispatch** | One-tap emergency escalation that notifies trusted contacts and logs high-priority incident records. |
| **🛡️ Resilient Offline Fallback** | Transparent Supabase proxy client auto-switching to an in-memory mock store when remote databases are offline or unconfigured. |

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

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router, Turbopack) & React 19
* **Language**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS v4 with custom design tokens (`@theme inline`)
* **State Management**: Zustand with persistent storage
* **Charts & Visuals**: Recharts, Lucide Icons, Framer Motion
* **Database & Auth**: Supabase (PostgreSQL, Auth, RLS Policies, Realtime)
* **AI Engine**: Grok (xAI) API & Sentinel Multi-Modal Extractor Pipeline

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js**: v18.17.0 or higher
* **npm**: v9.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/FuryFox55/SentinelAI.git
cd SentinelAI
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROK_API_KEY=your-grok-api-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## 📄 Documentation & Resources

* 🏗️ [System Architecture](docs/architecture.md)
* 🔐 [Security & RLS Specifications](SECURITY.md)
* 💻 [Development Workflow](docs/development.md)
* 🤝 [Contributing Guide](CONTRIBUTING.md)
* 📜 [MIT License](LICENSE)

---

## 👤 Author & Maintainer

Developed by **[Sai Ram (FuryFox55)](https://github.com/FuryFox55)**.
