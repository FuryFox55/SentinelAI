# SentinelAI — 3-Minute Recruiter Demo Walkthrough

This document outlines a 3-minute evaluation walkthrough for software engineering recruiters, AI/ML evaluators, and hiring managers inspecting **SentinelAI**.

---

## ⏱️ Demo Schedule & Script

### `00:00 – 00:30` | 1. SaaS Homepage & Platform Overview
* **Route**: `/`
* **Action**: Launch application and observe the technical homepage.
* **Key Takeaway**: Understand SentinelAI positioning within 10 seconds: *AI-Assisted Fraud Detection & Security Operations Platform*. Inspect the 5-step workflow pipeline (`Detect` → `Analyze` → `Score` → `Explain` → `Respond`) and live threat visualization widget.

---

### `00:30 – 01:15` | 2. Multi-Modal Threat Analyzer
* **Route**: `/protection`
* **Action**: Select **URL Phishing Scan** or **SMS Analysis**, paste a suspicious sample payload, and click **Analyze Threat**.
* **Key Takeaway**: Observe the **Fraud Confidence Engine** calculating a deterministic risk score (0–100), classification, key threat indicators, and evidence breakdown.

---

### `01:15 – 02:00` | 3. Security Operations Center (SOC) Console
* **Route**: `/command-center`
* **Action**: Review active incident tickets (`INC-0248`, `INC-[0249]`), metric cards (`Active Incidents`, `Scam Detection Rate`), and threat activity time series.
* **Key Takeaway**: Experience high-density incident triage with actionable severity chips and evidence timelines.

---

### `02:00 – 02:45` | 4. Sentinel AI Security Copilot
* **Route**: `/assistant`
* **Action**: Click on suggested analyst prompt: *"Why was INC-0248 classified as critical?"*
* **Key Takeaway**: Experience contextual security assistance generating risk factor breakdowns, evidence summaries, and recommended analyst actions.

---

### `02:45 – 03:00` | 5. Architecture & Code Verification
* **Action**: Inspect `README.md`, `docs/architecture.md`, and run verification commands (`npm test`, `npm run build`).
* **Key Takeaway**: Verify engineering quality, strict TypeScript typing, test coverage, and clean build logs.
