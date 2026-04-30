const testimonials = [
  {
    quote:
      "We found a rogue prompt costing us $400/month within an hour of setting up AICore. Before that we had zero visibility into which feature was burning our OpenAI budget.",
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'Fintool',
    initials: 'SC',
    accent: 'gold' as const,
  },
  {
    quote:
      "Shadow mode is the killer feature. We tested Claude vs GPT-4o on real traffic for two weeks. Switched with full confidence — 54% cheaper, identical quality scores.",
    name: 'Marcus Webb',
    role: 'Staff Engineer',
    company: 'Assembled',
    initials: 'MW',
    accent: 'sky' as const,
  },
  {
    quote:
      "Four minutes from npx aicore init to full observability in our Next.js app. The context compression alone saves us hundreds of dollars a month in wasted token spend.",
    name: 'Priya Sharma',
    role: 'Founder',
    company: 'Typebot',
    initials: 'PS',
    accent: 'gold' as const,
  },
];

const trustMetrics = [
  { value: '5 min',  label: 'to first log',          sub: 'from a blank project' },
  { value: '1',      label: 'import',                 sub: 'to instrument everything' },
  { value: '4',      label: 'providers integrated',   sub: 'OpenAI · Anthropic · Gemini · Groq' },
  { value: '0',      label: 'cold-start cost',        sub: 'no LLM call on init' },
];

export default function SocialProof() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Subtle ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(196,146,48,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">
            Beta tester feedback
          </span>
          <h2
            className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 leading-tight"
            style={{ letterSpacing: '-0.025em' }}
          >
            Developers ship faster.<br />
            <span className="gradient-gold">Teams finally see the bill.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[440px] mx-auto leading-relaxed">
            Here&apos;s what engineers building AI-native products say after their first week with AICore.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-hover relative flex flex-col gap-5 rounded-[var(--radius-xl)] p-7"
              style={{
                background:
                  t.accent === 'gold'
                    ? 'rgba(196,146,48,0.04)'
                    : 'rgba(74,143,170,0.04)',
                border: `1px solid ${
                  t.accent === 'gold'
                    ? 'rgba(196,146,48,0.12)'
                    : 'rgba(74,143,170,0.12)'
                }`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: 'var(--gold-bright)', fontSize: '13px' }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[var(--text-secondary)] text-[15px] leading-[1.7] flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{
                    background:
                      t.accent === 'gold'
                        ? 'linear-gradient(135deg, rgba(196,146,48,0.3), rgba(232,184,75,0.15))'
                        : 'linear-gradient(135deg, rgba(74,143,170,0.3), rgba(122,204,224,0.15))',
                    color: t.accent === 'gold' ? 'var(--gold-bright)' : 'var(--sky-bright)',
                    border: `1px solid ${
                      t.accent === 'gold'
                        ? 'rgba(196,146,48,0.25)'
                        : 'rgba(74,143,170,0.25)'
                    }`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[var(--text-primary)] text-sm font-semibold leading-none mb-1">
                    {t.name}
                  </div>
                  <div className="text-[var(--text-muted)] text-[11px]">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust metrics bar */}
        <div
          className="spin-border-wrap rounded-xl"
        >
          <div className="spin-border-layer animate-spin-border" />
          <div
            className="relative rounded-[11px] grid grid-cols-2 md:grid-cols-4 overflow-hidden"
            style={{ background: 'rgba(13,11,16,0.9)' }}
          >
            {trustMetrics.map((m, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-8 gap-1 text-center"
                style={{
                  borderRight: i < trustMetrics.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span
                  className="font-black text-3xl md:text-4xl leading-none"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: i % 2 === 0 ? 'var(--gold-bright)' : 'var(--sky-bright)',
                  }}
                >
                  {m.value}
                </span>
                <span className="text-[var(--text-secondary)] text-sm font-semibold mt-1">
                  {m.label}
                </span>
                <span className="text-[var(--text-muted)] text-[11px]">
                  {m.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
