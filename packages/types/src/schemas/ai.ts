import { z } from "zod";

/**
 * High-fidelity validation schema for incoming AI chat requests.
 */
export const ChatRequestSchema = z.object({
  model: z.string().optional(),
  provider: z.enum(["openai", "anthropic", "gemini", "groq"]).optional(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  stream: z.boolean().default(false),
  shadowMode: z.boolean().default(false),
  metadata: z.object({
    workspaceId: z.string().optional(),
    userId: z.string().optional(),
    taskType: z.string().optional(),
    feature: z.string().optional(),
    planTier: z.string().optional(),
    environment: z.string().optional(),
    traceId: z.string().optional(),
    agentId: z.string().optional(),
    workflowRunId: z.string().optional(),
    pipelineStep: z.number().optional(),
  }).passthrough().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Schema for standard telemetry usage envelopes.
 */
export const UsageEnvelopeSchema = z.object({
  usage: z.object({
    provider: z.string(),
    model: z.string(),
    inputTokens: z.number(),
    outputTokens: z.number(),
    costCents: z.number(),
    latencyMs: z.number(),
    ttftMs: z.number().optional(),
    statusCode: z.number(),
  }),
  workspaceId: z.string().optional(),
  taskType: z.string().optional(),
  agentId: z.string().optional(),
  isShadowCall: z.boolean().default(false),
});

export type UsageEnvelope = z.infer<typeof UsageEnvelopeSchema>;
