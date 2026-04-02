/**
 * @module sdk
 *
 * AICore SDK — canonical client for the AICore Worker.
 */

import {
  type ChatMessage,
  type AICoreLogger,
  type AICoreError,
  type StreamChunk,
  type ChatRequest,
  ChatRequestSchema,
  createLogger,
} from "@aicore/types";
import { StreamNormalizer } from "./streamNormalizer.js";

export type {
  ChatMessage,
  AICoreLogger,
  AICoreError,
  StreamChunk,
  ChatRequest,
};

// ---------------------------------------------------------------------------
// SDK Types
// ---------------------------------------------------------------------------

export interface AICoreClientConfig {
  endpoint: string;
  workspaceId: string;
  workspaceKey?: string;
  defaultModel?: string;
  defaultProvider?: ChatRequest["provider"];
  environment?: ChatRequest["metadata"]["environment"];
  logger?: AICoreLogger;
  terminalMetrics?: boolean;
}

export interface ChatOptions extends Partial<Omit<ChatRequest, "messages">> {
  feature: string;
  taskType: string;
  userId?: string;
  planTier?: string;
  traceId?: string;
}

export interface UsageMetadata {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costCents?: number;
  latencyMs?: number;
}

export interface ChatResponse {
  content: string;
  raw: unknown;
  model: string;
  provider: string;
  usage?: UsageMetadata;
}

// ---------------------------------------------------------------------------
// Worker Envelope Types (Internal)
// ---------------------------------------------------------------------------

interface WorkerResponseSuccess {
  ok: true;
  data: unknown;
  usage?: UsageMetadata;
}

interface WorkerResponseError {
  ok: false;
  error: AICoreError;
}

type WorkerResponse = WorkerResponseSuccess | WorkerResponseError;

// ---------------------------------------------------------------------------
// AICore Client
// ---------------------------------------------------------------------------

export class AICore {
  private readonly config: AICoreClientConfig;
  private readonly endpoint: string;
  private readonly logger: AICoreLogger;
  private metricsEmitted = false;

  constructor(config: AICoreClientConfig) {
    if (!config.endpoint) {
      throw new Error("AICore: endpoint is required in AICoreClientConfig.");
    }
    if (!config.workspaceId) {
      throw new Error("AICore: workspaceId is required in AICoreClientConfig.");
    }

    this.config = config;
    this.endpoint = config.endpoint.replace(/\/$/, "");
    this.logger = config.logger ?? createLogger("sdk");
  }

  /**
   * Sends a chat completion request to the AICore Worker.
   */
  async chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.config.defaultModel ?? "gpt-4o-mini";
    const provider = options.provider ?? this.config.defaultProvider ?? "openai";
    const callId = crypto.randomUUID();
    const traceId = options.traceId ?? crypto.randomUUID();

    const url = `${this.endpoint}/v1/ai/chat`;

    // Constructing canonical ChatRequest payload
    const payload: ChatRequest = {
      model,
      provider,
      messages,
      stream: options.stream ?? false,
      shadowMode: options.shadowMode ?? false,
      metadata: {
        workspaceId: this.config.workspaceId,
        userId: options.userId,
        taskType: options.taskType,
        ...options.metadata,
      } as any,
    };

    // Validation (Self-Correction/10/10 Design)
    const validation = ChatRequestSchema.safeParse(payload);
    if (!validation.success) {
      this.logger.warn("AICore SDK: Request validation failed locally.", validation.error.format());
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.workspaceKey) {
      headers["x-workspace-key"] = this.config.workspaceKey;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      throw new Error(`AICore request failed: could not reach ${this.endpoint}. ${(err as Error).message}`);
    }

    const envelope = await this.parseEnvelope(response);

    if (!response.ok || !envelope.ok) {
      throw this.toError(envelope, response.status);
    }

    const data = envelope.data;
    const content = this.extractChatContent(data);
    const usage = envelope.usage;

    this.emitTerminalMetrics(provider, model, usage);

    return {
      content,
      raw: data,
      model,
      provider,
      usage,
    };
  }

  /**
   * Wraps chat() by sending a single user message.
   */
  async complete(prompt: string, options: ChatOptions): Promise<{ text: string; usage?: UsageMetadata }> {
    const messages: ChatMessage[] = [{ role: "user", content: prompt }];
    const res = await this.chat(messages, options);
    return { text: res.content, usage: res.usage };
  }

  /**
   * Async iterable for progressive consumption.
   */
  async *stream(messages: ChatMessage[], options: ChatOptions): AsyncIterable<StreamChunk> {
    const url = `${this.endpoint}/v1/ai/chat`;
    const payload: ChatRequest = {
      model: options.model ?? this.config.defaultModel ?? "gpt-4o-mini",
      provider: options.provider ?? this.config.defaultProvider ?? "openai",
      messages,
      stream: true,
      shadowMode: options.shadowMode ?? false,
      metadata: {
        workspaceId: this.config.workspaceId,
        userId: options.userId,
        taskType: options.taskType,
        ...options.metadata,
      } as any,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.workspaceKey) {
      headers["x-workspace-key"] = this.config.workspaceKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const envelope = (await response.json()) as WorkerResponse;
        throw this.toError(envelope, response.status);
      }
      throw new Error(`AICore stream request failed with HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("AICore stream response body is empty.");
    }

    const normalizer = new StreamNormalizer();
    yield* normalizer.normalize(response.body);
  }

  private emitTerminalMetrics(provider: string, model: string, usage?: UsageMetadata): void {
    if (this.metricsEmitted || !this.config.terminalMetrics || !usage) {
      return;
    }
    this.logger.info(`[AICore Metrics] provider=${provider} model=${model} latency=${usage.latencyMs}ms cost=${usage.costCents}\u00a2 tokens=${usage.totalTokens}`);
    this.metricsEmitted = true;
  }

  private async parseEnvelope(response: Response): Promise<WorkerResponse> {
    const contentType = response.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      throw new Error(`AICore: Expected JSON response, got "${text.slice(0, 100)}"`);
    }
    return (await response.json()) as WorkerResponse;
  }

  private extractChatContent(data: unknown): string {
    if (!data || typeof data !== "object") return "";
    const d = data as any;
    if (d.choices?.[0]?.message?.content !== undefined) return String(d.choices[0].message.content);
    if (Array.isArray(d.content) && d.content[0]?.text !== undefined) return String(d.content[0].text);
    if (d.candidates?.[0]?.content?.parts?.[0]?.text !== undefined) return String(d.candidates[0].content.parts[0].text);
    return "";
  }

  private toError(envelope: WorkerResponse, status: number): Error {
    if (!envelope.ok) {
      const workerError = envelope.error;
      const err = new Error(workerError?.message ?? `Worker returned HTTP ${status}`) as Error & { aicoreError?: AICoreError };
      err.name = "AICoreError";
      err.aicoreError = workerError;
      return err;
    }
    return new Error(`Request failed with HTTP ${status}`);
  }
}
