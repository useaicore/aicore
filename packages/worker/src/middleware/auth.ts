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
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 2. Query Supabase
    const supabaseUrl = (env as any).SUPABASE_URL;
    const serviceRoleKey = (env as any).SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("[AICore Worker] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return sendUnauthorized();
    }

    const queryUrl = `${supabaseUrl}/rest/v1/workspace_api_keys?key_hash=eq.${keyHash}&select=id,workspace_id,revoked_at,expires_at`;
    
    const dbResponse = await fetch(queryUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
        "Accept": "application/json"
      }
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

    // 4. Attach workspace_id to context
    ctx.state.workspaceId = keyRow.workspace_id;

    // 5. Fire-and-forget last_used_at update
    const { ctx: executionCtx } = ctx;
    executionCtx.waitUntil((async () => {
      try {
        await fetch(`${supabaseUrl}/rest/v1/workspace_api_keys?id=eq.${keyRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ last_used_at: new Date().toISOString() })
        });
      } catch (err) {
        console.warn("[AICore Worker] Failed to update last_used_at:", err);
      }
    })());

  } catch (error) {
    console.error("[AICore Worker] Auth exception:", error);
    return sendUnauthorized();
  }

  return next();
};
