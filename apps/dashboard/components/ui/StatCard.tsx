import Badge from './Badge';
import Skeleton from './Skeleton';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  unit?: string;
  loading?: boolean;
  accent?: 'gold' | 'sky';
}

export default function StatCard({ label, value, change, unit, loading, accent = 'gold' }: StatCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-[var(--radius-lg)] p-5 relative overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-3" />
        <Skeleton className="h-3 w-16" />
        {/* Shimmer beam */}
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-lg)]">
          <div
            className="absolute top-0 bottom-0 w-1/3 animate-beam-sweep"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] p-5 relative overflow-hidden group transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          accent === 'gold' ? 'rgba(196,146,48,0.22)' : 'rgba(74,143,170,0.22)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.1em] mb-3 font-semibold">
        {label}
      </p>

      <div className="flex items-end gap-1.5 mb-2">
        <p
          className="text-3xl font-black leading-none tabular-nums"
          style={{
            fontFamily: 'var(--font-geist-mono, monospace)',
            color: accent === 'gold' ? 'var(--gold-cream)' : 'var(--sky-bright)',
          }}
        >
          {value}
        </p>
        {unit && (
          <span className="text-[var(--text-muted)] text-sm mb-0.5 font-medium">{unit}</span>
        )}
      </div>

      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1.5">
          <Badge
            variant={change >= 0 ? 'success' : 'error'}
            size="xs"
            label={`${change >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(change))}%`}
          />
          <span className="text-[var(--text-faint)] text-[10px] font-medium">vs last period</span>
        </div>
      )}

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: accent === 'gold'
            ? 'linear-gradient(90deg, var(--gold-dim), var(--gold-bright))'
            : 'linear-gradient(90deg, var(--sky-dim), var(--sky-bright))',
        }}
      />
    </div>
  );
}
