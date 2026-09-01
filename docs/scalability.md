# SentinelAI — Scalability Analysis

This document analyzes system capacity, potential scaling bottlenecks, and performance behavior for **SentinelAI**.

---

## 📈 Capacity & Scaling Analysis

### 1. Workload Scale: 100 Active Users (Prototype Scale)
* **Performance**: Sub-50ms API response times.
* **Database**: Direct Supabase PostgreSQL connections handle load seamlessly.
* **AI Pipeline**: Direct Grok xAI API execution per request.

---

### 2. Workload Scale: 10,000 Active Users (Production Scale)
* **Bottleneck**: Synchronous LLM API calls under concurrent surge loads.
* **Scaling Strategy**: Introduce Redis cache for repeated URL domain checks and enqueue background analysis jobs via Redis/BullMQ queue.

---

### 3. Workload Scale: 1,000,000 Security Events / Day (Enterprise Scale)
* **Bottleneck**: High-frequency database writes on `security_events` table.
* **Scaling Strategy**: Partition `security_events` table by month, introduce ClickHouse or BigQuery for analytical event aggregation, and deploy Redis rate-limiting middleware.
