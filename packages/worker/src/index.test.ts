import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import worker from "./index.js";

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

/**
 * A valid Supabase key row returned by the auth middleware's PostgREST query.
 * Spend values are below the limit so the spend ceiling check passes.
 */
const mockKeyRow = [
  {
    id: "key-uuid-test",
    workspace_id: "ws-uuid-test",
    key_prefix: "ak_test_",
    environment: "development",
    revoked_at: null,
    expires_at: null,
    workspaces: {
      plan_tier: "free",
      monthly_spend_limit_cents: 5000,
      current_month_spend_cents: 0,
    },
  },
];

const mockOpenAISuccess = {
  choices: [{ message: { role: "assistant", content: "Hello!" }, finish_reason: "stop" }],
  usage: { prompt_tokens: 10, completion_tokens: 20 },
  model: "gpt-4o-mini",
};

const mockAnthropicSuccess = {
  id: "msg_123",
  type: "message",
  role: "assistant",
  model: "claude-3-5-sonnet-20240620",
  content: [{ type: "text", text: "Hello from Claude!" }],
  usage: { input_tokens: 15, output_tokens: 25 },
};

// ---------------------------------------------------------------------------
// Helper: build a sequential mock for fetch
//   call 0 → Supabase auth (key row)
//   call 1 → AI provider (actual response)
//   call 2 → Supabase RPC increment_key_usage (fire-and-forget via waitUntil)
//   call 3 → Supabase usagelogs insert (fire-and-forget)
//   call 4 → Supabase RPC increment_workspace_spend (fire-and-forget)
// ---------------------------------------------------------------------------
function mockAuthThenAI(aiResponse: object) {
  (globalThis.fetch as any)
    .mockResolvedValueOnce({           // call 0: Supabase auth
      ok: true,
      status: 200,
      json: async () => mockKeyRow,
    })
    .mockResolvedValue({               // call 1+: AI + all fire-and-forget
      ok: true,
      status: 200,
      json: async () => aiResponse,
    });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Worker Fetch Handler", () => {
  let mockEnv: any;
  let mockCtx: any;

  beforeEach(() => {
    mockEnv = {
      WORKSPACE_KEY: "sk-test",
      TELEMETRY_GATEWAY_URL: "https://telemetry.example.com",
      OPENAI_API_KEY: "sk-test",
      ANTHROPIC_API_KEY: "sk-ant-test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key-test",
    };
    mockCtx = { waitUntil: jest.fn() };
    globalThis.fetch = jest.fn() as any;
    jest.clearAllMocks();
  });

  it("should return ok: true with meta block for a successful call", async () => {
    mockAuthThenAI(mockOpenAISuccess);

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-aicore-key": "ak_test_validkey",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(mockOpenAISuccess);
    expect(body.usage).toBeDefined();
    expect(body.usage.inputTokens).toBe(10);
    expect(body.usage.outputTokens).toBe(20);

    // Feature 1: meta block
    expect(body.meta).toBeDefined();
    expect(body.meta.model).toBeDefined();
    expect(body.meta.provider).toBeDefined();
    expect(typeof body.meta.tokens_input).toBe("number");
    expect(typeof body.meta.tokens_output).toBe("number");
    expect(typeof body.meta.cost_usd).toBe("number");
    expect(typeof body.meta.latency_ms).toBe("number");
    // Feature 2: tokenAudit fields in meta
    expect(typeof body.meta.tokens_estimated).toBe("number");
    expect(typeof body.meta.context_utilization).toBe("number");
    expect(typeof body.meta.over_budget).toBe("boolean");

    expect(mockCtx.waitUntil).toHaveBeenCalled();
  });

  it("should return ok: false with no meta block for a provider error", async () => {
    const mockOpenAIError = {
      error: { message: "Invalid API Key", type: "invalid_request_error", code: "invalid_api_key" },
    };

    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockKeyRow }) // auth
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => mockOpenAIError }); // AI

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_validkey" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("OPENAI_INVALID_API_KEY");
    expect(body.meta).toBeUndefined(); // meta absent on errors
  });

  it("should route to Anthropic for claude-* models", async () => {
    mockAuthThenAI(mockAnthropicSuccess);

    const request = new Request("https://aicore.example.com/v1/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_validkey" },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        messages: [{ role: "user", content: "Hi Claude" }],
      }),
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body: any = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.usage.provider).toBe("anthropic");
    expect(body.usage.inputTokens).toBe(15);
    expect(body.usage.outputTokens).toBe(25);
  });

  describe("Authentication", () => {
    it("should return 401 if x-aicore-key header is missing", async () => {
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

    it("should return 401 if key is not found in Supabase", async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true, status: 200, json: async () => [], // empty rows = key not found
      });

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_BADKEY" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      const body: any = await response.json();

      expect(response.status).toBe(401);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("WORKER_AUTH_FAILED");
    });

    it("should return 401 if key is revoked", async () => {
      const revokedRow = [{ ...mockKeyRow[0], revoked_at: "2026-01-01T00:00:00Z" }];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true, status: 200, json: async () => revokedRow,
      });

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_REVOKED" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      expect(response.status).toBe(401);
    });
  });

  // Feature 3: Spend ceiling
  describe("Spend Ceiling", () => {
    it("should return 429 SPEND_LIMIT_EXCEEDED when workspace is at limit", async () => {
      const atLimitRow = [{
        ...mockKeyRow[0],
        workspaces: {
          plan_tier: "free",
          monthly_spend_limit_cents: 5000,
          current_month_spend_cents: 5000, // at limit
        },
      }];

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true, status: 200, json: async () => atLimitRow,
      });

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_validkey" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      const body: any = await response.json();

      expect(response.status).toBe(429);
      expect(body.error).toBe("SPEND_LIMIT_EXCEEDED");
    });

    it("should allow requests when spend is below limit", async () => {
      mockAuthThenAI(mockOpenAISuccess);

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_validkey" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      expect(response.status).toBe(200);
    });
  });

  describe("Provider Config", () => {
    it("should return config_error if provider API key is missing", async () => {
      mockAuthThenAI({}); // auth passes, AI key missing from env
      const { OPENAI_API_KEY, ...envWithoutKey } = mockEnv;

      const request = new Request("https://aicore.example.com/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-aicore-key": "ak_test_validkey" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
      });

      const response = await worker.fetch(request, envWithoutKey, mockCtx);
      const body: any = await response.json();

      expect(body.ok).toBe(false);
      expect(body.error.type).toBe("config_error");
      expect(body.error.code).toBe("OPENAI_MISSING_API_KEY");
    });
  });
});
