import type { AICoreUsageLog } from "@aicore/types";
import { createFileUsageLogger } from "./usageLogger.js";

const LOG_PATH = process.env.AICORE_USAGE_LOG_PATH ?? "./logs/usage.jsonl";
const logger = createFileUsageLogger({ filePath: LOG_PATH });

/**
 * Ingests a single usage log row into the persistent JSONL storage.
 * Calls are serialized to avoid race conditions during file appends.
 */
export async function ingestUsage(row: AICoreUsageLog): Promise<void> {
  return logger.logUsage(row);
}
