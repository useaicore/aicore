/**
 * @module worker/index
 *
 * AICore Cloudflare Worker — Modern Middleware Entrypoint.
 */

import { createInternalError, ChatRequest } from "@aicore/types";
import { type ProviderChatParams, type Env } from "./providers/providerAdapter.js";
import { registry } from "./providers/registry.js";
import { pickProvider } from "./routing/providerRouting.js";
import { createSseResponse } from "./utils/streamUtils.js";
import { emitTelemetry, withTelemetry } from "./utils/telemetry.js";

// --- Middleware Chain Imports ---
import { compose, type Middleware } from "./middleware/compose.js";
import { withLogging } from "./middleware/logging.js";
import { withAuth } from "./middleware/auth.js";
import { withValidation } from "./middleware/validation.js";
import { withCircuitBreaker } from "./middleware/circuitBreaker.js";

// ---------------------------------------------------------------------------
// Business Logic: Proxy Execution
// ---------------------------------------------------------------------------

/**
 * The final "action" in the middleware chain.
 * Picks the provider, handles shadow mode, and executes the AI call.
 */
const executeProxy: Middleware = async (ctx) => {
  const { state, env, ctx: executionCtx, startTime } = ctx;
  const payload = state.payload as ChatRequest;

  // 1. Resolve Provider & Adapter
  const provider = pickProvider(payload);
  const adapter = registry.getAdapter(provider);
  const params: ProviderChatParams = { payload, env };

  // 2. Shadow Mode Execution (Phase 3)
  if (payload.shadowMode === true) {
    executionCtx.waitUntil((async () => {
      try {
        const shadowProvider = provider === "openai" ? "anthropic" : "openai";
        const shadowAdapter = registry.getAdapter(shadowProvider);
        const shadowResult = await shadowAdapter.chat({ payload, env });
        if (shadowResult.ok) {
          await emitTelemetry(shadowResult.usage, env, payload, true);
        }
      } catch (err) {
        console.warn("[AICore Worker] Shadow call failed:", err);
      }
    })());
  }

  // 3. Execution Path (Streaming vs Unary)
  if (payload.stream === true) {
    const stream = await adapter.stream(params);
    const telemetryStream = withTelemetry(stream, env, executionCtx, payload, startTime);
    return createSseResponse(telemetryStream);
  }

  const result = await adapter.chat(params);
  if (result.ok) {
    executionCtx.waitUntil(emitTelemetry(result.usage, env, payload));
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const status = result.error.details?.httpStatusCode ?? 500;
  return new Response(JSON.stringify(result), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// ---------------------------------------------------------------------------
// Main Worker Handler (10/10 Architecture)
// ---------------------------------------------------------------------------

export default {
  /**
   * Finalized Middleware Chain:
   * Logging -> Auth -> Validation -> CircuitBreaker -> Proxy Logic
   */
  fetch: compose(
    withLogging,
    withAuth,
    withValidation,
    withCircuitBreaker,
    executeProxy
  )
};
