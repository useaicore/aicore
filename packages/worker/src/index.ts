/**
 * @module worker/index
 *
 * AICore Cloudflare Worker — Modern Middleware Entrypoint.
 */

import { ChatRequest } from "@aicore/types";
import { type ProviderChatParams } from "./providers/providerAdapter.js";
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

  state.callId = `call_${crypto.randomUUID()}`;
  state.traceId = payload.metadata?.traceId ?? `trace_${crypto.randomUUID()}`;

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
          await emitTelemetry(shadowResult.usage, ctx, true);
        }
      } catch (err) {
        console.warn("[AICore Worker] Shadow call failed:", err);
      }
    })());
  }

  // 3. Execution Path (Streaming vs Unary)
  if (payload.stream === true) {
    const stream = await adapter.stream(params);
    const telemetryStream = withTelemetry(stream, ctx);
    return createSseResponse(telemetryStream);
  }

  const result = await adapter.chat(params);
  
  const responsePayload = {
    ...result,
    call_id: state.callId,
    trace_id: state.traceId
  };

  if (result.ok) {
    executionCtx.waitUntil(emitTelemetry(result.usage, ctx));
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const status = result.error.details?.httpStatusCode ?? 500;
  return new Response(JSON.stringify(responsePayload), {
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
