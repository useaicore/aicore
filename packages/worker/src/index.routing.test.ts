/**
 * @file index.routing.test.ts
 *
 * Unit tests for the provider-routing helpers in packages/worker/src/index.ts.
 *
 * These tests are pure unit tests:
 *  - No Cloudflare Worker runtime.
 *  - No fetch() calls.
 *  - No provider adapter imports.
 *
 * Helpers under test are exported from index.ts under the
 * "Test-only exports" block and are side-effect-free.
 */

import { describe, it, expect } from "@jest/globals";
import { inferProviderFromModel, pickProvider } from "./index.js";

// ---------------------------------------------------------------------------
// inferProviderFromModel
// ---------------------------------------------------------------------------

describe("inferProviderFromModel", () => {
  it("returns undefined for undefined input", () => {
    expect(inferProviderFromModel(undefined)).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(inferProviderFromModel("")).toBeUndefined();
  });

  it("infers openai from a gpt-4.1-mini model string", () => {
    expect(inferProviderFromModel("gpt-4.1-mini")).toBe("openai");
  });

  it("infers openai from a gpt4-turbo-preview model string", () => {
    expect(inferProviderFromModel("gpt4-turbo-preview")).toBe("openai");
  });

  it("infers openai from GPT-4O-MINI (case-insensitive)", () => {
    expect(inferProviderFromModel("GPT-4O-MINI")).toBe("openai");
  });

  it("infers openai from gpt-3.5-turbo", () => {
    expect(inferProviderFromModel("gpt-3.5-turbo")).toBe("openai");
  });

  it("infers anthropic from claude-3-5-sonnet", () => {
    expect(inferProviderFromModel("claude-3-5-sonnet")).toBe("anthropic");
  });

  it("returns undefined for gemini-pro (Gemini hook not active yet)", () => {
    expect(inferProviderFromModel("gemini-pro")).toBeUndefined();
  });

  it("returns undefined for an entirely unrecognised model string", () => {
    expect(inferProviderFromModel("my-custom-llm-v1")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// pickProvider
// ---------------------------------------------------------------------------

describe("pickProvider", () => {
  // ── Explicit provider field ──────────────────────────────────────────────

  it("uses an explicit provider:openai even when model looks like Anthropic", () => {
    expect(pickProvider({ provider: "openai", model: "claude-3-5-sonnet" })).toBe("openai");
  });

  it("uses an explicit provider:anthropic", () => {
    expect(pickProvider({ provider: "anthropic" })).toBe("anthropic");
  });

  // ── Model inference (no provider field) ─────────────────────────────────

  it("infers openai from a gpt-4o model string", () => {
    expect(pickProvider({ model: "gpt-4o" })).toBe("openai");
  });

  it("infers openai from a gpt-4.1-mini model string", () => {
    expect(pickProvider({ model: "gpt-4.1-mini" })).toBe("openai");
  });

  it("infers anthropic from a claude-3-opus model string", () => {
    expect(pickProvider({ model: "claude-3-opus" })).toBe("anthropic");
  });

  // ── Fallback to default (openai) scenarios ───────────────────────────────

  it("infers anthropic from a claude-3-5-sonnet model string", () => {
    expect(pickProvider({ model: "claude-3-5-sonnet" })).toBe("anthropic");
  });

  it("falls back to openai for an empty payload object", () => {
    expect(pickProvider({})).toBe("openai");
  });

  it("falls back to openai for a null payload", () => {
    expect(pickProvider(null)).toBe("openai");
  });

  it("falls back to openai for a numeric payload", () => {
    expect(pickProvider(42)).toBe("openai");
  });

  it("falls back to openai for a string payload", () => {
    expect(pickProvider("hello")).toBe("openai");
  });

  // ── taskType is present but has no routing effect in Phase 1 ────────────

  it("ignores taskType and still infers openai from a gpt-* model", () => {
    expect(pickProvider({ taskType: "code_review", model: "gpt-4.1-mini" })).toBe("openai");
  });

  it("ignores taskType and still infers anthropic from a claude-* model", () => {
    expect(pickProvider({ taskType: "cheap_summary", model: "claude-3-5-sonnet" })).toBe("anthropic");
  });

  it("ignores taskType when payload has no model or provider at all", () => {
    expect(pickProvider({ taskType: "code_review" })).toBe("openai");
  });

  // ── Unknown / future provider values are not recognised yet ─────────────

  it("recognises anthropic as a valid provider value", () => {
    expect(pickProvider({ provider: "anthropic" })).toBe("anthropic");
  });
});
