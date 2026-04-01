/**
 * @module errors/providers/anthropic
 */

import { type AICoreError, type AICoreErrorType, buildDetails } from "../core.js";

/**
 * Shape that the Anthropic REST API returns inside a non-2xx response body.
 * @internal
 */
interface AnthropicErrorBody {
  type: string;
  error?: {
    type?: string;
    message?: string;
  };
}

/**
 * Attempts to extract an Anthropic error body from an unknown value.
 * @internal
 */
function extractAnthropicBody(candidate: unknown): AnthropicErrorBody | null {
  if (
    candidate !== null &&
    typeof candidate === "object" &&
    "type" in candidate &&
    (candidate as Record<string, unknown>).type === "error" &&
    "error" in candidate &&
    typeof (candidate as Record<string, unknown>).error === "object"
  ) {
    return candidate as unknown as AnthropicErrorBody;
  }
  return null;
}

/**
 * Returns a short, actionable hint for well-known Anthropic error types.
 * @internal
 */
function anthropicHintForType(type: string): string | undefined {
  switch (type) {
    case "authentication_error": return "Verify your ANTHROPIC_API_KEY is set and valid.";
    case "permission_error": return "Your API key does not have permission for this resource.";
    case "not_found_error": return "The requested model or resource was not found — check the model name.";
    case "rate_limit_error": return "You have exceeded your Anthropic rate limit. Reduce request frequency.";
    case "overloaded_error": return "Anthropic is currently overloaded. Retry with exponential back-off.";
    case "api_error": return "Anthropic is experiencing an internal issue. Retry later.";
    default: return undefined;
  }
}

/**
 * Normalizes an error originating from the Anthropic Messages API into an AICoreError.
 */
export function normalizeAnthropicError(input: {
  error: unknown;
  requestId?: string;
}): AICoreError {
  const { error: raw, requestId } = input;

  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const status = typeof obj["status"] === "number" ? obj["status"] : undefined;
    const body = extractAnthropicBody(obj);
    
    // Anthropic errors have a top-level type: "error" and an inner error.type
    const providerType = body?.error?.type ?? undefined;
    const providerMsg  = body?.error?.message ?? undefined;
    const isRateLimit  = status === 429 || providerType === "rate_limit_error";

    if (status !== undefined || providerType !== undefined) {
      const type: AICoreErrorType = isRateLimit ? "rate_limit_error" : "provider_error";
      const hint = providerType ? anthropicHintForType(providerType) : undefined;

      const code = isRateLimit
        ? "ANTHROPIC_RATE_LIMIT"
        : providerType
          ? `ANTHROPIC_${String(providerType).toUpperCase().replace(/[^A-Z0-9]/g, "_")}`
          : status
            ? `ANTHROPIC_HTTP_${status}`
            : "ANTHROPIC_ERROR";

      const message = providerMsg
        ?? (isRateLimit ? "Anthropic rate limit exceeded." : `Anthropic error (type: ${providerType ?? 'unknown'}).`);

      return {
        type,
        code,
        message,
        ...(hint      !== undefined && { hint }),
        ...(requestId !== undefined && { requestId }),
        details: buildDetails({
          provider: "anthropic",
          httpStatusCode: status,
          ...(providerType !== undefined && { providerErrorCode: String(providerType) }),
          rawProviderError: raw,
        }),
      };
    }

    if (raw instanceof Error) {
      return {
        type: "provider_error",
        code: "ANTHROPIC_ERROR",
        message: raw.message || "An unexpected Anthropic error occurred.",
        ...(requestId !== undefined && { requestId }),
        details: buildDetails({ provider: "anthropic", rawProviderError: raw }),
      };
    }
  }

  return {
    type: "provider_error",
    code: "ANTHROPIC_ERROR",
    message: "An unknown error was received from Anthropic.",
    ...(requestId !== undefined && { requestId }),
    details: buildDetails({ provider: "anthropic", rawProviderError: raw }),
  };
}
