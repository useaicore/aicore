/**
 * @file anthropicError.test.ts
 */

import { describe, it, expect } from "@jest/globals";
import { normalizeAnthropicError } from "../errors/providers/anthropic.js";

describe("normalizeAnthropicError", () => {
  it("normalizes an authentication_error (401)", () => {
    const errorBody = {
      type: "error",
      error: {
        type: "authentication_error",
        message: "invalid api key"
      }
    };

    const result = normalizeAnthropicError({ error: { status: 401, ...errorBody } });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("ANTHROPIC_AUTHENTICATION_ERROR");
    expect(result.message).toBe("invalid api key");
    expect(result.hint).toContain("Verify your ANTHROPIC_API_KEY");
  });

  it("normalizes a rate_limit_error (429)", () => {
    const errorBody = {
      type: "error",
      error: {
        type: "rate_limit_error",
        message: "too many requests"
      }
    };

    const result = normalizeAnthropicError({ error: { status: 429, ...errorBody } });

    expect(result.type).toBe("rate_limit_error");
    expect(result.code).toBe("ANTHROPIC_RATE_LIMIT");
    expect(result.message).toBe("too many requests");
    expect(result.hint).toContain("exceeded your Anthropic rate limit");
  });

  it("normalizes a generic api_error (500)", () => {
    const errorBody = {
      type: "error",
      error: {
        type: "api_error",
        message: "internal error"
      }
    };

    const result = normalizeAnthropicError({ error: { status: 500, ...errorBody } });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("ANTHROPIC_API_ERROR");
    expect(result.message).toBe("internal error");
  });

  it("handles non-structured Error objects", () => {
    const error = new Error("Network timeout");
    const result = normalizeAnthropicError({ error });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("ANTHROPIC_ERROR");
    expect(result.message).toBe("Network timeout");
  });

  it("handles unknown values", () => {
    const result = normalizeAnthropicError({ error: "Something went wrong" });

    expect(result.type).toBe("provider_error");
    expect(result.code).toBe("ANTHROPIC_ERROR");
    expect(result.message).toContain("unknown error");
  });
});
