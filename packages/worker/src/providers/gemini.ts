/**
 * @module providers/gemini
 *
 * Google Gemini (Generative Language) API adapter for the AICore Cloudflare Worker.
 */

import { normalizeGeminiError } from "@aicore/types";
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
