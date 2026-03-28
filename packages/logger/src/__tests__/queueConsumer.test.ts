import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// ESM Mocking for Jest requires unstable_mockModule before dynamic imports
jest.unstable_mockModule("../nodeIngest.js", () => ({
  ingestUsage: jest.fn<any>().mockResolvedValue(undefined),
}));

jest.unstable_mockModule("bullmq", () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn<any>().mockResolvedValue(undefined),
  })),
}));

jest.unstable_mockModule("../redisConnection.js", () => ({
  getRedisConnection: jest.fn().mockReturnValue({
    quit: jest.fn<any>().mockResolvedValue(undefined),
    on: jest.fn(),
  }),
}));

// Dynamically import the modules after mocking
const { startUsageLogConsumer } = await import("../queueConsumer.js");
const { ingestUsage } = (await import("../nodeIngest.js")) as any;
const { Worker } = (await import("bullmq")) as any;

describe("queueConsumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize a BullMQ Worker with correct parameters", () => {
    const { close } = startUsageLogConsumer({ concurrency: 2 });

    expect(Worker).toHaveBeenCalledWith(
      "aicore-usage-logs",
      expect.any(Function),
      expect.objectContaining({
        concurrency: 2,
        connection: expect.any(Object),
      })
    );

    expect(close).toBeInstanceOf(Function);
  });

  it("should call ingestUsage when the worker processor is executed", async () => {
    startUsageLogConsumer();
    
    // Extract the processor function passed to the Worker constructor
    const processor = (Worker as jest.Mock).mock.calls[0][1] as any;
    
    const mockJob = {
      id: "job_1",
      name: "usage-log",
      data: {
        callId: "call_123",
        workspaceId: "ws_456",
        timestampMs: Date.now(),
      },
    };

    await processor(mockJob);

    expect(ingestUsage).toHaveBeenCalledWith(mockJob.data);
  });

  it("should log to stderr and rethrow if ingestUsage fails", async () => {
    const error = new Error("Ingestion failed");
    ingestUsage.mockRejectedValueOnce(error);
    
    const spyStderr = jest.spyOn(console, "error").mockImplementation(() => {});
    
    startUsageLogConsumer();
    const processor = (Worker as jest.Mock).mock.calls[0][1] as any;
    
    const mockJob = {
      id: "job_err",
      name: "usage-log",
      data: {
        callId: "call_err",
        workspaceId: "ws_err",
      },
    };

    await expect(processor(mockJob)).rejects.toThrow("Ingestion failed");
    
    expect(spyStderr).toHaveBeenCalledWith(
      expect.stringContaining("job_err")
    );
    expect(spyStderr).toHaveBeenCalledWith(
      expect.stringContaining("call_err")
    );

    spyStderr.mockRestore();
  });
});
