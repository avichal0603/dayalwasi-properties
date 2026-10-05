-- ============================================
-- Dayalwasi Properties — Supabase Setup SQL
-- ============================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → Your Project → SQL Editor

-- 1. Create the properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('plot', 'house', 'flat', 'commercial', 'floor')),
  colony TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Agra',
  area_gaj NUMERIC NOT NULL DEFAULT 0,
  area_sqft NUMERIC GENERATED ALWAYS AS (area_gaj * 9) STORED,
  plot_length NUMERIC,
  plot_breadth NUMERIC,
  floors INTEGER,
  bhk TEXT,
  bathrooms INTEGER,
  parking BOOLEAN DEFAULT false,
  parking_type TEXT CHECK (parking_type IN ('covered', 'open', NULL)),
  facing TEXT NOT NULL DEFAULT 'east' CHECK (facing IN ('east', 'west', 'north', 'south', 'north-east', 'north-west', 'south-east', 'south-west')),
  road_width NUMERIC,
  corner_plot BOOLEAN DEFAULT false,
  price NUMERIC NOT NULL DEFAULT 0,
  price_per_gaj NUMERIC GENERATED ALWAYS AS (
    CASE WHEN area_gaj > 0 THEN ROUND(price / area_gaj) ELSE 0 END
  ) STORED,
  registry_status TEXT NOT NULL DEFAULT 'freehold' CHECK (registry_status IN ('registered', 'unregistered', 'freehold', 'leasehold')),
  loan_available BOOLEAN DEFAULT false,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'sold', 'reserved', 'negotiation')),
  construction_status TEXT NOT NULL DEFAULT 'plot' CHECK (construction_status IN ('ready', 'under_construction', 'plot')),
  owner_name TEXT NOT NULL DEFAULT '',
  owner_contact TEXT NOT NULL DEFAULT '',
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_colony ON properties (colony);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON properties (availability);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties (area_gaj);

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Enable Row Level Security (but allow all operations for now since it's a private app)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON properties
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Create the storage bucket for property images
-- NOTE: Run this manually in Supabase Dashboard → Storage → Create Bucket
-- Bucket name: property-images
-- Public: Yes (so images can be displayed without auth)

-- 6. Insert sample data for testing
INSERT INTO properties (title, property_type, colony, address, area_gaj, facing, price, registry_status, availability, construction_status, owner_name, owner_contact, latitude, longitude, notes) VALUES
  ('3 BHK House in Tulsi Vihar', 'house', 'Tulsi Vihar', 'Phase 2, Block B, Plot 45', 200, 'east', 7500000, 'freehold', 'available', 'ready', 'Ramesh Kumar', '9876543210', 27.2280, 78.0050, 'Well-maintained house with garden. Near park.'),
  ('Corner Plot in Jeevan Jyoti', 'plot', 'Jeevan Jyoti', 'Sector 3, Near Main Road', 150, 'north-east', 3000000, 'registered', 'available', 'plot', 'Suresh Sharma', '9123456789', 27.2260, 78.0100, 'Prime corner plot. 30ft road. Excellent location.'),
  ('2 BHK Flat in Prem Nagar', 'flat', 'Prem Nagar', 'Tower A, 3rd Floor, Flat 302', 100, 'south', 4500000, 'freehold', 'negotiation', 'ready', 'Ankit Gupta', '9988776655', 27.2200, 78.0080, 'Semi-furnished flat with modular kitchen.'),
  ('Commercial Shop in Dayal Bagh', 'commercial', 'Dayal Bagh', 'Main Market, Shop No. 12', 50, 'west', 2500000, 'registered', 'available', 'ready', 'Vijay Agarwal', '9876501234', 27.2244, 78.0120, 'Ground floor shop. High footfall area.'),
  ('200 Gaj Plot in Tulsi Vihar', 'plot', 'Tulsi Vihar', 'Phase 3, Block D', 200, 'north', 4000000, 'freehold', 'available', 'plot', 'Prakash Verma', '9112233445', 27.2290, 78.0060, 'Wide road. Approved layout. Ready for construction.');

-- Done! Your database is ready.
