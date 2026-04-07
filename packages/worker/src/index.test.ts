import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import worker from "./index.js";

describe("Worker Fetch Handler", () => {
  let mockEnv: any;
  let mockCtx: any;

  beforeEach(() => {
    mockEnv = {
      WORKSPACE_KEY: "sk-test",
      TELEMETRY_GATEWAY_URL: "https://telemetry.example.com",
      OPENAI_API_KEY: "sk-test",
      ANTHROPIC_API_KEY: "sk-ant-test",
    };
    mockCtx = {
      waitUntil: jest.fn(),
    };
    // Mock global fetch
    globalThis.fetch = jest.fn() as any;
    jest.clearAllMocks();
  });

  it("should return ok: true and usage in the response for a successful call", async () => {
    const mockOpenAIResponse = {
      choices: [{ message: { role: "assistant", content: "Hello!" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 20 },
      model: "gpt-4o-mini"
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOpenAIResponse,
    });

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-workspace-key": "sk-test"
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(mockOpenAIResponse);
    expect(body.usage).toBeDefined();
    expect(body.usage.inputTokens).toBe(10);
    expect(body.usage.outputTokens).toBe(20);
    expect(mockCtx.waitUntil).toHaveBeenCalled();
  });

  it("should return ok: false and error for a provider error", async () => {
    const mockOpenAIError = {
      error: {
        message: "Invalid API Key",
        type: "invalid_request_error",
        code: "invalid_api_key"
      }
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => mockOpenAIError,
    } as any);

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-workspace-key": "sk-test"
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("OPENAI_INVALID_API_KEY");
  });

  it("should route to Anthropic and normalize results for a claude-* model", async () => {
    const mockAnthropicResponse = {
      id: "msg_123",
      type: "message",
      role: "assistant",
      model: "claude-3-5-sonnet-20240620",
      content: [{ type: "text", text: "Hello from Claude!" }],
      usage: { input_tokens: 15, output_tokens: 25 }
    };

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAnthropicResponse,
    });

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-workspace-key": "sk-test"
      },
      body: JSON.stringify({ 
        model: "claude-3-5-sonnet-20240620",
        messages: [{ role: "user", content: "Hi Claude" }] 
      }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    // Data is the raw Anthropic response
    expect(body.data).toEqual(mockAnthropicResponse);
    expect(body.usage.provider).toBe("anthropic");
    expect(body.usage.inputTokens).toBe(15);
    expect(body.usage.outputTokens).toBe(25);
  });

  describe("Authentication", () => {
    it("should return 401 if x-workspace-key is missing", async () => {
      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      const body: any = await response.json();

      expect(response.status).toBe(401);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("WORKER_AUTH_FAILED");
    });

    it("should return 401 if x-workspace-key is invalid", async () => {
      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-workspace-key": "wrong-key"
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      const body: any = await response.json();

      expect(response.status).toBe(401);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("WORKER_AUTH_FAILED");
    });
  });

  describe("Telemetry", () => {
    it("should send the correct UsageEnvelope schema to the gateway", async () => {
      const mockResult = { choices: [{ message: { content: "ok" } }], usage: { prompt_tokens: 5, completion_tokens: 5 } };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResult,
      });

      const payload = {
        messages: [{ role: "user", content: "Hi" }],
        metadata: {
          workspaceId: "ws_99",
          taskType: "summarisation",
          shadowMode: true,
        }
      };

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-workspace-key": "sk-test" },
        body: JSON.stringify(payload),
      });

      await worker.fetch(request, mockEnv, mockCtx);

      // Verify the second fetch call (which is telemetry)
      const telemetryCall = (globalThis.fetch as jest.Mock).mock.calls.find(call => 
        call[0] === "https://telemetry.example.com"
      );
      
      expect(telemetryCall).toBeDefined();
      const telemetryBody = JSON.parse((telemetryCall![1] as any).body);
      
      expect(telemetryBody.usage).toBeDefined();
      expect(telemetryBody.workspaceId).toBe("ws_99");
      expect(telemetryBody.taskType).toBe("summarisation");
      expect(telemetryBody.isShadowCall).toBe(true);
    });
  });

  describe("Provider Config", () => {
    it("should return config_error if provider API key is missing", async () => {
      // Remove API key from env
      const { OPENAI_API_KEY, ...envWithoutKey } = mockEnv;

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-workspace-key": "sk-test" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, envWithoutKey, mockCtx);
      const body: any = await response.json();

      expect(response.status).toBe(400); // or 500/401 depending on how you map config_error
      expect(body.ok).toBe(false);
      expect(body.error.type).toBe("config_error");
      expect(body.error.code).toBe("OPENAI_MISSING_API_KEY");
    });
  });
});
