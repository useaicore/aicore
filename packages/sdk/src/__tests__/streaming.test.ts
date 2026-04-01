/**
 * @file sdk/streaming.test.ts
 */

import { jest, describe, it, expect } from "@jest/globals";
import { AICore, type ChatMessage } from "../index.js";

describe("AICore.stream", () => {
  const config = {
    endpoint: "https://ai.aicore.dev",
    workspaceId: "test-ws",
  };
  const ai = new AICore(config);

  it("should stream normalized chunks", async () => {
    const mockChunks = [
      'data: {"type": "message_start", "model": "gpt-4"}\n\n',
      'data: {"type": "text_delta", "delta": "Hello"}\n\n',
      'data: {"type": "text_delta", "delta": " platform"}\n\n',
      'data: {"type": "usage", "inputTokens": 5, "outputTokens": 10}\n\n',
      'data: {"type": "message_end"}\n\n'
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

    (globalThis as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: nativeStream,
      headers: new Headers({ "Content-Type": "text/event-stream" })
    });

    const messages: ChatMessage[] = [{ role: "user", content: "Hi" }];
    const options = { 
      feature: "chat", 
      taskType: "code" as any, 
      planTier: "free" as any 
    };

    const chunks = [];
    for await (const chunk of ai.stream(messages, options)) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBe(5);
    expect(chunks[0].type).toBe("message_start");
    expect(chunks[1]).toEqual({ type: "text_delta", delta: "Hello" });
    expect(chunks[2].type).toBe("text_delta");
    expect(chunks[3]).toEqual({ type: "usage", inputTokens: 5, outputTokens: 10 });
    expect(chunks[4].type).toBe("message_end");
  });
});
