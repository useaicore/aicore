import { startUsageLogConsumer } from "../src/queueConsumer.js";

/**
 * Main entry point for running the BullMQ Usage Log Consumer locally.
 * Run with: npx tsx --env-file=.env packages/logger/scripts/runUsageConsumer.ts
 */
async function run() {
  console.log("🚀 Starting usage log consumer...");

  const concurrency = process.env.AICORE_USAGE_CONCURRENCY 
    ? parseInt(process.env.AICORE_USAGE_CONCURRENCY, 10) 
    : undefined;

  const { close } = startUsageLogConsumer({ concurrency });

  console.log(`✅ Consumer started (concurrency: ${concurrency ?? 1}). Waiting for jobs...`);

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down consumer...`);
    try {
      await close();
      console.log("👋 Consumer shut down gracefully.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

run().catch((err) => {
  console.error("💥 Failed to start consumer:", err);
  process.exit(1);
});
