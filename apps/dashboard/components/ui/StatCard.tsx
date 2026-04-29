import Badge from './Badge.js';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  unit?: string;
}

export default function StatCard({ label, value, change, unit }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--gold-dim)] transition-all duration-200">
      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.08em] mb-2 font-medium">
        {label}
      </p>
      
      <div className="flex items-end gap-2 mb-1">
        <p className="text-[var(--gold-cream)] text-3xl font-bold font-variant-numeric-tabular-nums">
          {value}
        </p>
        {unit && (
          <span className="text-[var(--text-muted)] text-sm mb-1.5 font-medium">
            {unit}
          </span>
        )}
      </div>

      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1.5 mt-2">
          <Badge 
            variant={change >= 0 ? 'success' : 'error'} 
            size="xs"
            label={`${change >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(change))}%`}
          />
          <span className="text-[var(--text-faint)] text-[10px] font-medium">
            vs last period
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--gold-dim)] rounded-b-[var(--radius-lg)] opacity-30 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
