import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  label: string | number;
  size?: 'sm' | 'xs';
  dot?: boolean;
  className?: string;
}

const config = {
  success: {
    bg:     'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.18)',
    text:   'var(--success)',
    dot:    '#22C55E',
  },
  warning: {
    bg:     'rgba(232,184,75,0.08)',
    border: 'rgba(232,184,75,0.18)',
    text:   'var(--warning)',
    dot:    '#E8B84B',
  },
  error: {
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
    text:   'var(--error)',
    dot:    '#EF4444',
  },
  info: {
    bg:     'rgba(74,143,170,0.1)',
    border: 'rgba(74,143,170,0.2)',
    text:   'var(--sky-bright)',
    dot:    '#7ACCE0',
  },
  muted: {
    bg:     'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.07)',
    text:   'var(--text-muted)',
    dot:    'var(--text-muted)',
  },
};

export default function Badge({ variant = 'info', label, size = 'sm', dot, className }: BadgeProps) {
  const c = config[variant];
  const isXs = size === 'xs';

  return (
    <span
      className={cn('inline-flex items-center font-semibold rounded-full', className)}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: isXs ? 10 : 11,
        padding: isXs ? '2px 7px' : '3px 9px',
        letterSpacing: '0.02em',
        gap: dot ? 5 : 0,
      }}
    >
      {dot && (
        <span
          style={{
            width: isXs ? 5 : 6,
            height: isXs ? 5 : 6,
            borderRadius: '50%',
            background: c.dot,
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
      )}
      {label}
    </span>
  );
}
