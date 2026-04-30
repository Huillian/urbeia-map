-- =====================================================
-- MIGRATION: harden non-admin review fields
-- =====================================================

CREATE OR REPLACE FUNCTION enforce_hive_photo_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.photo_url = NULL;
      NEW.reviewed_by = NULL;
      NEW.reviewed_at = NULL;
      NEW.data_quality_status = 'needs_review';
      NEW.photo_review_status = CASE
        WHEN NEW.pending_photo_url IS NOT NULL THEN 'pending'
        ELSE 'none'
      END;
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.photo_url = OLD.photo_url;
      NEW.reviewed_by = OLD.reviewed_by;
      NEW.reviewed_at = OLD.reviewed_at;
      NEW.data_quality_status = 'needs_review';
      NEW.location_plausible = OLD.location_plausible;
      NEW.species_plausible = OLD.species_plausible;
      NEW.photo_valid = OLD.photo_valid;
      NEW.content_appropriate = OLD.content_appropriate;
      NEW.photo_review_status = CASE
        WHEN NEW.pending_photo_url IS DISTINCT FROM OLD.pending_photo_url
          AND NEW.pending_photo_url IS NOT NULL THEN 'pending'
        ELSE OLD.photo_review_status
      END;
      NEW.photo_rejected_reason = CASE
        WHEN NEW.pending_photo_url IS DISTINCT FROM OLD.pending_photo_url
          AND NEW.pending_photo_url IS NOT NULL THEN NULL
        ELSE OLD.photo_rejected_reason
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
