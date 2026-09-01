# Security Architecture & Hardening Document

## 1. Authentication & Session Management
- **Token Delegation**: Public anonymous keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) are scoped for client browser sessions. Administrative service-role keys are strictly server-side.
- **Resilient Fallback Session**: In offline or mock development mode, session tokens are scoped to isolated in-memory stores.

## 2. Row-Level Security (RLS) Policies
- All PostgreSQL tables (`user_profiles`, `trusted_contacts`, `threat_events`, `analysis_reports`) enforce RLS policies verifying `auth.uid() = user_id`.

## 3. Data Protection & Sanitization
- User input strings (URLs, SMS logs, uploaded OCR text) undergo sanitization prior to LLM payload generation to prevent prompt injection vectors.

## 4. Environment Key Handling
- Sensitive credentials (`GROK_API_KEY`, GCP service keys) are managed via standard `.env.local` environment definitions and are excluded from Git indexing (`.gitignore`).
