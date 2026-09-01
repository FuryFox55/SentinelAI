# Changelog

All notable changes to **SentinelAI** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-01

### Added
* **Multi-Modal Threat Inspection Engine**: Text SMS, URL typosquatting, QR Code VPA, Voice audio deepfake, and Document OCR scanner modules.
* **Pure Fraud Confidence Risk Scoring**: Deterministic algorithm in `src/lib/services/scoring.ts` calculating normalized Fraud Confidence Index (0–100) with 100% unit test coverage.
* **Security Operations Center (SOC) Console**: High-density incident queue (`INC-0248`), risk distribution visualization, and system health status.
* **Sentinel AI Security Copilot**: Grok (xAI) LLM integration with prompt-injection-resilient prompt boundaries.
* **Database & Auth Layer**: Supabase PostgreSQL database with Row-Level Security (RLS) policies and transparent offline proxy failover.
* **Comprehensive Documentation Suite**: 12 engineering guides in `docs/` covering architecture, telemetry data flow, threat models, database RLS, and recruiter evaluation scripts.
