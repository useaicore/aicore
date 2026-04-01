/**
 * @module errors/providers/gemini
 *
 * Normalization logic for Google Gemini (Generative Language API) errors.
 */

import { type AICoreError, type AICoreErrorType, buildDetails } from "../core.js";

/**
 * Shape of a Google AI Error body.
 * @see https://cloud.google.com/apis/design/errors
 */
interface GeminiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<unknown>;
  };
}

/**
 * Maps Google API status strings to AICoreError types.
 */
function mapGeminiStatusToType(status: string | undefined): AICoreErrorType {
  switch (status) {
    case "INVALID_ARGUMENT":
      return "validation_error";
    case "UNAUTHENTICATED":
    case "PERMISSION_DENIED":
      return "provider_error";
    case "RESOURCE_EXHAUSTED":
      return "rate_limit_error";
    case "INTERNAL":
    case "UNAVAILABLE":
    case "DEADLINE_EXCEEDED":
      return "provider_error";
    default:
      return "provider_error";
  }
}

/**
 * Maps Google API status strings to canonical AICore codes.
 */
function mapGeminiStatusToCode(status: string | undefined): string {
  return status ? `GEMINI_${status}` : "GEMINI_ERROR";
}

/**
 * Attempts to extract a Gemini error body from an unknown value.
 * @internal
 */
function extractGeminiBody(candidate: unknown): GeminiErrorBody | null {
  if (candidate !== null && typeof candidate === "object" && "error" in candidate) {
    return candidate as GeminiErrorBody;
  }
  return null;
}

/**
 * Normalizes a Google Gemini error into a uniform AICoreError.
 */
export function normalizeGeminiError(params: {
  error: unknown;
  requestId?: string;
}): AICoreError {
  const { error, requestId } = params;
  const body = extractGeminiBody(error);

  if (body?.error) {
    const status = body.error.status;
    const type = mapGeminiStatusToType(status);
    const code = mapGeminiStatusToCode(status);
    const message = body.error.message ?? "An unknown error occurred in the Gemini adapter.";

    let hint = "Check the Gemini API status and your project quota.";
    if (status === "UNAUTHENTICATED") {
      hint = "Verify your GOOGLE_API_KEY is valid and has been added to the Worker secrets.";
    } else if (status === "RESOURCE_EXHAUSTED") {
      hint = "You have exceeded your Gemini rate limit. Consider upgrading your tier or reducing request frequency.";
    }

    return {
      type,
      code,
      message,
      hint,
      requestId,
      details: buildDetails({ provider: "gemini", rawProviderError: body.error }),
    };
  }

  // Fallback for generic errors
  const message = error instanceof Error ? error.message : String(error);
  return {
    type: "provider_error",
    code: "GEMINI_ERROR",
    message: message || "An unexpected error occurred in the Gemini adapter.",
    requestId,
    details: buildDetails({ provider: "gemini", rawProviderError: error }),
  };
}
