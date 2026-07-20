-- ====================================================
-- Sentinel AI - PostgreSQL & Supabase Database Schema
-- Architecture Specification for Cyber Threat Forensics
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'Citizen',
      'Law Enforcement',
      'Financial Institution',
      'Admin'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'threat_severity') THEN
    CREATE TYPE public.threat_severity AS ENUM (
      'Safe',
      'Low',
      'Medium',
      'High',
      'Critical'
    );
  END IF;
END$$;

-- ====================================================
-- 1. User Profiles
-- ====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'India',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'dark',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  preferences JSONB DEFAULT '{"backgroundAI": true, "liveCallMonitor": true, "urlBlocker": true, "voiceBiometrics": true, "documentShield": true, "qrAnalysis": true}'::jsonb,
  protection_score INT DEFAULT 92 NOT NULL,
  role public.user_role DEFAULT 'Citizen' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 2. Threat Analysis Requests & Reports
-- ====================================================
CREATE TABLE IF NOT EXISTS public.analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('voice', 'document', 'screenshot', 'QR', 'URL', 'chat', 'currency')),
  input_text TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.analysis_requests(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  classification TEXT NOT NULL,
  explainable_ai JSONB DEFAULT '[]'::jsonb,
  threat_indicators JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  fraud_confidence INT NOT NULL CHECK (fraud_confidence BETWEEN 0 AND 100),
  ai_confidence INT NOT NULL CHECK (ai_confidence BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 3. Scan & Protection History
-- ====================================================
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_report_id UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  input_type TEXT NOT NULL,
  classification TEXT NOT NULL,
  threat_level public.threat_severity NOT NULL,
  fraud_confidence INT NOT NULL CHECK (fraud_confidence BETWEEN 0 AND 100),
  ai_confidence INT NOT NULL CHECK (ai_confidence BETWEEN 0 AND 100),
  processing_time INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.protection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  status TEXT NOT NULL,
  threat_level public.threat_severity NOT NULL,
  fraud_confidence INT NOT NULL CHECK (fraud_confidence BETWEEN 0 AND 100),
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 4. AI Chat History
-- ====================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  analysis_reference UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 5. Dashboard Statistics
-- ====================================================
CREATE TABLE IF NOT EXISTS public.dashboard_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  protection_score INT DEFAULT 92 NOT NULL,
  total_scans INT DEFAULT 0 NOT NULL,
  threats_detected INT DEFAULT 0 NOT NULL,
  critical_alerts INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 6. Notifications
-- ====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 7. Trusted Contacts
-- ====================================================
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 8. Saved Reports
-- ====================================================
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_report_id UUID REFERENCES public.analysis_reports(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 9. Threat Intelligence Database
-- ====================================================
CREATE TABLE IF NOT EXISTS public.scam_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  impersonated_agency TEXT,
  known_script TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scam_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES public.scam_patterns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Monitoring', 'Dormant')),
  start_date DATE DEFAULT CURRENT_DATE NOT NULL,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS public.threat_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level public.threat_severity NOT NULL,
  source TEXT DEFAULT 'National Cyber Intel' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.intelligence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- 10. Operations Command Center
-- ====================================================
CREATE TABLE IF NOT EXISTS public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.analysis_reports(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Unresolved' CHECK (status IN ('Unresolved', 'Investigating', 'Resolved', 'Dismissed')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- OPTIMIZED RETRIEVAL INDEXES
-- ====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user ON public.analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user ON public.analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_user ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_protection_history_user ON public.protection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user ON public.saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);

-- ====================================================
-- ROLE-BASED ACCESS CONTROL HELPER FUNCTIONS
-- ====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_law_enforcement()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'Law Enforcement'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_financial_institution()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'Financial Institution'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 1. user_profiles Policies
CREATE POLICY "Manage own user profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 2. analysis_requests Policies
CREATE POLICY "Manage own analysis requests" ON public.analysis_requests
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 3. analysis_reports Policies
CREATE POLICY "Manage own analysis reports" ON public.analysis_reports
  FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR public.is_law_enforcement());

-- 4. scan_history Policies
CREATE POLICY "Manage own scan history" ON public.scan_history
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 5. protection_history Policies
CREATE POLICY "Manage own protection history" ON public.protection_history
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 6. ai_chat_history Policies
CREATE POLICY "Manage own chat history" ON public.ai_chat_history
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 7. dashboard_statistics Policies
CREATE POLICY "Manage own dashboard statistics" ON public.dashboard_statistics
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 8. notifications Policies
CREATE POLICY "Manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 9. trusted_contacts Policies
CREATE POLICY "Manage own trusted contacts" ON public.trusted_contacts
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 10. saved_reports Policies
CREATE POLICY "Manage own saved reports" ON public.saved_reports
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 11. investigations Policies
CREATE POLICY "Users can view investigations on their reports" ON public.investigations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analysis_reports
      WHERE public.analysis_reports.id = public.investigations.report_id
      AND public.analysis_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Law Enforcement and Admins manage investigations" ON public.investigations
  FOR ALL USING (public.is_law_enforcement() OR public.is_admin());

-- 12. Threat Intelligence global feeds (Read-only for all authenticated users, all roles)
ALTER TABLE public.scam_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read intelligence scam patterns" ON public.scam_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read intelligence scam campaigns" ON public.scam_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read intelligence threat feed" ON public.threat_feed FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read intelligence events" ON public.intelligence_events FOR SELECT TO authenticated USING (public.is_financial_institution() OR public.is_admin() OR public.is_law_enforcement());

-- ====================================================
-- AUTOMATIC AUTH TRIGGER TO SYNC PROFILE
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, email, phone, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'Citizen'::public.user_role)
  );

  INSERT INTO public.dashboard_statistics (user_id, protection_score, total_scans, threats_detected, critical_alerts)
  VALUES (
    new.id,
    92,
    0,
    0,
    0
  );

  -- Insert initial notification welcome
  INSERT INTO public.notifications (user_id, title, message, type, is_read)
  VALUES (
    new.id,
    'Welcome to Sentinel AI',
    'Your isolated cybersecurity workspace is fully configured and ready for active protection.',
    'info',
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution linked to auth.users created hook
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
