/**
 * StreamNormalizer unit tests — isolated from transport.
 *
 * These tests exercise the StreamNormalizer (specifically fromEnvelope()) in
 * isolation from the HTTP transport so that:
 *  - The normalizer's chunk-sequencing logic can be verified independently.
 *  - Future changes to fromSSE() / fromNDJSON() can be tested the same way.
 *  - Failures here point unambiguously to the normalization layer, not to
 *    fetch, config, or envelope parsing.
 *
 * The normalizer is an internal class; we access it via the stream() API
 * with a mocked fetch that returns a pre-built envelope.
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AICore } from "../index.js";
import type { ChatMessage, Logger, StreamChunk } from "@aicore/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLogger(): Logger {
  return { info: jest.fn(), error: jest.fn() };
}

function makeConfig(mockFetch: jest.MockedFunction<typeof globalThis.fetch>) {
  return {
    workerUrl: "https://aicore.example.com",
    logger: makeLogger(),
    fetch: mockFetch as typeof globalThis.fetch,
  };
}

const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

/** Consumes an AsyncIterable into an array. */
async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const chunks: T[] = [];
  for await (const c of iter) chunks.push(c);
  return chunks;
}

/** Builds a mock fetch response from a Worker success envelope. */
function successResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ ok: true, data }),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Standard OpenAI-shaped data payloads
// ---------------------------------------------------------------------------

const openAIData = {
  model: "gpt-4o-mini",
  choices: [
    {
      message: { role: "assistant", content: "Hello there!" },
      finish_reason: "stop",
    },
  ],
  usage: { prompt_tokens: 10, completion_tokens: 5 },
};

const openAIDataNoUsage = {
  model: "gpt-4o-mini",
  choices: [
    {
      message: { role: "assistant", content: "Hi." },
      finish_reason: "stop",
    },
  ],
};

// ---------------------------------------------------------------------------
// fromEnvelope: chunk sequence
// ---------------------------------------------------------------------------

describe("StreamNormalizer.fromEnvelope — via AICore.stream()", () => {
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;

  beforeEach(() => {
    mockFetch = jest.fn();
  });

  it("emits message_start as the first chunk", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const [first] = await collect(sdk.stream(messages));
    expect(first.type).toBe("message_start");
  });

  it("carries the model name in message_start", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const [start] = await collect(sdk.stream(messages));
    if (start.type !== "message_start") throw new Error("wrong type");
    expect(start.model).toBe("gpt-4o-mini");
  });

  it("emits text_delta as the second chunk", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const delta = chunks[1];
    expect(delta.type).toBe("text_delta");
  });

  it("text_delta.delta contains the extracted content string", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const delta = chunks[1];
    if (delta.type !== "text_delta") throw new Error("wrong type");
    expect(delta.delta).toBe("Hello there!");
  });

  it("emits a usage chunk when token data is present", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const usage = chunks.find((c) => c.type === "usage");
    expect(usage).toBeDefined();
    if (usage?.type !== "usage") throw new Error("wrong type");
    expect(usage.inputTokens).toBe(10);
    expect(usage.outputTokens).toBe(5);
  });

  it("does NOT emit a usage chunk when token data is absent", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIDataNoUsage));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    expect(chunks.find((c) => c.type === "usage")).toBeUndefined();
  });

  it("emits message_end as the final chunk", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const last = chunks[chunks.length - 1];
    expect(last.type).toBe("message_end");
  });

  it("carries stopReason in message_end when finish_reason is present", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const end = chunks[chunks.length - 1];
    if (end.type !== "message_end") throw new Error("wrong type");
    expect(end.stopReason).toBe("stop");
  });

  it("full sequence with usage: [message_start, text_delta, usage, message_end]", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIData));
    const sdk = new AICore(makeConfig(mockFetch));
    const types = (await collect(sdk.stream(messages))).map((c) => c.type);
    expect(types).toEqual(["message_start", "text_delta", "usage", "message_end"]);
  });

  it("full sequence without usage: [message_start, text_delta, message_end]", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(openAIDataNoUsage));
    const sdk = new AICore(makeConfig(mockFetch));
    const types = (await collect(sdk.stream(messages))).map((c) => c.type);
    expect(types).toEqual(["message_start", "text_delta", "message_end"]);
  });

  // ── Fallback behaviour ────────────────────────────────────────────────────

  it("falls back to JSON.stringify(data) as text_delta when shape is unrecognised", async () => {
    const unknownData = { result: "something", provider: "future" };
    mockFetch.mockResolvedValueOnce(successResponse(unknownData));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    const delta = chunks.find((c): c is Extract<StreamChunk, { type: "text_delta" }> =>
      c.type === "text_delta",
    );
    expect(delta).toBeDefined();
    expect(delta!.delta).toBe(JSON.stringify(unknownData));
  });

  it("handles a null data payload without throwing", async () => {
    mockFetch.mockResolvedValueOnce(successResponse(null));
    const sdk = new AICore(makeConfig(mockFetch));
    const chunks = await collect(sdk.stream(messages));
    expect(chunks[0].type).toBe("message_start");
    expect(chunks[chunks.length - 1].type).toBe("message_end");
  });

  it("model field is absent in message_start when data has no model", async () => {
    mockFetch.mockResolvedValueOnce(successResponse({ choices: [] }));
    const sdk = new AICore(makeConfig(mockFetch));
    const [start] = await collect(sdk.stream(messages));
    if (start.type !== "message_start") throw new Error("wrong type");
    expect(start.model).toBeUndefined();
  });
});
