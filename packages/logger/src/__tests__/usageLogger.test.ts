import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createFileUsageLogger } from '../usageLogger.js';
import type { AICoreUsageLog } from '@aicore/types';
import { Features } from '@aicore/types';

describe('FileUsageLogger', () => {
  let tmpDir: string;
  let logFilePath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aicore-logger-test-'));
    logFilePath = path.join(tmpDir, 'logs', 'usage.jsonl');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const validRow: AICoreUsageLog = {
    callId: 'call_1',
    traceId: 'trace_1',
    workspaceId: 'ws_1',
    timestampMs: Date.now(),
    feature: Features.chat,
    taskType: 'generation',
    model: 'gpt-4',
    provider: 'openai',
    planTier: 'free',
    environment: 'development',
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
    costCents: 1,
    latencyMs: 150,
    isShadowCall: false,
    shadowMode: false,
    statusCode: 200,
    isError: false,
  };

  it('should write a valid log row to a JSONL file', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    await logger.logUsage(validRow);

    const content = await fs.readFile(logFilePath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(1);

    const parsed = JSON.parse(lines[0]);
    expect(parsed.callId).toBe(validRow.callId);
    expect(parsed.totalTokens).toBe(30);
  });

  it('should create parent directories if mkdirIfMissing is true (default)', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    await logger.logUsage(validRow);

    const exists = await fs.access(path.dirname(logFilePath)).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should throw if totalTokens does not match sum of input and output', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    const invalidRow = { ...validRow, totalTokens: 999 };

    await expect(logger.logUsage(invalidRow as any)).rejects.toThrow(
      /totalTokens \(999\) mismatch/
    );
  });

  it('should throw if isShadowCall does not match shadowMode', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    const invalidRow = { ...validRow, isShadowCall: true, shadowMode: false };

    await expect(logger.logUsage(invalidRow as any)).rejects.toThrow(
      /isShadowCall \(true\) must match metadata.shadowMode \(false\)/
    );
  });

  it('should serialize multiple concurrent writes correctly', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    const rows = [
      { ...validRow, callId: 'call_1' },
      { ...validRow, callId: 'call_2' },
      { ...validRow, callId: 'call_3' },
    ];

    // Fire them all concurrently
    await Promise.all(rows.map(row => logger.logUsage(row)));

    const content = await fs.readFile(logFilePath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(3);

    const callIds = lines.map(line => JSON.parse(line).callId);
    expect(callIds).toContain('call_1');
    expect(callIds).toContain('call_2');
    expect(callIds).toContain('call_3');
  });

  it('should resolve flush() when all writes are done', async () => {
    const logger = createFileUsageLogger({ filePath: logFilePath });
    const promise = logger.logUsage(validRow);
    
    await logger.flush();
    
    const content = await fs.readFile(logFilePath, 'utf-8');
    expect(content).toContain('call_1');
    await promise; // Cleanup
  });
});
