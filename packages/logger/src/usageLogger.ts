import fs from 'node:fs/promises';
import path from 'node:path';
import type { AICoreUsageLog } from '@aicore/types';

export interface UsageLogger {
  /**
   * Appends a usage log row to the JSONL destination.
   * Enforces runtime invariants for token totals and shadow mode status.
   */
  logUsage(row: AICoreUsageLog): Promise<void>;

  /**
   * Returns a promise that resolves when all current pending writes are finished.
   */
  flush(): Promise<void>;

  /**
   * Closes the logger. For basic JSONL append, this is equivalent to flush().
   */
  close?(): Promise<void>;
}

export interface FileUsageLoggerOptions {
  /**
   * Absolute or relative path to the JSONL log file.
   * Example: "./logs/usage.jsonl"
   */
  filePath: string;

  /**
   * If true, the logger will create parent directories if they do not exist.
   * Default: true.
   */
  mkdirIfMissing?: boolean;
}

class FileUsageLogger implements UsageLogger {
  private lastWrite: Promise<void> = Promise.resolve();
  private readonly filePath: string;
  private readonly mkdirIfMissing: boolean;
  private initialized = false;

  constructor(options: FileUsageLoggerOptions) {
    this.filePath = path.resolve(options.filePath);
    this.mkdirIfMissing = options.mkdirIfMissing !== false;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.mkdirIfMissing) {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
    }
    this.initialized = true;
  }

  async logUsage(row: AICoreUsageLog): Promise<void> {
    // 1. Runtime Invariants
    if (row.totalTokens !== row.inputTokens + row.outputTokens) {
      throw new Error(
        `Invalid AICoreUsageLog: totalTokens (${row.totalTokens}) mismatch ` +
        `inputTokens (${row.inputTokens}) + outputTokens (${row.outputTokens})`
      );
    }

    if (row.isShadowCall !== row.shadowMode) {
      throw new Error(
        `Invalid AICoreUsageLog: isShadowCall (${row.isShadowCall}) must match metadata.shadowMode (${row.shadowMode})`
      );
    }

    // 2. Serialized Write
    this.lastWrite = this.lastWrite.then(async () => {
      try {
        await this.initialize();
        const line = JSON.stringify(row) + '\n';
        await fs.appendFile(this.filePath, line, 'utf-8');
      } catch (err) {
        console.error(`[@aicore/logger] Persistent log write failed for ${this.filePath}`, err);
        throw err;
      }
    });

    return this.lastWrite;
  }

  async flush(): Promise<void> {
    return this.lastWrite;
  }

  async close(): Promise<void> {
    return this.flush();
  }
}

/**
 * Creates a Node.js usage logger that writes structured JSONL to disk.
 * Optimized for append-only performance and high-cardinality metadata.
 */
export function createFileUsageLogger(options: FileUsageLoggerOptions): UsageLogger {
  return new FileUsageLogger(options);
}
