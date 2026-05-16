-- =====================================================
-- MIGRATION: privacy notice version 2026-05-16
-- =====================================================

ALTER TABLE hives
  ALTER COLUMN privacy_notice_version SET DEFAULT '2026-05-16';

COMMENT ON COLUMN hives.privacy_notice_version IS 'Versao do aviso de privacidade aceito no envio.';
COMMENT ON COLUMN hives.privacy_accepted_at IS 'Momento em que o usuario confirmou ciencia do tratamento de dados.';
