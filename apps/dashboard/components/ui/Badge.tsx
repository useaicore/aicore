import { cn } from '@/lib/utils.js';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  label: string | number;
  size?: 'sm' | 'xs';
  className?: string;
}

export default function Badge({ variant = 'info', label, size = 'sm', className }: BadgeProps) {
  const variants = {
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
    error: "bg-[var(--error)]/10 text-[var(--error)]",
    info: "bg-[var(--sky-dim)]/20 text-[var(--sky-bright)]",
    muted: "bg-[var(--bg-subtle)] text-[var(--text-muted)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    xs: "px-1.5 py-0.5 text-[10px]",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      variants[variant],
      sizes[size],
      className
    )}>
      {label}
    </span>
  );
}
