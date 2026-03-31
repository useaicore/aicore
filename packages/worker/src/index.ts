/**
 * @module worker/index
 *
 * AICore Cloudflare Worker — entrypoint.
 *
 * Responsibilities (current phase):
 *  - Expose a single POST /v1/ai/chat route.
 *  - Delegate to executeAiCall (placeholder; will be replaced by provider routing).
 *  - Translate results and errors into a uniform JSON envelope using @aicore/types.
 *
 * Not in scope here (will be factored out in later steps):
 *  - Provider adapters (OpenAI, Anthropic, …).
 *  - Request-body schema validation.
 *  - Telemetry emission.
 *  - Authentication / rate-limit middleware.
 */

import {
  type AICoreError,
  createInternalError,
  // TODO: re-export normalizeNetworkError inside provider adapters when they
  // issue fetch() calls to downstream services (proxy, gateway, providers).
  normalizeNetworkError as _normalizeNetworkError, // eslint-disable-line @typescript-eslint/no-unused-vars
} from "@aicore/types";

// ---------------------------------------------------------------------------
// Cloudflare bindings
// ---------------------------------------------------------------------------

/**
 * Cloudflare Worker environment bindings.
 * Extend this interface as new secrets / services / KV namespaces are added.
 */
export interface Env {
  /** Base URL of the internal telemetry gateway service. */
  TELEMETRY_GATEWAY_URL: string;
  /** OpenAI API key — placeholder; will be consumed by the OpenAI adapter. */
  OPENAI_API_KEY: string;
}

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

/**
 * Usage and performance metadata captured for every AI provider call.
 * Consumed by the telemetry gateway in a later step.
 */
export interface ProviderCallUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  latencyMs: number;
  statusCode: number;
}

/**
 * Discriminated union returned by executeAiCall.
 * On success, carries both the model response and usage metadata.
 * On failure, carries a fully-formed AICoreError.
 */
export type ProviderCallResult =
  | { ok: true; data: unknown; usage: ProviderCallUsage }
  | { ok: false; error: AICoreError };

// ---------------------------------------------------------------------------
// Placeholder executor
// ---------------------------------------------------------------------------

/**
 * Placeholder for the real AI call dispatcher.
 *
 * Returns a ProviderCallResult so the fetch handler can handle both the
 * happy path (with usage metadata) and typed error cases without its own
 * try/catch.
 *
 * Replace this stub with real provider routing in a later step.
 */
async function executeAiCall(
  payload: unknown,
  _env: Env,
): Promise<ProviderCallResult> {
  try {
    const t0 = Date.now();

    // Placeholder: no real I/O yet — simulate the async boundary that a real
    // provider HTTP call would introduce.
    await Promise.resolve();

    const latencyMs = Date.now() - t0;

    const usage: ProviderCallUsage = {
      provider: "openai",
      model: "gpt-4.1-mini",
      // Dummy token / cost values; real figures will come from the provider
      // response once the OpenAI adapter is wired in.
      inputTokens: 0,
      outputTokens: 0,
      costCents: 0,
      latencyMs,
      statusCode: 200,
    };

    return { ok: true, data: { echo: payload }, usage };
  } catch (err) {
    return {
      ok: false,
      error: createInternalError({
        code: "WORKER_EXECUTOR_ERROR",
        message: "An unexpected error occurred inside the AI call executor.",
        component: "worker_proxy",
        rawProviderError: err,
      }),
    };
  }
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

      // ── Execute (placeholder) ──────────────────────────────────────────────
      const result = await executeAiCall(payload, env);

      if (result.ok) {
        // TODO: emit result.usage to the telemetry gateway via
        // env.TELEMETRY_GATEWAY_URL once the telemetry adapter is introduced.
        return jsonResponse({ ok: true, data: result.data }, 200);
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
