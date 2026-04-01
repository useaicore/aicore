import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { AICore } from "../index.js";
import type { ChatMessage, Logger, AICoreError } from "@aicore/types";

describe("AICore SDK", () => {
  let mockLogger: Logger;
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;

  let config: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    mockFetch = jest.fn() as any;
    config = {
      workerUrl: "https://aicore.example.com",
      logger: mockLogger,
      fetch: mockFetch as any,
    };
  });

  const messages: ChatMessage[] = [
    { role: "user", content: "Hello" },
  ];

  describe("Constructor", () => {
    it("should throw if workerUrl is missing", () => {
      expect(() => new AICore({ ...config, workerUrl: "" })).toThrow(
        /workerUrl is required/
      );
    });

    it("should throw if logger is missing", () => {
      expect(() => new AICore({ ...config, logger: undefined as any })).toThrow(
        /logger instance is required/
      );
    });

    it("should throw if fetch is missing and globalThis.fetch is undefined", () => {
      const originalFetch = globalThis.fetch;
      // @ts-ignore
      delete globalThis.fetch;
      expect(() => new AICore({ ...config, fetch: undefined })).toThrow(
        /fetch implementation is missing/
      );
      globalThis.fetch = originalFetch;
    });

    it("should strip trailing slash from workerUrl", () => {
      const sdk = new AICore({ ...config, workerUrl: "https://example.com/" });
      // Accessing private property for test verification
      expect((sdk as any).workerUrl).toBe("https://example.com");
    });
  });

  describe("chat()", () => {
    it("should return data on successful Worker response", async () => {
      const mockData = { id: "chatcmpl-123", choices: [{ message: { content: "Hi!" } }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, data: mockData }),
      } as any as Response);

      const sdk = new AICore(config);
      const result = await sdk.chat(messages);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://aicore.example.com/v1/ai/chat",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ messages }),
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("starting request"),
        expect.anything()
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("success")
      );
    });

    it("should throw AICoreError when Worker returns an error envelope", async () => {
      const mockError: AICoreError = {
        type: "provider_error",
        code: "OPENAI_RATE_LIMIT",
        message: "Too many requests.",
        details: { provider: "openai", httpStatusCode: 429 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ ok: false, error: mockError }),
      } as any as Response);

      const sdk = new AICore(config);
      const promise = sdk.chat(messages);

      await expect(promise).rejects.toThrow("Too many requests.");
      try {
        await promise;
      } catch (err: any) {
        expect(err.code).toBe("OPENAI_RATE_LIMIT");
        expect(err.type).toBe("provider_error");
        expect(err.details).toEqual(mockError.details);
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Worker returned error envelope"),
        undefined,
        expect.objectContaining({ status: 429, error: mockError })
      );
    });

    it("should throw a generic error when Worker returns malformed JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error("Parse error"); },
      } as any as Response);

      const sdk = new AICore(config);
      await expect(sdk.chat(messages)).rejects.toThrow(
        /received malformed JSON from Worker/
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("failed to parse Worker response JSON"),
        expect.any(Error)
      );
    });

    it("should throw network error when fetch itself throws", async () => {
      const networkError = new Error("Network failure");
      mockFetch.mockRejectedValueOnce(networkError);

      const sdk = new AICore(config);
      await expect(sdk.chat(messages)).rejects.toThrow("Network failure");
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("unexpected error during fetch"),
        networkError
      );
    });
  });
});
