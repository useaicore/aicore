CREATE OR REPLACE FUNCTION public.gen_uuid_v7()
RETURNS UUID AS $$
DECLARE
  unix_ms BIGINT;
  ts_hex  TEXT;
  rand_a  TEXT;
  rand_b  TEXT;
BEGIN
  unix_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  ts_hex  := lpad(to_hex((unix_ms >> 16) & x'ffffffff'::BIGINT), 8, '0') || '-'
           || lpad(to_hex(unix_ms & x'ffff'::BIGINT), 4, '0');
  rand_a  := lpad(to_hex((x'7000'::INT | (floor(random() * x'0fff'::INT + 1)::INT))), 4, '0');
  rand_b  := lpad(to_hex((x'8000'::INT | (floor(random() * x'3fff'::INT + 1)::INT))), 4, '0') || '-'
           || lpad(to_hex(floor(random() * 281474976710655 + 1)::BIGINT), 12, '0');
  RETURN (ts_hex || '-' || rand_a || '-' || rand_b)::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updatedat = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.usagelogs (
  id               UUID        NOT NULL DEFAULT public.gen_uuid_v7(),
  callid           TEXT        NOT NULL,
  traceid          TEXT,
  workspaceid      UUID        REFERENCES public.workspaces (id) ON DELETE SET NULL,
  timestampms      BIGINT      NOT NULL,
  createdat        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  feature          TEXT        NOT NULL,
  tasktype         TEXT        NOT NULL,
  model            TEXT        NOT NULL,
  provider         TEXT        NOT NULL,
  userid           TEXT,
  plantier         TEXT,
  inputtokens      INTEGER     NOT NULL DEFAULT 0,
  outputtokens     INTEGER     NOT NULL DEFAULT 0,
  totaltokens      INTEGER     NOT NULL DEFAULT 0,
  costcents        INTEGER     NOT NULL DEFAULT 0,
  latencyms        INTEGER     NOT NULL DEFAULT 0,
  isshadowcall     BOOLEAN     NOT NULL DEFAULT FALSE,
  shadowmode       BOOLEAN     NOT NULL DEFAULT FALSE,
  shadowsavingscents INTEGER,
  statuscode       INTEGER     NOT NULL DEFAULT 200,
  iserror          BOOLEAN     NOT NULL DEFAULT FALSE,
  latencysensitive BOOLEAN,
  sessionid        TEXT,
  environment      TEXT,
  sdkversion       TEXT,
  ipregion         TEXT,
  budgetid         UUID,
  routingstrategy  TEXT,
  cachekey         TEXT,
  cachehit         BOOLEAN,
  qualityscore     REAL,
  workflowrunid    TEXT,
  agentid          TEXT,
  pipelinestep     INTEGER,
  parentcallid     TEXT,
  metadata         JSONB,
  PRIMARY KEY (id, createdat),
  CONSTRAINT chk_totaltokens     CHECK (totaltokens = inputtokens + outputtokens),
  CONSTRAINT chk_isshadowcall    CHECK (isshadowcall = shadowmode),
  CONSTRAINT chk_tasktype        CHECK (tasktype IN ('generation','summarisation','classification','embedding','moderation')),
  CONSTRAINT chk_provider        CHECK (provider IN ('openai','anthropic','groq','gemini')),
  CONSTRAINT chk_plantier        CHECK (plantier IS NULL OR plantier IN ('free','pro','team','enterprise')),
  CONSTRAINT chk_environment     CHECK (environment IS NULL OR environment IN ('development','staging','production')),
  CONSTRAINT chk_routingstrategy CHECK (routingstrategy IS NULL OR routingstrategy IN ('cost','latency','quality','fallback')),
  CONSTRAINT chk_qualityscore    CHECK (qualityscore IS NULL OR (qualityscore >= 0.0 AND qualityscore <= 1.0)),
  CONSTRAINT chk_costcents       CHECK (costcents >= 0),
  CONSTRAINT chk_latencyms       CHECK (latencyms >= 0)
) PARTITION BY RANGE (createdat);

CREATE TABLE public.usagelogs_2026_04 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE public.usagelogs_2026_05 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE public.usagelogs_2026_06 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE public.usagelogs_2026_07 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE public.usagelogs_2026_08 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE public.usagelogs_2026_09 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE public.usagelogs_2026_10 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE public.usagelogs_2026_11 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE public.usagelogs_2026_12 PARTITION OF public.usagelogs FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
CREATE TABLE public.usagelogs_default  PARTITION OF public.usagelogs DEFAULT;

CREATE UNIQUE INDEX idx_usagelogs_callid           ON public.usagelogs (callid, createdat);
CREATE INDEX idx_usagelogs_workspace_created       ON public.usagelogs (workspaceid, createdat DESC);
CREATE INDEX idx_usagelogs_workspace_feature       ON public.usagelogs (workspaceid, feature);
CREATE INDEX idx_usagelogs_provider_model          ON public.usagelogs (provider, model);
CREATE INDEX idx_usagelogs_shadow                  ON public.usagelogs (workspaceid, isshadowcall) WHERE isshadowcall = TRUE;
CREATE INDEX idx_usagelogs_errors                  ON public.usagelogs (workspaceid, iserror, createdat DESC) WHERE iserror = TRUE;
CREATE INDEX idx_usagelogs_workflow                ON public.usagelogs (workflowrunid) WHERE workflowrunid IS NOT NULL;
CREATE INDEX idx_usagelogs_metadata_gin            ON public.usagelogs USING GIN (metadata) WHERE metadata IS NOT NULL;

ALTER TABLE public.usagelogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p1_bypass_usagelogs"
  ON public.usagelogs FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);