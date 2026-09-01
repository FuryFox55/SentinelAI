# SentinelAI — 4.5-Minute Evaluator Demo Script

This script provides a 4.5-minute step-by-step walkthrough for demonstrating **SentinelAI** to recruiters, hiring managers, and technical interviewers.

---

## ⏱️ Timeline & Script Walkthrough

### `0:00 – 0:30` | 1. Introduction & Product Positioning
* **Route**: `/`
* **Presenter Script**:
  > "SentinelAI is an AI-assisted fraud detection and security operations platform designed to analyze suspicious digital interactions, generate explainable risk assessments, and support security incident investigation. It bridges consumer threat protection with enterprise SOC incident triage."

---

### `0:30 – 1:15` | 2. Multi-Modal Threat Scanner
* **Route**: `/protection`
* **Presenter Script**:
  > "Let's submit a suspicious message containing coercive law enforcement phrasing and an urgent bank transfer request. When I click 'Analyze Threat', the multi-modal extractor processes the text payload."

---

### `1:15 – 2:00` | 3. Explainable Risk Assessment
* **Presenter Script**:
  > "The Fraud Confidence Engine returns a deterministic Risk Score of 94/100 (Critical). Rather than returning a black-box AI response, SentinelAI breaks down specific threat indicators: high-risk extortion language, direct OTP/VPA requests, and domain typosquatting."

---

### `2:00 – 3:00` | 4. Incident Investigation Workspace
* **Route**: `/command-center`
* **Presenter Script**:
  > "High-priority threats automatically generate incident tickets like INC-0248 in our SOC Command Center. Here, analysts can inspect evidence, review the detection timeline, check system health nodes, and execute containment actions."

---

### `3:00 – 4:00` | 5. Sentinel AI Security Copilot
* **Route**: `/assistant`
* **Presenter Script**:
  > "Analysts can converse directly with the Security Copilot. By clicking 'Why was INC-0248 classified as critical?', the Grok xAI API analyzes the incident context and generates structured reasoning, risk factor highlights, and recommended next steps."

---

### `4:00 – 4:30` | 6. Technical Architecture & Summary
* **Presenter Script**:
  > "SentinelAI is built on Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Supabase PostgreSQL with Row-Level Security. It includes pure deterministic scoring, automated CI pipelines, and a transparent offline fallback for 100% demo resilience."
