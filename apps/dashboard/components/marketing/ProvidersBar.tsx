const providers = [
  { name: 'OpenAI',       icon: '◎' },
  { name: 'Anthropic',    icon: '◆' },
  { name: 'Google Gemini',icon: '◇' },
  { name: 'Mistral',      icon: '▲' },
  { name: 'Groq',         icon: '▸' },
  { name: 'Cohere',       icon: '◉' },
  { name: 'Together AI',  icon: '⊕' },
  { name: 'Perplexity',   icon: '⊙' },
];

export default function ProvidersBar() {
  return (
    <section className="relative py-10" style={{ background: 'rgba(255,255,255,0.015)' }}>
      {/* Top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,50,0.2) 30%, rgba(74,143,170,0.2) 70%, transparent)' }}
      />
      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,50,0.2) 30%, rgba(74,143,170,0.2) 70%, transparent)' }}
      />

      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.25em] text-center mb-7">
          Works with every major provider
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {providers.map((p) => (
            <div
              key={p.name}
              className="glass-neutral flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] text-sm font-medium cursor-default transition-all duration-200 hover:border-[var(--gold-dim)] hover:text-[var(--text-primary)] hover:bg-[rgba(212,168,50,0.04)]"
            >
              <span className="text-[var(--text-faint)] text-xs">{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
