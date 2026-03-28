import { Redis } from 'ioredis';

/**
 * Shared Redis connection properties required by BullMQ.
 * 
 * Precedence:
 * 1. REDIS_URL (e.g., redis://user:pass@host:port) - Primary for Upstash.
 * 2. REDIS_HOST/REDIS_PORT/REDIS_PASSWORD - Fallback for local dev.
 * 
 * IMPORTANT: 
 * We return a live IORedis instance to ensure REDIS_URL is parsed correctly
 * as a connection string, avoiding 'getaddrinfo EAI_FAIL' errors caused by
 * passing a full URL in the 'host' field.
 */
export function getRedisConnection(): Redis {
  const REDIS_URL = process.env.REDIS_URL;
  const USE_TLS = process.env.AICORE_REDIS_TLS === 'true';

  const baseOptions = {
    // BullMQ mandatory setting for ioredis
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: USE_TLS ? {} : undefined,
  };

  if (REDIS_URL) {
    // When using REDIS_URL, ioredis REQUIRES it as the first argument, 
    // not as a property on the options object.
    return new Redis(REDIS_URL, baseOptions);
  }

  // Fallback to separate host/port only if REDIS_URL is missing
  return new Redis({
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
    ...baseOptions,
  });
}
