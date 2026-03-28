import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { AICoreUsageLog } from "@aicore/types";

describe("ingestUsage (node entrypoint)", () => {
  let tmpDir: string;
  let logFilePath: string;
  let originalEnvPath: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aicore-ingest-test-"));
    logFilePath = path.join(tmpDir, "usage.jsonl");
    originalEnvPath = process.env.AICORE_USAGE_LOG_PATH;
    process.env.AICORE_USAGE_LOG_PATH = logFilePath;
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    process.env.AICORE_USAGE_LOG_PATH = originalEnvPath;
    // Clear ESM module cache for the next test if needed,
    // but here we only have one test anyway.
  });

  const validRow: AICoreUsageLog = {
    callId: "call_ingest_1",
    traceId: "trace_ingest_1",
    workspaceId: "ws_ingest_1",
    timestampMs: Date.now(),
    feature: "chat" as any,
    taskType: "generation",
    model: "gpt-4",
    provider: "openai",
    planTier: "free",
    environment: "development",
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

  it("should write to the file specified by AICORE_USAGE_LOG_PATH", async () => {
    // Import dynamically so it picks up the process.env change
    const { ingestUsage } = await import("../nodeIngest.js");
    
    await ingestUsage(validRow);

    const content = await fs.readFile(logFilePath, "utf-8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.callId).toBe(validRow.callId);
  });
});
