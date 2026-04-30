-- =====================================================
-- MIGRATION: review metadata + data quality
-- =====================================================

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_review_status TEXT DEFAULT 'none'
    CHECK (photo_review_status IN ('none', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS photo_rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS data_quality_status TEXT DEFAULT 'unreviewed'
    CHECK (data_quality_status IN ('unreviewed', 'needs_review', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS location_plausible BOOLEAN,
  ADD COLUMN IF NOT EXISTS species_plausible BOOLEAN,
  ADD COLUMN IF NOT EXISTS photo_valid BOOLEAN,
  ADD COLUMN IF NOT EXISTS content_appropriate BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_hives_photo_review_status ON hives(photo_review_status);
CREATE INDEX IF NOT EXISTS idx_hives_data_quality_status ON hives(data_quality_status);
CREATE INDEX IF NOT EXISTS idx_hives_reviewed_at ON hives(reviewed_at);

UPDATE hives
SET photo_review_status = CASE
    WHEN pending_photo_url IS NOT NULL THEN 'pending'
    WHEN photo_url IS NOT NULL THEN 'approved'
    ELSE 'none'
  END,
  data_quality_status = CASE
    WHEN status = 'approved' THEN 'verified'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE COALESCE(NULLIF(data_quality_status, 'unreviewed'), 'needs_review')
  END
WHERE photo_review_status IS NULL
   OR data_quality_status IS NULL
   OR photo_review_status = 'none';

CREATE OR REPLACE FUNCTION set_hive_review_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF is_admin() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.photo_review_status IS DISTINCT FROM OLD.photo_review_status
       OR NEW.data_quality_status IS DISTINCT FROM OLD.data_quality_status THEN
      NEW.reviewed_by = auth.uid();
      NEW.reviewed_at = NOW();
    END IF;
  END IF;

  IF NEW.status = 'approved' AND NEW.data_quality_status = 'unreviewed' THEN
    NEW.data_quality_status = 'verified';
  ELSIF NEW.status = 'rejected' THEN
    NEW.data_quality_status = 'rejected';
  ELSIF NEW.status = 'pending' AND NEW.data_quality_status = 'unreviewed' THEN
    NEW.data_quality_status = 'needs_review';
  END IF;

  IF NEW.pending_photo_url IS NOT NULL AND NEW.photo_review_status IN ('none', 'approved') THEN
    NEW.photo_review_status = 'pending';
  ELSIF NEW.pending_photo_url IS NULL AND NEW.photo_url IS NOT NULL AND NEW.photo_review_status = 'none' THEN
    NEW.photo_review_status = 'approved';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_hive_review_metadata ON hives;
CREATE TRIGGER set_hive_review_metadata
  BEFORE UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION set_hive_review_metadata();
