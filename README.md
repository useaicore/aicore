# AICore

> The Unified Infrastructure for AI Systems — LLM routing, caching, context registry, and observability for developers and agents.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#)
[![Phase](https://img.shields.io/badge/phase-1%20building-yellow.svg)](#phase-1--what-were-shipping)

---

## What is AICore?

AICore is the intelligence and control layer for AI-native development. It sits between your application and any LLM provider, solving the four invisible taxes every developer and team currently pays:

1. **SDK fragmentation** — copy-paste setup across OpenAI, Anthropic, Gemini, Groq
2. **Zero cost visibility** — AI bills arrive with no breakdown of which feature, model, or user
3. **Manual doc hunting** — pasting `.md` files into prompts before every integration
4. **No shared knowledge system** — what works stays trapped in Slack and dying docs

One import. Full visibility. Shared context. From day one.

---

## Phase 1 — What We’re Shipping

> **Status: 🚧 Building**

**Objective:** A thin, shippable slice that proves AICore is useful with almost no setup.

### TypeScript SDK
- `ai.chat`, `ai.stream`, `ai.complete`
- Works as a drop-in replacement around existing OpenAI/Anthropic calls
- Supports shadow mode — run alongside existing setup, log but do not replace

### Cloudflare Worker Proxy
- Forwards requests to underlying providers
- Adds basic logging: model, tokens, cost, latency
- Minimal configuration: one AICore endpoint + one workspace key

### Local Context Folder
- `npx aicore init` creates `.aicore/context/` in the project
- Generates:
  - `overview.md` — how AI is (or will be) used in this project
  - `stack.md` — detected frameworks and infra from `package.json`
  - `workflow/*.md` — basic prompts and coding-workflow notes
- Detects providers like `stripe` and scaffolds `.aicore/context/providers/stripe/*` with:
  - Official doc links (subscriptions, payments, invoices, webhooks)
  - AICore-written checklists and examples
  - Project-specific “fill these in” sections

### Context Folder Structure (Phase 1 Target)

```text
.aicore/
  context/
    overview.md
    stack.md
    workflow/
      coding-tools.md
      prompts.md
    providers/
      stripe/
        overview.md
        subscriptions.md
        one-time-payments.md
        invoices.md
        webhooks.md
```

### Example Stripe Flow

```bash
npm install stripe
npx aicore init
```

CLI detects `stripe` and asks:

> Detected Stripe. What are you adding first?
> 1) Subscriptions  2) One-time payments  3) Invoices  4) I’m not sure yet

AICore creates `.aicore/context/providers/stripe/` and pre-fills the relevant file with Stripe doc links, AICore-written explanations, and empty project-specific slots.

### Explicitly NOT in Phase 1
- No Context Registry or community templates
- No ClickHouse, BullMQ, or complex analytics pipeline
- No team management, SSO, or enterprise features
- No semantic search or vector DB

---

## Phase 1 Build Checklist

> Updated live as we build. Checked = committed and working.

**Monorepo & Scaffold**
- [ ] Initialise Turborepo monorepo structure
- [ ] Scaffold `packages/sdk`
- [ ] Scaffold `packages/worker` (Cloudflare Worker)
- [ ] Scaffold `packages/cli` (`npx aicore`)
- [ ] Scaffold `packages/types` (shared TypeScript contracts)
- [ ] Scaffold `packages/logger` (local JSONL logger)
- [ ] Configure shared TypeScript, ESLint, build pipeline

**Type Contracts**
- [ ] Metadata schema (all Phase 1–5 fields, reserved from day one)
- [ ] Telemetry / log schema (same schema that goes to ClickHouse in Phase 2)
- [ ] Provider adapter interface (streaming + non-streaming)
- [ ] SDK configuration interface
- [ ] Routing rule interface (stub for Phase 2)

**SDK (`packages/sdk`)**
- [ ] `ai.chat(prompt, options)` — returns `ChatResponse`
- [ ] `ai.stream(prompt, options)` — returns `AsyncIterable<StreamChunk>`
- [ ] `ai.complete(prompt, options)` — returns `CompletionResponse`
- [ ] Shadow mode implementation
- [ ] Terminal output on first call: cost, latency, model, savings estimate
- [ ] OpenAI provider adapter
- [ ] Anthropic provider adapter
- [ ] Groq provider adapter
- [ ] Gemini provider adapter

**Cloudflare Worker Proxy (`packages/worker`)**
- [ ] Worker entrypoint pattern with `ctx.waitUntil` logging
- [ ] Provider request forwarding
- [ ] Basic logging: model, tokens, cost, latency
- [ ] Workspace key validation
- [ ] Error handling and fallback

**Local Logger (`packages/logger`)**
- [ ] Write to `.aicorelogs.jsonl` (newline-delimited JSON)
- [ ] Uses exact telemetry schema (same fields as Phase 2 ClickHouse)
- [ ] Abstract interface (swappable with BullMQ in Phase 2 via config)
- [ ] Never throws — logging failure must not affect the hot path

**CLI — `npx aicore init` (`packages/cli`)**
- [ ] Detect stack from `package.json` (framework, providers, infra)
- [ ] Generate `overview.md` and `stack.md`
- [ ] Generate `workflow/coding-tools.md` and `workflow/prompts.md`
- [ ] Detect Stripe — one-question flow — generate `providers/stripe/*`
- [ ] Idempotent (safe to run multiple times)
- [ ] Graceful when no `package.json` is present

**Supabase**
- [ ] Design and create `usagelogs` table in Supabase Postgres
- [ ] RLS policies for workspace isolation (reserved for Phase 2 but schema correct now)

**Validation**
- [ ] Dogfood in a real test project (Stripe + one AI provider)
- [ ] Load test: 1,000 concurrent requests through Worker, no log drops
- [ ] Failure test: primary provider times out, fallback works
- [ ] Cost assertion: terminal output matches actual token usage

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript (Node 22) | Strict mode, no `any` |
| Monorepo | Turborepo | Package-based, shared types |
| SDK | `aicore-sdk` (Node/TS) | npm package |
| Edge Proxy | Cloudflare Workers | Sub-10ms overhead, `ctx.waitUntil` logging |
| Backend API | Fastify (Phase 2+) | Stub in Phase 1 |
| Database | Supabase Postgres | RLS per workspace |
| Analytics | ClickHouse (Phase 2+) | Not in Phase 1 |
| Queue | BullMQ + Redis (Phase 2+) | Not in Phase 1 |
| Dashboard | Next.js 15 (Phase 2+) | Stub in Phase 1 |
| Auth | better-auth (Phase 2+) | Not in Phase 1 |
| CLI | Node-based `npx aicore` | |

---

## Full Roadmap

### Phase 1 — SDK + Context *(Weeks 1–4)* 🚧 Building
- One SDK replaces all provider imports
- Shadow mode for zero-risk adoption
- `npx aicore init` — stack detection, auto-generates `.aicore/context/`
- Terminal cost + latency output on first call
- Local `.aicorelogs.jsonl` with unified telemetry schema

### Phase 2 — Observability + Team Dashboard *(Weeks 5–12)*
- BullMQ + Postgres + ClickHouse async logging pipeline
- Next.js dashboard — call logs, cost by feature, model breakdown
- Team workspaces with auth (better-auth)
- Budget alerts at 50%, 75%, 90%
- Rule-based routing — config-driven, no LLM per request

### Phase 3 — Monetization + Smart Routing *(Weeks 13–20)*
- Routing engine — offline quality scoring per `taskType`
- Per-workspace budgets with enforcement at the proxy
- Stripe billing — Free / Pro ($29) / Team ($99) / Enterprise
- Cost breakdown dashboards per feature, model, user

### Phase 3.5 — Community Context + Semantic Caching *(Months 5–7)*
- Community Context Registry — peer-reviewed integration templates
- `aicore provider add`, `aicore feature add` CLI commands
- Semantic caching — vector search, similarity thresholds, TTLs
- Refinement engine — quality scores stored per call

### Phase 4 — Agent-Aware Infrastructure *(Months 7–11)*
- Agent metadata — `workflowRunId`, `agentId`, `pipelineStep`
- Per-workflow cost dashboards
- Agent-aware routing using quality score history
- Multi-agent budget enforcement
- `.aicore/context` auto-injection for agent frameworks

### Phase 5 — Enterprise Platform *(Months 11–18)*
- MCP server — native integration with Claude Code, Cursor, Windsurf
- SSO, RBAC, audit logs
- HIPAA, SOC 2 Type II compliance
- Integrations — LangGraph, CrewAI, Strands, Datadog, Segment

---

## Target Launch

| Status | Phase | Est. Launch | Target ARR |
|---|---|---|---|
| Pre-Alpha | Build & Deploy | Q2 2026 | $600k / 18mo |

---

## Contributing

Contributions are welcome. Bug reports, feature suggestions, or pull requests — open an issue and let’s build this together.

---

## License

MIT © [AICore](https://github.com/useaicore)

---

<p align="center">
  The Unified Infrastructure for AI Systems.
</p>
