-- v2: Idempotent re-application of api_key_tracking changes.
-- Safe to run even if v1 (20260427225000) already ran.
-- All column additions use IF NOT EXISTS, function uses CREATE OR REPLACE.

ALTER TABLE workspace_api_keys
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS usage_count  BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS note         TEXT;

-- Recreate the atomic increment RPC (no-op if unchanged, safe to replace)
CREATE OR REPLACE FUNCTION increment_key_usage(key_id UUID)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE workspace_api_keys
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = key_id;
$$;
