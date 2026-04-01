/**
 * @module worker/index
 *
 * AICore Cloudflare Worker — entrypoint.
 */

import {
  type AICoreProvider,
  type StreamChunk,
  createInternalError,
} from "@aicore/types";

import { type ProviderChatParams, type ProviderCallUsage, type Env } from "./providers/providerAdapter.js";
import { registry } from "./providers/registry.js";
import { pickProvider } from "./routing/providerRouting.js";
import { createSseResponse } from "./utils/streamUtils.js";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Builds a JSON Response with the given body and status code.
 */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The subset of the incoming payload that the router inspects.
 */
interface RoutedPayload {
  provider?: AICoreProvider;
  model?: string;
  taskType?: string;
  stream?: boolean;
  [key: string]: unknown;
}

interface TelemetryPayload {
  usage: ProviderCallUsage;
  taskType?: string;
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

/**
 * Best-effort telemetry emission; failures are non-fatal to the request.
 */
async function emitTelemetry(
  usage: ProviderCallUsage,
  env: Env,
  payload: unknown,
): Promise<void> {
  try {
    const body: TelemetryPayload = { usage };

    if (payload && typeof payload === "object") {
      const t = (payload as Record<string, unknown>).taskType;
      if (typeof t === "string") {
        body.taskType = t;
      }
    }

    await fetch(env.TELEMETRY_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {}
}

/**
 * Intercepts the usage chunk in a stream to emit telemetry.
 */
function withTelemetry(
  stream: ReadableStream<StreamChunk>,
  env: Env,
  ctx: ExecutionContext,
  payload: unknown,
): ReadableStream<StreamChunk> {
  const { readable, writable } = new TransformStream<StreamChunk, StreamChunk>({
    transform(chunk, controller) {
      if (chunk.type === "usage") {
        const usage: ProviderCallUsage = {
          provider: (payload as any).provider ?? "unknown",
          model: (payload as any).model ?? "unknown",
          inputTokens: chunk.inputTokens ?? 0,
          outputTokens: chunk.outputTokens ?? 0,
          costCents: 0,
          latencyMs: 0, // Latency is harder to track for streams here
          statusCode: 200,
        };
        ctx.waitUntil(emitTelemetry(usage, env, payload));
      }
      controller.enqueue(chunk);
    },
  });

  stream.pipeTo(writable).catch(() => {});
  return readable;
}

// ---------------------------------------------------------------------------
// Worker handler
// ---------------------------------------------------------------------------

export default {
  /**
   * Main Cloudflare Worker fetch handler.
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(request.url);

      // ── Routing ────────────────────────────────────────────────────────────
      if (request.method !== "POST" || url.pathname !== "/v1/ai/chat") {
        return new Response("Not found", { status: 404 });
      }

      // ── Body parsing ───────────────────────────────────────────────────────
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        const parseError = createInternalError({
          code: "WORKER_INVALID_JSON",
          message: "Request body is not valid JSON.",
          component: "worker_proxy",
        });
        return jsonResponse({ ok: false, error: parseError }, 400);
      }

      // ── Resolve Provider & Adapter ─────────────────────────────────────────
      const input = payload as RoutedPayload;
      // TODO: Add support for latency-aware and cost-based routing (Phase 4 engine)
      const provider = pickProvider(input);
      const adapter = registry.getAdapter(provider);
      const params: ProviderChatParams = { payload, env };

      // ── Execute ───────────────────────────────────────────────────────────
      
      // A) Streaming Path
      if (input.stream === true) {
        try {
          // TODO: Implement shadow mode (Phase 3) - fire-and-forget call to secondary provider
          const stream = await adapter.stream(params);
          const telemetryStream = withTelemetry(stream, env, ctx, payload);
          return createSseResponse(telemetryStream);
        } catch (err) {
          console.error("[AICore Worker] Streaming error", err);
          const error = (err && typeof err === "object" && "type" in err)
            ? (err as any)
            : createInternalError({
                code: "STREAM_INITIALIZATION_ERROR",
                message: err instanceof Error ? err.message : "Failed to initialize stream.",
                component: "worker_proxy",
                rawProviderError: err,
              });
          return jsonResponse({ ok: false, error }, error.details?.httpStatusCode ?? 500);
        }
      }

      // B) Unary Path
      try {
        const result = await adapter.chat(params);
        if (result.ok) {
          ctx.waitUntil(emitTelemetry(result.usage, env, payload));
          return jsonResponse(result, 200);
        }
        const status = result.error.details?.httpStatusCode ?? 500;
        return jsonResponse(result, status);
      } catch (err) {
        const error = createInternalError({
          code: "UNARY_EXECUTION_ERROR",
          message: err instanceof Error ? err.message : "An unexpected error occurred during execution.",
          component: "worker_proxy",
          rawProviderError: err,
        });
        return jsonResponse({ ok: false, error }, 500);
      }

    } catch (err) {
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
