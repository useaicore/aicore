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
 * Best-effort telemetry emission to the canonical gateway ingest route.
 */
async function emitTelemetry(
  usage: ProviderCallUsage,
  env: Env,
  payload: any,
): Promise<void> {
  try {
    const metadata = payload?.metadata ?? {};
    const url = env.TELEMETRY_GATEWAY_URL;

    // Use the canonical UsageEnvelope shape expected by /v1/telemetry/usage
    const body: any = {
      usage,
      taskType: metadata.taskType,
      workspaceId: metadata.workspaceId,
      workflowRunId: metadata.workflowRunId,
      agentId: metadata.agentId,
      pipelineStep: metadata.pipelineStep,
      isShadowCall: metadata.shadowMode ?? false,
      shadowSavingsCents: metadata.shadowSavingsCents,
    };

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Best-effort, do not throw or block
    console.warn("[AICore Worker] Telemetry emission failed:", err);
  }
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
        const metadata = (payload as any).metadata ?? {};
        const usage: ProviderCallUsage = {
          provider: metadata.provider ?? (payload as any).provider ?? "unknown",
          model: metadata.model ?? (payload as any).model ?? "unknown",
          inputTokens: chunk.inputTokens ?? 0,
          outputTokens: chunk.outputTokens ?? 0,
          costCents: 0, // Costs calculated at the gateway if pricing exists
          latencyMs: 0, // End-to-end latency not measurable for stream usage chunk
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
      let payload: any;
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

      // ── Auth ───────────────────────────────────────────────────────────────
      const workspaceKey = request.headers.get("x-workspace-key");
      if (!env.WORKSPACE_KEY || workspaceKey !== env.WORKSPACE_KEY) {
        const authError = createInternalError({
          code: "WORKER_AUTH_FAILED",
          message: "Invalid or missing workspace key.",
          component: "worker_proxy",
        });
        return jsonResponse({ ok: false, error: authError }, 401);
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
