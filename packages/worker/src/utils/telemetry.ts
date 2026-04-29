import { type StreamChunk } from "@aicore/types";
import { type ProviderCallUsage } from "../providers/providerAdapter.js";
import { type MiddlewareContext } from "../middleware/compose.js";

/**
 * Direct telemetry emission to Supabase REST API.
 */
export async function emitTelemetry(
  usage: ProviderCallUsage,
  ctx: MiddlewareContext,
  isShadow: boolean = false,
): Promise<void> {
  try {
    const payload = ctx.state.payload as any;
    const metadata = payload?.metadata ?? {};
    
    const supabaseUrl = (ctx.env as any).SUPABASE_URL;
    const serviceRoleKey = (ctx.env as any).SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("[AICore Worker] Telemetry emission failed: Missing Supabase credentials.");
      return;
    }

    const body = {
      call_id: ctx.state.callId,
      trace_id: ctx.state.traceId,
      workspace_id: ctx.state.workspaceId,
      timestamp_ms: ctx.startTime,
      feature: metadata.feature ?? "chat",
      task_type: metadata.taskType ?? "generation",
      model: usage.model,
      provider: usage.provider,
      user_id: metadata.userId,
      plan_tier: metadata.planTier ?? "free",
      input_tokens: usage.inputTokens ?? 0,
      output_tokens: usage.outputTokens ?? 0,
      total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      cost_cents: usage.costCents ?? 0,
      latency_ms: usage.latencyMs,
      is_shadow_call: payload?.shadowMode ?? false,
      shadow_mode: payload?.shadowMode ?? false,
      shadow_savings_cents: metadata.shadowSavingsCents,
      status_code: usage.statusCode,
      is_error: usage.statusCode < 200 || usage.statusCode >= 300,
      latency_sensitive: metadata.latencySensitive,
      session_id: metadata.sessionId,
      environment: metadata.environment,
      sdk_version: metadata.sdkVersion,
      ip_region: metadata.ipRegion,
      budget_id: metadata.budgetId,
      routing_strategy: metadata.routingStrategy,
      cache_key: metadata.cacheKey,
      cache_hit: metadata.cacheHit,
      quality_score: metadata.qualityScore,
      workflow_run_id: metadata.workflowRunId,
      agent_id: metadata.agentId,
      pipeline_step: metadata.pipelineStep,
      parent_call_id: metadata.parentCallId,
      metadata: metadata
    };

    await fetch(`${supabaseUrl}/rest/v1/usagelogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(body),
    });

    // Fire-and-forget: atomically increment the workspace's monthly spend.
    // Guarded so a missing workspaceId or zero-cost call skips the RPC.
    // The .catch() ensures this never throws into emitTelemetry's caller.
    if (ctx.state.workspaceId && usage.costCents > 0) {
      ctx.ctx.waitUntil(
        fetch(`${supabaseUrl}/rest/v1/rpc/increment_workspace_spend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
          },
          body: JSON.stringify({
            p_workspace_id: ctx.state.workspaceId,
            p_cost_cents:   usage.costCents,
          }),
        }).catch((err) => {
          console.warn("[AICore Worker] increment_workspace_spend failed:", err);
        })
      );
    }
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
  ctx: MiddlewareContext
): ReadableStream<StreamChunk> {
  let ttftMs: number | undefined;

  const { readable, writable } = new TransformStream<StreamChunk, StreamChunk>({
    transform(chunk, controller) {
      if (chunk.type === "text_delta" && ttftMs === undefined) {
        ttftMs = Date.now() - ctx.startTime;
      }

      if (chunk.type === "usage") {
        const payload = ctx.state.payload as any;
        const metadata = payload?.metadata ?? {};
        const usage: ProviderCallUsage = {
          provider: metadata.provider ?? payload?.provider ?? "unknown",
          model: metadata.model ?? payload?.model ?? "unknown",
          inputTokens: chunk.inputTokens ?? 0,
          outputTokens: chunk.outputTokens ?? 0,
          costCents: 0, 
          latencyMs: Date.now() - ctx.startTime,
          ttftMs,
          statusCode: 200,
        };
        ctx.ctx.waitUntil(emitTelemetry(usage, ctx));
      }
      controller.enqueue(chunk);
    },
  });

  stream.pipeTo(writable).catch(() => {});
  return readable;
}
