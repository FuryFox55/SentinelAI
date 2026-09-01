# SentinelAI — Portfolio & Recruiter Guide

This document provides consolidated positioning, summaries, and technical talking points for **SentinelAI**.

---

## ⚡ One-Line Description
> **SentinelAI** is an AI-assisted fraud detection and security operations platform that analyzes suspicious digital interactions, produces explainable risk assessments, and supports incident triage.

---

## 📝 50-Word Description
> SentinelAI bridges consumer threat detection with enterprise security operations. Built with Next.js 16, React 19, TypeScript, and Supabase, it analyzes suspicious messages, URLs, QR VPAs, voice recordings, and documents using a pure deterministic scoring algorithm (0–100) and Grok (xAI) LLM integration for structured analyst investigation.

---

## 💼 Resume Bullets

* **Architected** a multi-modal threat analysis engine using **Next.js 16 (App Router)**, **React 19**, and **TypeScript**, enabling real-time inspection of phishing URLs, QR VPAs, and deepfake audio recordings.
* **Engineered** a pure deterministic risk scoring algorithm in **TypeScript** (`evaluateFraudConfidence`), aggregating weighted feature indicators and acoustic deepfake probability into a normalized Fraud Confidence Index (0–100) backed by 100% unit test coverage.
* **Implemented** secure data access and authentication via **Supabase PostgreSQL** and **Row-Level Security (RLS)**, featuring a resilient Proxy architecture that auto-switches to an in-memory mock store during network offline conditions.
* **Developed** an AI Security Copilot powered by the **Grok (xAI) API**, using prompt-injection-resilient prompt boundaries to provide security analysts with structured incident reasoning and recommended mitigation steps.

---

## 💡 Key Technical Talking Points

1. **Why Decouple Scoring from LLM APIs?**
   * *Talking Point*: Calling raw LLM APIs directly for numerical risk scores introduces stochastic latency and vulnerability to prompt injection. SentinelAI decouples scoring into a deterministic TypeScript engine, using the LLM solely for qualitative reasoning.

2. **How Does Offline Resiliency Work?**
   * *Talking Point*: SentinelAI wraps Supabase database queries inside a transparent Proxy pattern (`src/lib/supabase.ts`). If remote database credentials are missing or unreachable, queries failover cleanly to an in-memory store without breaking application workflows.
