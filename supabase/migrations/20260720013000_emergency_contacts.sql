-- Migration: Emergency Contact Management System
-- Timestamp: 2026-07-20T01:30:00Z
-- Version: 20260720013000_emergency_contacts.sql

-- Drop existing table if any
DROP TABLE IF EXISTS public.trusted_contacts CASCADE;

-- Create table with new schema
CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  country_code TEXT DEFAULT '+91' NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NULL,
  relationship TEXT NULL,
  priority INTEGER DEFAULT 1 NOT NULL,
  preferred_contact_method TEXT DEFAULT 'sms' NOT NULL CHECK (preferred_contact_method IN ('sms', 'email', 'push')),
  receive_sms BOOLEAN DEFAULT TRUE NOT NULL,
  receive_email BOOLEAN DEFAULT FALSE NOT NULL,
  receive_push BOOLEAN DEFAULT TRUE NOT NULL,
  receive_location BOOLEAN DEFAULT TRUE NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Unique constraint: prevent duplicate contacts (same phone_number) within the same user account
ALTER TABLE public.trusted_contacts ADD CONSTRAINT unique_user_phone UNIQUE (user_id, phone_number);

-- Indexes for performant lookups
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_phone_number ON public.trusted_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_priority ON public.trusted_contacts(priority);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_is_primary ON public.trusted_contacts(is_primary);

-- Trigger to automatically unset other primary contacts when a new one is set to Primary
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

CREATE OR REPLACE TRIGGER trigger_single_primary_contact
  BEFORE INSERT OR UPDATE OF is_primary ON public.trusted_contacts
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION public.ensure_single_primary_contact();

-- Enable RLS
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Select policy for trusted_contacts" ON public.trusted_contacts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Insert policy for trusted_contacts" ON public.trusted_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update policy for trusted_contacts" ON public.trusted_contacts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Delete policy for trusted_contacts" ON public.trusted_contacts
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
