import { ChatRequestSchema, createInternalError } from "@aicore/types";
import { type Middleware } from "./compose.js";

/**
 * Zod Payload Validation middleware.
 * Enforces canonical AI request schema.
 */
export const withValidation: Middleware = async (ctx, next) => {
  const { request } = ctx;

  if (request.method !== "POST") {
    return next();
  }

  try {
    const rawPayload = await request.json();
    const result = ChatRequestSchema.safeParse(rawPayload);

    if (!result.success) {
      const fieldErrors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      const validationError = createInternalError({
        code: "WORKER_INVALID_PAYLOAD",
        message: `Validation failed: ${fieldErrors}`,
        component: "worker_proxy",
      });

      return new Response(JSON.stringify({ ok: false, error: validationError }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Attach validated payload for downstream use
    ctx.state.payload = result.data;
    return next();
  } catch (err) {
    const parseError = createInternalError({
      code: "WORKER_INVALID_JSON",
      message: "Request body is not valid JSON.",
      component: "worker_proxy",
    });

    return new Response(JSON.stringify({ ok: false, error: parseError }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
