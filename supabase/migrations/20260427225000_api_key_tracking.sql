-- Add usage tracking and note columns to workspace_api_keys
-- usage_count: atomically incremented via RPC on every authenticated request
-- note:        optional human-readable label set at key creation time

ALTER TABLE workspace_api_keys
  ADD COLUMN usage_count BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN note        TEXT;

-- Atomic increment function — avoids read-then-write race condition under
-- concurrent requests. Called fire-and-forget via waitUntil() in auth.ts.
CREATE OR REPLACE FUNCTION increment_key_usage(key_id UUID)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE workspace_api_keys
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = key_id;
$$;
