/**
 * @module sdk
 *
 * AICore SDK — public client for the AICore Worker.
 */

import type {
  ChatMessage,
  Logger,
  AICoreProvider,
  AICoreTaskType,
  AICorePlanTier,
  AICoreEnvironment,
  AICoreError,
  StreamChunk,
} from "@aicore/types";

export type {
  ChatMessage,
  Logger,
  AICoreProvider,
  AICoreTaskType,
  AICorePlanTier,
  AICoreEnvironment,
  AICoreError,
  StreamChunk,
};

// ---------------------------------------------------------------------------
// SDK Types
// ---------------------------------------------------------------------------

export interface AICoreClientConfig {
  endpoint: string;
  workspaceId: string;
  workspaceKey?: string;
  defaultModel?: string;
  defaultProvider?: AICoreProvider;
  environment?: AICoreEnvironment;
  logger?: Logger;
  terminalMetrics?: boolean;
}

export interface ChatOptions {
  model?: string;
  provider?: AICoreProvider;
  feature: string;
  taskType: AICoreTaskType;
  userId?: string;
  planTier: AICorePlanTier;
  traceId?: string;
  shadowMode?: boolean;
  latencySensitive?: boolean;
  metadata?: Record<string, unknown>;
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

export interface CompletionResponse {
  text: string;
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
  usage?: UsageMetadata & {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
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
  private metricsEmitted = false;

  constructor(config: AICoreClientConfig) {
    if (!config.endpoint) {
      throw new Error("AICore: endpoint is required in AICoreClientConfig.");
    }
    if (!config.workspaceId) {
      throw new Error("AICore: workspaceId is required in AICoreClientConfig.");
    }

    this.config = config;
    this.endpoint = normalizeEndpoint(config.endpoint);
  }

  /**
   * Sends a chat completion request to the AICore Worker.
   */
  async chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.config.defaultModel ?? "gpt-4o-mini";
    const provider = options.provider ?? this.config.defaultProvider;
    const callId = crypto.randomUUID();
    const traceId = options.traceId ?? crypto.randomUUID();

    const url = `${this.endpoint}/v1/ai/chat`;

    const body = {
      model,
      provider,
      taskType: options.taskType,
      messages,
      metadata: {
        callId,
        traceId,
        workspaceId: this.config.workspaceId,
        timestampMs: Date.now(),
        feature: options.feature,
        taskType: options.taskType,
        model,
        provider: provider ?? "openai",
        userId: options.userId,
        planTier: options.planTier,
        latencySensitive: options.latencySensitive ?? false,
        shadowMode: options.shadowMode ?? false,
        environment: this.config.environment ?? "development",
        ...options.metadata,
      },
    };

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
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(`AICore request failed: could not reach ${this.endpoint}. ${(err as Error).message}`);
    }

    const envelope = await parseEnvelope(response, this.config.logger);

    if (!response.ok || !envelope.ok) {
      throw toError(envelope, response.status);
    }

    const data = envelope.data;
    const content = extractChatContent(data);
    const usage = normalizeUsage(envelope.usage);

    this.emitTerminalMetrics(provider ?? "openai", model, usage);

    return {
      content,
      raw: data,
      model,
      provider: provider ?? "openai",
      usage,
    };
  }

  /**
   * Wraps chat() by sending a single user message.
   */
  async complete(prompt: string, options: ChatOptions): Promise<CompletionResponse> {
    const messages: ChatMessage[] = [{ role: "user", content: prompt }];
    const chatResponse = await this.chat(messages, options);

    return {
      text: chatResponse.content,
      raw: chatResponse.raw,
      model: chatResponse.model,
      provider: chatResponse.provider,
      usage: chatResponse.usage,
    };
  }

  /**
   * Async iterable for progressive consumption.
   * Calls the Worker's normalized streaming endpoint.
   */
  async *stream(messages: ChatMessage[], options: ChatOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.config.defaultModel ?? "gpt-4o-mini";
    const provider = options.provider ?? this.config.defaultProvider;
    const callId = crypto.randomUUID();
    const traceId = options.traceId ?? crypto.randomUUID();

    const url = `${this.endpoint}/v1/ai/chat`;

    const body = {
      model,
      provider,
      stream: true,
      messages,
      metadata: {
        callId,
        traceId,
        workspaceId: this.config.workspaceId,
        feature: options.feature,
        taskType: options.taskType,
        ...options.metadata,
      },
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
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const envelope = (await response.json()) as WorkerResponse;
        throw toError(envelope, response.status);
      }
      throw new Error(`AICore stream request failed with HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("AICore stream response body is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line || !line.startsWith("data: ")) continue;

          const data = line.slice(6);
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
            if (chunk.type === "error") return;
          } catch (err) {
            // Ignore malformed JSON in stream
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private emitTerminalMetrics(provider: string, model: string, usage?: UsageMetadata): void {
    if (this.metricsEmitted || !this.config.terminalMetrics || !usage) {
      return;
    }

    const metrics = `[AICore Metrics] provider=${provider} model=${model} latency=${usage.latencyMs}ms cost=${usage.costCents}¢ tokens=${usage.totalTokens}`;
    
    if (this.config.logger) {
      this.config.logger.info(metrics);
    } else {
      console.info(metrics);
    }

    this.metricsEmitted = true;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeEndpoint(endpoint: string): string {
  return endpoint.replace(/\/$/, "");
}

function extractChatContent(data: unknown): string {
  if (data && typeof data === "object") {
    const d = data as any;
    // OpenAI & Groq
    if (d.choices?.[0]?.message?.content !== undefined) {
      return String(d.choices[0].message.content);
    }
    // Anthropic
    if (Array.isArray(d.content) && d.content[0]?.text !== undefined) {
      return String(d.content[0].text);
    }
    // Gemini
    if (d.candidates?.[0]?.content?.parts?.[0]?.text !== undefined) {
      return String(d.candidates[0].content.parts[0].text);
    }
    // Legacy OpenAI
    if (d.choices?.[0]?.text !== undefined) {
      return String(d.choices[0].text);
    }
  }
  return "";
}

function normalizeUsage(usage?: any): UsageMetadata | undefined {
  if (!usage) return undefined;

  const inputTokens = usage.inputTokens ?? usage.prompt_tokens ?? 0;
  const outputTokens = usage.outputTokens ?? usage.completion_tokens ?? 0;
  let totalTokens = usage.totalTokens ?? usage.total_tokens;

  if (totalTokens === undefined) {
    totalTokens = inputTokens + outputTokens;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    costCents: usage.costCents ?? 0,
    latencyMs: usage.latencyMs ?? 0,
  };
}

async function parseEnvelope(response: Response, logger?: Logger): Promise<WorkerResponse> {
  const contentType = response.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`AICore request failed with HTTP ${response.status}: expected JSON response, got "${text.slice(0, 100)}"`);
  }

  try {
    return (await response.json()) as WorkerResponse;
  } catch (err) {
    if (logger) {
      logger.error("AICore: failed to parse Worker response JSON", err as Error);
    }
    throw new Error("Invalid AICore response envelope.");
  }
}

function toError(envelope: WorkerResponse, status: number): Error {
  if (!envelope.ok) {
    const workerError = envelope.error;
    const message = workerError?.message ?? `AICore Worker returned HTTP ${status}`;
    const err = new Error(message) as Error & { aicoreError?: AICoreError };
    err.aicoreError = workerError;
    return err;
  }
  
  return new Error(`AICore request failed with HTTP ${status}`);
}
