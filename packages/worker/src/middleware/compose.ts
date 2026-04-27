import { type Env } from "../providers/providerAdapter.js";

/**
 * Core middleware context for Cloudflare Worker.
 */
export interface MiddlewareContext {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
  state: Record<string, any>;
  startTime: number;
}

/**
 * Middleware function signature.
 */
export type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<Response>
) => Promise<Response>;

/**
 * Composes a chain of middleware into a single fetch-style handler.
 */
export function compose(...middlewares: Middleware[]): (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => Promise<Response> {
  return async (request, env, ctx) => {
    const timestampMs = Date.now();
    const context: MiddlewareContext = {
      request,
      env,
      ctx,
      state: {},
      startTime: timestampMs,
    };

    let index = -1;

    async function dispatch(i: number): Promise<Response> {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) {
        return new Response("Not Found", { status: 404 });
      }
      try {
        return await fn(context, () => dispatch(i + 1));
      } catch (err) {
        throw err;
      }
    }

    return dispatch(0);
  };
}
