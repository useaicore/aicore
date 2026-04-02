import { type StreamChunk } from "@aicore/types";
import { type ProviderCallUsage, type Env } from "../providers/providerAdapter.js";

/**
 * Best-effort telemetry emission to the canonical gateway ingest route.
 */
export async function emitTelemetry(
  usage: ProviderCallUsage,
  env: Env,
  payload: any,
  isShadow: boolean = false,
): Promise<void> {
  try {
    const metadata = payload?.metadata ?? {};
    const url = env.TELEMETRY_GATEWAY_URL;

    const body: any = {
      usage,
      taskType: metadata.taskType,
      workspaceId: metadata.workspaceId,
      workflowRunId: metadata.workflowRunId,
      agentId: metadata.agentId,
      pipelineStep: metadata.pipelineStep,
      isShadowCall: isShadow || metadata.shadowMode || false,
      shadowSavingsCents: metadata.shadowSavingsCents,
      ttftMs: usage.ttftMs,
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
export function withTelemetry(
  stream: ReadableStream<StreamChunk>,
  env: Env,
  ctx: ExecutionContext,
  payload: unknown,
  startTime: number,
): ReadableStream<StreamChunk> {
  let ttftMs: number | undefined;

  const { readable, writable } = new TransformStream<StreamChunk, StreamChunk>({
    transform(chunk, controller) {
      if (chunk.type === "text_delta" && ttftMs === undefined) {
        ttftMs = Date.now() - startTime;
      }

      if (chunk.type === "usage") {
        const metadata = (payload as any).metadata ?? {};
        const usage: ProviderCallUsage = {
          provider: metadata.provider ?? (payload as any).provider ?? "unknown",
          model: metadata.model ?? (payload as any).model ?? "unknown",
          inputTokens: chunk.inputTokens ?? 0,
          outputTokens: chunk.outputTokens ?? 0,
          costCents: 0, 
          latencyMs: Date.now() - startTime,
          ttftMs,
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
