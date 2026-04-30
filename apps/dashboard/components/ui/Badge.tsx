import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  label: string | number;
  size?: 'sm' | 'xs';
  dot?: boolean;
  className?: string;
}

const variants = {
  success: 'bg-success/10 border-success/20 text-success',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  error:   'bg-error/10 border-error/20 text-error',
  info:    'bg-sky-bright/10 border-sky-bright/20 text-sky-bright',
  muted:   'bg-white/5 border-white/10 text-text-muted',
};

const dotColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-sky-bright',
  muted:   'bg-text-muted',
};

export default function Badge({ variant = 'info', label, size = 'sm', dot, className }: BadgeProps) {
  const isXs = size === 'xs';

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border backdrop-blur-md transition-all',
        isXs ? 'text-[9px] px-1.5 py-0.5 gap-1' : 'text-[10px] px-2 py-1 gap-1.5',
        'uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'rounded-full flex-shrink-0',
          isXs ? 'w-1 h-1' : 'w-1.5 h-1.5',
          dotColors[variant],
          variant !== 'muted' && 'animate-pulse'
        )} />
      )}
      {label}
    </span>
  );
}

