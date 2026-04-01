/**
 * @module providers/groq
 *
 * Groq (OpenAI-compatible) API adapter for the AICore Cloudflare Worker.
 */

import { normalizeGroqError } from "@aicore/types";
import {
  type ProviderAdapter,
  type ProviderChatParams,
  type ProviderCallResult,
  type ProviderCallUsage
} from "./providerAdapter.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-70b-versatile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatPayload {
  model:     string;
  messages: Array<ChatMessage>;
}

interface GroqChatResponse {
  usage?: {
    prompt_tokens?:     number;
    completion_tokens?: number;
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Groq provider adapter implementation.
 */
export class GroqProvider implements ProviderAdapter {
  public readonly name = "groq" as const;
  public readonly supportsStreaming = true;

  /**
   * Sends a chat completion request to Groq.
   */
  async chat(params: ProviderChatParams): Promise<ProviderCallResult> {
    const { payload, env } = params;

    // ── Step 1: Validate payload ─────────────────────────────────────────────
    const parsed = this.parsePayload(payload);
    if (!parsed.ok) {
      return {
        ok: false,
        error: {
          type:    "validation_error",
          code:    "GROQ_INVALID_PAYLOAD",
          message: parsed.reason,
          hint:    'Ensure the request body contains a "messages" array with at least one { role, content } entry.',
          details: { provider: "groq", component: "worker_proxy" },
        },
      };
    }

    const { model, messages } = parsed.value;

    // ── Step 2: Call Groq ───────────────────────────────────────────────────
    try {
      const t0 = Date.now();

      const response = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({ model, messages }),
      });

      const latencyMs = Date.now() - t0;

      // ── Step 3: Handle non-2xx responses ─────────────────────────────────
      if (!response.ok) {
        const rawBody = await response.json().catch(() => null) as Record<string, unknown> | null;
        const merged: Record<string, unknown> = {
          status: response.status,
          ...(rawBody ?? {}),
        };

        const error = normalizeGroqError({ error: merged });
        return { ok: false, error };
      }

      // ── Step 4: Parse success response ───────────────────────────────────
      const data = await response.json() as GroqChatResponse;

      const inputTokens  = data.usage?.prompt_tokens     ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;
      const statusCode   = response.status;

      // TODO: replace costCents with real per-model pricing
      const costCents = 0;

      const usage: ProviderCallUsage = {
        provider: "groq",
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
      const error = normalizeGroqError({ error: err });
      return { ok: false, error };
    }
  }

  /**
   * Narrows `unknown` to `ChatPayload`.
   * @internal
   */
  private parsePayload(
    payload: unknown,
  ): { ok: true; value: ChatPayload } | { ok: false; reason: string } {
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
        messages: obj["messages"] as Array<ChatMessage>,
      },
    };
  }
}
