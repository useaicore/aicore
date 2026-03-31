/**
 * @module providers/openai
 *
 * OpenAI Chat Completions adapter for the AICore Cloudflare Worker.
 *
 * Responsibilities:
 *  - Validate the incoming payload (messages required, model defaulted).
 *  - Call POST https://api.openai.com/v1/chat/completions.
 *  - Measure end-to-end latency.
 *  - Extract token usage from the response.
 *  - Normalise all error paths into AICoreError via @aicore/types.
 *
 * Not in scope (handled upstream or in later steps):
 *  - Request-body schema validation beyond messages/model.
 *  - Retry / back-off logic.
 *  - Cost calculation (costCents is a placeholder; real pricing comes later).
 *  - Streaming responses.
 */

import type { Env, ProviderCallUsage, ProviderCallResult } from "../index.js";
import { normalizeOpenAIError } from "@aicore/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL   = "gpt-4o-mini";

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * The subset of the request body that this adapter cares about.
 * Remaining fields (temperature, max_tokens, …) will be forwarded as-is
 * once passthrough is implemented.
 */
interface ChatPayload {
  model?:    string;
  messages?: Array<ChatMessage>;
}

/**
 * Minimal shape of a successful OpenAI Chat Completions response.
 * We only type the fields we actually read; the rest is preserved as `unknown`
 * and forwarded to the caller.
 */
interface OpenAIChatResponse {
  usage?: {
    prompt_tokens?:     number;
    completion_tokens?: number;
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Narrows `unknown` to `ChatPayload` and validates that `messages` is a
 * non-empty array. Returns the casted value on success, or a descriptive
 * string error message on failure.
 */
function parsePayload(
  payload: unknown,
): { ok: true; value: ChatPayload } | { ok: false; reason: string } {
  if (payload === null || typeof payload !== "object") {
    return { ok: false, reason: "Request body must be a JSON object." };
  }

  const obj = payload as Record<string, unknown>;

  // messages — required, must be an array
  if (!Array.isArray(obj["messages"])) {
    return {
      ok: false,
      reason: 'Missing or invalid field "messages": expected a non-empty array of { role, content } objects.',
    };
  }

  return {
    ok: true,
    value: {
      model:    typeof obj["model"] === "string" ? obj["model"] : undefined,
      messages: obj["messages"] as Array<ChatMessage>,
    },
  };
}

// ---------------------------------------------------------------------------
// Exported adapter
// ---------------------------------------------------------------------------

/**
 * Sends a chat completion request to OpenAI and returns a ProviderCallResult.
 *
 * This function never throws — all error paths are normalised into
 * `{ ok: false, error: AICoreError }` before being returned.
 *
 * @param payload - Raw, unvalidated request body from the Worker's fetch handler.
 * @param env     - Cloudflare Worker environment bindings (OPENAI_API_KEY required).
 */
export async function callOpenAIChat(
  payload: unknown,
  env: Env,
): Promise<ProviderCallResult> {
  // ── Step 1: Validate payload ─────────────────────────────────────────────
  const parsed = parsePayload(payload);

  if (!parsed.ok) {
    return {
      ok: false,
      error: {
        type:    "validation_error",
        code:    "OPENAI_INVALID_PAYLOAD",
        message: parsed.reason,
        hint:    'Ensure the request body contains a "messages" array with at least one { role, content } entry.',
        details: { provider: "openai", component: "worker_proxy" },
      },
    };
  }

  const model    = parsed.value.model ?? DEFAULT_MODEL;
  const messages = parsed.value.messages!;

  // ── Step 2: Call OpenAI ───────────────────────────────────────────────────
  try {
    const t0 = Date.now();

    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });

    const latencyMs = Date.now() - t0;

    // ── Step 3: Handle non-2xx responses ─────────────────────────────────
    if (!response.ok) {
      // Attempt to get the structured OpenAI error body.
      // Merge status onto the body object so normalizeOpenAIError can pick
      // up both the HTTP status code and the provider error fields in one pass.
      const rawBody = await response.json().catch(() => null) as Record<string, unknown> | null;
      const merged: Record<string, unknown> = {
        status: response.status,
        ...(rawBody ?? {}),
      };

      const error = normalizeOpenAIError({ error: merged, requestId: undefined });
      return { ok: false, error };
    }

    // ── Step 4: Parse success response ───────────────────────────────────
    const data = await response.json() as OpenAIChatResponse;

    const inputTokens  = data.usage?.prompt_tokens     ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const statusCode   = response.status;

    // TODO: replace costCents with real per-model pricing once the pricing
    // table is introduced (see packages/worker/src/pricing/).
    const costCents = 0;

    const usage: ProviderCallUsage = {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      costCents,
      latencyMs,
      statusCode,
    };

    return { ok: true, data, usage };

  } catch (err) {
    // ── Step 5: Network / unexpected errors ───────────────────────────────
    // fetch() itself threw — typically a DNS failure, connection refused, or
    // a Workers runtime constraint.  We route through normalizeOpenAIError as
    // a convenient catch-all; a future refactor may use normalizeNetworkError
    // when we want to distinguish network vs provider errors more explicitly.
    const error = normalizeOpenAIError({ error: err, requestId: undefined });
    return { ok: false, error };
  }
}
