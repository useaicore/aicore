const providers = [
  { name: 'OpenAI',       icon: '◎', latency: '~340ms', status: 'live' as const },
  { name: 'Anthropic',    icon: '◆', latency: '~620ms', status: 'live' as const },
  { name: 'Google Gemini',icon: '◇', latency: '~280ms', status: 'live' as const },
  { name: 'Groq',         icon: '▸', latency: '~180ms', status: 'live' as const },
  { name: 'Mistral',      icon: '▲', latency: null,      status: 'soon' as const },
  { name: 'Cohere',       icon: '◉', latency: null,      status: 'soon' as const },
  { name: 'Together AI',  icon: '⊕', latency: null,      status: 'soon' as const },
  { name: 'Perplexity',   icon: '⊙', latency: null,      status: 'soon' as const },
];

export default function ProvidersBar() {
  return (
    <section className="relative py-12" style={{ background: 'rgba(255,255,255,0.012)' }}>
      {/* Top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(196,146,48,0.18) 30%, rgba(74,143,170,0.18) 70%, transparent)' }}
      />
      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(196,146,48,0.18) 30%, rgba(74,143,170,0.18) 70%, transparent)' }}
      />

      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.3em] text-center mb-8">
          Routes to every major AI provider
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
          {providers.map((p) => (
            <div
              key={p.name}
              className={`
                group flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                transition-all duration-200 cursor-default
                ${p.status === 'live'
                  ? 'glass-neutral hover:border-[rgba(196,146,48,0.22)] hover:bg-[rgba(196,146,48,0.04)] hover:text-[var(--text-primary)]'
                  : 'opacity-40 hover:opacity-60'
                }
              `}
              style={{ color: p.status === 'live' ? 'var(--text-secondary)' : 'var(--text-muted)' }}
            >
              {/* Status dot */}
              {p.status === 'live' ? (
                <span className="live-dot" style={{ width: '6px', height: '6px' }} />
              ) : (
                <span className="soon-dot" style={{ width: '6px', height: '6px' }} />
              )}

              {/* Icon + name */}
              <span className="text-[var(--text-faint)] text-xs leading-none">{p.icon}</span>
              <span>{p.name}</span>

              {/* Latency badge — live only */}
              {p.latency && (
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: 'rgba(74,143,170,0.1)',
                    color: 'var(--sky-mid)',
                    border: '1px solid rgba(74,143,170,0.15)',
                  }}
                >
                  {p.latency}
                </span>
              )}

              {/* Coming soon label */}
              {p.status === 'soon' && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                  soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
