import { Hono } from "hono";
import { z } from "zod";
import { enqueueUsageLog } from "@aicore/logger";
import type { AICoreUsageLog } from "@aicore/types";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

/**
 * Interface for the telemetry payload received from Cloudflare Workers.
 * Forward-compatible with future Phase 4 fields.
 */
export interface UsageEnvelope {
  usage: {
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
    latencyMs: number;
    statusCode: number;
  };
  taskType?: string;
  workspaceId?: string;
  workflowRunId?: string;
  agentId?: string;
  pipelineStep?: number;
  isShadowCall?: boolean;
  shadowSavingsCents?: number;
}

export interface TelemetryIngestResponse {
  ok: true;
}

export interface TelemetryIngestError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

const MAX_BODY_SIZE = 1024 * 1024; // 1MB body limit

/**
 * Zod schema to validate incoming usage log telemetry.
 * Strictly aligned with the AICoreUsageLog type for data integrity.
 */
export const usageLogSchema = z.object({
  // Identity & Time
  callId: z.string().min(1),
  traceId: z.string().optional(),
  workspaceId: z.string().min(1),
  timestampMs: z.number().int().positive(),
  
  // Routing & Classification
  feature: z.string().min(1),
  taskType: z.enum(["generation", "summarisation", "classification", "embedding", "moderation"]),
  model: z.string().min(1),
  provider: z.enum(["openai", "anthropic", "groq", "gemini"]),
  
  // User & Billing
  userId: z.string().optional(),
  planTier: z.enum(["free", "pro", "team", "enterprise"]),
  
  // Environment & Context
  environment: z.enum(["development", "staging", "production"]),
  
  // Metrics
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  costCents: z.number().int().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  
  // Status & Flags
  isShadowCall: z.boolean(),
  shadowMode: z.boolean(),
  statusCode: z.number().int(),
  isError: z.boolean(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => data.totalTokens === data.inputTokens + data.outputTokens,
  {
    message: "totalTokens must match inputTokens + outputTokens",
    path: ["totalTokens"],
  }
).refine(
  (data) => data.isShadowCall === data.shadowMode,
  {
    message: "isShadowCall must match shadowMode flag",
    path: ["isShadowCall"],
  }
);

export type UsageLogInput = z.infer<typeof usageLogSchema>;

/**
 * Registers telemetry routes onto the Hono application instance.
 * @param app Hono instance
 * @param db Postgres connection pool
 */
export function registerTelemetryRoutes(app: Hono, db: Pool) {
  /**
   * Existing endpoint for complex usage logs via BullMQ.
   */
  app.post("/telemetry/usage-log", async (c) => {
    try {
      const body = await c.req.json();
      const validation = usageLogSchema.safeParse(body);

      if (!validation.success) {
        return c.json(
          {
            error: "Invalid usage log",
            details: validation.error.format(),
          },
          400
        );
      }

      await enqueueUsageLog(validation.data as AICoreUsageLog);
      return c.json({ status: "queued" }, 202);
    } catch (err) {
      console.error("[Telemetry Route Error]", err);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  /**
   * Phase 1 direct-to-Postgres ingest endpoint.
   * Receives best-effort telemetry from Cloudflare Workers.
   */
  app.post("/v1/telemetry/usage", async (c) => {
    try {
      // 1. Lightweight body-size guard
      const contentLength = c.req.header("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        console.debug("[Telemetry] Rejecting oversized payload:", contentLength);
        return c.json({
          ok: false,
          error: {
            code: "TELEMETRY_PAYLOAD_TOO_LARGE",
            message: "Payload exceeds 1MB limit.",
          }
        } as TelemetryIngestError, 413);
      }

      const body = await c.req.json() as UsageEnvelope;
      const { 
        usage, 
        taskType, 
        workspaceId, 
        workflowRunId, 
        agentId, 
        pipelineStep, 
        isShadowCall, 
        shadowSavingsCents 
      } = body ?? {};

      // 2. Minimal validation with debug logging
      if (!usage || typeof usage !== "object" || typeof usage.model !== "string" || !usage.model) {
        console.debug("[Telemetry] Validation failed: Missing or invalid `usage` block", body);
        return c.json({
          ok: false,
          error: {
            code: "TELEMETRY_INVALID_PAYLOAD",
            message: "Missing or invalid `usage` block.",
          },
        } as TelemetryIngestError, 400);
      }

      const id = randomUUID();
      const now = new Date();

      // 3. Persist to usagelogs table
      await db.query(
        `
        INSERT INTO usagelogs (
          id,
          workspaceid,
          model,
          inputtokens,
          outputtokens,
          costcents,
          latencyms,
          isshadowcall,
          shadowsavingscents,
          tasktype,
          workflowrunid,
          agentid,
          pipelinestep,
          createdat
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14
        )
        `,
        [
          id,
          workspaceId ?? null,
          usage.model,
          usage.inputTokens ?? 0,
          usage.outputTokens ?? 0,
          usage.costCents ?? 0,
          usage.latencyMs ?? 0,
          isShadowCall ?? false,
          shadowSavingsCents ?? null,
          taskType ?? null,
          workflowRunId ?? null,
          agentId ?? null,
          pipelineStep ?? null,
          now,
        ],
      );

      return c.json({ ok: true } as TelemetryIngestResponse, 200);
    } catch (err) {
      console.error("[Telemetry Ingest Error]", err);
      return c.json({
        ok: false,
        error: {
          code: "TELEMETRY_INTERNAL_ERROR",
          message: "An unexpected error occurred during ingestion.",
        },
      } as TelemetryIngestError, 500);
    }
  });
}
