-- =====================================================
-- MIGRATION: richer species editorial content
-- =====================================================

ALTER TABLE species
  ADD COLUMN IF NOT EXISTS family_tribe TEXT DEFAULT 'Apidae / Meliponini',
  ADD COLUMN IF NOT EXISTS urban_indication TEXT,
  ADD COLUMN IF NOT EXISTS behavior TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS observations TEXT,
  ADD COLUMN IF NOT EXISTS nesting_type TEXT,
  ADD COLUMN IF NOT EXISTS key_plants TEXT,
  ADD COLUMN IF NOT EXISTS conservation_status TEXT,
  ADD COLUMN IF NOT EXISTS best_use TEXT,
  ADD COLUMN IF NOT EXISTS occurrence_regions TEXT;
