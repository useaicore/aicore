/**
 * @module sdk
 *
 * AICore SDK — public client for the AICore Worker.
 *
 * Architecture:
 *  - The Worker is the provider-aware system boundary. It owns all provider
 *    routing, provider adapters, and provider-specific normalization.
 *  - The SDK converts Worker envelopes / future Worker stream events into the
 *    shared public types defined in @aicore/types.
 *  - Provider-specific parsing must NOT appear here.
 *
 * Public surface:
 *  - AICore                — main client class
 *  - AICoreConfig          — constructor options
 *  - StreamOptions         — options for stream()
 */

import type {
  ChatMessage,
  Logger,
  AICoreError,
  StreamChunk,
  StreamChunkMessageStart,
  StreamChunkTextDelta,
  StreamChunkMessageEnd,
  StreamChunkUsage,
} from "@aicore/types";

// Re-export public types so downstream consumers can import them from the SDK
// without also depending on @aicore/types directly.
export type { ChatMessage, AICoreError, StreamChunk };

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration options for the AICore SDK client.
 */
export interface AICoreConfig {
  /**
   * Base URL of the AICore Worker (e.g. "https://aicore-worker.example.workers.dev").
   * Required.
   */
  workerUrl: string;

  /**
   * Logger instance for instrumentation (info/error).
   * Required.
   */
  logger: Logger;

  /**
   * Optional custom fetch implementation.
   * Defaults to globalThis.fetch if available.
   */
  fetch?: typeof globalThis.fetch;
}

/**
 * Options accepted by AICore.stream().
 */
export interface StreamOptions {
  /**
   * Hint to the Worker's routing engine about which model to use.
   * Provider selection is the Worker's responsibility — no `provider` field
   * is exposed here. The Worker ignores unknown fields harmlessly today and
   * will use this field once routing gates on it.
   */
  model?: string;
}

// ---------------------------------------------------------------------------
// Worker envelope types (internal)
// ---------------------------------------------------------------------------

/** Standard Worker JSON envelope for successful responses. @internal */
interface WorkerResponseSuccess {
  ok: true;
  data: unknown;
}

/** Standard Worker JSON envelope for error responses. @internal */
interface WorkerResponseError {
  ok: false;
  error: AICoreError;
}

/** Union of possible Worker JSON envelopes. @internal */
type WorkerResponse = WorkerResponseSuccess | WorkerResponseError;

// ---------------------------------------------------------------------------
// Shared request helpers (reused by chat() and stream())
// ---------------------------------------------------------------------------

/**
 * Builds the fetch RequestInit for a Worker chat call.
 * @internal
 */
function buildRequestInit(
  messages: ChatMessage[],
  options?: StreamOptions,
): RequestInit {
  const body: Record<string, unknown> = { messages };
  if (options?.model !== undefined) body.model = options.model;
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/**
 * Parses the Worker response body into a WorkerResponse envelope.
 * Throws a descriptive Error if the body is not valid JSON.
 * @internal
 */
async function parseEnvelope(
  response: Response,
  logger: Logger,
): Promise<WorkerResponse> {
  try {
    return (await response.json()) as WorkerResponse;
  } catch (err) {
    logger.error("AICore: failed to parse Worker response JSON", err as Error);
    throw new Error(
      `AICore: received malformed JSON from Worker (HTTP ${response.status})`,
    );
  }
}

/**
 * Converts a `{ ok: false, error }` envelope into a thrown Error decorated
 * with AICoreError fields so callers can match on them without `as any`.
 * @internal
 */
function throwFromEnvelope(
  envelope: WorkerResponseError,
  httpStatus: number,
  logger: Logger,
): never {
  const workerError = envelope.error;
  const message =
    workerError?.message ?? `AICore Worker returned HTTP ${httpStatus}`;

  logger.error("AICore: Worker returned error envelope", undefined, {
    status: httpStatus,
    error: workerError,
  });

  const err = new Error(message) as Error & Partial<AICoreError>;
  if (workerError) {
    err.code = workerError.code;
    err.type = workerError.type;
    err.details = workerError.details;
    err.requestId = workerError.requestId;
  } else {
    err.code = "WORKER_HTTP_FAILURE";
    err.type = "aicore_internal";
  }
  throw err;
}

// ---------------------------------------------------------------------------
// StreamNormalizer — Worker-output → AsyncIterable<StreamChunk>
// ---------------------------------------------------------------------------

/**
 * Internal interface for the Worker stream normalization seam.
 *
 * Today: `fromEnvelope()` converts a final JSON envelope into a synthetic
 * `AsyncIterable<StreamChunk>`. Future wiring points (commented) will be
 * implemented when the Worker gains true SSE/NDJSON streaming — only those
 * methods need to change; the public `stream()` API remains stable.
 *
 * This interface normalizes *Worker-originated output only*. Raw provider
 * event shapes (OpenAI SSE, Anthropic SSE, etc.) are the Worker's concern.
 *
 * @internal
 */
interface WorkerStreamSource {
  /** Today's path: consume a complete Worker JSON envelope as a stream. */
  fromEnvelope(envelope: WorkerResponseSuccess): AsyncIterable<StreamChunk>;

  // Future wiring points — uncomment and implement when Worker adds streaming:
  // fromSSE(stream: ReadableStream<Uint8Array>): AsyncIterable<StreamChunk>;
  // fromNDJSON(stream: ReadableStream<Uint8Array>): AsyncIterable<StreamChunk>;
}

/**
 * Extracts text content from a Worker `data` payload.
 *
 * Strategy (Worker is OpenAI-only today; falls back gracefully for future shapes):
 *  1. Try `data.choices[0].message.content` — standard OpenAI chat completion shape.
 *  2. Fall back to `JSON.stringify(data)` as a single text delta so the stream
 *     always emits *something* rather than silently dropping content.
 *
 * @internal
 */
function extractTextContent(data: unknown): string {
  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const choices = obj["choices"];
    if (Array.isArray(choices) && choices.length > 0) {
      const first = choices[0] as Record<string, unknown> | null;
      if (first !== null && typeof first === "object") {
        const message = first["message"];
        if (message !== null && typeof message === "object") {
          const content = (message as Record<string, unknown>)["content"];
          if (typeof content === "string") return content;
        }
      }
    }
  }
  // Graceful fallback: unknown shape — preserve data as JSON text
  return JSON.stringify(data);
}

/**
 * Extracts token usage from a Worker `data` payload (OpenAI shape).
 * Returns undefined when usage data is absent.
 * @internal
 */
function extractUsage(
  data: unknown,
): { inputTokens: number; outputTokens: number } | undefined {
  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const usage = obj["usage"];
    if (usage !== null && typeof usage === "object") {
      const u = usage as Record<string, unknown>;
      const inputTokens =
        typeof u["prompt_tokens"] === "number" ? u["prompt_tokens"] : undefined;
      const outputTokens =
        typeof u["completion_tokens"] === "number"
          ? u["completion_tokens"]
          : undefined;
      if (inputTokens !== undefined || outputTokens !== undefined) {
        return { inputTokens: inputTokens ?? 0, outputTokens: outputTokens ?? 0 };
      }
    }
  }
  return undefined;
}

/**
 * Extracts the model name from a Worker `data` payload (OpenAI shape).
 * @internal
 */
function extractModel(data: unknown): string | undefined {
  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj["model"] === "string") return obj["model"];
  }
  return undefined;
}

/**
 * Extracts the stop reason from a Worker `data` payload (OpenAI shape).
 * @internal
 */
function extractStopReason(data: unknown): string | undefined {
  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const choices = obj["choices"];
    if (Array.isArray(choices) && choices.length > 0) {
      const first = choices[0] as Record<string, unknown> | null;
      if (first !== null && typeof first === "object") {
        const reason = (first as Record<string, unknown>)["finish_reason"];
        if (typeof reason === "string") return reason;
      }
    }
  }
  return undefined;
}

/**
 * Normalizes Worker-originated envelopes and future stream events into
 * `AsyncIterable<StreamChunk>`.
 *
 * Implements the `WorkerStreamSource` seam so the public `stream()` method
 * remains stable as the Worker transport evolves.
 *
 * @internal
 */
class StreamNormalizer implements WorkerStreamSource {
  /**
   * Converts a final Worker JSON envelope into a synthetic stream.
   *
   * Chunk sequence:
   *   message_start → text_delta → [usage] → message_end
   *
   * This is the current production path. When the Worker gains true SSE
   * streaming, wire `fromSSE()` instead and leave this method unchanged
   * for compatibility with Worker versions that still return final envelopes.
   */
  async *fromEnvelope(
    envelope: WorkerResponseSuccess,
  ): AsyncIterable<StreamChunk> {
    const { data } = envelope;

    // 1. message_start
    const model = extractModel(data);
    const startChunk: StreamChunkMessageStart = {
      type: "message_start",
      ...(model !== undefined && { model }),
    };
    yield startChunk;

    // 2. text_delta — may be empty string for empty completions
    const textChunk: StreamChunkTextDelta = {
      type: "text_delta",
      delta: extractTextContent(data),
    };
    yield textChunk;

    // 3. usage (optional)
    const usage = extractUsage(data);
    if (usage !== undefined) {
      const usageChunk: StreamChunkUsage = {
        type: "usage",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      };
      yield usageChunk;
    }

    // 4. message_end
    const stopReason = extractStopReason(data);
    const endChunk: StreamChunkMessageEnd = {
      type: "message_end",
      ...(stopReason !== undefined && { stopReason }),
    };
    yield endChunk;
  }

  // ---------------------------------------------------------------------------
  // Future wiring points (not yet implemented)
  // ---------------------------------------------------------------------------
  // Uncomment and implement when the Worker gains SSE/NDJSON streaming.
  // The public stream() API does not change — only the transport branch below.
  //
  // async *fromSSE(stream: ReadableStream<Uint8Array>): AsyncIterable<StreamChunk> {
  //   // TODO: parse text/event-stream from Worker, yield StreamChunk per event
  //   throw new Error("fromSSE: not yet implemented");
  // }
  //
  // async *fromNDJSON(stream: ReadableStream<Uint8Array>): AsyncIterable<StreamChunk> {
  //   // TODO: parse newline-delimited JSON from Worker, yield StreamChunk per line
  //   throw new Error("fromNDJSON: not yet implemented");
  // }
}

// Singleton — stateless, safe to share across AICore instances.
const normalizer = new StreamNormalizer();

// ---------------------------------------------------------------------------
// AICore client
// ---------------------------------------------------------------------------

/**
 * Main AICore SDK client.
 * Provides a unified, provider-neutral interface for interacting with the
 * AICore platform via the Worker.
 */
export class AICore {
  private readonly workerUrl: string;
  private readonly logger: Logger;
  private readonly fetch: typeof globalThis.fetch;

  /**
   * Creates a new instance of the AICore SDK.
   *
   * @param config - The configuration object.
   * @throws {Error} if required configuration is missing or fetch is unavailable.
   */
  constructor(config: AICoreConfig) {
    if (!config.workerUrl) {
      throw new Error("AICore: workerUrl is required in AICoreConfig.");
    }
    if (!config.logger) {
      throw new Error("AICore: logger instance is required in AICoreConfig.");
    }

    this.workerUrl = config.workerUrl.replace(/\/$/, "");
    this.logger = config.logger;
    this.fetch = config.fetch ?? globalThis.fetch;

    if (!this.fetch) {
      throw new Error(
        "AICore: fetch implementation is missing. Provide 'fetch' in AICoreConfig or ensure globalThis.fetch exists.",
      );
    }
  }

  // ---------------------------------------------------------------------------
  // chat()
  // ---------------------------------------------------------------------------

  /**
   * Sends a chat completion request to the AICore Worker and returns the
   * normalized provider response data.
   *
   * @param messages - Array of chat messages ({ role, content }).
   * @returns The Worker's normalized provider response data.
   * @throws {Error} decorated with AICoreError fields if the Worker returns an error envelope.
   * @throws {Error} for network failures or malformed Worker responses.
   */
  async chat(messages: ChatMessage[]): Promise<unknown> {
    const url = `${this.workerUrl}/v1/ai/chat`;

    this.logger.info("AICore.chat: starting request", {
      messageCount: messages.length,
      url,
    });

    try {
      const response = await this.fetch(url, buildRequestInit(messages));
      const envelope = await parseEnvelope(response, this.logger);

      if (!response.ok || envelope.ok === false) {
        throwFromEnvelope(
          envelope as WorkerResponseError,
          response.status,
          this.logger,
        );
      }

      this.logger.info("AICore.chat: success");
      return (envelope as WorkerResponseSuccess).data;
    } catch (err: unknown) {
      // Re-throw errors that already carry AICoreError fields (from throwFromEnvelope
      // or parseEnvelope). For raw network/runtime errors, log then re-throw.
      const e = err as Record<string, unknown>;
      if (e.code && e.type) throw err;

      this.logger.error(
        "AICore.chat: unexpected error during fetch",
        err as Error,
      );
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // stream()
  // ---------------------------------------------------------------------------

  /**
   * Sends a chat completion request to the AICore Worker and returns an
   * `AsyncIterable<StreamChunk>` for progressive consumption.
   *
   * Current behaviour: calls the Worker's final-response endpoint and emits a
   * synthetic stream (message_start → text_delta → [usage] → message_end).
   * Future behaviour: when the Worker gains SSE/NDJSON streaming, only the
   * internal transport branch changes — the caller's `for await` loop is
   * unaffected.
   *
   * Error handling:
   *  - Errors before the first chunk (network failure, invalid JSON, Worker
   *    error envelope) are **thrown** so the caller's try/catch catches them
   *    before the loop starts.
   *  - Errors during an active stream are yielded as a final `{ type: "error" }`
   *    chunk (future path, when true streaming is wired).
   *
   * @param messages - Array of chat messages ({ role, content }).
   * @param options  - Optional stream configuration (model hint, etc.).
   * @returns AsyncIterable<StreamChunk> — iterate with `for await`.
   * @throws {Error} before iteration begins if the Worker returns an error
   *   or the network/request fails.
   *
   * @example
   * ```ts
   * for await (const chunk of ai.stream(messages)) {
   *   if (chunk.type === "text_delta") process.stdout.write(chunk.delta);
   *   if (chunk.type === "usage")      console.log("tokens:", chunk.outputTokens);
   *   if (chunk.type === "error")      throw new Error(chunk.error.message);
   * }
   * ```
   */
  async *stream(
    messages: ChatMessage[],
    options?: StreamOptions,
  ): AsyncIterable<StreamChunk> {
    const url = `${this.workerUrl}/v1/ai/chat`;

    this.logger.info("AICore.stream: starting request", {
      messageCount: messages.length,
      url,
      model: options?.model,
    });

    let response: Response;
    try {
      response = await this.fetch(url, buildRequestInit(messages, options));
    } catch (err: unknown) {
      this.logger.error(
        "AICore.stream: fetch failed",
        err as Error,
      );
      throw err;
    }

    let envelope: WorkerResponse;
    try {
      envelope = await parseEnvelope(response, this.logger);
    } catch (err: unknown) {
      // parseEnvelope already logged; re-throw so the caller's try/catch fires.
      throw err;
    }

    // Worker returned an error envelope — throw before the iterator opens.
    if (!response.ok || envelope.ok === false) {
      throwFromEnvelope(
        envelope as WorkerResponseError,
        response.status,
        this.logger,
      );
    }

    // Normalize the successful envelope into a stream of chunks.
    this.logger.info("AICore.stream: envelope received, starting stream");

    try {
      yield* normalizer.fromEnvelope(envelope as WorkerResponseSuccess);
      this.logger.info("AICore.stream: stream complete");
    } catch (err: unknown) {
      this.logger.error(
        "AICore.stream: error during normalization",
        err as Error,
      );
      throw err;
    }
  }
}
