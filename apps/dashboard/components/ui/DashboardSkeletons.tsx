import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden glass-neutral rounded-xl bg-white/[0.02]", 
        className
      )}
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-beam-sweep" style={{ animationDuration: '3.5s' }} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden group border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-beam-sweep" style={{ animationDuration: '4s' }} />
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="w-24 h-4 opacity-40" />
        <Skeleton className="w-8 h-8 rounded-lg opacity-20" />
      </div>
      <Skeleton className="w-32 h-8 mb-2" />
      <Skeleton className="w-40 h-3 opacity-30" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-strong rounded-2xl p-8 relative overflow-hidden h-[400px] border-white/5">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-beam-sweep" style={{ animationDuration: '5s' }} />
       <div className="flex justify-between items-end h-[280px] gap-3 mt-8">
          {[...Array(12)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-full opacity-10" 
              style={{ 
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.15}s` 
              }} 
            />
          ))}
       </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <div className="bg-white/[0.02] px-6 py-4 border-b border-white/5">
        <Skeleton className="w-32 h-4 opacity-30" />
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0 opacity-20" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-1/3 h-4 opacity-40" />
                <Skeleton className="w-1/4 h-3 opacity-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-6 rounded-lg opacity-10" />
              <Skeleton className="w-12 h-6 rounded-lg opacity-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
