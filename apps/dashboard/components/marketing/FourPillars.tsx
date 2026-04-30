import ScrollReveal from '@/components/ui/ScrollReveal';

const compressionFiles = [
  ['src/app/**',     '23 files', '12 tok'],
  ['lib/auth.ts',    '1 file',   '8 tok' ],
  ['package.json',   '1 file',   '3 tok' ],
  ['prisma/schema',  '1 file',   '9 tok' ],
];

const logRows = [
  { model: 'gpt-4o',            ms: '342ms',  tokens: '1,204', cost: '$0.0041', ok: true  },
  { model: 'claude-3-5-sonnet', ms: '891ms',  tokens: '889',   cost: '$0.0019', ok: true  },
  { model: 'mistral-small',     ms: '201ms',  tokens: '1,102', cost: '$0.0006', ok: true  },
  { model: 'gpt-4o-mini',       ms: '—',      tokens: '—',     cost: '—',       ok: false },
  { model: 'gemini-1.5-pro',    ms: '612ms',  tokens: '2,401', cost: '$0.0021', ok: true  },
];

const primaryRows = [
  { k: 'model',   v: 'gpt-4o',   c: 'text-[var(--gold-cream)]' },
  { k: 'latency', v: '342ms ✓',  c: 'text-[var(--text-secondary)]' },
  { k: 'cost',    v: '$0.0041',  c: 'text-[var(--text-secondary)]' },
  { k: 'quality', v: '—',        c: 'text-[var(--text-faint)]' },
];

const shadowRows = [
  { k: 'model',   v: 'claude-3.5', c: 'text-[var(--sky-bright)]' },
  { k: 'latency', v: '891ms ✓',    c: 'text-[var(--text-secondary)]' },
  { k: 'cost',    v: '$0.0019',    c: 'text-[var(--sky-bright)]' },
  { k: 'quality', v: '0.94',       c: 'text-[var(--sky-bright)] font-bold' },
];

export default function FourPillars() {
  return (
    <section id="features" className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--bg-base) 0%, #080c10 35%, #0a0e12 50%, #080c10 65%, var(--bg-base) 100%)',
        }}
      />

      {/* ── Pillar 01 — aicore init ── */}
      <div className="relative py-28 max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          <ScrollReveal className="flex-1 min-w-0" direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[var(--gold-bright)] font-black text-4xl font-mono leading-none">01</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)] border border-[var(--gold-dim)] px-2 py-0.5 rounded">
                aicore init
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              Read once.<br />Brief forever.
            </h2>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 max-w-[420px]">
              Run{' '}
              <code className="text-[var(--gold-mid)] font-mono text-[13px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                aicore init
              </code>{' '}
              once in your project. It detects your stack, reads your source
              files, and compresses everything into a structured context file.
              Every AI tool you open is briefed automatically.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 max-w-[420px]">
              No copy-paste. No stale docs. No context window wasted on things
              your AI tool should already know.
            </p>
            <a href="#" className="text-[var(--gold-mid)] text-sm font-semibold hover:text-[var(--gold-bright)] transition-colors duration-150">
              See how context generation works →
            </a>
          </ScrollReveal>

          <ScrollReveal className="flex-1 min-w-0 w-full max-w-[480px]" direction="right" delay={100}>
            <div className="glass rounded-xl overflow-hidden glow-gold">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(212,168,50,0.1)] bg-[rgba(0,0,0,0.25)]">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] opacity-70" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] opacity-70" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] opacity-70" />
                <span className="ml-3 text-[var(--text-faint)] text-[11px] font-mono">~/projects/app</span>
              </div>
              <div className="p-5 font-mono text-[13px] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--gold-mid)]">$</span>
                  <span className="text-[var(--text-secondary)]">aicore init</span>
                  <span className="inline-block w-[7px] h-[15px] bg-[var(--gold-mid)] animate-blink translate-y-px" />
                </div>
                <div className="h-1" />
                <div className="text-[var(--success)] text-[12px]">✓ Stack detected: Next.js 15 · TypeScript</div>
                <div className="text-[var(--success)] text-[12px]">✓ Providers found: OpenAI · Anthropic · Mistral</div>
                <div className="text-[var(--text-muted)] text-[12px]">↳ Reading 47 source files…</div>
                <div className="text-[var(--gold-bright)] text-[12px]">{'  [████████████████████]'} done</div>
                <div className="h-1" />
                <div className="text-[var(--text-muted)] text-[12px] flex items-center gap-2">
                  <span>Compressed:</span>
                  <span className="text-[var(--text-secondary)] line-through opacity-60">28,419</span>
                  <span className="text-[var(--sky-bright)] font-bold">→ 402 tokens</span>
                </div>
                <div className="h-1" />
                <div className="text-[var(--success)] font-semibold text-[13px]">✓ Context written to .aicore/context.json</div>
                <div className="text-[var(--success)] font-semibold text-[13px]">✓ All AI tools briefed. You&apos;re ready.</div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6"><div className="h-px bg-[rgba(255,255,255,0.04)]" /></div>

      {/* ── Pillar 02 — Context Engine ── */}
      <div className="relative py-28 max-w-[1100px] mx-auto px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 50%, rgba(74,143,170,0.05) 0%, transparent 70%)' }}
        />
        <div className="relative flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-center">

          <ScrollReveal className="flex-1 min-w-0" direction="right">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[var(--sky-bright)] font-black text-4xl font-mono leading-none">02</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sky-dim)] border border-[var(--sky-dim)] px-2 py-0.5 rounded">
                Context Engine
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              Context that fits<br />in a pocket.
            </h2>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 max-w-[420px]">
              A full project read is 28,000 tokens of raw file content. Too expensive. Too slow. Too much noise.
            </p>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 max-w-[420px]">
              The Context Engine compresses it to 400 tokens of structured, semantic context — stack, deps, patterns, providers.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 max-w-[420px]">
              Generated once during init. Injected automatically on every session. Permanent savings — not just the first call.
            </p>
            <a href="#" className="text-[var(--sky-mid)] text-sm font-semibold hover:text-[var(--sky-bright)] transition-colors duration-150">
              See how context compression works →
            </a>
          </ScrollReveal>

          <ScrollReveal className="flex-1 min-w-0 w-full max-w-[480px] space-y-4" direction="left" delay={100}>
            <div className="glass-sky rounded-xl p-6">
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest mb-1">Raw input</div>
                  <div className="text-[var(--text-secondary)] font-mono font-bold text-2xl">28,419</div>
                  <div className="text-[var(--text-faint)] text-xs mt-0.5">tokens</div>
                </div>
                <div className="text-[var(--text-faint)] text-2xl pb-4">→</div>
                <div>
                  <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest mb-1">Context output</div>
                  <div className="text-[var(--sky-bright)] font-mono font-black text-2xl">402</div>
                  <div className="text-[var(--text-faint)] text-xs mt-0.5">tokens</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                    <span>Raw file reads</span><span className="font-mono">100%</span>
                  </div>
                  <div className="h-2 bg-[var(--text-faint)] rounded-full opacity-60" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                    <span>Compressed context</span>
                    <span className="font-mono text-[var(--sky-bright)]">1.4%</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--sky-mid)] rounded-full" style={{ width: '1.4%' }} />
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[rgba(74,143,170,0.15)] flex items-center justify-between">
                <span className="text-[var(--text-muted)] text-xs">Average reduction</span>
                <span className="text-[var(--sky-bright)] font-black text-xl">93%</span>
              </div>
            </div>
            <div className="glass-neutral rounded-xl p-4 font-mono text-[12px]">
              <div className="text-[var(--text-faint)] text-[10px] uppercase tracking-widest mb-3">What gets compressed</div>
              {compressionFiles.map(([path, files, tokens]) => (
                <div key={path} className="flex items-center gap-2 py-1.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <span className="text-[var(--gold-dim)] w-[120px] truncate">{path}</span>
                  <span className="text-[var(--text-faint)] text-[11px]">{files}</span>
                  <span className="text-[var(--text-faint)] ml-auto">→</span>
                  <span className="text-[var(--sky-mid)] w-[44px] text-right">{tokens}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6"><div className="h-px bg-[rgba(255,255,255,0.04)]" /></div>

      {/* ── Pillar 03 — Intelligent Router ── */}
      <div className="relative py-28 max-w-[1100px] mx-auto px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(212,168,50,0.04) 0%, transparent 70%)' }}
        />
        <div className="relative flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          <ScrollReveal className="flex-1 min-w-0 lg:pt-2" direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[var(--gold-bright)] font-black text-4xl font-mono leading-none">03</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)] border border-[var(--gold-dim)] px-2 py-0.5 rounded">
                Intelligent Router
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              Your traffic,<br />under control.
            </h2>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 max-w-[400px]">
              Circuit breaker. Latency routing. Quality scoring. Automatic failover. The proxy that actually thinks — not just a URL swap.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-2 max-w-[400px]">
              And then there&apos;s shadow mode.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 max-w-[400px]">
              Run GPT-4o. Shadow it with Claude. Compare costs and quality for 2 weeks. Switch when you&apos;re confident. Zero risk. Real data.
            </p>
            <a href="#" className="text-[var(--gold-mid)] text-sm font-semibold hover:text-[var(--gold-bright)] transition-colors duration-150">
              See routing configuration docs →
            </a>
          </ScrollReveal>

          <ScrollReveal className="flex-1 min-w-0 w-full max-w-[500px] space-y-4" direction="right" delay={100}>
            <div className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(212,168,50,0.1)] bg-[rgba(0,0,0,0.25)]">
                <span className="w-2 h-2 rounded-full bg-[var(--gold-dim)] opacity-70" />
                <span className="text-[var(--text-faint)] text-[11px] font-mono">.aicore/routing.yaml</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.75]">
                <div><span className="text-[var(--sky-bright)]">routing</span><span className="text-[var(--text-secondary)]">:</span></div>
                <div className="pl-4"><span className="text-[var(--sky-mid)]">primary</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">gpt-4o</span></div>
                <div className="pl-4"><span className="text-[var(--sky-mid)]">fallback</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">claude-3-5-sonnet</span></div>
                <div className="pl-4 mt-0.5"><span className="text-[var(--sky-bright)]">shadow</span><span className="text-[var(--text-secondary)]">:</span></div>
                <div className="pl-8"><span className="text-[var(--sky-mid)]">enabled</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--success)]">true</span></div>
                <div className="pl-8"><span className="text-[var(--sky-mid)]">target</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">claude-3-5-sonnet</span></div>
                <div className="pl-4"><span className="text-[var(--sky-mid)]">latencyThreshold</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">2000</span></div>
                <div className="pl-4"><span className="text-[var(--sky-bright)]">circuitBreaker</span><span className="text-[var(--text-secondary)]">:</span></div>
                <div className="pl-8"><span className="text-[var(--sky-mid)]">threshold</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">5</span></div>
                <div className="pl-8"><span className="text-[var(--sky-mid)]">window</span><span className="text-[var(--text-secondary)]">: </span><span className="text-[var(--gold-cream)]">60s</span></div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
              <div className="bg-[rgba(0,0,0,0.35)] px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Shadow mode — live comparison</span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.04)]">
                <div className="glass p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-mid)]">Primary</span>
                    <span className="text-[10px] text-[var(--success)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />live
                    </span>
                  </div>
                  {primaryRows.map(row => (
                    <div key={row.k} className="flex items-center justify-between">
                      <span className="text-[var(--text-faint)] font-mono text-[11px]">{row.k}</span>
                      <span className={`font-mono text-[11px] ${row.c}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-sky p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sky-mid)]">Shadow</span>
                    <span className="text-[10px] text-[var(--sky-dim)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--sky-dim)] inline-block" />silent
                    </span>
                  </div>
                  {shadowRows.map(row => (
                    <div key={row.k} className="flex items-center justify-between">
                      <span className="text-[var(--text-faint)] font-mono text-[11px]">{row.k}</span>
                      <span className={`font-mono text-[11px] ${row.c}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-[11px] italic text-center">
              Same output. 54% cheaper. Switch when you&apos;re ready.
            </p>
          </ScrollReveal>

        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6"><div className="h-px bg-[rgba(255,255,255,0.04)]" /></div>

      {/* ── Pillar 04 — Provider Gateway ── */}
      <div className="relative py-28 max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-center">

          <ScrollReveal className="flex-1 min-w-0" direction="right">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[var(--sky-bright)] font-black text-4xl font-mono leading-none">04</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sky-dim)] border border-[var(--sky-dim)] px-2 py-0.5 rounded">
                Provider Gateway
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              One key.<br />No surprises.
            </h2>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 max-w-[420px]">
              Replace five provider keys with one. Route to any model. Every call logged with provider, model, tokens, cost, and latency.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 max-w-[420px]">
              Change your{' '}
              <code className="text-[var(--sky-mid)] font-mono text-xs bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">baseURL</code>
              {' '}to{' '}
              <code className="text-[var(--sky-mid)] font-mono text-xs bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">api.aicore.dev/v1</code>
              . Everything else stays the same.
            </p>
            <a href="#" className="text-[var(--sky-mid)] text-sm font-semibold hover:text-[var(--sky-bright)] transition-colors duration-150">
              See provider compatibility →
            </a>
          </ScrollReveal>

          <ScrollReveal className="flex-1 min-w-0 w-full max-w-[500px]" direction="left" delay={100}>
            <div className="glass-sky rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr,72px,64px,68px,40px] gap-2 px-4 py-3 border-b border-[rgba(74,143,170,0.15)] bg-[rgba(0,0,0,0.3)]">
                {['Model', 'Latency', 'Tokens', 'Cost', ''].map((h, i) => (
                  <div key={i} className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">{h}</div>
                ))}
              </div>
              {logRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr,72px,64px,68px,40px] gap-2 px-4 py-3 border-b border-[rgba(74,143,170,0.05)] font-mono text-[12px] transition-colors ${
                    row.ok ? 'hover:bg-[rgba(212,168,50,0.04)]' : 'bg-[rgba(160,80,64,0.07)] border-l-2 border-l-[var(--error)]'
                  }`}
                >
                  <span className="text-[var(--text-secondary)] truncate">{row.model}</span>
                  <span className={row.ok ? 'text-[var(--text-muted)]' : 'text-[var(--error)]'}>{row.ms}</span>
                  <span className="text-[var(--text-muted)]">{row.tokens}</span>
                  <span className={row.ok ? 'text-[var(--gold-mid)]' : 'text-[var(--error)]'}>{row.cost}</span>
                  <span className={row.ok ? 'text-[var(--success)]' : 'text-[var(--error)]'}>{row.ok ? '✓' : '✗'}</span>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-[rgba(0,0,0,0.2)]">
                <span className="text-[10px] text-[var(--text-faint)] font-mono uppercase tracking-widest">
                  AICORE_API_KEY · 5 providers · 1 key
                </span>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>

    </section>
  );
}
