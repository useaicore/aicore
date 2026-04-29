import { cn } from '@/lib/utils';

interface EmptyStateProps {
  message: string;
  height?: string;
  className?: string;
}

export default function EmptyState({ message, height = '200px', className }: EmptyStateProps) {
  return (
    <div 
      style={{ height }}
      className={cn(
        "flex items-center justify-center bg-[var(--bg-surface)] border border-dashed border-[var(--text-faint)] rounded-[var(--radius-lg)]",
        className
      )}
    >
      <span className="text-[var(--text-muted)] text-sm">
        {message}
      </span>
    </div>
  );
}
