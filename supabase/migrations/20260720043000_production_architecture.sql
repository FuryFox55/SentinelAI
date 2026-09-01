-- Migration: Sentinel AI Production-Ready Architecture Upgrade
-- Timestamp: 2026-07-20T15:01:00Z
-- Version: 20260720043000_production_architecture.sql

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
-- DROP ALL LEGACY TABLES TO ENSURE CLEAN NORMALIZATION
-- ====================================================
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.fraud_reports CASCADE;
DROP TABLE IF EXISTS public.analysis_history CASCADE;
DROP TABLE IF EXISTS public.voice_analysis CASCADE;
DROP TABLE IF EXISTS public.conversation_analysis CASCADE;
DROP TABLE IF EXISTS public.document_analysis CASCADE;
DROP TABLE IF EXISTS public.qr_analysis CASCADE;
DROP TABLE IF EXISTS public.url_analysis CASCADE;
DROP TABLE IF EXISTS public.currency_analysis CASCADE;
DROP TABLE IF EXISTS public.protection_logs CASCADE;
DROP TABLE IF EXISTS public.device_sessions CASCADE;
DROP TABLE IF EXISTS public.command_center_cases CASCADE;
DROP TABLE IF EXISTS public.system_health CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.threat_events CASCADE;
DROP TABLE IF EXISTS public.trusted_contacts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.analysis_requests CASCADE;
DROP TABLE IF EXISTS public.analysis_reports CASCADE;
DROP TABLE IF EXISTS public.scan_history CASCADE;
DROP TABLE IF EXISTS public.protection_history CASCADE;
DROP TABLE IF EXISTS public.ai_chat_history CASCADE;
DROP TABLE IF EXISTS public.dashboard_statistics CASCADE;
DROP TABLE IF EXISTS public.saved_reports CASCADE;
DROP TABLE IF EXISTS public.scam_patterns CASCADE;
DROP TABLE IF EXISTS public.scam_campaigns CASCADE;
DROP TABLE IF EXISTS public.threat_feed CASCADE;
DROP TABLE IF EXISTS public.intelligence_events CASCADE;
DROP TABLE IF EXISTS public.investigations CASCADE;

-- ====================================================
-- MODULE 1: USER MANAGEMENT
-- ====================================================

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'India',
  protection_score INT DEFAULT 92 NOT NULL,
  role public.user_role DEFAULT 'Citizen' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  time_format TEXT DEFAULT '24h',
  dashboard_layout TEXT DEFAULT 'grid',
  animations_enabled BOOLEAN DEFAULT true,
  accessibility_preferences JSONB DEFAULT '{}'::jsonb,
  ai_preferences JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  country_code TEXT DEFAULT '+91' NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  priority INTEGER DEFAULT 1 NOT NULL,
  preferred_contact_method TEXT DEFAULT 'sms' NOT NULL CHECK (preferred_contact_method IN ('sms', 'email', 'push')),
  receive_sms BOOLEAN DEFAULT TRUE NOT NULL,
  receive_email BOOLEAN DEFAULT FALSE NOT NULL,
  receive_push BOOLEAN DEFAULT TRUE NOT NULL,
  receive_location BOOLEAN DEFAULT TRUE NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_phone UNIQUE (user_id, phone_number)
);

CREATE TABLE public.connected_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  platform TEXT NOT NULL, -- e.g. 'android', 'ios', 'web'
  os_version TEXT,
  app_version TEXT,
  push_token TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  browser TEXT,
  operating_system TEXT,
  device_type TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 3: THREAT ANALYSIS (Pre-requisites for AI Assistant & Analysis Reports)
-- ====================================================

-- We define analysis_requests, uploaded_files, ocr_results, speech_transcripts first.
-- In order to handle circular dependencies, ocr_result_id and speech_transcript_id in analysis_requests
-- will be defined as foreign keys via ALTER TABLE at the end.

CREATE TABLE public.analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('voice', 'document', 'screenshot', 'QR', 'URL', 'chat', 'currency')),
  input_text TEXT,
  ocr_result_id UUID, -- Foreign keys added via ALTER TABLE later
  speech_transcript_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_request_id UUID REFERENCES public.analysis_requests(id) ON DELETE SET NULL,
  storage_bucket TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT NOT NULL,
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID UNIQUE REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
  extracted_text TEXT NOT NULL,
  language TEXT,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.speech_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID UNIQUE REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  language TEXT,
  speaker_count INT,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID UNIQUE REFERENCES public.analysis_requests(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  classification TEXT NOT NULL,
  explainable_ai JSONB DEFAULT '[]'::jsonb,
  threat_level public.threat_severity DEFAULT 'Safe'::public.threat_severity NOT NULL,
  user_safety TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE public.protection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  status TEXT NOT NULL,
  threat_level public.threat_severity NOT NULL,
  fraud_confidence INT NOT NULL CHECK (fraud_confidence BETWEEN 0 AND 100),
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.threat_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.analysis_reports(id) ON DELETE CASCADE,
  indicator_name TEXT NOT NULL,
  description TEXT,
  severity public.threat_severity NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.fraud_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID UNIQUE NOT NULL REFERENCES public.analysis_reports(id) ON DELETE CASCADE,
  overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  ai_confidence INT NOT NULL CHECK (ai_confidence BETWEEN 0 AND 100),
  risk_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.analysis_reports(id) ON DELETE CASCADE,
  action_steps TEXT NOT NULL,
  priority INT DEFAULT 1 CHECK (priority >= 1),
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.analysis_reports(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  evidence_value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System telemetry tables for pipeline.ts compatibility
CREATE TABLE public.threat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  node_name TEXT NOT NULL,
  status TEXT NOT NULL,
  load_avg NUMERIC NOT NULL,
  uptime_seconds INT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  report_id UUID REFERENCES public.analysis_reports(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Unresolved' CHECK (status IN ('Unresolved', 'Investigating', 'Resolved', 'Dismissed')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 2: AI ASSISTANT
-- ====================================================

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  referenced_report_id UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,
  referenced_analysis_id UUID REFERENCES public.analysis_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.ai_reasoning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reasoning_steps JSONB DEFAULT '[]'::jsonb NOT NULL,
  tokens_used INT,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  response_text TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.conversation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID UNIQUE NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 4: THREAT INTELLIGENCE
-- ====================================================

CREATE TABLE public.known_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number TEXT UNIQUE NOT NULL,
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.known_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  domain TEXT UNIQUE NOT NULL,
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.known_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url TEXT UNIQUE NOT NULL,
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.known_upi_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upi_id TEXT UNIQUE NOT NULL,
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.known_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  blockchain TEXT DEFAULT 'Ethereum',
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.known_email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_address TEXT UNIQUE NOT NULL,
  reputation TEXT DEFAULT 'suspicious' CHECK (reputation IN ('safe', 'suspicious', 'malicious')),
  reported_count INT DEFAULT 1 NOT NULL,
  scam_category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- e.g. 'phone', 'url', 'domain', 'upi', 'wallet', 'email'
  reported_value TEXT NOT NULL,
  description TEXT,
  evidence_url TEXT,
  verification_status TEXT DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.scam_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Monitoring', 'Dormant')),
  description TEXT,
  start_date DATE DEFAULT CURRENT_DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 5: DASHBOARD
-- ====================================================

CREATE TABLE public.dashboard_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protection_score INT DEFAULT 92 NOT NULL,
  total_scans INT DEFAULT 0 NOT NULL,
  threats_detected INT DEFAULT 0 NOT NULL,
  critical_alerts INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.recent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g. 'scan', 'sos', 'profile_update'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.security_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- e.g. 'block_rate', 'response_time_ms'
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 6: EMERGENCY
-- ====================================================

CREATE TABLE public.emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  threat_level public.threat_severity DEFAULT 'Critical'::public.threat_severity NOT NULL,
  fraud_score INT CHECK (fraud_score BETWEEN 0 AND 100),
  associated_report_id UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,
  trusted_contacts_notified BOOLEAN DEFAULT FALSE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'False Alarm')),
  resolved_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.emergency_contacts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emergency_event_id UUID NOT NULL REFERENCES public.emergency_events(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notification_method TEXT NOT NULL CHECK (notification_method IN ('sms', 'email', 'push')),
  status TEXT DEFAULT 'Sent' CHECK (status IN ('Sent', 'Delivered', 'Failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  accuracy NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.sos_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emergency_event_id UUID UNIQUE NOT NULL REFERENCES public.emergency_events(id) ON DELETE CASCADE,
  incident_details TEXT,
  police_contacted BOOLEAN DEFAULT FALSE NOT NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 7: NOTIFICATIONS
-- ====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type TEXT DEFAULT 'info' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  reference_object_type TEXT,
  reference_object_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_email BOOLEAN DEFAULT TRUE NOT NULL,
  enable_sms BOOLEAN DEFAULT TRUE NOT NULL,
  enable_push BOOLEAN DEFAULT TRUE NOT NULL,
  critical_alerts_only BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- MODULE 8: SUPPORT
-- ====================================================

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- AUDIT LOGGING SYSTEM
-- ====================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- RESOLVE CIRCULAR FOREIGN KEY DEPENDENCIES
-- ====================================================
ALTER TABLE public.analysis_requests
  ADD CONSTRAINT fk_ocr_result FOREIGN KEY (ocr_result_id) REFERENCES public.ocr_results(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_speech_transcript FOREIGN KEY (speech_transcript_id) REFERENCES public.speech_transcripts(id) ON DELETE SET NULL;

-- ====================================================
-- OPTIMIZED RETRIEVAL INDEXES
-- ====================================================

-- Index helper function for user_id and created_at on all tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_phone_number ON public.trusted_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_connected_devices_user_id ON public.connected_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON public.ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_logs_message_id ON public.ai_reasoning_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_conversation_id ON public.conversation_context(conversation_id);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON public.analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON public.analysis_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_request_id ON public.uploaded_files(analysis_request_id);
CREATE INDEX IF NOT EXISTS idx_ocr_results_file_id ON public.ocr_results(file_id);
CREATE INDEX IF NOT EXISTS idx_speech_transcripts_file_id ON public.speech_transcripts(file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id ON public.analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_request_id ON public.analysis_reports(request_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_report_id ON public.scan_history(analysis_report_id);
CREATE INDEX IF NOT EXISTS idx_protection_history_user_id ON public.protection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_report_id ON public.threat_indicators(report_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_report_id ON public.fraud_scores(report_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_report_id ON public.recommendations(report_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_report_id ON public.evidence_items(report_id);

CREATE INDEX IF NOT EXISTS idx_threat_events_user_id ON public.threat_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_health_user_id ON public.system_health(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_report_id ON public.investigations(report_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);

CREATE INDEX IF NOT EXISTS idx_known_phone_numbers_phone ON public.known_phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_known_domains_domain ON public.known_domains(domain);
CREATE INDEX IF NOT EXISTS idx_known_urls_url ON public.known_urls(url);
CREATE INDEX IF NOT EXISTS idx_known_upi_ids_upi ON public.known_upi_ids(upi_id);
CREATE INDEX IF NOT EXISTS idx_known_wallets_address ON public.known_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_known_email_addresses_email ON public.known_email_addresses(email_address);
CREATE INDEX IF NOT EXISTS idx_community_reports_user_id ON public.community_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_campaigns_user_id ON public.scam_campaigns(user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_statistics_user_id ON public.dashboard_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_user_id ON public.recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_security_metrics_user_id ON public.security_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_events_user_id ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_report_id ON public.emergency_events(associated_report_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_log_event_id ON public.emergency_contacts_log(emergency_event_id);
CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON public.location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_reports_event_id ON public.sos_reports(emergency_event_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

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
-- ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- ====================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reasoning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_context ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.known_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_upi_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_campaigns ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.dashboard_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. USER MANAGEMENT POLICIES
CREATE POLICY "Manage own user profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own user preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Manage own trusted contacts" ON public.trusted_contacts FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own connected devices" ON public.connected_devices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own login history" ON public.login_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 2. AI ASSISTANT POLICIES
CREATE POLICY "Manage own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own AI messages" ON public.ai_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own AI reasoning logs" ON public.ai_reasoning_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own prompt history" ON public.prompt_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own conversation context" ON public.conversation_context FOR ALL USING (auth.uid() = user_id);

-- 3. THREAT ANALYSIS POLICIES
CREATE POLICY "Manage own requests" ON public.analysis_requests FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Law enforcement read requests" ON public.analysis_requests FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own reports" ON public.analysis_reports FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read reports" ON public.analysis_reports FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own scan history" ON public.scan_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read scan history" ON public.scan_history FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own protection history" ON public.protection_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Manage own uploaded files" ON public.uploaded_files FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read files" ON public.uploaded_files FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own OCR results" ON public.ocr_results FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read OCR" ON public.ocr_results FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own speech transcripts" ON public.speech_transcripts FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read transcripts" ON public.speech_transcripts FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own threat indicators" ON public.threat_indicators FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read indicators" ON public.threat_indicators FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own fraud scores" ON public.fraud_scores FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read fraud scores" ON public.fraud_scores FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own recommendations" ON public.recommendations FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Manage own evidence" ON public.evidence_items FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read evidence" ON public.evidence_items FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own threat events" ON public.threat_events FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Allow threat event logging system" ON public.threat_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Law enforcement read threat events" ON public.threat_events FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Read system health" ON public.system_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage system health" ON public.system_health FOR ALL USING (public.is_admin());

CREATE POLICY "Users view investigations on their reports" ON public.investigations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.analysis_reports
    WHERE public.analysis_reports.id = public.investigations.report_id
    AND public.analysis_reports.user_id = auth.uid()
  )
);
CREATE POLICY "Law enforcement and Admin manage investigations" ON public.investigations FOR ALL USING (public.is_law_enforcement() OR public.is_admin());

-- 4. THREAT INTELLIGENCE POLICIES
CREATE POLICY "Read intelligence known numbers" ON public.known_phone_numbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known numbers" ON public.known_phone_numbers FOR ALL USING (public.is_admin());

CREATE POLICY "Read intelligence known domains" ON public.known_domains FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known domains" ON public.known_domains FOR ALL USING (public.is_admin());

CREATE POLICY "Read intelligence known urls" ON public.known_urls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known urls" ON public.known_urls FOR ALL USING (public.is_admin());

CREATE POLICY "Read intelligence known upi ids" ON public.known_upi_ids FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known upi ids" ON public.known_upi_ids FOR ALL USING (public.is_admin());

CREATE POLICY "Read intelligence known wallets" ON public.known_wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known wallets" ON public.known_wallets FOR ALL USING (public.is_admin());

CREATE POLICY "Read intelligence known email addresses" ON public.known_email_addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage known email addresses" ON public.known_email_addresses FOR ALL USING (public.is_admin());

CREATE POLICY "Manage own community reports" ON public.community_reports FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement and Admin read community reports" ON public.community_reports FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Read scam campaigns" ON public.scam_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage scam campaigns" ON public.scam_campaigns FOR ALL USING (public.is_admin());

-- 5. DASHBOARD POLICIES
CREATE POLICY "Manage own dashboard statistics" ON public.dashboard_statistics FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own recent activity" ON public.recent_activity FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own security metrics" ON public.security_metrics FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 6. EMERGENCY POLICIES
CREATE POLICY "Manage own emergency events" ON public.emergency_events FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read emergency events" ON public.emergency_events FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own emergency contacts logs" ON public.emergency_contacts_log FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own location history" ON public.location_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read location history" ON public.location_history FOR SELECT USING (public.is_law_enforcement());

CREATE POLICY "Manage own SOS reports" ON public.sos_reports FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Law enforcement read SOS reports" ON public.sos_reports FOR SELECT USING (public.is_law_enforcement());

-- 7. NOTIFICATIONS POLICIES
CREATE POLICY "Manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. SUPPORT POLICIES
CREATE POLICY "Manage own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Manage own ticket messages" ON public.ticket_messages FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- SYSTEM WIDE POLICIES
CREATE POLICY "Users read own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Allow log insertions" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ====================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trusted_contacts_updated_at BEFORE UPDATE ON public.trusted_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connected_devices_updated_at BEFORE UPDATE ON public.connected_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversation_context_updated_at BEFORE UPDATE ON public.conversation_context FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_phone_numbers_updated_at BEFORE UPDATE ON public.known_phone_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_domains_updated_at BEFORE UPDATE ON public.known_domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_urls_updated_at BEFORE UPDATE ON public.known_urls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_upi_ids_updated_at BEFORE UPDATE ON public.known_upi_ids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_wallets_updated_at BEFORE UPDATE ON public.known_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_known_email_addresses_updated_at BEFORE UPDATE ON public.known_email_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_statistics_updated_at BEFORE UPDATE ON public.dashboard_statistics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
-- AUTOMATIC SIGNUP / USER HANDLER TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.user_profiles (user_id, full_name, email, phone, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'Citizen'::public.user_role)
  );

  -- 2. Create Dashboard Stats
  INSERT INTO public.dashboard_statistics (user_id, protection_score, total_scans, threats_detected, critical_alerts)
  VALUES (new.id, 92, 0, 0, 0);

  -- 3. Create Preferences
  INSERT INTO public.user_preferences (user_id, theme, language, date_format, time_format, dashboard_layout, animations_enabled, accessibility_preferences, ai_preferences, notification_preferences)
  VALUES (
    new.id,
    'light',
    'en',
    'YYYY-MM-DD',
    '24h',
    'grid',
    true,
    '{}'::jsonb,
    '{}'::jsonb,
    '{"email": true, "sms": true, "push": true}'::jsonb
  );

  -- 4. Create Notification Preferences
  INSERT INTO public.notification_preferences (user_id, enable_email, enable_sms, enable_push)
  VALUES (new.id, true, true, true);

  -- 5. Insert Welcome Notification
  INSERT INTO public.notifications (user_id, title, description, priority, type, is_read)
  VALUES (
    new.id,
    'Welcome to Sentinel AI',
    'Your isolated cybersecurity workspace is fully configured and ready for active protection.',
    'medium',
    'info',
    false
  );

  -- 6. Insert Audit Log Entry
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    new.id,
    'User Signup',
    jsonb_build_object('email', new.email)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind hook to auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- AUTOMATIC DASHBOARD STATS & NOTIFICATIONS TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.update_dashboard_stats_on_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment dashboard statistics
  UPDATE public.dashboard_statistics
  SET 
    total_scans = total_scans + 1,
    threats_detected = threats_detected + CASE WHEN NEW.threat_level != 'Safe' THEN 1 ELSE 0 END,
    critical_alerts = critical_alerts + CASE WHEN NEW.threat_level = 'Critical' THEN 1 ELSE 0 END,
    updated_at = timezone('utc'::text, now())
  WHERE user_id = NEW.user_id;

  -- Create Notification for non-safe threat levels
  IF NEW.threat_level != 'Safe' THEN
    INSERT INTO public.notifications (user_id, title, description, priority, type, reference_object_type, reference_object_id)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.threat_level = 'Critical' THEN 'Critical Threat Intercepted' ELSE 'Suspicious Activity Detected' END,
      'Threat scanner identified ' || NEW.classification || '. Immediate action recommended.',
      CASE WHEN NEW.threat_level = 'Critical' THEN 'critical'::text WHEN NEW.threat_level = 'High' THEN 'high'::text ELSE 'medium'::text END,
      'emergency',
      'analysis_reports',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_dashboard_stats
  AFTER INSERT ON public.analysis_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_dashboard_stats_on_analysis();

-- ====================================================
-- AUTOMATIC EMERGENCY EVENTS LOGGER TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_emergency_event_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert emergency notification
  INSERT INTO public.notifications (user_id, title, description, priority, type, reference_object_type, reference_object_id)
  VALUES (
    NEW.user_id,
    'SOS Triggered',
    'Emergency SOS event triggered. Status: ' || NEW.status || '. Threat level: ' || NEW.threat_level || '.',
    'critical',
    'emergency',
    'emergency_events',
    NEW.id
  );

  -- Insert audit log
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'Emergency Activated',
    jsonb_build_object('event_id', NEW.id, 'trigger_type', NEW.trigger_type, 'location', NEW.location, 'threat_level', NEW.threat_level)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_emergency_event_notify
  AFTER INSERT ON public.emergency_events
  FOR EACH ROW EXECUTE FUNCTION public.on_emergency_event_trigger();

-- ====================================================
-- AUTOMATIC SUPPORT TICKETS HANDLER TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_support_ticket_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert support notification
  INSERT INTO public.notifications (user_id, title, description, priority, type, reference_object_type, reference_object_id)
  VALUES (
    NEW.user_id,
    'Support Ticket Submitted',
    'Support Ticket #' || NEW.id || ' has been registered.',
    'low',
    'info',
    'support_tickets',
    NEW.id
  );

  -- Insert audit log
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'Ticket Submitted',
    jsonb_build_object('ticket_id', NEW.id, 'subject', NEW.subject, 'priority', NEW.priority)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_support_ticket_notify
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.on_support_ticket_trigger();

-- ====================================================
-- PROFILE UPDATE AUDIT TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_profile_update_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'Profile Update',
    jsonb_build_object(
      'old_name', OLD.full_name, 'new_name', NEW.full_name,
      'old_phone', OLD.phone, 'new_phone', NEW.phone,
      'old_avatar', OLD.avatar_url, 'new_avatar', NEW.avatar_url
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_profile_update_audit
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_update_audit();

-- ====================================================
-- PREFERENCES UPDATE AUDIT TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_preferences_update_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'Settings Changed',
    jsonb_build_object(
      'theme', NEW.theme,
      'language', NEW.language,
      'animations_enabled', NEW.animations_enabled
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_preferences_update_audit
  AFTER UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.on_preferences_update_audit();

-- ====================================================
-- ANALYSIS CREATED AUDIT TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_analysis_created_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'Analysis Created',
    jsonb_build_object(
      'analysis_id', NEW.id,
      'type', NEW.analysis_type
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_analysis_created_audit
  AFTER INSERT ON public.analysis_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_analysis_created_audit();

-- ====================================================
-- USER LOGIN / LOGOUT AUDIT LOGGER FROM LOGIN HISTORY
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_login_history_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.user_id,
    'User Login',
    jsonb_build_object(
      'login_time', NEW.login_time,
      'ip_address', NEW.ip_address,
      'browser', NEW.browser,
      'operating_system', NEW.operating_system,
      'device_type', NEW.device_type,
      'session_id', NEW.session_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_login_history_insert
  AFTER INSERT ON public.login_history
  FOR EACH ROW EXECUTE FUNCTION public.on_login_history_insert();

CREATE OR REPLACE FUNCTION public.on_login_history_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logout_time IS NOT NULL AND OLD.logout_time IS NULL THEN
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (
      NEW.user_id,
      'Logout',
      jsonb_build_object(
        'logout_time', NEW.logout_time,
        'session_id', NEW.session_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_login_history_update
  AFTER UPDATE OF logout_time ON public.login_history
  FOR EACH ROW EXECUTE FUNCTION public.on_login_history_update();

-- ====================================================
-- AUTH USERS PASSWORD CHANGE AUDIT TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.on_auth_user_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password THEN
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (
      NEW.id,
      'Password Change',
      '{}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auth_user_updated ON auth.users;
CREATE TRIGGER trigger_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_updated();

-- ====================================================
-- TRUSTED CONTACTS SINGLE PRIMARY CONTACT TRIGGER
-- ====================================================

CREATE OR REPLACE FUNCTION public.ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE public.trusted_contacts
    SET is_primary = FALSE
    WHERE user_id = NEW.user_id AND id <> NEW.id AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_primary_contact
  BEFORE INSERT OR UPDATE OF is_primary ON public.trusted_contacts
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION public.ensure_single_primary_contact();

-- ====================================================
-- SUPABASE STORAGE BUCKETS SETUP & RLS POLICIES
-- ====================================================

-- Create buckets inside storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('analysis-files', 'analysis-files', false),
  ('documents', 'documents', false),
  ('screenshots', 'screenshots', false),
  ('audio-recordings', 'audio-recordings', false),
  ('reports', 'reports', false),
  ('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies on storage.objects for each bucket
DO $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Allow users to manage their own profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read access to profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own analysis files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own screenshots" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own audio recordings" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own reports" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to manage their own support attachments" ON storage.objects;
END$$;

CREATE POLICY "Allow users to manage their own profile images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow public read access to profile images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'profile-images');

CREATE POLICY "Allow users to manage their own analysis files" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'analysis-files' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow users to manage their own documents" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'documents' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow users to manage their own screenshots" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'screenshots' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow users to manage their own audio recordings" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'audio-recordings' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow users to manage their own reports" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'reports' AND (name LIKE auth.uid()::text || '/%'));

CREATE POLICY "Allow users to manage their own support attachments" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'support-attachments' AND (name LIKE auth.uid()::text || '/%'));
