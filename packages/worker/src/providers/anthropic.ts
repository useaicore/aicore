/**
 * @module providers/anthropic
 *
 * Anthropic Messages API adapter for the AICore Cloudflare Worker.
 */

import {
  type StreamChunk,
  normalizeAnthropicError,
} from "@aicore/types";
import {
  type ProviderAdapter,
  type ProviderChatParams,
  type ProviderCallResult,
  type ProviderCallUsage
} from "./providerAdapter.js";
import { 
  toAnthropicMessages, 
  createSseTransformer 
} from "../utils/streamUtils.js";
import { calculateCost } from "../utils/pricing.js";
import { withRetry } from "../utils/resilience.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
// const ANTHROPIC_MESSAGES_URL = "http://localhost:9090/v1/messages"; // E2E mock
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
  public readonly supportsStreaming = true;

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

    const { model, messages: rawMessages } = parsed.value;
    const { system, messages } = toAnthropicMessages(rawMessages);

    // ── Step 2: Call Anthropic ───────────────────────────────────────────────
    try {
      const t0 = Date.now();

      if (!env.ANTHROPIC_API_KEY) {
        // ... handled in resilience/retry or checked here ...
      }

      const url = env.ANTHROPIC_API_URL || ANTHROPIC_MESSAGES_URL;
      const response = await withRetry(async () => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "x-api-key":         env.ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "Content-Type":      "application/json",
          },
          body: JSON.stringify({
            model,
            system,
            messages,
            max_tokens: 1024,
          }),
        });

        if (!res.ok && (res.status === 429 || res.status >= 500)) {
          throw res; // Throw to trigger withRetry
        }
        return res;
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

      const costCents = calculateCost("anthropic", model, inputTokens, outputTokens);

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
   * Sends a streaming chat completion request to Anthropic.
   */
  async stream(params: ProviderChatParams): Promise<ReadableStream<StreamChunk>> {
    const { payload, env } = params;

    // ── Step 1: Validate payload ─────────────────────────────────────────────
    const parsed = this.parsePayload(payload);
    if (!parsed.ok) {
      throw new Error(parsed.reason);
    }

    const { model, messages: rawMessages } = parsed.value;
    const { system, messages } = toAnthropicMessages(rawMessages);

    // ── Step 2: Call Anthropic ───────────────────────────────────────────────
    const url = env.ANTHROPIC_API_URL || ANTHROPIC_MESSAGES_URL;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key":         env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model,
        system,
        messages,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const error = normalizeAnthropicError({ error: errorBody });
      throw error;
    }

    if (!response.body) {
      throw new Error("Anthropic response body is empty.");
    }

    // ── Step 3: Transform native SSE to normalized StreamChunks ──────────────
    return this.createNormalizedStream(response.body, model);
  }

  /**
   * Transforms the Anthropic SSE stream into a ReadableStream of StreamChunks.
   * @internal
   */
  private createNormalizedStream(
    nativeStream: ReadableStream<Uint8Array>,
    model: string,
  ): ReadableStream<StreamChunk> {
    return nativeStream.pipeThrough(createSseTransformer<StreamChunk>((event, controller) => {
      const { event: type, data } = event;
      try {
        const json = JSON.parse(data);

        switch (type) {
          case "content_block_delta":
            if (json.delta?.text) {
              controller.enqueue({ type: "text_delta", delta: json.delta.text });
            }
            break;

          case "message_start":
            if (json.message?.usage) {
              controller.enqueue({
                type: "usage",
                inputTokens: json.message.usage.input_tokens,
                outputTokens: json.message.usage.output_tokens,
              });
            }
            break;

          case "message_delta":
            if (json.usage) {
              controller.enqueue({
                type: "usage",
                outputTokens: json.usage.output_tokens,
              });
            }
            break;

          case "message_stop":
            controller.enqueue({ type: "message_end" });
            break;

          case "error":
            controller.enqueue({
              type: "error",
              error: normalizeAnthropicError({ error: json.error }),
            });
            break;
        }
      } catch (err) {
        // Ignore malformed JSON chunks
      }
    })).pipeThrough(new TransformStream({
      start(controller) {
        controller.enqueue({ type: "message_start", model });
      }
    }));
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
