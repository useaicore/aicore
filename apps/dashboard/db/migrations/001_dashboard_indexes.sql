-- Dashboard Performance Optimization Indexes

-- 1. Combined index for workspace-scoped time-range queries (Overview & Usage)
CREATE INDEX IF NOT EXISTS idx_usage_logs_workspace_time 
ON usage_logs(workspace_id, timestamp_ms DESC);

-- 2. Index for filtering by model within a workspace (Logs & Usage breakdown)
CREATE INDEX IF NOT EXISTS idx_usage_logs_workspace_model 
ON usage_logs(workspace_id, model);

-- 3. Index for filtering by provider within a workspace (Logs & Usage breakdown)
CREATE INDEX IF NOT EXISTS idx_usage_logs_workspace_provider 
ON usage_logs(workspace_id, provider);

-- 4. Index for environment-specific filtering
CREATE INDEX IF NOT EXISTS idx_usage_logs_workspace_env
ON usage_logs(workspace_id, environment);

-- 5. API Key lookup index for the keys management page
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_active 
ON api_keys(workspace_id, is_active);

-- Note: Run this once against your Supabase DB via the SQL editor before running the app.
