import { Worker, type Job } from "bullmq";
import type { AICoreUsageLog } from "@aicore/types";
import { getRedisConnection } from "./redisConnection.js";
import { ingestUsage } from "./nodeIngest.js";

const QUEUE_NAME = "aicore-usage-logs";

/**
 * Starts the BullMQ Worker for processing usage logs.
 * 
 * Behavior:
 * - Default concurrency: 1 (strict serialization).
 * - On failure: Logs job details to stderr and lets BullMQ handle retries/failure.
 * - Connection: Uses getRedisConnection() helper.
 * 
 * @param options Configuration for the consumer.
 * @returns An object with a close() method for graceful shutdown.
 */
export function startUsageLogConsumer(options?: {
  concurrency?: number;
}): { close: () => Promise<void> } {
  const concurrency = options?.concurrency ?? 1;
  const connection = getRedisConnection();

  const worker = new Worker<AICoreUsageLog>(
    QUEUE_NAME,
    async (job: Job<AICoreUsageLog>) => {
      try {
        await ingestUsage(job.data);
      } catch (err) {
        const { callId, workspaceId } = job.data;
        console.error(
          `[Worker Error] Job ID: ${job.id}, Name: ${job.name}, callId: ${callId}, workspaceId: ${workspaceId} - Failed to ingest usage log.`
        );
        // Rethrow to let BullMQ mark the job as failed and respect backoff
        throw err;
      }
    },
    {
      connection,
      concurrency,
    }
  );

  // Handle worker-level errors (e.g. Redis connection issues) to avoid process crashes
  worker.on("error", (err) => {
    console.error("[Worker Critical Error]", err);
  });

  return {
    close: async () => {
      // worker.close() stops the worker from processing new jobs
      // By default it doesn't close the connection if it was passed in the options
      await worker.close();
      await connection.quit();
    },
  };
}
