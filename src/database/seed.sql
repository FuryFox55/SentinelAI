-- ====================================================
-- Sentinel AI - Database Seeding Script (sentinel_seed.sql)
-- Seeds realistic cybercrime investigations, analyses,
-- dashboard statistics, and explainable AI metrics.
-- ====================================================

-- 1. Seed auth.users (Supabase Auth parent identity)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, aud, role)
VALUES
  (
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 
    '00000000-0000-0000-0000-000000000000', 
    'citizen@sentinel.ai', 
    '$2a$10$wN7K/Q6pA.V6l9p1bFp7t.Xm6d45e5r6F7g8h9i0j1k2l3m4n5o6p', 
    now(), 
    now(), 
    '{"provider": "email", "providers": ["email"]}'::jsonb, 
    '{"full_name": "Sai Ram", "role": "Citizen"}'::jsonb, 
    false, 
    now(), 
    now(), 
    '+91 98765 43210', 
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    'a16cbbf0-10ef-4172-8822-261908bf5bf0', 
    '00000000-0000-0000-0000-000000000000', 
    'operator@sentinel.ai', 
    '$2a$10$wN7K/Q6pA.V6l9p1bFp7t.Xm6d45e5r6F7g8h9i0j1k2l3m4n5o6p', 
    now(), 
    now(), 
    '{"provider": "email", "providers": ["email"]}'::jsonb, 
    '{"full_name": "Command Agent Alpha", "role": "Admin"}'::jsonb, 
    false, 
    now(), 
    now(), 
    '+91 99999 88888', 
    now(),
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Update user_profiles to add details (if trigger succeeded, update; otherwise trigger handles it)
UPDATE public.user_profiles
SET phone = '+91 98765 43210', avatar_url = 'SR'
WHERE user_id = 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29';

UPDATE public.user_profiles
SET phone = '+91 99999 88888', avatar_url = 'OV'
WHERE user_id = 'a16cbbf0-10ef-4172-8822-261908bf5bf0';

-- 3. Seed Trusted Contacts
INSERT INTO public.trusted_contacts (id, user_id, contact_name, contact_phone, relationship, verified)
VALUES 
  ('728a0112-be00-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'Sunita Ram', '+91 98765 55555', 'Spouse', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Threat Intelligence Scam Patterns
INSERT INTO public.scam_patterns (id, name, impersonated_agency, known_script)
VALUES
  ('332a0112-aa00-4b00-a548-2895f32a76f2', 'CBI Digital Arrest Scam', 'Central Bureau of Investigation (CBI)', 'A caller claiming to be a police officer asserts your Aadhar ID was used to send illegal packages. Instructs you to stay on video conference for verification under threat of arrest.'),
  ('332a0112-aa00-4b00-a548-2895f32a76f3', 'FedEx Customs Parcel Scam', 'FedEx Logistics / India Customs', 'Victim receives SMS claiming illegal drugs were found in a package addressed to them. Directs them to pay customs clearance fees instantly to a designated UPI wallet.')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Scam Campaigns
INSERT INTO public.scam_campaigns (id, pattern_id, name, status, start_date)
VALUES
  ('442a0112-bb00-4b00-a548-2895f32a76f2', '332a0112-aa00-4b00-a548-2895f32a76f2', 'CBI Vishing Extortion campaign', 'Active', '2026-07-01')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Global Threat Feed
INSERT INTO public.threat_feed (id, title, description, risk_level, source)
VALUES
  ('552a0112-cc00-4b00-a548-2895f32a76f2', 'Fake CBI Video Conference Alerts', 'Alert on surge of callers utilizing deepfake CBI police uniforms on Skype. Immediate reports advised.', 'Critical', 'National Cyber Crime Portal'),
  ('552a0112-cc00-4b00-a548-2895f32a76f3', 'Malicious bhim-upi Domains', 'Multiple domains mimicking standard UPI interfaces detected harvesting credentials.', 'High', 'CERT-In Agency')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Analysis Requests (Voice analysis scenario)
INSERT INTO public.analysis_requests (id, user_id, analysis_type, input_text, file_url)
VALUES
  ('662a0112-dd00-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'voice', 'Recorded call session from +91 95382 10928 claiming CBI warrant.', 'https://hhhxnvdpzfbbwptaxevrg.supabase.co/storage/v1/object/public/evidence-bucket/voice_v8941.mp3')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Analysis Reports
INSERT INTO public.analysis_reports (id, user_id, request_id, summary, classification, fraud_confidence, ai_confidence, explainable_ai, threat_indicators, evidence, recommendations, timeline)
VALUES
  (
    '772a0112-ee00-4b00-a548-2895f32a76f2', 
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    '662a0112-dd00-4b00-a548-2895f32a76f2', 
    'Forensic evaluation identified clone signature match indicating ElevenLabs voice generation vectors.', 
    'Government Impersonation', 
    92, 
    98,
    '[{"name": "Synthetic Voice Fingerprint", "explanation": "Voice patterns match ElevenLabs synthetic voice clones used in financial extortion campaigns."}]'::jsonb,
    '[{"name": "Synthetic Voice Fingerprint", "severity": "High", "confidence": 94, "explanation": "Voice matches known CBI extortion clone signature with 94% frequency match."}]'::jsonb,
    '{"detectedNumbers": ["+91 95382 10928"], "governmentNames": ["CBI Verification Officer"], "moneyAmount": "₹45,000"}'::jsonb,
    '["Block Caller Contacts", "Report to National Cyber Security portal (1930)"]'::jsonb,
    '["Call Received", "Government identity claimed", "Fear tactics used", "Money requested", "Call Blocked"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Scan History
INSERT INTO public.scan_history (id, user_id, analysis_report_id, module, input_type, classification, threat_level, fraud_confidence, ai_confidence, processing_time)
VALUES
  (
    '882a0112-ff00-4b00-a548-2895f32a76f2',
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    '772a0112-ee00-4b00-a548-2895f32a76f2',
    'Voice Scanner',
    'voice',
    'Government Impersonation',
    'High',
    92,
    98,
    120
  )
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Protection History
INSERT INTO public.protection_history (id, user_id, module, status, threat_level, fraud_confidence, summary)
VALUES
  (
    'aa2a0112-1100-4b00-a548-2895f32a76f2',
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    'Background AI Heuristics',
    'Completed',
    'High',
    92,
    'AI intercepted a potential Government Impersonation event.'
  )
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Command Center Investigations
INSERT INTO public.investigations (id, report_id, assignee_id, status, notes)
VALUES
  ('dd2a0112-4400-4b00-a548-2895f32a76f2', '772a0112-ee00-4b00-a548-2895f32a76f2', 'a16cbbf0-10ef-4172-8822-261908bf5bf0', 'Investigating', 'Suspect caller matches known SBI/CBI vishing syndicate. Coordinating trace block request.')
ON CONFLICT (id) DO NOTHING;

-- 12. Seed User Dashboard Statistics
INSERT INTO public.dashboard_statistics (user_id, protection_score, total_scans, threats_detected, critical_alerts)
VALUES
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 92, 1, 1, 0)
ON CONFLICT (user_id) DO UPDATE 
SET protection_score = EXCLUDED.protection_score,
    total_scans = EXCLUDED.total_scans,
    threats_detected = EXCLUDED.threats_detected,
    critical_alerts = EXCLUDED.critical_alerts;
