/**
 * @file groq.test.ts
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { GroqProvider } from "./groq.js";

describe("GroqProvider", () => {
  let provider: GroqProvider;
  let mockEnv: any;

  beforeEach(() => {
    provider = new GroqProvider();
    mockEnv = { GROQ_API_KEY: "test-key" };
    globalThis.fetch = jest.fn() as any;
  });

  it("should return success for a standard chat request", async () => {
    const mockGroqResponse = {
      choices: [{ message: { role: "assistant", content: "Hello from Groq!" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 15, completion_tokens: 25 },
      model: "llama-3.1-70b-versatile"
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    });

    const payload = {
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: "Hi" }]
    };

    const result = await provider.chat({ payload, env: mockEnv });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(mockGroqResponse);
      expect(result.usage.inputTokens).toBe(15);
      expect(result.usage.outputTokens).toBe(25);
      expect(result.usage.provider).toBe("groq");
    }

    // Verify fetch call
    const fetchArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
    const fetchUrl = fetchArgs[0] as string;
    const fetchOptions = fetchArgs[1] as any;

    expect(fetchUrl).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(fetchOptions.headers["Authorization"]).toBe("Bearer test-key");
  });

  it("should handle error responses", async () => {
    const mockError = {
      error: {
        message: "Invalid API key",
        type: "authentication_error",
        code: "invalid_api_key"
      }
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => mockError,
    });

    const payload = { messages: [{ role: "user", content: "Hi" }] };
    const result = await provider.chat({ payload, env: mockEnv });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("GROQ_INVALID_API_KEY");
      expect(result.error.type).toBe("provider_error");
    }
  });
});
