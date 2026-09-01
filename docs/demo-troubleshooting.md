# SentinelAI — Presenter Demo Troubleshooting Guide

This guide provides presenter failover procedures for live demonstrations of **SentinelAI**.

---

## 🛠️ Demo Failover Matrix

| Issue Scenario | Cause | Automatic / Manual Recovery |
| :--- | :--- | :--- |
| **Supabase Unreachable** | Offline network / unconfigured keys | Proxy wrapper (`src/lib/supabase.ts`) automatically failovers to `MockSupabaseClient`. Application functions normally using in-memory demo store. |
| **Grok API Key Missing** | `.env.local` missing `GROK_API_KEY` | Server API returns pre-formatted structured security fallback analysis without throwing uncaught exceptions. |
| **Port 3000 Occupied** | Active dev server process | Run `npx kill-port 3000` or launch on `npm run dev -- -p 3001`. |
| **Reset Demo State** | Storage stale state | Clear browser `localStorage` (`sentinel_chat_history`, `sentinel_alerts`) and refresh page (`Ctrl+R`). |
