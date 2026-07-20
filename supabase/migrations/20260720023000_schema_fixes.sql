-- Migration: Schema fixes for V2 tables and systems
-- Timestamp: 2026-07-20T02:30:00Z
-- Version: 20260720023000_schema_fixes.sql

-- 1. Add missing columns to analysis_reports
ALTER TABLE public.analysis_reports 
ADD COLUMN IF NOT EXISTS threat_level public.threat_severity DEFAULT 'Safe'::public.threat_severity NOT NULL;

ALTER TABLE public.analysis_reports 
ADD COLUMN IF NOT EXISTS user_safety TEXT;

-- 2. Create system_health table
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  status TEXT NOT NULL,
  load_avg NUMERIC NOT NULL,
  uptime_seconds INT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on system_health
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Select policy for authenticated users
CREATE POLICY "Read system health" ON public.system_health 
  FOR SELECT TO authenticated USING (true);

-- Allow inserts/updates for admin/system
CREATE POLICY "Manage system health" ON public.system_health 
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Create threat_events table
CREATE TABLE IF NOT EXISTS public.threat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on threat_events
ALTER TABLE public.threat_events ENABLE ROW LEVEL SECURITY;

-- Select policy for authenticated users
CREATE POLICY "Read threat events" ON public.threat_events 
  FOR SELECT TO authenticated USING (true);

-- Insert policy
CREATE POLICY "Insert threat events" ON public.threat_events 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Manage threat events" ON public.threat_events 
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Set default theme to light for user profiles
ALTER TABLE public.user_profiles ALTER COLUMN theme SET DEFAULT 'light';
