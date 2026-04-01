/**
 * @module providers/openai
 *
 * OpenAI Chat Completions adapter for the AICore Cloudflare Worker.
 */

import {
  type StreamChunk,
  normalizeOpenAIError,
  createInternalError
} from "@aicore/types";
import {
  type ProviderAdapter,
  type ProviderChatParams,
  type ProviderCallResult,
  type ProviderCallUsage,
  type Env
} from "./providerAdapter.js";
import { createSseTransformer } from "../utils/streamUtils.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL   = "gpt-4o-mini";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatPayload {
  model?:    string;
  messages?: Array<ChatMessage>;
}

interface OpenAIChatResponse {
  usage?: {
    prompt_tokens?:     number;
    completion_tokens?: number;
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * OpenAI provider adapter implementation.
 */
export class OpenAIProvider implements ProviderAdapter {
  public readonly name = "openai" as const;
  public readonly supportsStreaming = true;

  /**
   * Sends a chat completion request to OpenAI.
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
        const rawBody = await response.json().catch(() => null) as Record<string, unknown> | null;
        const merged: Record<string, unknown> = {
          status: response.status,
          ...(rawBody ?? {}),
        };

        const error = normalizeOpenAIError({ error: merged });
        return { ok: false, error };
      }

      // ── Step 4: Parse success response ───────────────────────────────────
      const data = await response.json() as OpenAIChatResponse;

      const inputTokens  = data.usage?.prompt_tokens     ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;
      const statusCode   = response.status;

      // TODO: replace costCents with real per-model pricing
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
      const error = normalizeOpenAIError({ error: err });
      return { ok: false, error };
    }
  }

  /**
   * Sends a streaming chat completion request to OpenAI.
   */
  async stream(params: ProviderChatParams): Promise<ReadableStream<StreamChunk>> {
    const { payload, env } = params;

    // ── Step 1: Validate payload ─────────────────────────────────────────────
    const parsed = this.parsePayload(payload);
    if (!parsed.ok) {
      throw new Error(parsed.reason);
    }

    const { model, messages } = parsed.value;

    // ── Step 2: Call OpenAI ──────────────────────────────────────────────────
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const error = normalizeOpenAIError({ error: errorBody });
      throw error;
    }

    if (!response.body) {
      throw new Error("OpenAI response body is empty.");
    }

    // ── Step 3: Transform native SSE to normalized StreamChunks ──────────────
    return this.createNormalizedStream(response.body, model as string);
  }

  /**
   * Transforms the OpenAI SSE stream into a ReadableStream of StreamChunks.
   * @internal
   */
  private createNormalizedStream(
    nativeStream: ReadableStream<Uint8Array>,
    model: string,
  ): ReadableStream<StreamChunk> {
    return nativeStream.pipeThrough(createSseTransformer<StreamChunk>((event, controller) => {
      const { data } = event;
      if (data === "[DONE]") {
        controller.enqueue({ type: "message_end" });
        return;
      }

      try {
        const json = JSON.parse(data);

        // 1) Text delta
        const content = json.choices?.[0]?.delta?.content;
        if (content !== undefined && content !== null) {
          controller.enqueue({ type: "text_delta", delta: String(content) });
        }

        // 2) Finish reason
        const finishReason = json.choices?.[0]?.finish_reason;
        if (finishReason) {
          controller.enqueue({ type: "message_end", stopReason: String(finishReason) });
        }

        // 3) Usage
        if (json.usage) {
          controller.enqueue({
            type: "usage",
            inputTokens: json.usage.prompt_tokens,
            outputTokens: json.usage.completion_tokens,
          });
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
        model:    typeof obj["model"] === "string" ? obj["model"] : undefined,
        messages: obj["messages"] as Array<ChatMessage>,
      },
    };
  }
}
