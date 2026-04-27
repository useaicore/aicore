-- workspace_api_keys
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN keyhash      TO key_hash;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN keyprefix    TO key_prefix;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN workspaceid  TO workspace_id;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN lastusedAt   TO last_used_at;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN expiresat    TO expires_at;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN revokedat    TO revoked_at;
ALTER TABLE public.workspace_api_keys
  RENAME COLUMN createdat    TO created_at;

-- workspaces
ALTER TABLE public.workspaces
  RENAME COLUMN plantier       TO plan_tier;
ALTER TABLE public.workspaces
  RENAME COLUMN ownerid        TO owner_id;
ALTER TABLE public.workspaces
  RENAME COLUMN stripecustomerid TO stripe_customer_id;
ALTER TABLE public.workspaces
  RENAME COLUMN createdat      TO created_at;
ALTER TABLE public.workspaces
  RENAME COLUMN updatedat      TO updated_at;
ALTER TABLE public.workspaces
  RENAME COLUMN deletedat      TO deleted_at;

-- usagelogs
ALTER TABLE public.usagelogs
  RENAME COLUMN workspaceid     TO workspace_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN timestampms     TO timestamp_ms;
ALTER TABLE public.usagelogs
  RENAME COLUMN createdat       TO created_at;
ALTER TABLE public.usagelogs
  RENAME COLUMN tasktype        TO task_type;
ALTER TABLE public.usagelogs
  RENAME COLUMN plantier        TO plan_tier;
ALTER TABLE public.usagelogs
  RENAME COLUMN inputtokens     TO input_tokens;
ALTER TABLE public.usagelogs
  RENAME COLUMN outputtokens    TO output_tokens;
ALTER TABLE public.usagelogs
  RENAME COLUMN totaltokens     TO total_tokens;
ALTER TABLE public.usagelogs
  RENAME COLUMN costcents       TO cost_cents;
ALTER TABLE public.usagelogs
  RENAME COLUMN latencyms       TO latency_ms;
ALTER TABLE public.usagelogs
  RENAME COLUMN isshadowcall    TO is_shadow_call;
ALTER TABLE public.usagelogs
  RENAME COLUMN shadowmode      TO shadow_mode;
ALTER TABLE public.usagelogs
  RENAME COLUMN shadowsavingscents TO shadow_savings_cents;
ALTER TABLE public.usagelogs
  RENAME COLUMN statuscode      TO status_code;
ALTER TABLE public.usagelogs
  RENAME COLUMN iserror         TO is_error;
ALTER TABLE public.usagelogs
  RENAME COLUMN latencysensitive  TO latency_sensitive;
ALTER TABLE public.usagelogs
  RENAME COLUMN sessionid       TO session_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN sdkversion      TO sdk_version;
ALTER TABLE public.usagelogs
  RENAME COLUMN ipregion        TO ip_region;
ALTER TABLE public.usagelogs
  RENAME COLUMN budgetid        TO budget_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN routingstrategy TO routing_strategy;
ALTER TABLE public.usagelogs
  RENAME COLUMN cachekey        TO cache_key;
ALTER TABLE public.usagelogs
  RENAME COLUMN cachehit        TO cache_hit;
ALTER TABLE public.usagelogs
  RENAME COLUMN qualityscore    TO quality_score;
ALTER TABLE public.usagelogs
  RENAME COLUMN workflowrunid   TO workflow_run_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN agentid         TO agent_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN pipelinestep    TO pipeline_step;
ALTER TABLE public.usagelogs
  RENAME COLUMN parentcallid    TO parent_call_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN traceid         TO trace_id;
ALTER TABLE public.usagelogs
  RENAME COLUMN callid          TO call_id;