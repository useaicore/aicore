/**
 * @module aicoreError
 *
 * Unified error model for the AICore platform.
 * Used by both the SDK and the Cloudflare Worker proxy.
 *
 * Design goals:
 *  - Single, stable shape so error handling code is portable across packages.
 *  - Factory helpers so callers never construct the shape by hand.
 *  - Normalizers that absorb provider-specific shapes and emit AICoreError.
 *  - No external dependencies; safe for edge runtimes (Cloudflare Workers).
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * Discriminant for every error that the AICore platform can surface.
 * Add new variants here when introducing new error categories; never remove or
 * rename existing ones — downstream code pattern-matches on these strings.
 */
export type AICoreErrorType =
  | "config_error"       // Bad configuration (missing key, invalid model name, …)
  | "provider_error"     // Provider returned a non-success response (4xx / 5xx)
  | "network_error"      // Could not reach a component (timeout, DNS failure, …)
  | "rate_limit_error"   // Provider or internal rate limit hit (HTTP 429)
  | "validation_error"   // Request failed schema / constraint validation
  | "aicore_internal";   // Unexpected internal error (bugs, invariant violations)

/**
 * Provider- and component-level metadata attached to an AICoreError.
 * All fields are optional so the struct can be populated incrementally.
 */
export interface AICoreErrorDetails {
  /** LLM provider that produced the error, e.g. "openai", "anthropic". */
  provider?: string;
  /** AICore system component that produced or caught the error, e.g. "sdk", "worker_proxy", "telemetry_gateway". */
  component?: string;
  /** HTTP status code returned by the provider or internal service. */
  httpStatusCode?: number;
  /** Provider-native error code, e.g. "invalid_api_key", "rate_limit_exceeded". */
  providerErrorCode?: string;
  /** Raw error value for deep debugging — never logged at INFO level. */
  rawProviderError?: unknown;
}

/**
 * The canonical AICore error envelope.
 * Every error that escapes a package boundary MUST be represented as this type.
 */
export interface AICoreError {
  /** Broad category used for routing in error-handling middleware. */
  type: AICoreErrorType;
  /** Stable, SCREAMING_SNAKE_CASE code for programmatic matching, e.g. "OPENAI_INVALID_API_KEY". */
  code: string;
  /** Human-readable summary suitable for logs and developer dashboards. */
  message: string;
  /** One-liner advice on how to resolve the error. */
  hint?: string;
  /** Correlates to the callId / worker request id for distributed tracing. */
  requestId?: string;
  /** Optional structured metadata for deeper introspection. */
  details?: AICoreErrorDetails;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Builds an AICoreErrorDetails object, omitting undefined fields so the
 * serialised JSON stays lean.
 */
function buildDetails(opts: {
  provider?: string;
  component?: string;
  httpStatusCode?: number;
  providerErrorCode?: string;
  rawProviderError?: unknown;
}): AICoreErrorDetails | undefined {
  const d: AICoreErrorDetails = {};
  let hasKey = false;

  if (opts.provider !== undefined)        { d.provider          = opts.provider;          hasKey = true; }
  if (opts.component !== undefined)       { d.component         = opts.component;         hasKey = true; }
  if (opts.httpStatusCode !== undefined)  { d.httpStatusCode    = opts.httpStatusCode;    hasKey = true; }
  if (opts.providerErrorCode !== undefined) { d.providerErrorCode = opts.providerErrorCode; hasKey = true; }
  if (opts.rawProviderError !== undefined){ d.rawProviderError  = opts.rawProviderError;  hasKey = true; }

  return hasKey ? d : undefined;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Shared params accepted by every factory. */
interface BaseParams {
  code: string;
  message: string;
  hint?: string;
  requestId?: string;
  provider?: string;
  component?: string;
  httpStatusCode?: number;
  providerErrorCode?: string;
  rawProviderError?: unknown;
}

/**
 * Creates an AICoreError representing a configuration problem,
 * e.g. a missing API key or an unrecognised model identifier.
 */
export function createConfigError(params: BaseParams): AICoreError {
  return {
    type: "config_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

/**
 * Creates an AICoreError representing a provider-level failure
 * (non-429 HTTP error, provider-side internal error, etc.).
 */
export function createProviderError(params: BaseParams): AICoreError {
  return {
    type: "provider_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

/**
 * Creates an AICoreError representing a network-level failure,
 * e.g. a timeout or DNS resolution error when contacting a downstream service.
 */
export function createNetworkError(params: BaseParams): AICoreError {
  return {
    type: "network_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

/**
 * Creates an AICoreError representing an unexpected internal error —
 * bugs, violated invariants, unhandled edge cases.
 */
export function createInternalError(params: BaseParams): AICoreError {
  return {
    type: "aicore_internal",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Shape that the OpenAI REST API returns inside a non-2xx response body.
 * @internal
 */
interface OpenAIErrorBody {
  error?: {
    type?: string;
    code?: string | null;
    message?: string;
  };
}

/**
 * Attempts to extract an OpenAI error body from an unknown value.
 * Returns null when the value doesn't look like an OpenAI error response.
 * @internal
 */
function extractOpenAIBody(candidate: unknown): OpenAIErrorBody | null {
  if (candidate === null || typeof candidate !== "object") return null;
  const obj = candidate as Record<string, unknown>;
  if (!("error" in obj)) return null;
  const err = obj["error"];
  if (err === null || typeof err !== "object") return null;
  return obj as OpenAIErrorBody;
}

/**
 * Returns a short, actionable hint for well-known OpenAI HTTP status codes.
 * @internal
 */
function openAIHintForStatus(status: number): string | undefined {
  switch (status) {
    case 400: return "Check that your request payload is correctly formatted.";
    case 401: return "Verify your OPENAI_API_KEY is set and has not expired.";
    case 403: return "Your API key does not have permission for this resource.";
    case 404: return "The requested model or resource was not found — check the model name.";
    case 429: return "You have exceeded your rate limit. Reduce request frequency or upgrade your OpenAI plan.";
    case 500: return "OpenAI is experiencing an internal issue. Retry with exponential back-off.";
    case 503: return "OpenAI is temporarily unavailable. Retry after a short delay.";
    default:  return undefined;
  }
}

/**
 * Normalizes an error originating from the OpenAI API into an AICoreError.
 *
 * Accepts two shapes:
 *  1. A `Response`-like object (has `status: number` and an async `.json()`)
 *     — preferred when you can `await response.json()` before calling this.
 *  2. Any `Error`-like object (has `message: string`).
 *  3. Anything else — wrapped generically.
 *
 * This function never throws.
 *
 * @example
 * ```ts
 * const body = await response.json().catch(() => null);
 * const err  = normalizeOpenAIError({ error: body ?? response, requestId: callId });
 * ```
 */
export function normalizeOpenAIError(input: {
  error: unknown;
  requestId?: string;
}): AICoreError {
  const { error: raw, requestId } = input;

  // ── Branch 1: Response-like object (already-parsed body or raw Response) ──
  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    // Has .status (Response / axios-like)
    const status = typeof obj["status"] === "number" ? obj["status"] : undefined;

    // Check for parsed OpenAI body shape: { error: { type, code, message } }
    const body = extractOpenAIBody(obj);
    const providerCode = body?.error?.code ?? body?.error?.type ?? undefined;
    const providerMsg  = body?.error?.message ?? undefined;
    const isRateLimit  = status === 429;

    if (status !== undefined) {
      const hint = openAIHintForStatus(status);
      const type: AICoreErrorType = isRateLimit ? "rate_limit_error" : "provider_error";

      const code = isRateLimit
        ? "OPENAI_RATE_LIMIT"
        : providerCode
          ? `OPENAI_${String(providerCode).toUpperCase().replace(/[^A-Z0-9]/g, "_")}`
          : `OPENAI_HTTP_${status}`;

      const message = providerMsg
        ?? (isRateLimit ? "OpenAI rate limit exceeded." : `OpenAI returned HTTP ${status}.`);

      return {
        type,
        code,
        message,
        ...(hint      !== undefined && { hint }),
        ...(requestId !== undefined && { requestId }),
        details: buildDetails({
          provider: "openai",
          httpStatusCode: status,
          ...(providerCode !== undefined && { providerErrorCode: String(providerCode) }),
          rawProviderError: raw,
        }),
      };
    }

    // Object without .status — could be a parsed body passed directly
    if (body) {
      const providerCode2 = body.error?.code ?? body.error?.type ?? undefined;
      const providerMsg2  = body.error?.message ?? "Unknown OpenAI error.";
      const code2 = providerCode2
        ? `OPENAI_${String(providerCode2).toUpperCase().replace(/[^A-Z0-9]/g, "_")}`
        : "OPENAI_ERROR";

      return {
        type: "provider_error",
        code: code2,
        message: providerMsg2,
        ...(requestId !== undefined && { requestId }),
        details: buildDetails({
          provider: "openai",
          ...(providerCode2 !== undefined && { providerErrorCode: String(providerCode2) }),
          rawProviderError: raw,
        }),
      };
    }

    // ── Branch 2: Error instance ──
    if (raw instanceof Error) {
      return {
        type: "provider_error",
        code: "OPENAI_ERROR",
        message: raw.message || "An unexpected OpenAI error occurred.",
        ...(requestId !== undefined && { requestId }),
        details: buildDetails({ provider: "openai", rawProviderError: raw }),
      };
    }
  }

  // ── Branch 3: Primitive or unrecognised value ──
  return {
    type: "provider_error",
    code: "OPENAI_ERROR",
    message: "An unknown error was received from OpenAI.",
    ...(requestId !== undefined && { requestId }),
    details: buildDetails({ provider: "openai", rawProviderError: raw }),
  };
}

/**
 * Normalizes any thrown value produced when the Worker or SDK cannot reach a
 * downstream component (worker_proxy, telemetry_gateway, openai, etc.).
 *
 * This function never throws.
 *
 * @example
 * ```ts
 * try {
 *   const res = await fetch(PROXY_URL, { signal, ... });
 * } catch (err) {
 *   return normalizeNetworkError({ error: err, component: "worker_proxy", requestId: callId });
 * }
 * ```
 */
export function normalizeNetworkError(input: {
  error: unknown;
  component: string;
  requestId?: string;
}): AICoreError {
  const { error: raw, component, requestId } = input;

  return {
    type: "network_error",
    code: "NETWORK_ERROR",
    message: `Failed to reach ${component}.`,
    hint: `Check that ${component} is reachable and retry with exponential back-off.`,
    ...(requestId !== undefined && { requestId }),
    details: buildDetails({ component, rawProviderError: raw }),
  };
}
