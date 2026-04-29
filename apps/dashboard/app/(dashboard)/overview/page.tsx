export default function OverviewPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-1">Overview</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">Last 30 days</p>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Requests" value="—" />
        <StatCard label="Total Spend" value="—" />
        <StatCard label="Avg Latency" value="—" />
        <StatCard label="Active Keys" value="—" />
      </div>

      <div className="mt-12">
        <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-4">Recent Requests</h3>
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--text-faint)] rounded-[var(--radius-lg)] h-[200px] flex items-center justify-center">
          <span className="text-[var(--text-muted)] text-sm">
            No requests yet. Make your first API call.
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--gold-dim)] transition-all duration-200">
      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.08em] mb-2 font-medium">
        {label}
      </p>
      <p className="text-[var(--gold-cream)] text-3xl font-bold font-variant-numeric-tabular-nums">
        {value}
      </p>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--gold-dim)] rounded-b-[var(--radius-lg)] opacity-30 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
