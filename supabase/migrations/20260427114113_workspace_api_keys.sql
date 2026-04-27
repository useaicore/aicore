CREATE TABLE IF NOT EXISTS public.workspace_api_keys (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspaceid UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  keyprefix   TEXT        NOT NULL,
  keyhash     TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL DEFAULT 'Default Key',
  environment TEXT        NOT NULL DEFAULT 'production',
  lastusedAt  TIMESTAMPTZ,
  expiresat   TIMESTAMPTZ,
  revokedat   TIMESTAMPTZ,
  createdat   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT api_keys_environment_check CHECK (environment IN ('development','staging','production'))
);

ALTER TABLE public.workspace_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p1_bypass_api_keys"
  ON public.workspace_api_keys FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
