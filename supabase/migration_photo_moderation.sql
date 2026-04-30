-- =====================================================
-- MIGRATION: moderate user-submitted hive photos
-- =====================================================

ALTER TABLE hives ADD COLUMN IF NOT EXISTS pending_photo_url TEXT;

-- Store storage paths instead of public URLs so pending photos are not public.
UPDATE hives
SET photo_url = split_part(photo_url, '/hive-photos/', 2)
WHERE photo_url LIKE '%/hive-photos/%';

UPDATE hives
SET pending_photo_url = split_part(pending_photo_url, '/hive-photos/', 2)
WHERE pending_photo_url LIKE '%/hive-photos/%';

UPDATE storage.buckets
SET public = false
WHERE id = 'hive-photos';

-- Non-admin users can suggest photos, but cannot directly publish photos.
-- Admin approval promotes pending_photo_url into photo_url.
CREATE OR REPLACE FUNCTION enforce_hive_photo_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.photo_url = NULL;
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.photo_url = OLD.photo_url;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_hive_photo_moderation ON hives;
CREATE TRIGGER enforce_hive_photo_moderation
  BEFORE INSERT OR UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION enforce_hive_photo_moderation();

DROP POLICY IF EXISTS "Hive photos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Approved hive photos are publicly readable" ON storage.objects;
CREATE POLICY "Approved hive photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hive-photos'
    AND EXISTS (
      SELECT 1
      FROM public.hives
      WHERE hives.status = 'approved'
        AND hives.photo_url = storage.objects.name
    )
  );

DROP POLICY IF EXISTS "Hive photo owners can read own uploads" ON storage.objects;
CREATE POLICY "Hive photo owners can read own uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'hive-photos'
    AND (
      is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
