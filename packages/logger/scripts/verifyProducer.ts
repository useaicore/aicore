import type { AICoreUsageLog } from "@aicore/types";
import { enqueueUsageLog, closeUsageQueue } from "../src/index.js";
import { getRedisConnection } from "../src/redisConnection.js";

/**
 * Manual verification script for the BullMQ Producer.
 * Run with: npx tsx --env-file=.env packages/logger/scripts/verifyProducer.ts
 * 
 * Note: Requires a Redis instance to be reachable (configured via .env).
 */
async function verify() {
  console.log("🔍 Checking Redis connectivity...");
  const redis = getRedisConnection();

  // Handle background error events to avoid "Unhandled error event" noise
  redis.on('error', (err: any) => {
    if (process.env.DEBUG) console.error("[ioredis background]", err.message);
  });

  try {
    const pong = await redis.ping();
    console.log(`✅ Redis ping successful: ${pong}`);
  } catch (err: any) {
    console.error("❌ Redis connection failed:", err.message);
    process.exit(1);
  }

  const testLog: AICoreUsageLog = {
    callId: `verify_${Date.now()}`,
    workspaceId: "ws_verify",
    timestampMs: Date.now(),
    feature: "verification" as any,
    taskType: "generation",
    model: "gpt-mock",
    provider: "openai",
    planTier: "pro",
    environment: "development",
    inputTokens: 100,
    outputTokens: 200,
    totalTokens: 300,
    costCents: 5,
    latencyMs: 450,
    isShadowCall: false,
    shadowMode: false,
    statusCode: 200,
    isError: false,
  };

  console.log("🚀 Attempting to enqueue test job to BullMQ...");
  console.log(`Queue Name: aicore-usage-logs`);

  try {
    await enqueueUsageLog(testLog);
    console.log("✅ Success! Job added to 'aicore-usage-logs' queue.");
  } catch (err) {
    console.error("❌ Failed to enqueue job:", err);
    process.exit(1);
  } finally {
    await closeUsageQueue();
    console.log("Shutting down queue connection...");
  }
}

verify().catch(console.error);
