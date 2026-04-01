import type { ChatMessage, Logger, AICoreError } from "@aicore/types";

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
 * Standard Worker JSON envelope for successful responses.
 * @internal
 */
interface WorkerResponseSuccess {
  ok: true;
  data: unknown;
}

/**
 * Standard Worker JSON envelope for error responses.
 * @internal
 */
interface WorkerResponseError {
  ok: false;
  error: AICoreError;
}

/**
 * Union of possible Worker JSON envelopes.
 * @internal
 */
type WorkerResponse = WorkerResponseSuccess | WorkerResponseError;

/**
 * Main AICore SDK client.
 * Provides a unified interface for interacting with the AICore platform via the Worker.
 */
export class AICore {
  private readonly workerUrl: string;
  private readonly logger: Logger;
  private readonly fetch: typeof globalThis.fetch;

  /**
   * Creates a new instance of the AICore SDK.
   * 
   * @param config - The configuration object.
   * @throws {Error} if required configuration is missing.
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
    this.fetch = config.fetch || globalThis.fetch;

    if (!this.fetch) {
      throw new Error(
        "AICore: fetch implementation is missing. Provide 'fetch' in AICoreConfig or ensure globalThis.fetch exists."
      );
    }
  }

  /**
   * Sends a chat completion request to the AICore Worker.
   * 
   * @param messages - Array of chat messages ({ role, content }).
   * @returns The normalized provider response data as-is from the Worker.
   * @throws {AICoreError} if the Worker returns an error envelope.
   * @throws {Error} for network failures or malformed responses.
   */
  async chat(messages: ChatMessage[]): Promise<any> {
    const url = `${this.workerUrl}/v1/ai/chat`;

    this.logger.info("AICore.chat: starting request", {
      messageCount: messages.length,
      url,
    });

    try {
      const response = await this.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      // Parse the standard Worker envelope
      let envelope: WorkerResponse;
      try {
        envelope = await response.json() as WorkerResponse;
      } catch (err) {
        this.logger.error("AICore.chat: failed to parse response JSON", err as Error);
        throw new Error(
          `AICore: received malformed JSON from Worker (HTTP ${response.status})`
        );
      }

      // Handle the Worker's explicit envelope statuses
      if (!response.ok || envelope.ok === false) {
        // Use the error from the envelope if it exists, otherwise build a generic one
        const workerError = (envelope as WorkerResponseError)?.error;
        const message = workerError?.message || `Worker returned HTTP ${response.status}`;

        this.logger.error("AICore.chat: request failed", undefined, {
          status: response.status,
          error: workerError,
        });

        // We re-throw the error as a standard Error but decorated with AICore fields
        // so callers can match on them without needing to use 'as any'.
        const error = new Error(message) as any;
        if (workerError) {
          error.code = workerError.code;
          error.type = workerError.type;
          error.details = workerError.details;
          error.requestId = workerError.requestId;
        } else {
          error.code = "WORKER_HTTP_FAILURE";
          error.type = "aicore_internal";
        }
        throw error;
      }

      this.logger.info("AICore.chat: success");

      // Return the Worker's normalized provider response data directly
      return envelope.data;

    } catch (err: any) {
      // If it's already an error we processed above (has code/type), re-throw it.
      if (err.code && err.type) throw err;

      // Otherwise, it's a network error or unexpected runtime error.
      this.logger.error("AICore.chat: unexpected error during fetch", err);
      throw err;
    }
  }
}
