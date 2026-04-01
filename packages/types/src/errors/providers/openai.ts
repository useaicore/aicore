/**
 * @module errors/providers/openai
 */

import { type AICoreError, type AICoreErrorType, buildDetails } from "../core.js";

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
 */
export function normalizeOpenAIError(input: {
  error: unknown;
  requestId?: string;
}): AICoreError {
  const { error: raw, requestId } = input;

  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const status = typeof obj["status"] === "number" ? obj["status"] : undefined;
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

  return {
    type: "provider_error",
    code: "OPENAI_ERROR",
    message: "An unknown error was received from OpenAI.",
    ...(requestId !== undefined && { requestId }),
    details: buildDetails({ provider: "openai", rawProviderError: raw }),
  };
}
