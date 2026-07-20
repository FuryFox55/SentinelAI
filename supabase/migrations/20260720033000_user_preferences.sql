-- Migration: Add user_preferences table and update signup triggers
-- Timestamp: 2026-07-20T03:30:00Z
-- Version: 20260720033000_user_preferences.sql

-- 1. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  time_format TEXT DEFAULT '24h',
  dashboard_layout TEXT DEFAULT 'grid',
  animations_enabled BOOLEAN DEFAULT true,
  accessibility_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' AND policyname = 'Users can manage their own preferences'
  ) THEN
    CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- 4. Update the handle_new_user trigger function to include default preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.user_profiles (user_id, full_name, email, phone, avatar_url, theme, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url',
    'light', -- Default theme is light
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'Citizen'::public.user_role)
  );

  -- Insert stats
  INSERT INTO public.dashboard_statistics (user_id, protection_score, total_scans, threats_detected, critical_alerts)
  VALUES (
    new.id,
    92,
    0,
    0,
    0
  );

  -- Insert preferences
  INSERT INTO public.user_preferences (user_id, theme, language, date_format, time_format, dashboard_layout, animations_enabled, accessibility_preferences)
  VALUES (
    new.id,
    'light',
    'en',
    'YYYY-MM-DD',
    '24h',
    'grid',
    true,
    '{}'::jsonb
  );

  -- Insert welcome notification
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
