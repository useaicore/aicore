import { type Middleware } from "./compose.js";

export const withAdminAuth: Middleware = async (ctx, next) => {
  const { request, env } = ctx;
  const authHeader = request.headers.get("Authorization");
  const adminSecret = (env as any).AICORE_ADMIN_SECRET;

  if (!adminSecret) {
    console.error("[AICore Worker] Missing AICORE_ADMIN_SECRET environment variable");
    return new Response(JSON.stringify({ error: "internal_server_error", message: "Server misconfiguration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return new Response(JSON.stringify({ error: "forbidden", message: "Invalid or missing admin token" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return next();
};
