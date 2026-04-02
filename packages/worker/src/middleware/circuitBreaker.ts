import { createInternalError, type AICoreProvider } from "@aicore/types";
import { type Middleware } from "./compose.js";

// In-memory health state for providers
const HEALTH_MAP = new Map<string, { failures: number; lastFailure: number }>();
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 60000; // 1 minute

/**
 * High-fidelity Circuit Breaker middleware.
 * Tracks and trips for failing AI providers to protect the system.
 */
export const withCircuitBreaker: Middleware = async (ctx, next) => {
  const { state } = ctx;
  const provider = state.payload?.provider as AICoreProvider;

  if (!provider) return next();

  const health = HEALTH_MAP.get(provider);
  if (health && health.failures >= FAILURE_THRESHOLD) {
    const now = Date.now();
    if (now - health.lastFailure < COOLDOWN_MS) {
      const circuitError = createInternalError({
        code: "PROVIDER_CIRCUIT_TRIPPED",
        message: `Circuit breaker tripped for provider: ${provider}. Cooldown in progress.`,
        component: "worker_proxy",
      });

      return new Response(JSON.stringify({ ok: false, error: circuitError }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Cooldown passed, reset half-open
      HEALTH_MAP.delete(provider);
    }
  }

  try {
    const response = await next();
    if (response.status >= 500) {
      trackFailure(provider);
    } else {
      HEALTH_MAP.delete(provider); // Success resets circuit
    }
    return response;
  } catch (err) {
    trackFailure(provider);
    throw err;
  }
};

function trackFailure(provider: string) {
  const health = HEALTH_MAP.get(provider) || { failures: 0, lastFailure: 0 };
  health.failures++;
  health.lastFailure = Date.now();
  HEALTH_MAP.set(provider, health);
}
