export default function FeaturesGrid() {
  const features = [
    {
      icon: '⬡',
      color: 'text-[var(--gold-bright)]',
      title: 'One key for everything',
      body: 'Replace five provider keys with one. Rotate it, revoke it, or scope it to an environment — from a single dashboard.'
    },
    {
      icon: '▦',
      color: 'text-[var(--sky-bright)]',
      title: 'See every request',
      body: 'Every call logged with model, tokens, cost, latency, and status. Filter by provider, date, or error state in seconds.'
    },
    {
      icon: '◎',
      color: 'text-[var(--gold-bright)]',
      title: "Know what you're spending",
      body: 'Per-request cost in cents. Aggregated by model, provider, or time period. No surprises at month-end.'
    },
    {
      icon: '↻',
      color: 'text-[var(--sky-bright)]',
      title: 'Automatic Failover',
      body: 'Define fallback chains. If OpenAI returns a 5xx, AICore retries with your next provider automatically.'
    },
    {
      icon: '✦',
      color: 'text-[var(--gold-bright)]',
      title: 'Drop-in Compatible',
      body: 'AICore is OpenAI-compatible. Swap your baseURL, keep your existing SDK. No migration, no refactoring.'
    },
    {
      icon: '⚙',
      color: 'text-[var(--sky-bright)]',
      title: 'Environment Aware',
      body: 'Separate live and development keys. Filter logs by environment. Never mix test traffic with production data.'
    }
  ];

  return (
    <section id="features" className="py-24 max-w-[1100px] mx-auto px-6">
      <div className="text-center mb-20">
        <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Features</span>
        <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)]">
          Everything you need.<br />
          <span className="gradient-gold">Nothing you don't.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--text-faint)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] overflow-hidden">
        {features.map((f, i) => (
          <div key={i} className="bg-[var(--bg-base)] p-10 hover:bg-[var(--bg-surface)] transition-colors group">
            <span className={`block text-3xl mb-6 ${f.color} group-hover:scale-110 transition-transform duration-300`}>{f.icon}</span>
            <h3 className="text-[var(--text-primary)] font-semibold text-xl mb-4 tracking-tight">{f.title}</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed opacity-80">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
