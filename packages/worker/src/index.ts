/**
 * @module worker/index
 *
 * AICore Cloudflare Worker — entrypoint.
 *
 * Responsibilities (current phase):
 *  - Expose a single POST /v1/ai/chat route.
 *  - Route the request to the appropriate provider adapter via routeToProvider.
 *  - Translate results and errors into a uniform JSON envelope using @aicore/types.
 *
 * Not in scope here (will be factored out in later steps):
 *  - Full provider adapters beyond OpenAI (Anthropic, Gemini, Groq, …).
 *  - Request-body schema validation.
 *  - Telemetry emission.
 *  - Authentication / rate-limit middleware.
 *  - Task-type–aware routing (Phase 4 routing engine).
 */

import {
  type AICoreProvider,
  createInternalError,
} from "@aicore/types";

import { type ProviderChatParams, type ProviderCallResult, type ProviderCallUsage, type Env } from "./providers/providerAdapter.js";
import { registry } from "./providers/registry.js";
import { pickProvider } from "./routing/providerRouting.js";

// ---------------------------------------------------------------------------
// Cloudflare bindings
// ---------------------------------------------------------------------------

// Env is now imported from ./providers/providerAdapter.js

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Builds a JSON Response with the given body and status code.
 * All API responses produced by this Worker flow through this helper so that
 * headers are consistent and the serialisation path is centralised.
 */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Provider call types
// ---------------------------------------------------------------------------

// Provider types are now imported from ./providers/providerAdapter.js

/**
 * The subset of the incoming payload that the router inspects.
 */
interface RoutedPayload {
  provider?: AICoreProvider;
  model?: string;
  taskType?: string;
  [key: string]: unknown;
}

/**
 * Routes `payload` to the appropriate provider adapter and returns its
 * ProviderCallResult.
 *
 * This function does not need its own try/catch — each adapter is responsible
 * for normalising all error paths into `{ ok: false, error: AICoreError }`.
 */
async function routeToProvider(
  payload: unknown,
  env: Env,
): Promise<ProviderCallResult> {
  const input = payload as RoutedPayload;
  const provider = pickProvider(input);

  try {
    const adapter = registry.getAdapter(provider);
    const params: ProviderChatParams = { payload, env };
    return await adapter.chat(params);
  } catch (err) {
    return {
      ok: false,
      error: createInternalError({
        code: "PROVIDER_ROUTING_ERROR",
        message: err instanceof Error ? err.message : "An unexpected error occurred during provider routing.",
        component: "worker_proxy",
        rawProviderError: err,
      }),
    };
  }
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

interface TelemetryPayload {
  usage: ProviderCallUsage;
  taskType?: string;
}

/**
 * Best-effort telemetry emission; failures are non-fatal to the request.
 * Extracts taskType from the original payload if present.
 */
async function emitTelemetry(
  usage: ProviderCallUsage,
  env: Env,
  payload: unknown,
): Promise<void> {
  try {
    const body: TelemetryPayload = {
      usage,
    };

    if (
      payload &&
      typeof payload === "object" &&
      "taskType" in (payload as Record<string, unknown>)
    ) {
      const t = (payload as { taskType?: unknown }).taskType;
      if (typeof t === "string") {
        body.taskType = t;
      }
    }

    // Fire-and-forget style: we await the fetch so errors can be caught,
    // but any failure is swallowed and MUST NOT affect the main request.
    await fetch(env.TELEMETRY_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(() => {
      // Network-level failure — intentionally ignored.
    });
  } catch {
    // Any error in payload construction or fetch is intentionally ignored.
  }
}

// ---------------------------------------------------------------------------
// Test-only exports — do NOT use in production code
// ---------------------------------------------------------------------------
// These exports exist solely to make the pure routing helpers testable in a
// standard Node/Jest environment without spinning up a Worker.  The helpers
// themselves are side-effect-free and do not touch any Cloudflare APIs.

export { };

// ---------------------------------------------------------------------------
// Executor (thin delegator)
// ---------------------------------------------------------------------------

/**
 * Thin delegator that keeps the fetch handler decoupled from provider routing.
 *
 * All routing decisions (provider / model / taskType) are encapsulated inside
 * routeToProvider, which will evolve independently through Phase 2–4 without
 * requiring changes to the handler signature.
 *
 * This function never throws; all error paths bubble up as
 * `{ ok: false, error: AICoreError }` from within the adapter.
 */
async function executeAiCall(
  payload: unknown,
  env: Env,
): Promise<ProviderCallResult> {
  return routeToProvider(payload, env);
}

// ---------------------------------------------------------------------------
// Worker handler
// ---------------------------------------------------------------------------

export default {
  /**
   * Main Cloudflare Worker fetch handler.
   *
   * Route table (current phase):
   *   POST /v1/ai/chat  →  parseBody → executeAiCall → jsonResponse
   *   *                 →  404
   */
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(request.url);

      // ── Routing ────────────────────────────────────────────────────────────
      if (request.method !== "POST" || url.pathname !== "/v1/ai/chat") {
        return new Response("Not found", { status: 404 });
      }

      // ── Body parsing ───────────────────────────────────────────────────────
      // We accept any valid JSON at this layer; strict schema validation will
      // be added in a later step (see validation_error in AICoreErrorType).
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        const parseError = createInternalError({
          code: "WORKER_INVALID_JSON",
          message: "Request body is not valid JSON.",
          hint: "Ensure the request body is a well-formed JSON object and Content-Type is application/json.",
          component: "worker_proxy",
        });
        return jsonResponse({ ok: false, error: parseError }, 400);
      }

      // ── Execute ───────────────────────────────────────────────────────────
      const result = await executeAiCall(payload, env);

      if (result.ok) {
        // Best-effort telemetry emission; failures are non-fatal.
        _ctx.waitUntil(emitTelemetry(result.usage, env, payload));

        return jsonResponse({ ok: true, data: result.data, usage: result.usage }, 200);
      }

      // Typed error from the executor — use the provider-supplied status if
      // present, otherwise default to 500.
      const httpStatus = result.error.details?.httpStatusCode ?? 500;
      return jsonResponse({ ok: false, error: result.error }, httpStatus);

    } catch (err) {
      // ── Unhandled / unexpected errors ──────────────────────────────────────
      // Anything that escapes the executor without being wrapped in AICoreError
      // lands here.  We wrap it, log it, and return a generic 500 so that
      // internal details are never leaked to the caller.
      console.error("[AICore Worker] Unhandled error", err);

      const internalError = createInternalError({
        code: "WORKER_UNHANDLED_ERROR",
        message: "An unexpected error occurred in the AICore Worker.",
        component: "worker_proxy",
        rawProviderError: err,
      });

      return jsonResponse({ ok: false, error: internalError }, 500);
    }
  },
};
