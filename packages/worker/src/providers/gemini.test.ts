/**
 * @file gemini.test.ts
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { GeminiProvider } from "./gemini.js";

describe("GeminiProvider", () => {
  let provider: GeminiProvider;
  let mockEnv: any;

  beforeEach(() => {
    provider = new GeminiProvider();
    mockEnv = { GOOGLE_API_KEY: "test-key" };
    globalThis.fetch = jest.fn() as any;
  });

  it("should transform OpenAI messages to Gemini contents and return success", async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: { role: "model", parts: [{ text: "Hello from Gemini!" }] },
          finishReason: "STOP",
          index: 0
        }
      ],
      usageMetadata: {
        promptTokenCount: 12,
        candidatesTokenCount: 8,
        totalTokenCount: 20
      }
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponse,
    });

    const payload = {
      model: "gemini-1.5-flash",
      messages: [{ role: "user", content: "Hello" }]
    };

    const result = await provider.chat({ payload, env: mockEnv });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(mockGeminiResponse);
      expect(result.usage.inputTokens).toBe(12);
      expect(result.usage.outputTokens).toBe(8);
      expect(result.usage.provider).toBe("gemini");
    }

    // Verify fetch call
    const fetchArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
    const fetchUrl = fetchArgs[0] as string;
    const fetchOptions = fetchArgs[1] as any;
    const body = JSON.parse(fetchOptions.body);

    expect(fetchUrl).toContain("gemini-1.5-flash:generateContent");
    expect(fetchUrl).toContain("key=test-key");
    expect(body.contents[0].parts[0].text).toBe("Hello");
    expect(body.contents[0].role).toBe("user");
  });

  it("should handle error responses", async () => {
    const mockError = {
      error: {
        code: 429,
        status: "RESOURCE_EXHAUSTED",
        message: "quota exceeded"
      }
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => mockError,
    });

    const payload = { messages: [{ role: "user", content: "Hi" }] };
    const result = await provider.chat({ payload, env: mockEnv });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("rate_limit_error");
      expect(result.error.code).toBe("GEMINI_RESOURCE_EXHAUSTED");
    }
  });
});
