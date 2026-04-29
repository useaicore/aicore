import { cn } from '@/lib/utils.js';

export default function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--bg-subtle)]", className)}
      {...props}
    />
  );
}
