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

-- 2. Update user_profiles to add phone, avatar, and correct role
UPDATE public.user_profiles
SET phone = '+91 98765 43210', avatar_url = 'SR', role = 'Citizen'
WHERE user_id = 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29';

UPDATE public.user_profiles
SET phone = '+91 99999 88888', avatar_url = 'OV', role = 'Admin'
WHERE user_id = 'a16cbbf0-10ef-4172-8822-261908bf5bf0';

-- 3. Seed Trusted Contacts
INSERT INTO public.trusted_contacts (id, user_id, contact_name, phone_number, relationship, priority, is_primary)
VALUES 
  ('728a0112-be00-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'Sunita Ram', '+91 98765 55555', 'Spouse', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Connected Devices
INSERT INTO public.connected_devices (id, user_id, device_name, platform, os_version, app_version, push_token)
VALUES
  (gen_random_uuid(), 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'Sai''s Pixel 8', 'android', 'Android 14', '2.1.0', 'token_pixel_8_xyz'),
  (gen_random_uuid(), 'a16cbbf0-10ef-4172-8822-261908bf5bf0', 'Operator Workstation', 'web', 'Windows 11', '1.0.0', NULL)
ON CONFLICT DO NOTHING;

-- 5. Seed Threat Intelligence Registry Databases
INSERT INTO public.known_phone_numbers (phone_number, reputation, reported_count, scam_category, notes)
VALUES
  ('+91 95382 10928', 'malicious', 15, 'Vishing (CBI Impersonation)', 'Frequently calls asserting customs parcel block and threatening digital arrest.'),
  ('+91 98765 00001', 'suspicious', 2, 'Financial Scams', 'Unsolicited loan offers requesting upfront processing fee.')
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.known_domains (domain, reputation, reported_count, scam_category, notes)
VALUES
  ('hdfc-security-auth.net', 'malicious', 42, 'Credential Phishing', 'Mimics HDFC security login to harvest netbanking passwords.'),
  ('bhim-upi-cashback.in', 'malicious', 18, 'UPI Fraud', 'Mimics UPI portal asking users to click collect requests.')
ON CONFLICT (domain) DO NOTHING;

INSERT INTO public.known_urls (url, reputation, reported_count, scam_category, notes)
VALUES
  ('https://hdfc-security-auth.net/login/verification.php', 'malicious', 24, 'Credential Phishing', 'Specific phishing verification endpoint.'),
  ('https://bhim-upi-cashback.in/claim-bonus', 'malicious', 12, 'UPI Fraud', 'Collect transfer trap page.')
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.known_upi_ids (upi_id, reputation, reported_count, scam_category, notes)
VALUES
  ('cbi-officer-wallet@ybl', 'malicious', 8, 'Extortion', 'UPI ID used to receive extortion payments in CBI digital arrest campaigns.'),
  ('fast-customs-payment@upi', 'malicious', 14, 'Customs Fraud', 'Used in FedEx package customs scam.')
ON CONFLICT (upi_id) DO NOTHING;

INSERT INTO public.known_wallets (wallet_address, blockchain, reputation, reported_count, scam_category, notes)
VALUES
  ('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'Ethereum', 'suspicious', 3, 'Ransomware', 'Identified as deposit address in minor phishing script.'),
  ('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb', 'Tron', 'malicious', 19, 'Extortion', 'Used for USDT laundering in digital arrest extortion.')
ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO public.known_email_addresses (email_address, reputation, reported_count, scam_category, notes)
VALUES
  ('customs-clearance-dept@india-mail.com', 'malicious', 11, 'Impersonation', 'Sends fake invoices for package release fees.'),
  ('cbi-verification-unit@officer.com', 'malicious', 9, 'Extortion', 'Fake agency email for Skype meeting scheduling.')
ON CONFLICT (email_address) DO NOTHING;

-- 6. Seed Scam Campaigns
INSERT INTO public.scam_campaigns (id, user_id, name, status, description, start_date)
VALUES
  ('442a0112-bb00-4b00-a548-2895f32a76f2', 'a16cbbf0-10ef-4172-8822-261908bf5bf0', 'CBI Vishing Extortion campaign', 'Active', 'Vishing syndicate targeting urban citizens claiming illegal package seizures by customs and using fake CBI video calls.', '2026-07-01')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Analysis Requests (Voice analysis scenario)
INSERT INTO public.analysis_requests (id, user_id, analysis_type, input_text)
VALUES
  ('662a0112-dd00-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'voice', 'Recorded call session from +91 95382 10928 claiming CBI warrant.')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Uploaded Files
INSERT INTO public.uploaded_files (id, user_id, analysis_request_id, storage_bucket, file_path, original_filename, mime_type, size)
VALUES
  ('bb2a0112-2200-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '662a0112-dd00-4b00-a548-2895f32a76f2', 'audio-recordings', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29/voice_v8941.mp3', 'voice_v8941.mp3', 'audio/mp3', 2048500)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Speech Transcripts
INSERT INTO public.speech_transcripts (id, user_id, file_id, transcript, language, speaker_count, confidence)
VALUES
  ('cc2a0112-3300-4b00-a548-2895f32a76f2', 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', 'bb2a0112-2200-4b00-a548-2895f32a76f2', 'This is Officer Sharma from CBI. Your Aadhaar card has been flagged in connection with money laundering in Mumbai. You must remain on video verification or an arrest warrant will be issued.', 'en', 2, 0.95)
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Analysis Requests trigger details mapping
UPDATE public.analysis_requests
SET speech_transcript_id = 'cc2a0112-3300-4b00-a548-2895f32a76f2'
WHERE id = '662a0112-dd00-4b00-a548-2895f32a76f2';

-- 11. Seed Analysis Reports
INSERT INTO public.analysis_reports (id, user_id, request_id, summary, classification, explainable_ai, threat_level, user_safety)
VALUES
  (
    '772a0112-ee00-4b00-a548-2895f32a76f2', 
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    '662a0112-dd00-4b00-a548-2895f32a76f2', 
    'Forensic evaluation identified clone signature match indicating ElevenLabs voice generation vectors claiming law enforcement credentials.', 
    'Government Impersonation', 
    '[{"name": "Synthetic Voice Fingerprint", "explanation": "Voice patterns match ElevenLabs synthetic voice clones used in financial extortion campaigns."}]'::jsonb,
    'High',
    'Sentinel active shield is monitoring. Avoid sharing OTPs or financial credentials. Government officials will never ask you to stay on video conference for digital arrest.'
  )
ON CONFLICT (id) DO NOTHING;

-- 12. Seed Scan History
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

-- 13. Seed Protection History
INSERT INTO public.protection_history (id, user_id, module, status, threat_level, fraud_confidence, summary)
VALUES
  (
    'aa2a0112-1100-4b00-a548-2895f32a76f2',
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    'Voice Shield',
    'Completed',
    'High',
    92,
    'AI intercepted a potential Government Impersonation event from +91 95382 10928.'
  )
ON CONFLICT (id) DO NOTHING;

-- 14. Seed Fraud Scores
INSERT INTO public.fraud_scores (user_id, report_id, overall_score, ai_confidence, risk_breakdown)
VALUES
  (
    'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29',
    '772a0112-ee00-4b00-a548-2895f32a76f2',
    92,
    98,
    '{"fear_tactics": 95, "synthetic_voice": 94, "unauthorized_authority": 90}'::jsonb
  )
ON CONFLICT (report_id) DO NOTHING;

-- 15. Seed Recommendations
INSERT INTO public.recommendations (user_id, report_id, action_steps, priority, completed)
VALUES
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'Hang up immediately and do not return call.', 1, true),
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'File a cyber complaint on national portal (1930) or report scam number +91 95382 10928.', 2, false)
ON CONFLICT DO NOTHING;

-- 16. Seed Evidence Items
INSERT INTO public.evidence_items (user_id, report_id, evidence_type, evidence_value, notes)
VALUES
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'phone_number', '+91 95382 10928', 'Scammer caller ID captured by telemetry.'),
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'audio_segment', 'elevenlabs_signature_match', '120ms snippet containing ElevenLabs synthetic watermark markers.')
ON CONFLICT DO NOTHING;

-- 17. Seed Threat Indicators
INSERT INTO public.threat_indicators (user_id, report_id, indicator_name, description, severity)
VALUES
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'ElevenLabs Audio match', 'Voice fingerprint matches deepfake generator models.', 'Critical'),
  ('d0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', '772a0112-ee00-4b00-a548-2895f32a76f2', 'Aadhaar arrest script', 'Language templates match digital arrest extortion scripts.', 'High')
ON CONFLICT DO NOTHING;

-- 18. Seed Investigations
INSERT INTO public.investigations (id, report_id, assignee_id, status, notes)
VALUES
  ('dd2a0112-4400-4b00-a548-2895f32a76f2', '772a0112-ee00-4b00-a548-2895f32a76f2', 'a16cbbf0-10ef-4172-8822-261908bf5bf0', 'Investigating', 'Suspect caller matches known SBI/CBI vishing syndicate. Coordinating trace block request with local LE.')
ON CONFLICT (id) DO NOTHING;

-- 19. Seed User Dashboard Statistics (forcing initial values)
UPDATE public.dashboard_statistics
SET protection_score = 92, total_scans = 1, threats_detected = 1, critical_alerts = 0
WHERE user_id = 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29';
