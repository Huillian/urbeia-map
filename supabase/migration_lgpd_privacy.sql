-- =====================================================
-- MIGRATION: LGPD privacy hardening
-- =====================================================

-- Records the active privacy notice accepted when a user submits a hive.
ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS privacy_notice_version TEXT DEFAULT '2026-05-14',
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

COMMENT ON COLUMN hives.privacy_notice_version IS 'Versao do aviso de privacidade aceito no envio.';
COMMENT ON COLUMN hives.privacy_accepted_at IS 'Momento em que o usuario confirmou ciencia do tratamento de dados.';

-- Public API surface: omits private fields and never exposes exact coordinates
-- for records marked as approximate_location=true.
CREATE OR REPLACE VIEW public_hives AS
SELECT
  id,
  public_slug,
  CASE
    WHEN approximate_location THEN round(lat::numeric, 2)
    ELSE round(lat::numeric, 6)
  END AS lat,
  CASE
    WHEN approximate_location THEN round(lng::numeric, 2)
    ELSE round(lng::numeric, 6)
  END AS lng,
  nickname,
  species_slug,
  is_urbeia_verified,
  approximate_location,
  owner_name,
  note,
  installed_at,
  city,
  state,
  photo_url,
  created_at,
  approved_at,
  updated_at
FROM hives
WHERE status = 'approved';

ALTER VIEW public_hives SET (security_invoker = false);

COMMENT ON VIEW public_hives IS 'Dados publicos aprovados, sem e-mail, user_id ou coordenadas residenciais exatas quando approximate_location=true.';

-- Prevent anonymous clients from reading the base table directly.
-- Public reads must go through public_hives.
REVOKE ALL ON hives FROM public;
-- PostgREST requires table-level SELECT for view dependencies. RLS still
-- blocks direct anonymous reads because no SELECT policy is granted to anon.
GRANT SELECT ON hives TO anon;
GRANT SELECT ON public_hives TO anon, authenticated;

-- Keep authenticated app operations on the base table protected by RLS policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON hives TO authenticated;

-- Replace overly broad public SELECT policy with own/admin access.
DROP POLICY IF EXISTS "Approved hives readable by all" ON hives;
DROP POLICY IF EXISTS "Authenticated users see all hives" ON hives;
DROP POLICY IF EXISTS "Authenticated users can update" ON hives;
DROP POLICY IF EXISTS "Authenticated users can delete" ON hives;
DROP POLICY IF EXISTS "Users see own hives" ON hives;
DROP POLICY IF EXISTS "Admin sees all hives" ON hives;

CREATE POLICY "Users see own hives"
  ON hives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin sees all hives"
  ON hives FOR SELECT
  TO authenticated
  USING (is_admin());

-- Require an authenticated owner and explicit privacy acknowledgement on submit.
DROP POLICY IF EXISTS "Anyone can submit new hive" ON hives;
DROP POLICY IF EXISTS "Authenticated users can submit hive" ON hives;

CREATE POLICY "Authenticated users can submit hive"
  ON hives FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND is_urbeia_verified = false
    AND auth.uid() = user_id
    AND privacy_accepted_at IS NOT NULL
  );
