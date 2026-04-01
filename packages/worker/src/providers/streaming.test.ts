/**
 * @file streaming.test.ts
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";

describe("Streaming Normalization", () => {
  describe("OpenAIProvider", () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider();
    });

    it("should normalize OpenAI chunks", async () => {
      const mockChunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      const nativeStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          for (const chunk of mockChunks) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        }
      });

      // @ts-ignore - access private for test
      const stream = provider.createNormalizedStream(nativeStream, "gpt-4o");
      const reader = stream.getReader();

      const events = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        events.push(value);
      }

      expect(events[0]).toEqual({ type: "message_start", model: "gpt-4o" });
      expect(events[1]).toEqual({ type: "text_delta", delta: "Hello" });
      expect(events[2]).toEqual({ type: "text_delta", delta: " world" });
      expect(events[3]).toEqual({ type: "message_end" });
    });
  });

  describe("AnthropicProvider", () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider();
    });

    it("should normalize Anthropic events", async () => {
      const mockChunks = [
        'event: message_start\ndata: {"message": {"usage": {"input_tokens": 10, "output_tokens": 0}}}\n\n',
        'event: content_block_delta\ndata: {"delta": {"text": "Hi Anthropic"}}\n\n',
        'event: message_stop\ndata: {}\n\n'
      ];

      const nativeStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          for (const chunk of mockChunks) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        }
      });

      // @ts-ignore
      const stream = provider.createNormalizedStream(nativeStream, "claude-3");
      const reader = stream.getReader();

      const events = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        events.push(value);
      }

      expect(events[0]).toEqual({ type: "message_start", model: "claude-3" });
      expect(events[1]).toEqual({ type: "usage", inputTokens: 10, outputTokens: 0 });
      expect(events[2]).toEqual({ type: "text_delta", delta: "Hi Anthropic" });
      expect(events[3]).toEqual({ type: "message_end" });
    });
  });
});
