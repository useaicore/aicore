import { Hono } from "hono";
import { z } from "zod";
import { enqueueUsageLog } from "@aicore/logger";
import type { AICoreUsageLog } from "@aicore/types";

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
 * Registers the telemetry routes onto the Hono application instance.
 */
export function registerTelemetryRoutes(app: Hono) {
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

      // Enqueue the validated telemetry for background processing
      // With strict schema validation, we no longer need 'as unknown' cast
      await enqueueUsageLog(validation.data as AICoreUsageLog);

      return c.json({ status: "queued" }, 202);
    } catch (err) {
      console.error("[Telemetry Route Error]", err);
      return c.json({ error: "Internal server error" }, 500);
    }
  });
}
