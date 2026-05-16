-- =====================================================
-- MIGRATION: public_hives view execution mode
-- =====================================================

-- public_hives is the only anonymous read surface for approved hive data.
-- It must read the private hives table as the view owner, otherwise anon
-- requests fail with "permission denied for table hives" after hives is revoked.
ALTER VIEW public_hives SET (security_invoker = false);

REVOKE ALL ON hives FROM public;
GRANT SELECT ON hives TO anon;
GRANT SELECT ON public_hives TO anon, authenticated;
