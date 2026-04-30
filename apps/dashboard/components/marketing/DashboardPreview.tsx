const logRows = [
  { model: 'gpt-4o',          feature: 'summarizer',  ms: '342ms',  cost: '$0.0041', ok: true  },
  { model: 'claude-3-5-sonnet', feature: 'chat',       ms: '891ms',  cost: '$0.0019', ok: true  },
  { model: 'gemini-1.5-flash', feature: 'classifier',  ms: '201ms',  cost: '$0.0003', ok: true  },
  { model: 'gpt-4o-mini',      feature: 'embeddings',  ms: '—',      cost: '—',       ok: false },
  { model: 'claude-3-haiku',   feature: 'chat',        ms: '412ms',  cost: '$0.0008', ok: true  },
];

const statCards = [
  { label: 'Total Requests',  value: '847,293', delta: '+12.4%', up: true,  color: 'gold' },
  { label: 'Total Spend',     value: '$2,341',  delta: '+8.2%',  up: true,  color: 'gold' },
  { label: 'Avg Latency',     value: '412ms',   delta: '-3.1%',  up: false, color: 'sky'  },
  { label: 'Active Keys',     value: '8',       delta: '+2',     up: true,  color: 'sky'  },
];

const navItems = ['Overview', 'Logs', 'Usage', 'Keys', 'Settings'];

// SVG chart path — 14-day spend trend, gently rising
const chartPath = 'M 0,60 C 15,58 25,54 40,50 C 55,46 65,52 80,46 C 95,40 110,34 130,30 C 150,26 165,32 185,24 C 200,18 215,14 240,10';
const chartArea = `${chartPath} L 240,80 L 0,80 Z`;

const callouts = [
  {
    icon: '◈',
    title: 'Per-feature cost breakdown',
    body: 'See exactly which part of your product is burning AI budget. Allocate by feature, user, or environment.',
    color: 'gold',
  },
  {
    icon: '◉',
    title: 'Real-time request logs',
    body: 'Every AI call logged with model, latency, tokens, cost, and trace ID. Filter, search, and export.',
    color: 'sky',
  },
  {
    icon: '◇',
    title: 'Latency & reliability tracking',
    body: 'P50 / P95 / P99 latency per provider. Circuit breaker state and failover events visible at a glance.',
    color: 'gold',
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative py-28 overflow-hidden section-sky-ambient">
      {/* Sky ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(74,143,170,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[var(--sky-mid)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">
            Dashboard
          </span>
          <h2
            className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-5 leading-tight"
            style={{ letterSpacing: '-0.025em' }}
          >
            See everything.<br />
            <span className="gradient-sky">In real time.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[460px] mx-auto leading-relaxed">
            The moment your first call goes through AICore, your dashboard
            lights up — spend, latency, logs, and errors in one place.
          </p>
        </div>

        {/* Browser chrome mockup */}
        <div
          className="rounded-[var(--radius-xl)] overflow-hidden mb-16 glow-sky"
          style={{
            border: '1px solid rgba(74,143,170,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Browser top bar */}
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              background: 'rgba(13,11,16,0.98)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full opacity-70" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full opacity-70" style={{ background: '#FEBC2E' }} />
              <span className="w-3 h-3 rounded-full opacity-70" style={{ background: '#28C840' }} />
            </div>
            {/* URL bar */}
            <div
              className="flex items-center gap-2 flex-1 max-w-[280px] mx-auto px-3 py-1.5 rounded-[var(--radius-sm)]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span style={{ color: 'var(--success)', fontSize: '10px' }}>●</span>
              <span className="text-[var(--text-muted)] text-[11px] font-mono">app.aicore.dev/overview</span>
            </div>
          </div>

          {/* Dashboard layout */}
          <div
            className="flex overflow-hidden"
            style={{ background: 'var(--bg-base)', minHeight: '420px' }}
          >
            {/* Sidebar */}
            <div
              className="hidden md:flex flex-col flex-shrink-0 w-[180px] py-5 px-3 gap-1"
              style={{
                background: 'var(--bg-surface)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Logo */}
              <div className="flex items-center gap-2 px-3 mb-5">
                <span style={{ color: 'var(--gold-bright)', fontSize: '13px' }}>◆</span>
                <span className="text-[var(--text-primary)] font-bold text-sm">AICore</span>
              </div>
              {/* Nav items */}
              {navItems.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium"
                  style={{
                    background: i === 0 ? 'rgba(196,146,48,0.1)' : 'transparent',
                    color: i === 0 ? 'var(--gold-bright)' : 'var(--text-muted)',
                    border: i === 0 ? '1px solid rgba(196,146,48,0.15)' : '1px solid transparent',
                  }}
                >
                  <span className="text-[10px] opacity-60">
                    {['◈', '◉', '◇', '⬡', '◎'][i]}
                  </span>
                  {item}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[var(--text-primary)] font-bold text-base">Overview</h3>
                  <p className="text-[var(--text-muted)] text-[11px]">Apr 2026 · workspace: my-app</p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-[var(--radius-sm)] text-[11px] text-[var(--text-muted)] font-mono"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  Last 30 days ▾
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {statCards.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-[var(--radius-md)]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-2">
                      {c.label}
                    </p>
                    <p
                      className="font-black text-lg leading-none mb-1"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: c.color === 'gold' ? 'var(--gold-cream)' : 'var(--sky-bright)',
                      }}
                    >
                      {c.value}
                    </p>
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: c.up ? 'var(--success)' : 'var(--sky-bright)' }}
                    >
                      {c.delta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom row: chart + logs */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

                {/* Spend chart */}
                <div
                  className="lg:col-span-2 p-4 rounded-[var(--radius-md)]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-3">Daily spend</p>
                  <svg
                    viewBox="0 0 240 80"
                    className="w-full"
                    style={{ height: '80px' }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(196,146,48,0.25)" />
                        <stop offset="100%" stopColor="rgba(196,146,48,0)" />
                      </linearGradient>
                    </defs>
                    {/* Area fill */}
                    <path d={chartArea} fill="url(#chartGrad)" />
                    {/* Line */}
                    <path
                      d={chartPath}
                      stroke="var(--gold-bright)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* End dot */}
                    <circle cx="240" cy="10" r="3" fill="var(--gold-bright)" />
                  </svg>
                </div>

                {/* Logs table */}
                <div
                  className="lg:col-span-3 rounded-[var(--radius-md)] overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Recent requests</p>
                  </div>
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {logRows.map((row, i) => (
                      <div
                        key={i}
                        className="grid gap-2 px-4 py-2.5 font-mono text-[11px]"
                        style={{
                          gridTemplateColumns: '1fr 80px 60px 52px 20px',
                          background: !row.ok ? 'rgba(239,68,68,0.04)' : 'transparent',
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>{row.model}</span>
                          <span
                            className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)' }}
                          >
                            {row.feature}
                          </span>
                        </div>
                        <span style={{ color: row.ok ? 'var(--text-muted)' : 'var(--error)' }}>{row.ms}</span>
                        <span style={{ color: 'var(--text-faint)' }}></span>
                        <span style={{ color: row.ok ? 'var(--gold-mid)' : 'var(--error)' }}>{row.cost}</span>
                        <span style={{ color: row.ok ? 'var(--success)' : 'var(--error)', fontSize: '10px' }}>
                          {row.ok ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {callouts.map((c, i) => (
            <div key={i} className="flex gap-4">
              <div
                className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                style={{
                  background:
                    c.color === 'gold'
                      ? 'rgba(196,146,48,0.1)'
                      : 'rgba(74,143,170,0.1)',
                  border: `1px solid ${
                    c.color === 'gold'
                      ? 'rgba(196,146,48,0.18)'
                      : 'rgba(74,143,170,0.18)'
                  }`,
                  color: c.color === 'gold' ? 'var(--gold-bright)' : 'var(--sky-bright)',
                }}
              >
                {c.icon}
              </div>
              <div>
                <h4 className="text-[var(--text-primary)] font-semibold text-sm mb-1.5 leading-tight">
                  {c.title}
                </h4>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
