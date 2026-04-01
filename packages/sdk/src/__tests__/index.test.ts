import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { AICore } from "../index.js";
import type { AICoreClientConfig, ChatOptions } from "../index.js";
import type { ChatMessage, Logger, AICoreError } from "@aicore/types";

describe("AICore SDK", () => {
  let mockLogger: Logger;
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;
  let config: AICoreClientConfig;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    mockFetch = jest.fn() as any;
    globalThis.fetch = mockFetch;

    config = {
      endpoint: "https://aicore.example.com/",
      workspaceId: "ws_123",
      workspaceKey: "sk_test",
      logger: mockLogger,
      terminalMetrics: true,
    };
  });

  const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
  const options: ChatOptions = {
    feature: "chat",
    taskType: "generation",
    planTier: "free",
  };

  describe("Constructor", () => {
    it("should throw if endpoint is missing", () => {
      expect(() => new AICore({ ...config, endpoint: "" })).toThrow(/endpoint is required/);
    });

    it("should throw if workspaceId is missing", () => {
      expect(() => new AICore({ ...config, workspaceId: "" })).toThrow(/workspaceId is required/);
    });

    it("should strip trailing slash from endpoint", () => {
      const sdk = new AICore(config);
      // @ts-ignore - accessing private for verification
      expect(sdk.endpoint).toBe("https://aicore.example.com");
    });
  });

  describe("chat()", () => {
    it("should return content on successful OpenAI message response", async () => {
      const mockData = { choices: [{ message: { content: "Hi there!" } }] };
      const mockUsage = { inputTokens: 10, outputTokens: 20, latencyMs: 100, costCents: 1 };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => ({ ok: true, data: mockData, usage: mockUsage }),
      } as any);

      const sdk = new AICore(config);
      const result = await sdk.chat(messages, options);

      expect(result.content).toBe("Hi there!");
      expect(result.usage?.totalTokens).toBe(30);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://aicore.example.com/v1/ai/chat",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-workspace-key": "sk_test",
          }),
        })
      );
    });

    it("should fallback to text field if message.content is missing", async () => {
      const mockData = { choices: [{ text: "Fallback text" }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => ({ ok: true, data: mockData }),
      } as any);

      const sdk = new AICore(config);
      const result = await sdk.chat(messages, options);
      expect(result.content).toBe("Fallback text");
    });

    it("should throw aicoreError when Worker returns { ok: false, error }", async () => {
      const mockError: AICoreError = {
        type: "provider_error",
        code: "RATE_LIMIT",
        message: "Too fast!",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => ({ ok: false, error: mockError }),
      } as any);

      const sdk = new AICore(config);
      try {
        await sdk.chat(messages, options);
        fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Too fast!");
        expect(err.aicoreError).toEqual(mockError);
      }
    });

    it("should throw on malformed JSON envelope", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => { throw new Error("JSON error"); },
      } as any);

      const sdk = new AICore(config);
      await expect(sdk.chat(messages, options)).rejects.toThrow("Invalid AICore response envelope.");
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network down"));

      const sdk = new AICore(config);
      await expect(sdk.chat(messages, options)).rejects.toThrow(/could not reach/);
    });

    it("should emit terminal metrics exactly once when usage exists", async () => {
      const mockData = { choices: [{ message: { content: "Hi" } }] };
      const mockUsage = { inputTokens: 5, outputTokens: 5, latencyMs: 50, costCents: 0 };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => ({ ok: true, data: mockData, usage: mockUsage }),
      } as any);

      const sdk = new AICore(config);
      
      // First call
      await sdk.chat(messages, options);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("[AICore Metrics]"));
      
      // Second call
      jest.clearAllMocks();
      await sdk.chat(messages, options);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe("complete()", () => {
    it("should wrap chat correctly", async () => {
      const mockData = { choices: [{ message: { content: "Response" } }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([["Content-Type", "application/json"]]),
        json: async () => ({ ok: true, data: mockData }),
      } as any);

      const sdk = new AICore(config);
      const result = await sdk.complete("Prompt", options);

      expect(result.text).toBe("Response");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"messages":[{"role":"user","content":"Prompt"}]'),
        })
      );
    });
  });

  describe("stream()", () => {
    it("should throw the explicit not-implemented message", async () => {
      const sdk = new AICore(config);
      const stream = sdk.stream(messages, options);
      
      try {
        await stream.next();
        fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("AICore stream() is not implemented yet. Worker streaming is not wired in Phase 1.");
      }
    });
  });
});

function fail(msg: string) {
  throw new Error(msg);
}
