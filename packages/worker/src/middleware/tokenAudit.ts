import { type ChatRequest } from "@aicore/types";
import { type Middleware } from "./compose.js";

/**
 * Model context-window limits (in tokens).
 * Used to calculate utilization and flag over-budget requests.
 * Default: 128_000 if model not in map.
 */
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "gpt-4o":              128_000,
  "gpt-4o-mini":         128_000,
  "claude-sonnet-4-5":   200_000,
  "claude-haiku-3-5":    200_000,
  "gemini-2.0-flash":  1_048_576,
  "gemini-1.5-pro":    2_097_152,
  "llama3-70b-8192":     128_000,
  "mixtral-8x7b-32768":   32_768,
};

const DEFAULT_LIMIT = 128_000;
const OVER_BUDGET_THRESHOLD = 0.85;

export interface TokenAudit {
  estimated:   number;  // estimated prompt tokens (chars / 4)
  limit:       number;  // model context window limit
  utilization: number;  // estimated / limit (0.0 – 1.0+)
  over_budget: boolean; // true if utilization > 0.85
}

/**
 * Token Audit Middleware.
 *
 * Estimates prompt token usage from raw message JSON length,
 * looks up the model's context-window limit, and writes a
 * TokenAudit record to ctx.state.tokenAudit.
 *
 * The meta block in executeProxy reads ctx.state.tokenAudit to
 * populate tokens_estimated, context_utilization, over_budget.
 *
 * Middleware order requirement:
 *   withValidation → withCircuitBreaker → withTokenAudit → executeProxy
 *
 * ctx.state.payload is guaranteed to be a validated ChatRequest
 * by the time this middleware runs (set by withValidation).
 */
export const withTokenAudit: Middleware = async (ctx, next) => {
  const payload = ctx.state.payload as ChatRequest | undefined;

  if (payload?.messages) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload.messages)).length;
    const estimated = Math.ceil(bytes / 3);

    const model = payload.model ?? "gpt-4o";
    const limit = MODEL_CONTEXT_LIMITS[model] ?? DEFAULT_LIMIT;
    const utilization = estimated / limit;
    const over_budget = utilization > OVER_BUDGET_THRESHOLD;

    ctx.state.tokenAudit = {
      estimated,
      limit,
      utilization,
      over_budget,
    } satisfies TokenAudit;
  }

  return next();
};
