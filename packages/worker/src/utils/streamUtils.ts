/**
 * @module utils/streamUtils
 *
 * Utilities for normalizing and emitting Server-Sent Events (SSE).
 */

import { type StreamChunk } from "@aicore/types";

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
  const { readable, writable } = new TransformStream<StreamChunk, string>({
    transform(chunk, controller) {
      controller.enqueue(encodeSseEvent(chunk));
    },
  });

  const body = readable.pipeThrough(new TextEncoderStream());

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
 * Useful for errors that occur during the initial stream setup.
 */
export function createErrorStream(chunk: StreamChunk): ReadableStream<StreamChunk> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(chunk);
      controller.close();
    },
  });
}
