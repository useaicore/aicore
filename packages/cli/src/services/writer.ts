import { promises as fs } from "node:fs";
import * as path from "node:path";
import { exists, ensureDir } from "../utils/fs-utils.js";

/**
 * Result of a safe file write operation.
 */
export type WriteStatus = "created" | "skipped" | "overwritten";

/**
 * Result of a batch write operation.
 */
export interface BatchWriteResult {
  stats: Record<string, WriteStatus>;
  counts: {
    created: number;
    skipped: number;
    overwritten: number;
  };
}

/**
 * Writes a file only if it doesn't exist or if force is true.
 * Returns the status of the operation.
 */
export async function safeWrite(
  filePath: string,
  content: string,
  options: { force?: boolean } = {}
): Promise<WriteStatus> {
  const fileExists = await exists(filePath);
  if (fileExists && !options.force) {
    return "skipped";
  }

  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
  return fileExists ? "overwritten" : "created";
}

/**
 * Creates a batch write result from a record of statuses.
 */
export function createBatchResult(stats: Record<string, WriteStatus>): BatchWriteResult {
  const counts = { created: 0, skipped: 0, overwritten: 0 };
  for (const status of Object.values(stats)) {
    counts[status]++;
  }
  return { stats, counts };
}
