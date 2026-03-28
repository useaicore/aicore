export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

/** Branded type to encourage stable feature vocabularies */
export type AICoreFeature = string & { __brand?: "AICoreFeature" };

export type AICoreProvider = "openai" | "anthropic" | "groq" | "gemini";

export type AICoreTaskType = "generation" | "summarisation" | "classification" | "embedding" | "moderation";

export type AICorePlanTier = "free" | "pro" | "team" | "enterprise";

export type AICoreRoutingStrategy = "cost" | "latency" | "quality" | "fallback";

export type AICoreEnvironment = "development" | "staging" | "production";

/**
 * Single source of truth for AI call telemetry.
 * Flat structure optimized for ClickHouse (DateTime64, String, LowCardinality).
 */
export interface AICoreMetadata {
  // --- Phase 1: Identity & Time ---

  /**
   * Unique identifier for this specific AI call.
   * @phase 1
   * @required
   * @example "call_01H2X..."
   */
  callId: string;

  /**
   * Identifier for a chain of related calls.
   * @phase 1
   * @required
   * @example "trace_01H2X..."
   */
  traceId?: string;

  /**
   * The workspace owning this call.
   * @phase 1
   * @required
   * @example "ws_998877"
   */
  workspaceId: string;

  /**
   * Unix epoch milliseconds set at the SDK just before sending.
   * Primary time dimension for ClickHouse (DateTime64).
   * @phase 1
   * @required
   * @example 1711621200000
   */
  timestampMs: number;

  // --- Phase 1: Routing & Classification ---

  /**
   * The product feature that triggered this call.
   * Use a stable vocabulary ("chat", "summarise"). Avoid freeform input.
   * @phase 1
   * @required
   */
  feature: AICoreFeature;

  /**
   * The nature of the AI task.
   * @phase 1
   * @required
   */
  taskType: AICoreTaskType;

  /**
   * Specific model requested.
   * @phase 1
   * @required
   */
  model: string;

  /**
   * Underlying LLM provider.
   * @phase 1
   * @required
   */
  provider: AICoreProvider;

  // --- Phase 1: User & Billing ---

  /**
   * The end user who initiated the request.
   * @phase 1 (optional), @phase 2 (required at runtime)
   * 
   * @runtime_enforcement Phase 2+: 
   * - Dev: Throws if missing.
   * - Prod: SDK logs warning and drops event.
   */
  userId?: string;

  /**
   * The billing tier of the workspace.
   * @phase 1 (optional), @phase 2 (required at runtime)
   * 
   * @runtime_enforcement Phase 2+: 
   * - Dev: Throws if missing.
   * - Prod: SDK logs warning and drops event.
   */
  planTier: AICorePlanTier;

  // --- Phase 1: Performance Hints ---

  /**
   * Prioritize speed over cost/quality.
   * @phase 1
   * @optional
   */
  latencySensitive?: boolean;

  /**
   * If true, this is a shadow evaluation call.
   * Correlate with primary calls via shared traceId.
   * @phase 1
   * @optional
   */
  shadowMode: boolean;

  // --- Phase 2: Observability ---

  /**
   * User session identifier.
   * @phase 2
   * @optional
   */
  sessionId?: string;

  /**
   * Contextual environment.
   * @phase 2
   * @optional
   */
  environment: AICoreEnvironment;

  /**
   * aicore-sdk version string.
   * @phase 2
   * @optional
   * @example "1.2.0"
   */
  sdkVersion?: string;

  /**
   * Cloudflare region handling the request.
   * @phase 2
   * @optional
   */
  ipRegion?: string;

  // --- Phase 3: Control ---

  /**
   * Applied budget rule ID.
   * @phase 3
   * @optional
   */
  budgetId?: string;

  /**
   * Logic used for model/provider selection.
   * @phase 3
   * @optional
   */
  routingStrategy?: AICoreRoutingStrategy;

  // --- Phase 3.5: Caching & Quality ---

  /**
   * Hash for semantic cache lookups.
   * @phase 3.5
   * @optional
   */
  cacheKey?: string;

  /**
   * Indicates a cache hit.
   * @phase 3.5
   * @optional
   */
  cacheHit?: boolean;

  /**
   * Output quality score (0.0 to 1.0 inclusive).
   * Stored as Float32 in ClickHouse. Use for aggregation, not equality.
   * @phase 3.5
   * @optional
   */
  qualityScore?: number;

  // --- Phase 4: Agents ---

  /**
   * workflow execution container ID.
   * @phase 4
   * @optional
   */
  workflowRunId?: string;

  /**
   * Specific AI agent instance ID.
   * @phase 4
   * @optional
   */
  agentId?: string;

  /**
   * 1-based index of the step in the agent pipeline.
   * @phase 4
   * @optional
   * @example 1, 2, 3
   */
  pipelineStep?: number;

  /**
   * parentCallId for recursive agent calls.
   * @phase 4
   * @optional
   */
  parentCallId?: string;
}

/**
 * A single usage record representing one completed AI call.
 * This structure is strictly flat to ensure O(1) ingestion into ClickHouse
 * and high-performance querying without JSON parsing overhead.
 */
export interface AICoreUsageLog extends AICoreMetadata {
  // --- Performance & Usage ---

  /**
   * Number of tokens in the prompt.
   * @required
   */
  inputTokens: number;

  /**
   * Number of tokens in the completion/output.
   * @required
   */
  outputTokens: number;

  /**
   * Total tokens consumed (inputTokens + outputTokens).
   * @required
   */
  totalTokens: number;

  /**
   * Total cost of the call in integer cents, rounded UP to the nearest cent.
   * Calls costing < 1 cent are recorded as 1 cent.
   * This avoids floating point precision issues in billing and aggregations.
   * @required
   * @example 5 (represents $0.05)
   */
  costCents: number;

  /**
   * Total end-to-end latency in milliseconds.
   * Measured from SDK/Worker request start to response received.
   * @required
   */
  latencyMs: number;

  // --- Shadow Evaluation ---

  /**
   * CANONICAL BILLING FLAG for shadow evaluation.
   * Queries and dashboards must use this field as the primary shadow indicator.
   * MUST be kept in sync with `AICoreMetadata.shadowMode`.
   * @required
   */
  isShadowCall: boolean;

  /**
   * Potential savings in integer cents if this call was a shadow replacement 
   * for a more expensive model.
   * @optional
   */
  shadowSavingsCents?: number;

  // --- Status & Errors ---

  /**
   * Normalized numeric status code.
   * - HTTP Providers: Use the HTTP status code (e.g. 200, 429, 500).
   * - Non-HTTP: Map to canonical codes (200=success, 429=rate limited, 500=internal).
   * @required
   */
  statusCode: number;

  /**
   * Definitive failure flag from the user's perspective.
   * true if statusCode is not in success range (e.g. 200-299) OR if 
   * a provider-level error occurred despite HTTP 200.
   * @required
   */
  isError: boolean;
}
