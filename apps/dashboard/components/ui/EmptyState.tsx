import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  message: string;
  sub?: string;
  height?: string;
  className?: string;
  action?: { label: string; href: string };
  icon?: string;
}

export default function EmptyState({
  message,
  sub,
  height = '200px',
  className,
  action,
  icon = '◈',
}: EmptyStateProps) {
  return (
    <div
      style={{
        minHeight: height,
        background:
          'repeating-linear-gradient(-45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 12px)',
        border: '1px dashed rgba(255,255,255,0.07)',
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] px-6 py-10 text-center',
        className,
      )}
    >
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-lg"
        style={{
          background: 'rgba(196,146,48,0.07)',
          border: '1px solid rgba(196,146,48,0.12)',
          color: 'var(--gold-dim)',
        }}
      >
        {icon}
      </div>

      <div>
        <p className="text-[var(--text-secondary)] text-sm font-medium">{message}</p>
        {sub && (
          <p className="text-[var(--text-muted)] text-xs mt-1 leading-relaxed max-w-[280px]">{sub}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="mt-1 inline-flex items-center gap-1.5 text-[var(--gold-mid)] text-sm font-semibold hover:text-[var(--gold-bright)] transition-colors duration-150"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
