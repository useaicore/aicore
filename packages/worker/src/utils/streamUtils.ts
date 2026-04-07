/**
 * @module utils/streamUtils
 *
 * Support for normalizing SSE and mapping provider-specific messages.
 */

import { type StreamChunk, type ChatMessage } from "@aicore/types";

/**
 * Encodes an object as an SSE data block.
 * @internal
 */
function encodeSseEvent(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Creates a Cloudflare Worker Response with the experimental-stream
 * Content-Type, delivering a stream of normalized StreamChunks as SSE.
 */
export function createSseResponse(stream: ReadableStream<StreamChunk>): Response {
  const sseTransform = new TransformStream<StreamChunk, string>({
    transform(chunk, controller) {
      controller.enqueue(encodeSseEvent(chunk));
    },
  });

  const body = stream
    .pipeThrough(sseTransform)
    .pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache",
      "Connection":        "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Helper to create a stream from a single error chunk.
 */
export function createErrorStream(chunk: StreamChunk): ReadableStream<StreamChunk> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(chunk);
      controller.close();
    },
  });
}

/**
 * ── Provider Specific Mapping Helpers ──
 */

/**
 * Extracts a 'system' parameter and a 'messages' array for Anthropic.
 * Ensures strict alternating user/assistant sequence.
 */
export function toAnthropicMessages(messages: ChatMessage[]): {
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  let system: string | undefined;
  const filteredMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const m of messages) {
    if (m.role === "system") {
      system = m.content;
    } else if (m.role === "user" || m.role === "assistant") {
      filteredMessages.push({ role: m.role, content: m.content });
    }
  }

  // Anthropic requires the first message to be "user"
  if (filteredMessages.length > 0 && filteredMessages[0].role === "assistant") {
    filteredMessages.unshift({ role: "user", content: "..." });
  }

  return { system, messages: filteredMessages };
}

/**
 * Maps OpenAI messages to Gemini contents.
 */
export function toGeminiContents(messages: ChatMessage[]): {
  systemInstruction?: { parts: [{ text: string }] };
  contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }>;
} {
  let systemInstruction: { parts: [{ text: string }] } | undefined;
  const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemInstruction = { parts: [{ text: m.content }] };
    } else {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      });
    }
  }

  return { systemInstruction, contents };
}

/**
 * ── SSE Transformer ──
 */

export interface SseEvent {
  event?: string;
  data: string;
}

/**
 * A TransformStream that buffers a native Uint8Array stream and emits parsed SSE events.
 */
export function createSseTransformer<T = SseEvent>(
  onChunk: (event: SseEvent, controller: TransformStreamDefaultController<T>) => void
): TransformStream<Uint8Array, T> {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent: string | undefined;

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("event: ")) {
          currentEvent = trimmed.slice(7);
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          onChunk({ event: currentEvent, data }, controller);
          currentEvent = undefined; // Reset after data block
        }
      }
    }
  });
}
