-- =====================================================
-- MIGRATION: hive photo storage policies
-- =====================================================

-- Ensure the photo bucket exists and is suitable for public hive pages.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'hive-photos',
  'hive-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public hive/profile pages need to read approved hive photos.
DROP POLICY IF EXISTS "Hive photos are publicly readable" ON storage.objects;
CREATE POLICY "Hive photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hive-photos');

-- Uploads happen through the authenticated web app before hives.photo_url is saved.
DROP POLICY IF EXISTS "Authenticated users can upload hive photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload hive photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hive-photos');
