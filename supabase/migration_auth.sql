-- =====================================================
-- MIGRATION: user auth + RLS update
-- =====================================================

-- 1. Add user_id to hives
ALTER TABLE hives ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_hives_user_id ON hives(user_id);

-- 2. Helper function: is current user the admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'email') = 'huilliancomercial@gmail.com';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Remove old permissive policies
DROP POLICY IF EXISTS "Anyone can submit new hive"        ON hives;
DROP POLICY IF EXISTS "Authenticated users see all hives" ON hives;
DROP POLICY IF EXISTS "Authenticated users can update"    ON hives;
DROP POLICY IF EXISTS "Authenticated users can delete"    ON hives;

-- SELECT: public sees approved; users see own; admin sees all
CREATE POLICY "Users see own hives"
  ON hives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin sees all hives"
  ON hives FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT: only authenticated users, only pending + not verified, must set own user_id
CREATE POLICY "Authenticated users can submit hive"
  ON hives FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND is_urbeia_verified = false
    AND auth.uid() = user_id
  );

-- UPDATE: users can edit own hives (forces back to pending); admin can update anything
CREATE POLICY "Users can update own hives"
  ON hives FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND NOT is_admin())
  WITH CHECK (status = 'pending' AND is_urbeia_verified = false);

CREATE POLICY "Admin can update any hive"
  ON hives FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: users can delete own hives; admin can delete anything
CREATE POLICY "Users can delete own hives"
  ON hives FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can delete any hive"
  ON hives FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- VERIFY
-- =====================================================
-- SELECT schemaname, tablename, policyname, cmd, roles
-- FROM pg_policies WHERE tablename = 'hives' ORDER BY cmd, policyname;
