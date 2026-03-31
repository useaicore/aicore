import { enqueueUsageLog, closeUsageQueue, getUsageQueue } from '../queueProducer.js';

/**
 * Minimal tests for the BullMQ producer.
 * 
 * These tests assume process.env.REDIS_URL may be missing in CI.
 * They verify structural integrity and initialization without full integration.
 */
describe('queueProducer', () => {

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
