-- ============================================
-- Dayalwasi Properties — Supabase Schema Update
-- ============================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/auhjqameqeasaphxxlqq/sql

-- 1. Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  role TEXT NOT NULL DEFAULT 'broker' CHECK (role IN ('broker', 'builder', 'lawyer', 'banker', 'government', 'client', 'other')),
  company TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts (role);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts (name);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON contacts;
CREATE POLICY "Allow all" ON contacts FOR ALL USING (true) WITH CHECK (true);

-- Optional updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_contacts_updated_at ON contacts;
CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 2. Add Google Drive URL column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS drive_url TEXT;

-- 3. Sample contacts (if table empty)
INSERT INTO contacts (name, phone, role, company, notes)
SELECT 'Rajesh Sharma', '9876543210', 'broker', 'Sharma Properties', 'Active broker in Dayalbagh area'
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE phone = '9876543210');

INSERT INTO contacts (name, phone, role, company, notes)
SELECT 'Adv. Sunil Gupta', '9123456789', 'lawyer', 'Gupta & Associates', 'Property registration specialist'
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE phone = '9123456789');

INSERT INTO contacts (name, phone, role, company, notes)
SELECT 'SBI Agra Branch', '0562-2854123', 'banker', 'State Bank of India', 'Home loan contact'
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE phone = '0562-2854123');

