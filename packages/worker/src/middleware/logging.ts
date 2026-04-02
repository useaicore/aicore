import { createLogger } from "@aicore/logger";
import { type Middleware } from "./compose.js";

const logger = createLogger("worker");

/**
 * High-fidelity logging middleware for the Cloudflare Worker.
 * Tracks latency, status codes, and request metadata.
 */
export const withLogging: Middleware = async (ctx, next) => {
  const { request, startTime } = ctx;
  const url = new URL(request.url);
  const requestId = crypto.randomUUID();

  // Attach requestId to state for downstream use
  ctx.state.requestId = requestId;

  logger.info("Incoming Request", {
    requestId,
    method: request.method,
    path: url.pathname,
    userAgent: request.headers.get("user-agent"),
  });

  try {
    const response = await next();
    const duration = Date.now() - startTime;

    logger.info("Request Completed", {
      requestId,
      status: response.status,
      durationMs: duration,
    });

    // Inject requestId into response headers for observability
    response.headers.set("x-aicore-request-id", requestId);
    return response;
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error("Request Failed", err, { requestId, durationMs: duration });
    throw err;
  }
};
