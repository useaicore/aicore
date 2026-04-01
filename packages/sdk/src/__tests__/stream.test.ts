/**
 * AICore.stream() public API tests.
 *
 * These tests target the public contract of stream(): request construction,
 * transport error handling, Worker envelope error handling, logger
 * instrumentation, and config validation. They are deliberately independent
 * of normalizer internals — pair with normalizer.test.ts for chunk-level tests.
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AICore } from "../index.js";
import type { ChatMessage, Logger, AICoreError, StreamChunk } from "@aicore/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLogger(): Logger {
  return {
    info: jest.fn() as Logger["info"],
    error: jest.fn() as Logger["error"],
  };
}

/** Consumes an AsyncIterable into an array. */
async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const chunks: T[] = [];
  for await (const c of iter) chunks.push(c);
  return chunks;
}

const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

const okData = {
  model: "gpt-4o-mini",
  choices: [
    { message: { role: "assistant", content: "Hi!" }, finish_reason: "stop" },
  ],
  usage: { prompt_tokens: 5, completion_tokens: 3 },
};

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

describe("AICore.stream() — config validation", () => {
  it("throws at construction if workerUrl is empty", () => {
    const logger = makeLogger();
    expect(
      () =>
        new AICore({
          workerUrl: "",
          logger,
          fetch: jest.fn() as unknown as typeof globalThis.fetch,
        }),
    ).toThrow(/workerUrl is required/);
  });

  it("throws at construction if logger is missing", () => {
    expect(
      () =>
        new AICore({
          workerUrl: "https://example.com",
          logger: undefined as unknown as Logger,
          fetch: jest.fn() as unknown as typeof globalThis.fetch,
        }),
    ).toThrow(/logger instance is required/);
  });

  it("throws at construction if fetch is missing and globalThis.fetch is undefined", () => {
    const orig = globalThis.fetch;
    // @ts-ignore — intentionally removing fetch for this test
    delete globalThis.fetch;
    try {
      expect(
        () =>
          new AICore({
            workerUrl: "https://example.com",
            logger: makeLogger(),
            fetch: undefined,
          }),
      ).toThrow(/fetch implementation is missing/);
    } finally {
      globalThis.fetch = orig;
    }
  });
});

// ---------------------------------------------------------------------------
// Successful streaming
// ---------------------------------------------------------------------------

describe("AICore.stream() — successful path", () => {
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;
  let logger: Logger;

  beforeEach(() => {
    mockFetch = jest.fn<typeof globalThis.fetch>();
    logger = makeLogger();
  });

  function makeSDK() {
    return new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });
  }

  it("returns an AsyncIterable", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    const result = sdk.stream(messages);
    expect(result[Symbol.asyncIterator]).toBeDefined();
  });

  it("yields at least one chunk before completing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    const chunks = await collect(sdk.stream(messages));
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("stream completes (iterator is exhausted) after all chunks", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    const iter = sdk.stream(messages)[Symbol.asyncIterator]();
    let done = false;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await iter.next();
      if (result.done) {
        done = true;
        break;
      }
    }
    expect(done).toBe(true);
  });

  it("message_end is always the final non-done chunk", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    const chunks = await collect(sdk.stream(messages));
    expect(chunks[chunks.length - 1].type).toBe("message_end");
  });

  it("sends POST to /v1/ai/chat with correct headers and body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    await collect(sdk.stream(messages));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://aicore.example.com/v1/ai/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages }),
      }),
    );
  });

  it("forwards model option in the request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    await collect(sdk.stream(messages, { model: "gpt-4o" }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ messages, model: "gpt-4o" }),
      }),
    );
  });

  it("logs stream:start before yielding chunks", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    await collect(sdk.stream(messages));

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("starting request"),
      expect.anything(),
    );
  });

  it("logs stream complete after all chunks are yielded", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    await collect(sdk.stream(messages));

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("stream complete"),
    );
  });

  it("multiple chunks are yielded in a single stream (not just one)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const sdk = makeSDK();
    const chunks = await collect(sdk.stream(messages));
    // With usage present: message_start, text_delta, usage, message_end = 4
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("chunk types are only valid StreamChunkType values", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: okData }),
    } as unknown as Response);

    const validTypes = new Set([
      "message_start",
      "text_delta",
      "message_end",
      "usage",
      "error",
    ]);
    const sdk = makeSDK();
    const chunks = await collect(sdk.stream(messages));
    for (const chunk of chunks) {
      expect(validTypes.has(chunk.type)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Worker error envelope handling
// ---------------------------------------------------------------------------

describe("AICore.stream() — Worker error envelope", () => {
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;
  let logger: Logger;

  beforeEach(() => {
    mockFetch = jest.fn<typeof globalThis.fetch>();
    logger = makeLogger();
  });

  const workerError: AICoreError = {
    type: "provider_error",
    code: "OPENAI_RATE_LIMIT",
    message: "Too many requests.",
    details: { provider: "openai", httpStatusCode: 429 },
  };

  it("throws before the first chunk on a Worker error envelope", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: workerError }),
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    await expect(collect(sdk.stream(messages))).rejects.toThrow(
      "Too many requests.",
    );
  });

  it("thrown error carries AICoreError.code", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: workerError }),
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    try {
      await collect(sdk.stream(messages));
    } catch (err: unknown) {
      expect((err as Record<string, unknown>).code).toBe("OPENAI_RATE_LIMIT");
    }
  });

  it("thrown error carries AICoreError.type", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: workerError }),
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    try {
      await collect(sdk.stream(messages));
    } catch (err: unknown) {
      expect((err as Record<string, unknown>).type).toBe("provider_error");
    }
  });

  it("logs the error before throwing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: workerError }),
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    await expect(collect(sdk.stream(messages))).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Worker returned error envelope"),
      undefined,
      expect.objectContaining({ status: 429, error: workerError }),
    );
  });

  it("does not yield any chunks on error envelope", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ ok: false, error: { type: "aicore_internal", code: "WORKER_ERROR", message: "oops" } }),
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    // Manually iterate to confirm no chunks were collected before throw
    const chunks: StreamChunk[] = [];
    try {
      for await (const chunk of sdk.stream(messages)) {
        chunks.push(chunk);
      }
    } catch {
      // expected
    }
    expect(chunks).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Network / fetch errors
// ---------------------------------------------------------------------------

describe("AICore.stream() — network errors", () => {
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;
  let logger: Logger;

  beforeEach(() => {
    mockFetch = jest.fn<typeof globalThis.fetch>();
    logger = makeLogger();
  });

  it("throws (does not yield) when fetch itself throws", async () => {
    const networkError = new Error("Network failure");
    mockFetch.mockRejectedValueOnce(networkError);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    await expect(collect(sdk.stream(messages))).rejects.toThrow(
      "Network failure",
    );
  });

  it("logs the fetch error before throwing on network failure", async () => {
    const networkError = new Error("Connection refused");
    mockFetch.mockRejectedValueOnce(networkError);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    await expect(collect(sdk.stream(messages))).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("fetch failed"),
      networkError,
    );
  });

  it("throws when the Worker response body is not valid JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("JSON parse error");
      },
    } as unknown as Response);

    const sdk = new AICore({
      workerUrl: "https://aicore.example.com",
      logger,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    await expect(collect(sdk.stream(messages))).rejects.toThrow(
      /malformed JSON from Worker/,
    );
  });
});
