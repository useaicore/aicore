import ScrollReveal from '@/components/ui/ScrollReveal';

const stats = [
  { value: '93%',  label: 'Token reduction',      sub: '28,419 → 402 tokens' },
  { value: '<1ms', label: 'Injection overhead',   sub: 'reads from disk, not network' },
  { value: '∞',    label: 'Sessions saved',        sub: 'generated once, used forever' },
  { value: '$0',   label: 'Cold-start cost',       sub: 'no LLM call during init' },
];

export default function TokenSavingsChart() {
  return (
    <section className="relative py-28 overflow-hidden section-sky-ambient">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(74,143,170,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6">

        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-[var(--sky-mid)] text-[10px] font-bold uppercase tracking-[0.25em] mb-4 block">
            Integration
          </span>
          <h2
            className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-5 leading-tight"
            style={{ letterSpacing: '-0.025em' }}
          >
            Change one line.<br />
            <span className="gradient-sky">Keep everything else.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[460px] mx-auto leading-relaxed">
            The OpenAI SDK works unchanged. Point your{' '}
            <code className="text-[var(--sky-mid)] font-mono text-sm">baseURL</code> at AICore.
            Every call gets routed, logged, and costed — automatically.
          </p>
        </ScrollReveal>

        {/* 4-stat strip */}
        <ScrollReveal delay={100} className="mb-14">
          <div className="spin-border-wrap rounded-xl">
            <div className="spin-border-layer animate-spin-border" />
            <div className="relative rounded-[11px] glass grid grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="p-8 text-center"
                  style={{
                    borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div
                    className="text-3xl md:text-4xl font-black mb-2"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--sky-bright)',
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[var(--text-secondary)] text-sm font-medium mb-1">{s.label}</div>
                  <div className="text-[var(--text-muted)] text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Before / After code comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <ScrollReveal direction="left" delay={50}>
            <div className="glass rounded-xl overflow-hidden h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,168,50,0.1)] bg-[rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] opacity-70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] opacity-70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] opacity-70" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--error)] opacity-60">
                  5 keys to manage
                </span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.8]">
                <div>
                  <span className="text-[var(--sky-bright)]">import</span>{' OpenAI '}
                  <span className="text-[var(--sky-bright)]">from</span>{' '}
                  <span className="text-[var(--gold-cream)]">&apos;openai&apos;</span>
                </div>
                <div className="h-3" />
                <div>
                  <span className="text-[var(--sky-bright)]">const</span>{' client = '}
                  <span className="text-[var(--sky-bright)]">new</span>{' OpenAI({'}
                </div>
                <div className="pl-4 text-[var(--text-secondary)]">apiKey: process.env.OPENAI_API_KEY</div>
                <div>{'})  '}</div>
                <div className="h-3" />
                <div className="text-[var(--text-faint)]">{'// Also manage separately:'}</div>
                <div className="text-[var(--text-faint)]">{'// ANTHROPIC_API_KEY'}</div>
                <div className="text-[var(--text-faint)]">{'// GOOGLE_API_KEY'}</div>
                <div className="text-[var(--text-faint)]">{'// MISTRAL_API_KEY'}</div>
                <div className="text-[var(--text-faint)]">{'// GROQ_API_KEY'}</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={150}>
            <div className="glass-sky rounded-xl overflow-hidden glow-sky h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(74,143,170,0.15)] bg-[rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] opacity-70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] opacity-70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] opacity-70" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--success)] opacity-80">
                  1 key · all providers
                </span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.8]">
                <div>
                  <span className="text-[var(--sky-bright)]">import</span>{' OpenAI '}
                  <span className="text-[var(--sky-bright)]">from</span>{' '}
                  <span className="text-[var(--gold-cream)]">&apos;openai&apos;</span>
                </div>
                <div className="h-3" />
                <div>
                  <span className="text-[var(--sky-bright)]">const</span>{' client = '}
                  <span className="text-[var(--sky-bright)]">new</span>{' OpenAI({'}
                </div>
                <div className="bg-[rgba(34,197,94,0.08)] border-l-2 border-[var(--success)] -mx-5 px-5">
                  <div className="text-[var(--success)]">apiKey: process.env.AICORE_API_KEY,</div>
                  <div className="text-[var(--success)]">
                    {'baseURL: '}
                    <span className="text-[var(--gold-cream)]">&apos;https://api.aicore.dev/v1&apos;</span>
                    {','}
                  </div>
                </div>
                <div>{'})' }</div>
                <div className="h-3" />
                <div className="text-[var(--text-muted)]">{'// Route to any provider via model name.'}</div>
                <div className="text-[var(--text-muted)]">{'// Every call logged. Every cent tracked.'}</div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
