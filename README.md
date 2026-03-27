# AICore

> The intelligent AI infrastructure layer — smart LLM routing, caching, context registry, and agent orchestration for modern applications.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-in%20development-orange.svg)](#)

---

## What is AICore?

AICore is an open-source AI infrastructure SDK designed to sit between your application and any LLM provider. It abstracts away the complexity of model selection, context management, response caching, and agent coordination — so you can focus on building features, not plumbing.

Think of it as the **backbone layer** your AI-powered application runs on.

---

## Core Features

### Smart LLM Routing
Automatically route requests to the best available model based on task type, cost, latency, or fallback rules. Supports OpenAI, Anthropic, Groq, Gemini, and more.

### Response Caching
Semantic and exact-match caching to reduce redundant LLM calls, cut costs, and speed up response times — with configurable TTL and cache invalidation strategies.

### Context Registry
A structured memory layer for storing, retrieving, and managing conversation context, user sessions, and long-term agent memory across requests.

### Agent Orchestration
Define, compose, and run multi-step AI agents with tool calling, retry logic, and execution tracing — all within a clean, type-safe API.

### Observability
Built-in logging, token usage tracking, latency metrics, and error tracing to give you full visibility into every AI interaction.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Your Application               │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│                  AICore SDK                 │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Router   │  │  Cache   │  │ Context  │  │
│  │  Engine   │  │  Layer   │  │ Registry │  │
│  └───────────┘  └──────────┘  └──────────┘  │
│  ┌───────────────────────────────────────┐   │
│  │         Agent Orchestrator            │   │
│  └───────────────────────────────────────┘   │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│           LLM Providers                     │
│  OpenAI · Anthropic · Groq · Gemini · ...   │
└─────────────────────────────────────────────┘
```

---

## Roadmap

### Phase 1 — Foundation
- [ ] Core SDK scaffold (TypeScript, monorepo)
- [ ] LLM provider adapters (OpenAI, Anthropic, Groq, Gemini)
- [ ] Basic request routing with fallback support
- [ ] Exact-match response caching
- [ ] Session-based context registry

### Phase 2 — Intelligence Layer
- [ ] Semantic caching with embedding similarity
- [ ] Dynamic routing rules (cost, latency, task type)
- [ ] Long-term memory store (PostgreSQL / Supabase)
- [ ] Tool calling support for agents
- [ ] Token usage tracking and budget enforcement

### Phase 3 — Agent Platform
- [ ] Multi-step agent executor
- [ ] Agent templates (SDR, support triage, summarizer)
- [ ] Workflow chaining and conditional branching
- [ ] REST API + webhook delivery
- [ ] Dashboard UI for agent monitoring

### Phase 4 — SaaS & Ecosystem
- [ ] Hosted AICore cloud (multi-tenant)
- [ ] API key management and rate limiting
- [ ] Plugin/integration marketplace
- [ ] SDKs for Python and other languages

---

## Getting Started

> **Note:** AICore is currently in active development. The API surface is not yet stable. Watch this repo for updates.

```bash
# Clone the repository
git clone https://github.com/useaicore/aicore.git
cd aicore

# Install dependencies
npm install

# Run in development mode
npm run dev
```

---

## Contributing

Contributions are welcome! Whether it's bug reports, feature suggestions, or pull requests — feel free to open an issue and let's build this together.

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

---

## License

MIT © [AICore](https://github.com/useaicore)

---

<p align="center">
  Built with care by the AICore team.
</p>
