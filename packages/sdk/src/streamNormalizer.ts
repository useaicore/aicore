/**
 * @module sdk/streamNormalizer
 *
 * SSE parsing logic for the AICore SDK.
 */

import { type StreamChunk } from "@aicore/types";

/**
 * Normalizes a fetch Response body (ReadableStream) into an AsyncIterable of StreamChunks.
 */
export class StreamNormalizer {
  /**
   * Consumes a ReadableStream of bytes and yields normalized StreamChunks.
   */
  async *normalize(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamChunk> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
          } catch (err) {
            // Ignore malformed JSON chunks in the client
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
