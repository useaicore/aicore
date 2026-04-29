import { type MiddlewareContext } from "../middleware/compose.js";

const json = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Lists usage logs for a specific workspace.
 * Protected by withAdminAuth.
 */
export const listLogsHandler = async (ctx: MiddlewareContext) => {
  const { request, env } = ctx;
  const supabaseUrl = (env as any).SUPABASE_URL;
  
  const url = new URL(request.url);
  const workspace_id = url.searchParams.get("workspace_id");
  const limit = url.searchParams.get("limit");

  if (!workspace_id) {
    return json({ error: "missing_fields", message: "workspace_id query param is required" }, 400);
  }

  // Cap limit at 100 for safety
  const safeLimit = Math.min(Number(limit) || 25, 100);

  const supabaseHeaders = {
    apikey: (env as any).SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${(env as any).SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  const queryUrl = `${supabaseUrl}/rest/v1/usagelogs`
    + `?workspace_id=eq.${workspace_id}`
    + `&select=id,workspace_id,provider,model,input_tokens,output_tokens,cost_cents,latency_ms,is_error,created_at`
    + `&order=created_at.desc`
    + `&limit=${safeLimit}`;

  const res = await fetch(queryUrl, { headers: supabaseHeaders });

  if (!res.ok) {
    console.error("[AICore Worker] listLogs Supabase error", await res.text());
    return json({ error: "internal_server_error", message: "Failed to list logs" }, 500);
  }

  const logs = await res.json() as any[];
  return json({ logs });
};
