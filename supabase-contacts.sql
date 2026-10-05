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

CREATE INDEX idx_contacts_role ON contacts (role);
CREATE INDEX idx_contacts_name ON contacts (name);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Sample contacts
INSERT INTO contacts (name, phone, role, company, notes) VALUES
  ('Rajesh Sharma', '9876543210', 'broker', 'Sharma Properties', 'Active broker in Dayalbagh area'),
  ('Adv. Sunil Gupta', '9123456789', 'lawyer', 'Gupta & Associates', 'Property registration specialist'),
  ('SBI Agra Branch', '0562-2854123', 'banker', 'State Bank of India', 'Home loan contact');
