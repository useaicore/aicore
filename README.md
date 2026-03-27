# AICore

> About
The Unified Infrastructure for AI Systems — LLM routing, caching, context registry, and observability for developers and agents.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#)

---

## What is AICore?

AICore is the intelligence and control layer for AI-native development. It sits between your application and any LLM provider, solving the four invisible taxes every developer and team currently pays:

1. **SDK fragmentation** — copy-paste setup across OpenAI, Anthropic, Gemini, Groq
2. **Zero cost visibility** — AI bills arrive with no breakdown of which feature, model, or user
3. **Manual doc hunting** — pasting `.md` files into prompts before every integration
4. **No shared knowledge system** — what works stays trapped in Slack and dying docs

One import. Full visibility. Shared context. From day one.

---

## Core Features

### Unified LLM SDK
One TypeScript SDK replaces all your provider imports. `ai.chat`, `ai.stream`, `ai.complete` — same interface for OpenAI, Anthropic, Groq, Gemini, and more. Shadow mode lets you adopt with zero risk.

### Smart LLM Routing
Route requests to the best available model based on task type, cost, latency, and quality history. Rule-based at the edge — no extra LLM call per routing decision. Automatic fallback on provider failure.

### Response Caching
Exact-match and semantic caching to eliminate redundant LLM calls. Cut costs by 50–70%. Configurable TTL, similarity thresholds, and workspace-level isolation.

### Context Registry (`.aicorecontext`)
A project-local folder that gives AI tools and agents structured knowledge about your stack, providers, and integration patterns. Auto-generated on `npx aicore init`. Versioned with your code. Community-backed templates for Stripe, Supabase, OpenAI, and more.

### Observability Platform
Every LLM call is logged — model, tokens, cost, latency, cache hit, quality score, workspace. Free dashboard for call logs and cost breakdowns. Real-time budget alerts. Built on a unified telemetry schema from day one.

### Agent-Aware Infrastructure *(Phase 4)*
AICore does not orchestrate agents — that is the job of LangGraph, CrewAI, Strands, and similar frameworks. What AICore provides for agents is the infrastructure underneath them: intelligent routing using historical quality scores, per-workflow cost attribution, multi-agent budget enforcement, and automatic context injection via `.aicorecontext`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│       Your App  /  AI Agent Framework        │
└─────────────────────┬───────────────────────┘
                      │  aicore-sdk
┌─────────────────────▼───────────────────────┐
│            AICore Edge Proxy                 │
│         (Cloudflare Workers)                 │
│  Routing · Cache lookup · Logging · Budget   │
└─────────────┬─────────────┬──────────────────┘
               │             │
┌────────────▼─┐   ┌─────▼───────────────────┐
│  LLM Providers │   │   Control + Observability  │
│  OpenAI        │   │   Fastify API (Node 22)    │
│  Anthropic     │   │   Postgres / Supabase      │
│  Groq          │   │   ClickHouse (analytics)   │
│  Gemini  ...   │   │   Redis · BullMQ           │
└───────────────┘   └────────────────────────┘
```

---

## Roadmap

### Phase 1 — SDK + Context *(Weeks 1–4)*
- [ ] `aicore-sdk` — `ai.chat`, `ai.stream`, `ai.complete` with unified metadata schema
- [ ] Shadow mode — zero-risk adoption, runs alongside existing setup
- [ ] `npx aicore init` — stack detection, auto-generates `.aicorecontext` folder
- [ ] Terminal output — cost, latency, and model recommendation on first call
- [ ] Local logs — `.aicorelogs.jsonl` with unified telemetry schema

### Phase 2 — Observability + Team Dashboard *(Weeks 5–12)*
- [ ] BullMQ + Postgres + ClickHouse async logging pipeline
- [ ] Next.js dashboard — call logs, cost by feature, model breakdown
- [ ] Team workspaces with auth (better-auth)
- [ ] Basic budget alerts at 50%, 75%, 90%
- [ ] Rule-based routing — config-driven, no LLM per request

### Phase 3 — Monetization + Smart Routing *(Weeks 13–20)*
- [ ] Routing engine — offline quality scoring per `taskType`
- [ ] Per-workspace budgets with enforcement at the proxy
- [ ] Stripe integration — Free / Pro ($29) / Team ($99) / Enterprise
- [ ] Cost breakdown dashboards — per feature, per model, per user

### Phase 3.5 — Community Context + Semantic Caching *(Months 5–7)*
- [ ] Community Context Registry — peer-reviewed integration templates
- [ ] `aicore provider add`, `aicore feature add` CLI commands
- [ ] Semantic caching — vector search, similarity thresholds, TTLs
- [ ] Refinement engine — quality scores stored per call

### Phase 4 — Agent-Aware Infrastructure *(Months 7–11)*
- [ ] Agent metadata fields — `workflowRunId`, `agentId`, `pipelineStep`
- [ ] Per-workflow cost dashboards
- [ ] Agent-aware routing using quality score history
- [ ] Multi-agent budget enforcement
- [ ] `.aicorecontext` auto-injection for agent frameworks

### Phase 5 — Enterprise Platform *(Months 11–18)*
- [ ] MCP server — native integration with Claude Code, Cursor, Windsurf
- [ ] SSO, RBAC, audit logs UI
- [ ] HIPAA, SOC 2 Type II compliance
- [ ] Integrations — LangGraph, CrewAI, Strands, Bedrock, Datadog, Segment

---

## Getting Started

> **AICore is in pre-alpha.** The API surface is not yet stable. Watch this repo for updates.

```bash
# Clone the repository
git clone https://github.com/useaicore/aicore.git
cd aicore

# Install dependencies
npm install

# Run in development mode
npm run dev
```

Once published:

```bash
npx aicore init
```

---

## Target Launch

| Status | Phase | Est. Launch | Target ARR |
|--------|-------|-------------|------------|
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
