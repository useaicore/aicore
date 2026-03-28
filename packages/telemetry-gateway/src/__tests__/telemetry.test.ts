import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mocking @aicore/logger before dynamic imports for ESM compatibility
jest.unstable_mockModule("@aicore/logger", () => ({
  enqueueUsageLog: jest.fn().mockResolvedValue(undefined),
}));

// Dynamically import the app after mocking
const { default: app } = await import("../index.js");
const { enqueueUsageLog } = (await import("@aicore/logger")) as any;

describe("Telemetry Gateway - Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    workspaceId: "ws_test",
    callId: "call_test",
    timestampMs: Date.now(),
    model: "gpt-mock",
    feature: "chat",
    taskType: "generation",
    provider: "openai",
    planTier: "pro",
    environment: "development",
    inputTokens: 100,
    outputTokens: 200,
    totalTokens: 300,
    costCents: 5,
    latencyMs: 150,
    isShadowCall: false,
    shadowMode: false,
    statusCode: 200,
    isError: false,
  };

  it("should return 202 and enqueue log on happy path with strict payload", async () => {
    const res = await app.request("/telemetry/usage-log", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "queued" });
    expect(enqueueUsageLog).toHaveBeenCalledTimes(1);
    expect(enqueueUsageLog).toHaveBeenCalledWith(
      expect.objectContaining({
        callId: "call_test",
        totalTokens: 300,
      })
    );
  });

  it("should return 400 when missing required fields (e.g., planTier)", async () => {
    const invalidPayload = { ...validPayload };
    delete (invalidPayload as any).planTier;

    const res = await app.request("/telemetry/usage-log", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid usage log");
    expect(body.details.planTier).toBeDefined();
    expect(enqueueUsageLog).not.toHaveBeenCalled();
  });

  it("should return 400 when totalTokens is mismatched", async () => {
    const invalidPayload = { ...validPayload, totalTokens: 999 };

    const res = await app.request("/telemetry/usage-log", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(400);
    expect(enqueueUsageLog).not.toHaveBeenCalled();
  });

  it("should return 500 when queue operation fails", async () => {
    enqueueUsageLog.mockRejectedValueOnce(new Error("Queue full"));

    const res = await app.request("/telemetry/usage-log", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
