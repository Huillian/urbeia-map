-- =====================================================
-- URBEIA MAP · SCHEMA v0
-- =====================================================

CREATE TABLE IF NOT EXISTS species (
  slug TEXT PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_scientific TEXT NOT NULL,
  pollination_radius_m INTEGER NOT NULL,
  size_mm TEXT,
  honey_yield_l_year TEXT,
  region_pt TEXT,
  info_url TEXT,
  color_hex TEXT DEFAULT '#06d6a0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE species IS 'Espécies de abelhas sem ferrão com dados de polinização';

CREATE TABLE IF NOT EXISTS hives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_slug TEXT UNIQUE,
  species_slug TEXT REFERENCES species(slug) ON DELETE SET NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'SC',
  approximate_location BOOLEAN DEFAULT true,
  nickname TEXT,
  installed_at DATE,
  owner_name TEXT,
  owner_email TEXT,      -- PRIVADO — só admin vê
  note TEXT,
  photo_url TEXT,
  pending_photo_url TEXT,
  is_urbeia_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  photo_review_status TEXT DEFAULT 'none'
    CHECK (photo_review_status IN ('none', 'pending', 'approved', 'rejected')),
  photo_rejected_reason TEXT,
  data_quality_status TEXT DEFAULT 'unreviewed'
    CHECK (data_quality_status IN ('unreviewed', 'needs_review', 'verified', 'rejected')),
  location_plausible BOOLEAN,
  species_plausible BOOLEAN,
  photo_valid BOOLEAN,
  content_appropriate BOOLEAN,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hives IS 'Caixas de abelhas sem ferrão mapeadas';
COMMENT ON COLUMN hives.is_urbeia_verified IS 'TRUE = instalada pela Urbeia. Só admin pode setar.';
COMMENT ON COLUMN hives.owner_email IS 'PRIVADO — nunca retornar em queries públicas';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hives_status ON hives(status);
CREATE INDEX IF NOT EXISTS idx_hives_approved ON hives(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_hives_species ON hives(species_slug);
CREATE INDEX IF NOT EXISTS idx_hives_verified ON hives(is_urbeia_verified) WHERE is_urbeia_verified = true;
CREATE INDEX IF NOT EXISTS idx_hives_city ON hives(city);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hives_updated_at ON hives;
CREATE TRIGGER update_hives_updated_at
  BEFORE UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: auto-set approved_at
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hives_approved_at ON hives;
CREATE TRIGGER set_hives_approved_at
  BEFORE UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION set_approved_at();

-- RLS
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Species readable by all" ON species;
CREATE POLICY "Species readable by all"
  ON species FOR SELECT USING (true);

DROP POLICY IF EXISTS "Approved hives readable by all" ON hives;
CREATE POLICY "Approved hives readable by all"
  ON hives FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can submit new hive" ON hives;
CREATE POLICY "Anyone can submit new hive"
  ON hives FOR INSERT
  WITH CHECK (status = 'pending' AND is_urbeia_verified = false);

DROP POLICY IF EXISTS "Authenticated users see all hives" ON hives;
CREATE POLICY "Authenticated users see all hives"
  ON hives FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can update" ON hives;
CREATE POLICY "Authenticated users can update"
  ON hives FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete" ON hives;
CREATE POLICY "Authenticated users can delete"
  ON hives FOR DELETE TO authenticated USING (true);
