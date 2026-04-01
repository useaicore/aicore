/**
 * @file groqError.test.ts
 */

import { describe, it, expect } from "@jest/globals";
import { normalizeGroqError } from "../errors/providers/groq.js";

describe("normalizeGroqError", () => {
  it("normalizes an authentication_error", () => {
    const errorBody = {
      error: {
        message: "Invalid API key",
        type: "authentication_error",
        code: "invalid_api_key"
      }
    };

    const result = normalizeGroqError({ error: errorBody });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("GROQ_INVALID_API_KEY");
    expect(result.message).toBe("Invalid API key");
    expect(result.hint).toContain("Verify your GROQ_API_KEY");
  });

  it("normalizes a rate_limit_exceeded error", () => {
    const errorBody = {
      error: {
        message: "Rate limit reached",
        type: "rate_limit_exceeded",
        code: "rate_limit_exceeded"
      }
    };

    const result = normalizeGroqError({ error: errorBody });

    expect(result.type).toBe("rate_limit_error");
    expect(result.code).toBe("GROQ_RATE_LIMIT_EXCEEDED");
    expect(result.message).toBe("Rate limit reached");
    expect(result.hint).toContain("exceeded your Groq rate limit");
  });

  it("normalizes an invalid_request_error", () => {
    const errorBody = {
      error: {
        message: "Missing messages",
        type: "invalid_request_error"
      }
    };

    const result = normalizeGroqError({ error: errorBody });

    expect(result.type).toBe("validation_error");
    expect(result.code).toBe("GROQ_ERROR");
  });

  it("handles generic Error objects", () => {
    const error = new Error("Network timeout");
    const result = normalizeGroqError({ error });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("GROQ_ERROR");
    expect(result.message).toBe("Network timeout");
  });
});
