-- ==========================================
-- SentinelAI - AI Digital Arrest Scam Shield
-- Database Schema for Supabase / PostgreSQL
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. Users Table (Linked to Supabase Auth.users)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY, -- References auth.users(id)
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  city TEXT,
  state TEXT,
  emergency_contact TEXT, -- Reference to active contact phone / info
  protection_status TEXT DEFAULT 'Active Monitoring' CHECK (protection_status IN ('Active Monitoring', 'Alert Status', 'SOS Triggered', 'Paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 2. Scam Analysis Table (AI Scam Inspections)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scam_analysis (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('voice', 'document', 'screenshot', 'QR', 'URL', 'chat')),
  uploaded_file_url TEXT,
  input_text TEXT,
  ai_summary TEXT,
  scam_type TEXT, -- e.g., 'CBI Digital Arrest', 'Customs Parcel Scam', etc.
  fraud_confidence_score INT NOT NULL CHECK (fraud_confidence_score BETWEEN 0 AND 100),
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  explainable_reasoning JSONB DEFAULT '[]'::jsonb, -- Array of reasoning steps
  evidence_points JSONB DEFAULT '[]'::jsonb, -- Key evidence extracted
  recommended_actions JSONB DEFAULT '[]'::jsonb, -- Action checklist
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 3. Uploaded Files Table (Storage Metadata)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT NOT NULL,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 4. Emergency Contacts Table (SOS Recipients)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  priority INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 5. Emergency Events Table (SOS Logs)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  trigger_source TEXT NOT NULL CHECK (trigger_source IN ('Manual SOS Button', 'Volume Trigger', 'AI Call Threat Detection', 'Lockscreen Action')),
  gps_location TEXT, -- e.g., '12.9716, 77.5946'
  notified_contacts JSONB DEFAULT '[]'::jsonb, -- array of phone numbers notified
  cybercrime_alert_sent BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 6. Threat History Table (Scam Detections History)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.threat_history (
  threat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  fraud_score INT NOT NULL CHECK (fraud_score BETWEEN 0 AND 100),
  scam_category TEXT NOT NULL, -- e.g., 'Digital Arrest', 'Vishing', 'UPI Spoof'
  detected_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Mitigated' CHECK (status IN ('Active Intercept', 'Mitigated', 'Under Review', 'Reported'))
);

-- ------------------------------------------
-- 7. Fraud Patterns Table (AI Knowledgebase)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scam_name TEXT NOT NULL,
  impersonated_agency TEXT, -- e.g., 'CBI', 'Telecom Regulatory (TRAI)', 'Delhi Police'
  keywords JSONB DEFAULT '[]'::jsonb,
  threat_indicators JSONB DEFAULT '[]'::jsonb,
  urgency_indicators JSONB DEFAULT '[]'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  known_scam_script TEXT,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 8. Scam Keywords Table (Rapid Lookup Registry)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scam_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT UNIQUE NOT NULL,
  severity TEXT DEFAULT 'High' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical'))
);

-- ------------------------------------------
-- 9. Threat Reports Table (User Crowdsourced Filings)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.threat_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Reporter reference
  phone_number TEXT NOT NULL, -- Scammer's phone number
  description TEXT,
  uploaded_evidence TEXT, -- Link to uploaded file metadata
  report_status TEXT DEFAULT 'Submitted' CHECK (report_status IN ('Submitted', 'Verified', 'Flagged', 'False Positive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 10. Scam Numbers Table (Global Registry Database)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scam_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT DEFAULT '+91',
  number TEXT UNIQUE NOT NULL,
  reported_count INT DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  scam_category TEXT NOT NULL,
  confidence INT DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100)
);

-- ------------------------------------------
-- 11. AI Model Logs Table (Telemetry Inference Logs)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_model_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL, -- e.g. 'Grok-Beta', 'GPT-4o', etc.
  processing_time_ms INT NOT NULL,
  confidence INT CHECK (confidence BETWEEN 0 AND 100),
  tokens_used INT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 12. Dashboard Statistics Table (Realtime Aggregations)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.dashboard_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  users_protected INT DEFAULT 0,
  analyses_completed INT DEFAULT 0,
  scams_detected INT DEFAULT 0,
  money_potentially_saved NUMERIC(15, 2) DEFAULT 0.00,
  active_alerts INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- INDEXES FOR OPTIMAL RETRIEVAL
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_scam_analysis_user_id ON public.scam_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_analysis_type ON public.scam_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_history_user ON public.threat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_reports_number ON public.threat_reports(phone_number);
CREATE INDEX IF NOT EXISTS idx_scam_numbers_lookup ON public.scam_numbers(number);
CREATE INDEX IF NOT EXISTS idx_scam_keywords_phrase ON public.scam_keywords(phrase);
CREATE INDEX IF NOT EXISTS idx_ai_model_logs_time ON public.ai_model_logs(timestamp);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all user-specific data tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;

-- Disable modification permissions by default on global assets, read-only to authed/anon users
ALTER TABLE public.fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_statistics ENABLE ROW LEVEL SECURITY;

-- 1. Users table policies
CREATE POLICY "Users can read their own profile details"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile info"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile info during sign up"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Scam Analysis table policies
CREATE POLICY "Users can read their own scam analysis results"
  ON public.scam_analysis FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scam analysis events"
  ON public.scam_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history"
  ON public.scam_analysis FOR DELETE USING (auth.uid() = user_id);

-- 3. Uploaded Files table policies
CREATE POLICY "Users can view metadata of files they uploaded"
  ON public.uploaded_files FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register metadata of uploaded files"
  ON public.uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their file records"
  ON public.uploaded_files FOR DELETE USING (auth.uid() = user_id);

-- 4. Emergency Contacts table policies
CREATE POLICY "Users can view their own emergency contacts"
  ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their emergency contacts"
  ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- 5. Emergency Events table policies
CREATE POLICY "Users can view their triggered emergency events"
  ON public.emergency_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log new emergency events"
  ON public.emergency_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Threat History table policies
CREATE POLICY "Users can view their threat history entries"
  ON public.threat_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register new threats in history"
  ON public.threat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Threat Reports table policies
CREATE POLICY "Users can view reports they submitted"
  ON public.threat_reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit anonymous or user-specific threat reports"
  ON public.threat_reports FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 8. Global Tables (Read-Only access for authenticated users, full access for service_role)
CREATE POLICY "Allow select for authenticated users on fraud patterns"
  ON public.fraud_patterns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow select for authenticated users on scam keywords"
  ON public.scam_keywords FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow select for authenticated users on scam numbers"
  ON public.scam_numbers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow select for authenticated users on dashboard statistics"
  ON public.dashboard_statistics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/select on AI model logs for system analytics"
  ON public.ai_model_logs FOR SELECT TO authenticated USING (true);
