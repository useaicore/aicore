import Link from 'next/link';

const heroRows = [
  { model: 'gpt-4o',     ms: '342ms', cost: '$0.0041', ok: true },
  { model: 'claude-3.5', ms: '891ms', cost: '$0.0019', ok: true },
  { model: 'mistral-sm', ms: '201ms', cost: '$0.0006', ok: true },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-[60px] flex flex-col items-center overflow-hidden">

      {/* ── Background layer stack ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Gold orb — top-center, drifts slowly */}
        <div
          className="absolute animate-drift-gold"
          style={{
            top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '120%', height: '70%',
            background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(212,168,50,0.12) 0%, transparent 60%)',
          }}
        />
        {/* Sky orb — right side, counter-drifts */}
        <div
          className="absolute animate-drift-sky"
          style={{
            top: '35%', right: '-15%',
            width: '65%', height: '55%',
            background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,143,170,0.08) 0%, transparent 60%)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--text-faint) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[860px] px-6 pt-20 pb-16 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="text-[var(--gold-bright)] text-[10px]">✦</span>
          <span className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-widest">
            Now in public beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-[72px] font-black leading-[1.02] tracking-tight mb-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <span className="text-[var(--text-primary)]">One key.</span>
          <br />
          <span className="gradient-gold">Every AI provider.</span>
        </h1>

        {/* Subhead */}
        <p className="max-w-[500px] text-[var(--text-secondary)] text-lg leading-relaxed mb-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Route every AI call through a single endpoint. Full logs, cost tracking,
          context compression, and automatic failover.
        </p>
        <p className="max-w-[380px] text-[var(--text-muted)] text-sm leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Change your <code className="text-[var(--gold-mid)] font-mono text-xs">baseURL</code>. Keep everything else.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] font-bold text-sm rounded-[var(--radius-md)] shadow-[0_8px_32px_rgba(212,168,50,0.25)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
          >
            Start for free →
          </Link>
          <Link
            href="#"
            className="w-full sm:w-auto px-8 py-3.5 glass text-[var(--text-secondary)] font-semibold text-sm rounded-[var(--radius-md)] hover:text-[var(--text-primary)] transition-all duration-150"
          >
            Read the docs →
          </Link>
        </div>

        {/* ── 3-panel strip with spinning animated border ── */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="spin-border-wrap rounded-xl">
            <div className="spin-border-layer animate-spin-border" />
            <div className="relative rounded-[11px] overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(212,168,50,0.08)]">

              {/* Panel 01 — aicore init */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[var(--gold-bright)] font-black font-mono text-sm">01</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)]">aicore init</span>
                </div>
                <div className="font-mono text-[12px] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--gold-mid)]">$</span>
                    <span className="text-[var(--text-secondary)]">aicore init</span>
                    <span className="inline-block w-[7px] h-[14px] bg-[var(--gold-mid)] animate-blink translate-y-px" />
                  </div>
                  <div className="h-2" />
                  <div className="text-[var(--success)] text-[11px]">✓ Stack: Next.js · TypeScript</div>
                  <div className="text-[var(--success)] text-[11px]">✓ Providers: 3 detected</div>
                  <div className="text-[var(--text-muted)] text-[11px]">↳ Reading 47 files…</div>
                  <div className="text-[var(--text-muted)] text-[11px] flex items-center gap-1.5">
                    <span className="text-[var(--text-secondary)] line-through opacity-60">28,419</span>
                    <span className="text-[var(--text-faint)]">→</span>
                    <span className="text-[var(--sky-bright)] font-bold">402 tokens</span>
                  </div>
                  <div className="h-1" />
                  <div className="text-[var(--success)] text-[11px] font-semibold">✓ Context ready. Briefing complete.</div>
                </div>
              </div>

              {/* Panel 02 — Context Engine */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[var(--sky-bright)] font-black font-mono text-sm">02</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sky-dim)]">Context Engine</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] mb-1.5">Raw file reads</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-[var(--text-faint)] flex-1" />
                      <span className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">28,419 tok</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] mb-1.5">Compressed context</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full flex-1 bg-[rgba(255,255,255,0.05)] overflow-hidden">
                        <div className="h-full w-[1.4%] bg-[var(--sky-mid)] rounded-full" />
                      </div>
                      <span className="font-mono text-[11px] text-[var(--sky-bright)] font-bold whitespace-nowrap">402 tok</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.05)]">
                    <span className="text-[var(--sky-bright)] font-black text-2xl">93%</span>
                    <span className="text-[var(--text-muted)] text-[11px] ml-2">smaller · every session</span>
                  </div>
                </div>
              </div>

              {/* Panel 03 — Provider Gateway */}
              <div className="glass border-0 p-6 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[var(--gold-bright)] font-black font-mono text-sm">03</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold-dim)]">Provider Gateway</span>
                </div>
                <div className="font-mono text-[12px] space-y-2">
                  {heroRows.map(row => (
                    <div key={row.model} className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="text-[var(--success)] text-[11px]">✓</span>
                      <span className="w-[72px] truncate text-[var(--text-muted)] text-[11px]">{row.model}</span>
                      <span className="text-[var(--text-faint)] text-[11px] ml-auto">{row.ms}</span>
                      <span className="text-[var(--gold-mid)] text-[11px] w-[46px] text-right">{row.cost}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] text-[10px] text-[var(--text-faint)] uppercase tracking-widest">
                    via AICORE_API_KEY
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex flex-col items-center gap-1.5 animate-in fade-in duration-1000 delay-700">
          <span className="text-[var(--text-faint)] text-[10px] uppercase tracking-widest">See how it works</span>
          <span className="animate-pulse-down text-[var(--text-faint)] text-base">↓</span>
        </div>
      </div>
    </section>
  );
}
