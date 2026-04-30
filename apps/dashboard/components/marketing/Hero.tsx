import Link from 'next/link';

const heroRows = [
  { model: 'gpt-4o',       ms: '342ms', cost: '$0.0041', ok: true  },
  { model: 'claude-3.5',   ms: '891ms', cost: '$0.0019', ok: true  },
  { model: 'gemini-flash', ms: '201ms', cost: '$0.0003', ok: true  },
];

const stats = [
  { value: '4',    label: 'Providers' },
  { value: '<1ms', label: 'Proxy overhead' },
  { value: '93%',  label: 'Context saved' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-104px)] flex flex-col items-center overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Gold orb */}
        <div
          className="absolute animate-drift-gold"
          style={{
            top: '-15%', left: '50%', transform: 'translateX(-50%)',
            width: '130%', height: '75%',
            background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(196,146,48,0.11) 0%, transparent 65%)',
          }}
        />
        {/* Sky orb */}
        <div
          className="absolute animate-drift-sky"
          style={{
            top: '30%', right: '-20%',
            width: '70%', height: '60%',
            background: 'radial-gradient(ellipse 55% 50% at 80% 50%, rgba(74,143,170,0.07) 0%, transparent 65%)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 80%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[880px] px-6 pt-20 pb-16 flex flex-col items-center text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700"
          style={{
            background: 'rgba(196,146,48,0.08)',
            border: '1px solid rgba(196,146,48,0.2)',
          }}
        >
          <span className="live-dot" style={{ width: '6px', height: '6px' }} />
          <span className="text-[var(--gold-mid)] text-[11px] font-bold uppercase tracking-widest">
            Now in public beta
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-[76px] font-black leading-[1.0] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
          style={{ letterSpacing: '-0.03em' }}
        >
          <span className="text-[var(--text-primary)]">One key.</span>
          <br />
          <span className="gradient-gold">Every AI provider.</span>
        </h1>

        {/* Subhead */}
        <p className="max-w-[520px] text-[var(--text-secondary)] text-lg leading-relaxed mb-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Route every AI call through a single endpoint. Get full cost visibility,
          automatic failover, and context that travels with your entire team.
        </p>
        <p className="max-w-[400px] text-[var(--text-muted)] text-sm leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Change your{' '}
          <code className="text-[var(--gold-mid)] text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(196,146,48,0.1)' }}>baseURL</code>
          . Keep everything else. Two lines of config.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link href="/auth/signup" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm">
            Start free — 14-day trial →
          </Link>
          <Link
            href="#"
            className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-sm"
          >
            Read the docs
          </Link>
        </div>

        {/* No credit card */}
        <p className="text-[var(--text-faint)] text-[11px] mb-14 animate-in fade-in duration-700 delay-400">
          No credit card required · Cancel anytime
        </p>

        {/* ── Stats strip ── */}
        <div
          className="w-full max-w-[640px] grid grid-cols-2 md:grid-cols-4 gap-px mb-12 rounded-[var(--radius-lg)] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center py-4 px-3 gap-1"
              style={{ background: 'rgba(9,8,10,0.8)' }}
            >
              <span
                className="font-black text-xl md:text-2xl leading-none"
                style={{
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  color: i % 2 === 0 ? 'var(--gold-bright)' : 'var(--sky-bright)',
                }}
              >
                {s.value}
              </span>
              <span className="text-[var(--text-muted)] text-[10px] font-medium uppercase tracking-widest">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── 3-panel demo strip ── */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="spin-border-wrap rounded-xl">
            <div className="spin-border-layer animate-spin-border" />
            <div className="relative rounded-[11px] overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.05)]">

              {/* Panel 01 — aicore init */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="font-black font-mono text-sm"
                    style={{ color: 'var(--gold-bright)' }}
                  >01</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)]">aicore init</span>
                </div>
                <div className="font-mono text-[12px] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--gold-mid)' }}>$</span>
                    <span className="text-[var(--text-secondary)]">aicore init</span>
                    <span className="inline-block w-[7px] h-[14px] bg-[var(--gold-mid)] animate-blink translate-y-px" />
                  </div>
                  <div className="h-1.5" />
                  <div className="text-[11px]" style={{ color: 'var(--success)' }}>✓ Stack: Next.js · TypeScript</div>
                  <div className="text-[11px]" style={{ color: 'var(--success)' }}>✓ Providers: 3 detected</div>
                  <div className="text-[var(--text-muted)] text-[11px]">↳ Reading 47 files…</div>
                  <div className="text-[var(--text-muted)] text-[11px] flex items-center gap-1.5">
                    <span className="text-[var(--text-secondary)] line-through opacity-60">28,419</span>
                    <span className="text-[var(--text-faint)]">→</span>
                    <span className="font-bold" style={{ color: 'var(--sky-bright)' }}>402 tokens</span>
                  </div>
                  <div className="h-1" />
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--success)' }}>✓ Context ready. Briefing complete.</div>
                </div>
              </div>

              {/* Panel 02 — Context Engine */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="font-black font-mono text-sm" style={{ color: 'var(--sky-bright)' }}>02</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sky-dim)]">Context Engine</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] mb-1.5">Raw file reads</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-[var(--text-faint)] flex-1" />
                      <span className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">28,419 tok</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] mb-1.5">Compressed context</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full flex-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full w-[1.4%] rounded-full" style={{ background: 'var(--sky-mid)' }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold whitespace-nowrap" style={{ color: 'var(--sky-bright)' }}>402 tok</span>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-[rgba(255,255,255,0.05)]">
                    <span className="font-black text-2xl" style={{ color: 'var(--sky-bright)' }}>93%</span>
                    <span className="text-[var(--text-muted)] text-[11px] ml-2">smaller · every session</span>
                  </div>
                </div>
              </div>

              {/* Panel 03 — Provider Gateway */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="font-black font-mono text-sm" style={{ color: 'var(--gold-bright)' }}>03</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)]">Provider Gateway</span>
                </div>
                <div className="font-mono text-[12px] space-y-2">
                  {heroRows.map(row => (
                    <div key={row.model} className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="text-[11px]" style={{ color: 'var(--success)' }}>✓</span>
                      <span className="w-[76px] truncate text-[var(--text-muted)] text-[11px]">{row.model}</span>
                      <span className="text-[var(--text-faint)] text-[11px] ml-auto">{row.ms}</span>
                      <span className="text-[11px] w-[46px] text-right" style={{ color: 'var(--gold-mid)' }}>{row.cost}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                      via AICORE_API_KEY
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex flex-col items-center gap-1.5 animate-in fade-in duration-1000 delay-700">
          <span className="text-[var(--text-faint)] text-[10px] uppercase tracking-widest">Explore features</span>
          <span className="animate-pulse-down text-[var(--text-faint)] text-base">↓</span>
        </div>

      </div>
    </section>
  );
}
