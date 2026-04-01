/**
 * @module streaming
 *
 * Shared public streaming types for the AICore platform.
 *
 * Design goals:
 *  - Provider-neutral: chunk types map to common streaming events across all
 *    major LLM providers (OpenAI, Anthropic, Groq, Gemini) without exposing
 *    provider-specific raw shapes.
 *  - Simple but not toy-level: enough structure to support real multi-provider
 *    streaming without requiring a redesign when new providers are added.
 *  - Durable contract: field names are stable; add optional fields via
 *    intersections rather than breaking existing shapes.
 *
 * Normalization boundary:
 *  - The Worker is the provider-aware system boundary. It normalizes raw
 *    provider events internally before forwarding them to the SDK.
 *  - The SDK normalizes Worker envelopes / Worker stream events into this
 *    public StreamChunk contract. Provider-specific parsing must not appear
 *    in the SDK.
 */

import type { AICoreError } from "./aicoreError.js";

// ---------------------------------------------------------------------------
// Discriminant
// ---------------------------------------------------------------------------

/**
 * All possible stream chunk event types.
 *
 * - `message_start`  — first chunk; signals stream open, carries optional model name.
 * - `text_delta`     — incremental text content from the model.
 * - `message_end`    — final chunk before the iterator completes; carries stop reason.
 * - `usage`          — optional usage / billing metadata (may arrive mid-stream or at end).
 * - `error`          — error event; always the last chunk when present.
 */
export type StreamChunkType =
  | "message_start"
  | "text_delta"
  | "message_end"
  | "usage"
  | "error";

// ---------------------------------------------------------------------------
// Chunk variants
// ---------------------------------------------------------------------------

/** Base carried by every chunk. */
interface StreamChunkBase {
  readonly type: StreamChunkType;
}

/**
 * Signals that a new model response stream has opened.
 * Always the first chunk in a well-formed stream.
 */
export interface StreamChunkMessageStart extends StreamChunkBase {
  readonly type: "message_start";
  /**
   * Model identifier, if the Worker / provider surfaced it.
   * @example "gpt-4o-mini"
   */
  readonly model?: string;
}

/**
 * Carries an incremental text fragment produced by the model.
 * Callers should concatenate `delta` values in order to reconstruct
 * the full response text.
 */
export interface StreamChunkTextDelta extends StreamChunkBase {
  readonly type: "text_delta";
  /** Incremental text content — may be empty string for keep-alive deltas. */
  readonly delta: string;
}

/**
 * Signals that the model has finished generating.
 * Always the last non-error chunk in a well-formed stream.
 */
export interface StreamChunkMessageEnd extends StreamChunkBase {
  readonly type: "message_end";
  /**
   * Reason the model stopped generating.
   * @example "stop" | "length" | "content_filter"
   */
  readonly stopReason?: string;
}

/**
 * Carries token usage and billing metadata.
 * Emitted once per stream, typically just before or as part of `message_end`.
 * Optional — not all providers or Worker paths surface token counts.
 */
export interface StreamChunkUsage extends StreamChunkBase {
  readonly type: "usage";
  /** Tokens consumed by the prompt / input. */
  readonly inputTokens?: number;
  /** Tokens produced by the model / output. */
  readonly outputTokens?: number;
}

/**
 * Carries a normalized error that occurred during streaming.
 *
 * When present, this is always the final chunk — the iterator closes
 * immediately after yielding it.
 *
 * Note: errors that occur *before* the first chunk (network failure,
 * invalid envelope) are thrown directly from `stream()` rather than
 * wrapped in this chunk, because there is no partial stream to hand back.
 */
export interface StreamChunkError extends StreamChunkBase {
  readonly type: "error";
  /** Normalized error using the platform-wide AICoreError contract. */
  readonly error: AICoreError;
}

// ---------------------------------------------------------------------------
// Public union
// ---------------------------------------------------------------------------

/**
 * A single event in an AICore response stream.
 *
 * Iterate with `for await`:
 * ```ts
 * for await (const chunk of ai.stream(messages)) {
 *   if (chunk.type === "text_delta") process.stdout.write(chunk.delta);
 *   if (chunk.type === "usage")      console.log("tokens:", chunk.outputTokens);
 *   if (chunk.type === "error")      throw new Error(chunk.error.message);
 * }
 * ```
 */
export type StreamChunk =
  | StreamChunkMessageStart
  | StreamChunkTextDelta
  | StreamChunkMessageEnd
  | StreamChunkUsage
  | StreamChunkError;
