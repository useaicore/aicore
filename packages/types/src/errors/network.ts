/**
 * @module errors/network
 */

import { type AICoreError, buildDetails } from "./core.js";

/**
 * Normalizes any thrown value produced when the Worker or SDK cannot reach a
 * downstream component (worker_proxy, telemetry_gateway, openai, etc.).
 *
 * This function never throws.
 *
 * @example
 * ```ts
 * try {
 *   const res = await fetch(PROXY_URL, { signal, ... });
 * } catch (err) {
 *   return normalizeNetworkError({ error: err, component: "worker_proxy", requestId: callId });
 * }
 * ```
 */
export function normalizeNetworkError(input: {
  error: unknown;
  component: string;
  requestId?: string;
}): AICoreError {
  const { error: raw, component, requestId } = input;

  return {
    type: "network_error",
    code: "NETWORK_ERROR",
    message: `Failed to reach ${component}.`,
    hint: `Check that ${component} is reachable and retry with exponential back-off.`,
    ...(requestId !== undefined && { requestId }),
    details: buildDetails({ component, rawProviderError: raw }),
  };
}
