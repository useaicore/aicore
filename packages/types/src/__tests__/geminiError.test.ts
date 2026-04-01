/**
 * @file geminiError.test.ts
 */

import { describe, it, expect } from "@jest/globals";
import { normalizeGeminiError } from "../errors/providers/gemini.js";

describe("normalizeGeminiError", () => {
  it("normalizes an UNAUTHENTICATED error", () => {
    const errorBody = {
      error: {
        code: 401,
        message: "API key not valid",
        status: "UNAUTHENTICATED"
      }
    };

    const result = normalizeGeminiError({ error: errorBody });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("GEMINI_UNAUTHENTICATED");
    expect(result.message).toBe("API key not valid");
    expect(result.hint).toContain("Verify your GOOGLE_API_KEY");
  });

  it("normalizes a RESOURCE_EXHAUSTED error", () => {
    const errorBody = {
      error: {
        code: 429,
        message: "exceeded quota",
        status: "RESOURCE_EXHAUSTED"
      }
    };

    const result = normalizeGeminiError({ error: errorBody });

    expect(result.type).toBe("rate_limit_error");
    expect(result.code).toBe("GEMINI_RESOURCE_EXHAUSTED");
    expect(result.message).toBe("exceeded quota");
    expect(result.hint).toContain("exceeded your Gemini rate limit");
  });

  it("normalizes an INVALID_ARGUMENT error", () => {
    const errorBody = {
      error: {
        code: 400,
        message: "malformed request",
        status: "INVALID_ARGUMENT"
      }
    };

    const result = normalizeGeminiError({ error: errorBody });

    expect(result.type).toBe("validation_error");
    expect(result.code).toBe("GEMINI_INVALID_ARGUMENT");
  });

  it("handles generic Error objects", () => {
    const error = new Error("Network issue");
    const result = normalizeGeminiError({ error });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("GEMINI_ERROR");
    expect(result.message).toBe("Network issue");
  });
});
