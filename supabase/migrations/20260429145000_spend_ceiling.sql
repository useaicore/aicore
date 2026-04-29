-- ============================================================
-- Migration: Spend Ceiling Enforcement
-- Phase 1 — Feature 3
--
-- IMPORTANT: Requires the pg_cron extension to be enabled BEFORE
-- running this migration. Enable it via the Supabase dashboard:
--   Database → Extensions → pg_cron → Enable
--
-- Deploy order: (1) apply this migration, (2) deploy worker
-- ============================================================

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS monthly_spend_limit_cents  INTEGER NOT NULL DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS current_month_spend_cents  INTEGER NOT NULL DEFAULT 0;

-- Atomic increment function — avoids read-then-write race condition
-- under concurrent requests. Called fire-and-forget via waitUntil()
-- in telemetry.ts after every successful AI call.
CREATE OR REPLACE FUNCTION increment_workspace_spend(
  p_workspace_id UUID,
  p_cost_cents   INTEGER
) RETURNS VOID LANGUAGE SQL AS $$
  UPDATE workspaces
  SET current_month_spend_cents = current_month_spend_cents + p_cost_cents
  WHERE id = p_workspace_id;
$$;

-- pg_cron: reset all workspace spend counters on the 1st of every
-- month at midnight UTC. cron.schedule() replaces any existing job
-- with the same name — safe to re-run on re-deployment.
SELECT cron.schedule(
  'reset-monthly-spend',
  '0 0 1 * *',
  $$ UPDATE workspaces SET current_month_spend_cents = 0 $$
);
