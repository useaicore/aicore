import { type MiddlewareContext } from "../middleware/compose.js";

const json = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

const getSupabaseHeaders = (env: any) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
});

export const healthHandler = async (ctx: MiddlewareContext) => {
  const { workspaceId, planTier, keyPrefix, environment } = ctx.state;
  return json({
    status: "ok",
    workspace_id: workspaceId,
    plan_tier: planTier,
    key_prefix: keyPrefix,
    environment,
  });
};

export const createKeyHandler = async (ctx: MiddlewareContext) => {
  const { request, env } = ctx;
  const supabaseUrl = (env as any).SUPABASE_URL;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body", message: "Request body must be valid JSON" }, 400);
  }

  const { workspace_id, name, environment, note } = body;

  if (!workspace_id || !name || !environment) {
    return json({ error: "missing_fields", message: "workspace_id, name, and environment are required" }, 400);
  }

  if (!["production", "development", "staging"].includes(environment)) {
    return json({ error: "invalid_environment", message: "environment must be production, development, or staging" }, 400);
  }

  const supabaseHeaders = getSupabaseHeaders(env);

  // Step 1: Fetch workspace to verify it exists and get plan_tier
  const wsRes = await fetch(`${supabaseUrl}/rest/v1/workspaces?id=eq.${workspace_id}&select=plan_tier`, {
    headers: supabaseHeaders,
  });

  if (!wsRes.ok) {
    return json({ error: "internal_server_error", message: "Failed to fetch workspace" }, 500);
  }

  const workspaces = await wsRes.json() as any[];
  if (!workspaces || workspaces.length === 0) {
    return json({ error: "workspace_not_found" }, 404);
  }

  const plan_tier = workspaces[0].plan_tier;

  // Generate prefix
  const prefix = environment === "production" ? "ak_live_" : "ak_test_";
  const plaintext = prefix + crypto.randomUUID().replace(/-/g, "");

  // Prefix & Hash Conversion
  const keyPrefix = plaintext.substring(0, 16);
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plaintext));
  const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

  // Step 2: Insert into workspace_api_keys
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/workspace_api_keys`, {
    method: "POST",
    headers: {
      ...supabaseHeaders,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      key_hash: keyHash,
      key_prefix: keyPrefix,
      workspace_id,
      name,
      environment,
      note: note ?? null,
    }),
  });

  if (!insertRes.ok) {
    console.error("[AICore Worker] Failed to insert key", await insertRes.text());
    return json({ error: "internal_server_error", message: "Failed to create key" }, 500);
  }

  const inserted = await insertRes.json() as any[];
  const id = inserted[0].id;

  // Step 3: Return plaintext key
  return json({
    key: plaintext,
    key_prefix: keyPrefix,
    id,
    plan_tier,
    note: note ?? null,
  }, 201);
};

export const revokeKeyHandler = async (ctx: MiddlewareContext) => {
  const { request, env } = ctx;
  const supabaseUrl = (env as any).SUPABASE_URL;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body", message: "Request body must be valid JSON" }, 400);
  }

  const { key_id } = body;

  if (!key_id) {
    return json({ error: "missing_fields", message: "key_id is required" }, 400);
  }

  const supabaseHeaders = getSupabaseHeaders(env);

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/workspace_api_keys?id=eq.${key_id}`, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });

  if (!patchRes.ok) {
    console.error("[AICore Worker] Failed to revoke key", await patchRes.text());
    return json({ error: "internal_server_error", message: "Failed to revoke key" }, 500);
  }

  const updated = await patchRes.json() as any[];
  if (!Array.isArray(updated) || updated.length === 0) {
    return json({ error: "key_not_found" }, 404);
  }

  return json({ status: "revoked", key_id }, 200);
};
