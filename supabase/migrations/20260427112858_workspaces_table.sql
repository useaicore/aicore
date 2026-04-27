CREATE TABLE IF NOT EXISTS public.workspaces (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  plantier         TEXT        NOT NULL DEFAULT 'free',
  ownerid          TEXT        NOT NULL,
  stripecustomerid TEXT        UNIQUE,
  settings         JSONB       NOT NULL DEFAULT '{}',
  createdat        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deletedat        TIMESTAMPTZ,
  CONSTRAINT workspaces_slug_unique UNIQUE (slug),
  CONSTRAINT workspaces_plantier_check CHECK (plantier IN ('free','pro','team','enterprise')),
  CONSTRAINT workspaces_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p1_bypass_workspaces"
  ON public.workspaces FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
