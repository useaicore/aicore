/**
 * @module providers/gemini
 *
 * Google Gemini (Generative Language) API adapter for the AICore Cloudflare Worker.
 */

import {
  type StreamChunk,
  normalizeGeminiError,
} from "@aicore/types";
import {
  type ProviderAdapter,
  type ProviderChatParams,
  type ProviderCallResult,
  type ProviderCallUsage
} from "./providerAdapter.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL      = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-1.5-flash";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiPayload {
  model: string;
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

interface GeminiChatResponse {
  candidates: Array<{
    content: GeminiContent;
    finishReason: string;
    index: number;
    safetyRatings?: Array<unknown>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Google Gemini provider adapter implementation.
 */
export class GeminiProvider implements ProviderAdapter {
  public readonly name = "gemini" as const;
  public readonly supportsStreaming = false; // Phase 1: not implemented

  /**
   * Sends a chat completion request to Google Gemini.
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
          code:    "GEMINI_INVALID_PAYLOAD",
          message: parsed.reason,
          hint:    'Ensure the request body contains a "messages" array with at least one { role, content } entry.',
          details: { provider: "gemini", component: "worker_proxy" },
        },
      };
    }

    const { model, contents } = parsed.value;
    const url = `${BASE_URL}/models/${model}:generateContent?key=${env.GOOGLE_API_KEY}`;

    // ── Step 2: Call Gemini ──────────────────────────────────────────────────
    try {
      const t0 = Date.now();

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      });

      const latencyMs = Date.now() - t0;

      // ── Step 3: Handle non-2xx responses ─────────────────────────────────
      if (!response.ok) {
        const rawBody = await response.json().catch(() => ({ error: { status: response.statusText } })) as Record<string, unknown> | null;
        const error = normalizeGeminiError({ error: rawBody });
        return { ok: false, error };
      }

      // ── Step 4: Parse & Normalize success response ───────────────────────
      const data = await response.json() as GeminiChatResponse;

      const inputTokens  = data.usageMetadata?.promptTokenCount     ?? 0;
      const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
      const statusCode   = response.status;

      // TODO: replace costCents with real per-model pricing
      const costCents = 0;

      const usage: ProviderCallUsage = {
        provider: "gemini",
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
      const error = normalizeGeminiError({ error: err });
      return { ok: false, error };
    }
  }

  /**
   * Sends a streaming chat completion request to Google Gemini.
   */
  async stream(params: ProviderChatParams): Promise<ReadableStream<StreamChunk>> {
    const { payload, env } = params;

    // ── Step 1: Validate & Transform payload ────────────────────────────────
    const parsed = this.parsePayload(payload);
    if (!parsed.ok) {
      throw new Error(parsed.reason);
    }

    const { model, contents } = parsed.value;
    const url = `${BASE_URL}/models/${model}:streamGenerateContent?key=${env.GOOGLE_API_KEY}&alt=sse`;

    // ── Step 2: Call Gemini ──────────────────────────────────────────────────
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const rawBody = await response.json().catch(() => null) as Record<string, unknown> | null;
      const error = normalizeGeminiError({ error: rawBody });
      throw error;
    }

    if (!response.body) {
      throw new Error("Gemini response body is empty.");
    }

    // ── Step 3: Transform native SSE to normalized StreamChunks ──────────────
    return this.createNormalizedStream(response.body, model);
  }

  /**
   * Transforms the Gemini SSE stream into a ReadableStream of StreamChunks.
   * @internal
   */
  private createNormalizedStream(
    nativeStream: ReadableStream<Uint8Array>,
    model: string,
  ): ReadableStream<StreamChunk> {
    const textDecoder = new TextDecoder();
    let buffer = "";

    return nativeStream.pipeThrough(new TransformStream<Uint8Array, StreamChunk>({
      start(controller) {
        controller.enqueue({ type: "message_start", model });
      },

      transform(chunk, controller) {
        buffer += textDecoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          try {
            const json = JSON.parse(data) as GeminiChatResponse;

            // 1) Text delta
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text !== undefined && text !== null) {
              controller.enqueue({ type: "text_delta", delta: String(text) });
            }

            // 2) Finish reason
            const finishReason = json.candidates?.[0]?.finishReason;
            if (finishReason === "STOP") {
              controller.enqueue({ type: "message_end", stopReason: "stop" });
            } else if (finishReason) {
              controller.enqueue({ type: "message_end", stopReason: String(finishReason).toLowerCase() });
            }

            // 3) Usage
            if (json.usageMetadata) {
              controller.enqueue({
                type: "usage",
                inputTokens: json.usageMetadata.promptTokenCount,
                outputTokens: json.usageMetadata.candidatesTokenCount,
              });
            }
          } catch (err) {
            // Ignore malformed JSON chunks
          }
        }
      },

      flush(_controller) {
        // Final cleanup
      }
    }));
  }

  /**
   * Narrows `unknown` to `GeminiPayload`.
   * Maps OpenAI-style `messages` to Gemini-style `contents`.
   * @internal
   */
  private parsePayload(
    payload: unknown,
  ): { ok: true; value: GeminiPayload } | { ok: false; reason: string } {
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

    const messages = obj["messages"] as Array<{ role: string; content: string }>;
    const contents: GeminiContent[] = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    return {
      ok: true,
      value: {
        model:    typeof obj["model"] === "string" ? obj["model"] : DEFAULT_MODEL,
        contents,
      },
    };
  }
}
