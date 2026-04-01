/**
 * @module providers/providerAdapter
 *
 * Internal contract and shared types for AI provider adapters.
 */

import type { AICoreError, AICoreProvider, StreamChunk } from "@aicore/types";

// ---------------------------------------------------------------------------
// Cloudflare bindings
// ---------------------------------------------------------------------------

/**
 * Cloudflare Worker environment bindings.
 */
export interface Env {
  /** Base URL of the internal telemetry gateway service. */
  TELEMETRY_GATEWAY_URL: string;
  /** OpenAI API key. */
  OPENAI_API_KEY: string;
  /** Anthropic API key. */
  ANTHROPIC_API_KEY: string;
  /** Google AI API key (Gemini). */
  GOOGLE_API_KEY: string;
  /** Groq API key. */
  GROQ_API_KEY: string;
}

// ---------------------------------------------------------------------------
// Performance & Usage
// ---------------------------------------------------------------------------

/**
 * Usage and performance metadata captured for every AI provider call.
 */
export interface ProviderCallUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  latencyMs: number;
  statusCode: number;
}

/**
 * Discriminated union returned by every provider adapter.
 */
export type ProviderCallResult =
  | { ok: true; data: unknown; usage: ProviderCallUsage }
  | { ok: false; error: AICoreError };

// ---------------------------------------------------------------------------
// Adapter Interface
// ---------------------------------------------------------------------------

/**
 * Parameters passed to every provider chat call.
 */
export interface ProviderChatParams {
  /** Raw payload object from the client. */
  payload: unknown;
  /** Worker environment bindings (secrets). */
  env: Env;
}

/**
 * Public contract for every AI provider adapter in the AICore Worker.
 *
 * Every new provider (Anthropic, Gemini, Groq, …) must implement this
 * interface and register itself with the ProviderRegistry.
 */
export interface ProviderAdapter {
  /** Canonical name of the provider. */
  readonly name: AICoreProvider;

  /** Whether this adapter supports real-time streaming. */
  readonly supportsStreaming: boolean;

  /**
   * Non-streaming chat completion call.
   * Internal implementation handles payload parsing, normalization, and errors.
   */
  chat(params: ProviderChatParams): Promise<ProviderCallResult>;

  /**
   * Streaming chat completion call.
   * Returns a ReadableStream of normalized StreamChunks.
   */
  stream(params: ProviderChatParams): Promise<ReadableStream<StreamChunk>>;
}
