import { createInternalError } from "@aicore/types";
import { type Middleware } from "./compose.js";

/**
 * Standardized Workspace Auth middleware.
 * Enforces X-Workspace-Key header.
 */
export const withAuth: Middleware = async (ctx, next) => {
  const { request, env } = ctx;
  const workspaceKey = request.headers.get("x-workspace-key");

  if (!env.WORKSPACE_KEY || workspaceKey !== env.WORKSPACE_KEY) {
    const authError = createInternalError({
      code: "WORKER_AUTH_FAILED",
      message: "Invalid or missing workspace key.",
      component: "worker_proxy",
    });

    return new Response(JSON.stringify({ ok: false, error: authError }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return next();
};
