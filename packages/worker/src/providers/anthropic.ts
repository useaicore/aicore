/**
 * @module providers/anthropic
 *
 * Anthropic Messages API adapter for the AICore Cloudflare Worker.
 */

import { normalizeAnthropicError } from "@aicore/types";
import {
  type ProviderAdapter,
  type ProviderChatParams,
  type ProviderCallResult,
  type ProviderCallUsage
} from "./providerAdapter.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL         = "claude-3-5-sonnet-20240620";
const ANTHROPIC_VERSION     = "2023-06-01";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicPayload {
  model:     string;
  messages:  Array<AnthropicMessage>;
  max_tokens?: number;
}

interface AnthropicChatResponse {
  id: string;
  type: "message";
  role: "assistant";
  model: string;
  content: Array<{
    type: "text";
    text: string;
  }>;
  stop_reason: string | null;
  usage: {
    input_tokens:  number;
    output_tokens: number;
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Anthropic provider adapter implementation.
 */
export class AnthropicProvider implements ProviderAdapter {
  public readonly name = "anthropic" as const;
  public readonly supportsStreaming = false; // Phase 1: not implemented

  /**
   * Sends a chat completion request to Anthropic.
   */
  async chat(params: ProviderChatParams): Promise<ProviderCallResult> {
    const { payload, env } = params;

    // ── Step 1: Validate & Transform payload ────────────────────────────────
    const parsed = this.parsePayload(payload);
    if (!parsed.ok) {
      return {
        ok: false,
        error: {
          type:    "validation_error",
          code:    "ANTHROPIC_INVALID_PAYLOAD",
          message: parsed.reason,
          hint:    'Ensure the request body contains a "messages" array with at least one { role, content } entry.',
          details: { provider: "anthropic", component: "worker_proxy" },
        },
      };
    }

    const { model, messages } = parsed.value;

    // ── Step 2: Call Anthropic ───────────────────────────────────────────────
    try {
      const t0 = Date.now();

      const response = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: "POST",
        headers: {
          "x-api-key":         env.ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
          "Content-Type":      "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1024, // Required by Anthropic; can be made dynamic later
        }),
      });

      const latencyMs = Date.now() - t0;

      // ── Step 3: Handle non-2xx responses ─────────────────────────────────
      if (!response.ok) {
        const rawBody = await response.json().catch(() => null) as Record<string, unknown> | null;
        const merged: Record<string, unknown> = {
          status: response.status,
          ...(rawBody ?? {}),
        };

        const error = normalizeAnthropicError({ error: merged });
        return { ok: false, error };
      }

      // ── Step 4: Parse & Normalize success response ───────────────────────
      const data = await response.json() as AnthropicChatResponse;

      const inputTokens  = data.usage.input_tokens     ?? 0;
      const outputTokens = data.usage.output_tokens    ?? 0;
      const statusCode   = response.status;

      // TODO: replace costCents with real per-model pricing
      const costCents = 0;

      const usage: ProviderCallUsage = {
        provider: "anthropic",
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
      const error = normalizeAnthropicError({ error: err });
      return { ok: false, error };
    }
  }

  /**
   * Narrows `unknown` to `AnthropicPayload`.
   * @internal
   */
  private parsePayload(
    payload: unknown,
  ): { ok: true; value: AnthropicPayload } | { ok: false; reason: string } {
    if (payload === null || typeof payload !== "object") {
      return { ok: false, reason: "Request body must be a JSON object." };
    }

    const obj = payload as Record<string, unknown>;

    if (!Array.isArray(obj["messages"])) {
      return {
        ok: false,
        reason: 'Missing or invalid field "messages": expected a non-empty array of { role, content } objects.',
      };
    }

    return {
      ok: true,
      value: {
        model:    typeof obj["model"] === "string" ? (obj["model"] as string) : DEFAULT_MODEL,
        messages: obj["messages"] as Array<AnthropicMessage>,
        max_tokens: typeof obj["max_tokens"] === "number" ? (obj["max_tokens"] as number) : undefined,
      },
    };
  }
}
