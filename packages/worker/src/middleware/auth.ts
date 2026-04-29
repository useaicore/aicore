import { createInternalError } from "@aicore/types";
import { type Middleware } from "./compose.js";

/**
 * Standardized Workspace Auth middleware.
 * Enforces X-Workspace-Key header.
 */
export const withAuth: Middleware = async (ctx, next) => {
  const { request, env } = ctx;
  const aicoreKey = request.headers.get("x-aicore-key");

  const sendUnauthorized = () => {
    const authError = createInternalError({
      code: "WORKER_AUTH_FAILED",
      message: "Invalid or missing API key.",
      component: "worker_proxy",
    });
    return new Response(JSON.stringify({ ok: false, error: authError }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  };

  if (!aicoreKey) {
    return sendUnauthorized();
  }

  try {
    // 1. Hash the incoming key
    const encoder = new TextEncoder();
    const data = encoder.encode(aicoreKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // 2. Query Supabase
    const supabaseUrl = (env as any).SUPABASE_URL;
    const serviceRoleKey = (env as any).SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("[AICore Worker] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return sendUnauthorized();
    }

    const queryUrl = `${supabaseUrl}/rest/v1/workspace_api_keys`
      + `?key_hash=eq.${keyHash}`
      + `&select=id,workspace_id,revoked_at,expires_at,key_prefix,environment`
      + `,workspaces(plan_tier,monthly_spend_limit_cents,current_month_spend_cents)`;

    const dbResponse = await fetch(queryUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
        "Accept": "application/json",
      },
    });

    if (!dbResponse.ok) {
      console.error(`[AICore Worker] Supabase Auth Error: ${dbResponse.status} ${dbResponse.statusText}`);
      return sendUnauthorized();
    }

    const rows = await dbResponse.json() as any[];

    if (!rows || rows.length === 0) {
      return sendUnauthorized();
    }

    const keyRow = rows[0];

    // 3. Validate expiration and revocation
    if (keyRow.revoked_at !== null) {
      return sendUnauthorized();
    }

    if (keyRow.expires_at) {
      const expiresAt = new Date(keyRow.expires_at).getTime();
      if (Date.now() > expiresAt) {
        return sendUnauthorized();
      }
    }

    // 4. Attach context data for downstream handlers
    //    Spend values use safe fallbacks in case migration hasn't run yet
    //    (PostgREST silently omits unknown columns — fallbacks prevent a
    //    null >= null comparison that would incorrectly block all requests).
    ctx.state.workspaceId            = keyRow.workspace_id;
    ctx.state.keyPrefix              = keyRow.key_prefix;
    ctx.state.environment            = keyRow.environment;
    ctx.state.planTier               = keyRow.workspaces?.plan_tier ?? "free";
    ctx.state.currentMonthSpendCents = keyRow.workspaces?.current_month_spend_cents ?? 0;
    ctx.state.monthlySpendLimitCents = keyRow.workspaces?.monthly_spend_limit_cents ?? 5000;

    // 5. Spend ceiling enforcement — checked before any AI call is made.
    //    Uses >= so a workspace at exactly its limit is also blocked.
    if (ctx.state.currentMonthSpendCents >= ctx.state.monthlySpendLimitCents * 0.90) {
      return new Response(
        JSON.stringify({
          error:   "SPEND_LIMIT_EXCEEDED",
          message: "Monthly spend limit reached for this workspace.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Fire-and-forget: atomic usage_count increment + last_used_at via RPC
    //    Uses waitUntil() so the Worker response is not delayed.
    //    RPC does: UPDATE ... SET usage_count = usage_count + 1, last_used_at = NOW()
    //    This avoids the read-then-write race condition of PATCH with keyRow.usage_count + 1.
    const { ctx: executionCtx } = ctx;
    executionCtx.waitUntil(
      fetch(`${supabaseUrl}/rest/v1/rpc/increment_key_usage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": serviceRoleKey,
        },
        body: JSON.stringify({ key_id: keyRow.id }),
      }).catch(err => {
        console.warn("[AICore Worker] Failed to increment key usage:", err);
      })
    );

  } catch (error) {
    console.error("[AICore Worker] Auth exception:", error);
    return sendUnauthorized();
  }

  return next();
};
