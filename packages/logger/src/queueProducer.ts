import { Queue } from "bullmq";
import type { AICoreUsageLog } from "@aicore/types";
import { getRedisConnection } from "./redisConnection.js";

const QUEUE_NAME = "aicore-usage-logs";
const JOB_NAME = "usage-log";

let usageQueue: Queue<AICoreUsageLog> | null = null;

/**
 * Singleton getter for the BullMQ usage Queue.
 * 
 * - Queue name: aicore-usage-logs
 * - Connection: Shared IORedis instance from redisConnection.ts
 */
export function getUsageQueue(): Queue<AICoreUsageLog> {
  if (!usageQueue) {
    usageQueue = new Queue<AICoreUsageLog>(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    });
  }
  return usageQueue;
}

/**
 * Enqueues a usage log job for background consumption.
 * 
 * @param row The validated AICoreUsageLog to ingest.
 */
export async function enqueueUsageLog(row: AICoreUsageLog): Promise<void> {
  const queue = getUsageQueue();
  await queue.add(JOB_NAME, row);
}

/**
 * Gracefully closes the queue connection.
 */
export async function closeUsageQueue(): Promise<void> {
  if (usageQueue) {
    await usageQueue.close();
    usageQueue = null;
  }
}
