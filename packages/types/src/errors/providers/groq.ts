/**
 * @module errors/providers/groq
 *
 * Normalization logic for Groq (OpenAI-compatible) API errors.
 */

import { type AICoreError, type AICoreErrorType, buildDetails } from "../core.js";

/**
 * Shape of an OpenAI-compatible error body used by Groq.
 */
interface GroqErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: string;
    param?: string;
  };
}

/**
 * Maps Groq (OpenAI-like) error types to AICoreError types.
 */
function mapGroqTypeToType(type: string | undefined): AICoreErrorType {
  switch (type) {
    case "invalid_request_error":
      return "validation_error";
    case "rate_limit_exceeded":
    case "insufficient_quota":
      return "rate_limit_error";
    case "authentication_error":
      return "provider_error";
    default:
      return "provider_error";
  }
}

/**
 * Normalizes a Groq error into a uniform AICoreError.
 */
export function normalizeGroqError(params: {
  error: unknown;
  requestId?: string;
}): AICoreError {
  const { error, requestId } = params;

  if (error && typeof error === "object" && "error" in error) {
    const body = error as GroqErrorBody;
    if (body.error) {
      const { message, code, type } = body.error;
      const normalizedType = mapGroqTypeToType(type);

      let hint = "Check your Groq API key and project settings.";
      if (type === "rate_limit_exceeded") {
        hint = "You have exceeded your Groq rate limit. Consider upgrading your tier or reducing request frequency.";
      } else if (type === "authentication_error") {
        hint = "Verify your GROQ_API_KEY is valid and has been added to the Worker secrets.";
      }

      return {
        type: normalizedType,
        code: code ? `GROQ_${code.toUpperCase()}` : "GROQ_ERROR",
        message: message ?? "An unknown error occurred in the Groq adapter.",
        hint,
        requestId,
        details: buildDetails({ provider: "groq", rawProviderError: body.error }),
      };
    }
  }

  // Fallback for generic errors
  const message = error instanceof Error ? error.message : String(error);
  return {
    type: "provider_error",
    code: "GROQ_ERROR",
    message: message || "An unexpected error occurred in the Groq adapter.",
    requestId,
    details: buildDetails({ provider: "groq", rawProviderError: error }),
  };
}
