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
  type AICoreError,
  createInternalError,
  // TODO: re-export normalizeNetworkError inside provider adapters when they
  // issue fetch() calls to downstream services (proxy, gateway, providers).
  normalizeNetworkError as _normalizeNetworkError, // eslint-disable-line @typescript-eslint/no-unused-vars
} from "@aicore/types";

import { callOpenAIChat } from "./providers/openai.js";

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
// Provider routing
// ---------------------------------------------------------------------------

/**
 * Recognised provider identifiers.
 * Extend this union as new adapters are added (Anthropic, Gemini, Groq, …).
 */
type ProviderId = "openai" | "anthropic" | "gemini" | "groq";

/**
 * The subset of the incoming payload that the router inspects.
 * All other fields are forwarded opaquely to the chosen provider adapter.
 *
 * taskType is intentionally present but unused for routing in this phase —
 * it exists purely to keep a clean seam for Phase 4 task-type–aware routing
 * (aligned with the `tasktype` column in the usagelogs table).
 */
interface RoutedPayload {
  provider?: ProviderId;
  model?: string;
  taskType?: string;
  [key: string]: unknown;
}

/**
 * Infers the provider from the model string when `provider` is not explicitly
 * set by the caller.
 *
 * Only the OpenAI family is active in this phase; commented-out branches serve
 * as placeholders so future contributors know exactly where to add new rules.
 */
function inferProviderFromModel(model?: string): ProviderId | undefined {
  if (!model) return undefined;
  const m = model.toLowerCase();

  // OpenAI family (current phase)
  if (m.startsWith("gpt-") || m.startsWith("gpt4") || m.startsWith("gpt-4")) {
    return "openai";
  }

  // Placeholders for future adapters:
  // if (m.startsWith("claude-")) return "anthropic";
  // if (m.startsWith("gemini-")) return "gemini";
  // if (m.startsWith("groq-"))   return "groq";

  return undefined;
}

/**
 * Decides which provider to use for a given payload.
 *
 * Resolution order:
 *  1. Explicit `provider` field on the payload (if recognised).
 *  2. Inference from the `model` string.
 *  3. Future hook: `taskType`-aware routing engine (Phase 4).
 *  4. Default to OpenAI.
 */
function pickProvider(payload: unknown): ProviderId {
  if (payload && typeof payload === "object") {
    const obj = payload as RoutedPayload;

    // 1) Explicit provider wins if recognised
    if (
      obj.provider === "openai"
      // || obj.provider === "anthropic"
      // || obj.provider === "gemini"
      // || obj.provider === "groq"
    ) {
      return obj.provider;
    }

    // 2) Infer from model string
    const inferred = inferProviderFromModel(obj.model);
    if (inferred) return inferred;

    // 3) Future: taskType-aware routing hook (Phase 4)
    //    For now obj.taskType is intentionally not used for routing.
    //    Example rules that will go here:
    //      if (obj.taskType === "code_review")    → prefer provider X
    //      if (obj.taskType === "cheap_summary")  → prefer provider Y
  }

  // 4) Default to OpenAI in this phase
  return "openai";
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
  const provider = pickProvider(payload);

  switch (provider) {
    case "openai":
    default:
      // OpenAI is the only implemented adapter in this phase.
      return callOpenAIChat(payload, env);
  }
}

// ---------------------------------------------------------------------------
// Test-only exports — do NOT use in production code
// ---------------------------------------------------------------------------
// These exports exist solely to make the pure routing helpers testable in a
// standard Node/Jest environment without spinning up a Worker.  The helpers
// themselves are side-effect-free and do not touch any Cloudflare APIs.

export { inferProviderFromModel, pickProvider };

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
