import { enqueueUsageLog, closeUsageQueue, getUsageQueue } from '../queueProducer.js';
import type { AICoreUsageLog } from '@aicore/types';

/**
 * Minimal tests for the BullMQ producer.
 * 
 * These tests assume process.env.REDIS_URL may be missing in CI.
 * They verify structural integrity and initialization without full integration.
 */
describe('queueProducer', () => {
  const dummyRow: AICoreUsageLog = {
    callId: 'test_1',
    workspaceId: 'ws_test',
    timestampMs: Date.now(),
    feature: 'test' as any,
    taskType: 'generation',
    model: 'gpt-mock',
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

  afterEach(async () => {
    // Attempt singleton reset
    await closeUsageQueue();
  });

  it('should export stable producer functions', () => {
    expect(enqueueUsageLog).toBeDefined();
    expect(closeUsageQueue).toBeDefined();
    expect(getUsageQueue).toBeDefined();
  });

  it('should attempt initialization with environment-aware config', async () => {
    // If no Redis is running locally, getUsageQueue may throw or block.
    // We test that it at least constructs the Queue object correctly.
    try {
      const queue = getUsageQueue();
      expect(queue.name).toBe('aicore-usage-logs');
    } catch (err: any) {
      if (err.message.includes('Redis')) {
        // Expected connection failure in non-Redis environments
        return;
      }
      throw err;
    }
  });
});
