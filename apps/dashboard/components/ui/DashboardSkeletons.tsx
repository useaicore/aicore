import Skeleton from './Skeleton';

export function StatCardSkeleton() {
  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 space-y-3">
      <Skeleton className="h-3 w-20 opacity-50" />
      <div className="flex items-end gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-12 opacity-30" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-bg-surface border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32 opacity-50" />
        <Skeleton className="h-3 w-12 opacity-20" />
      </div>
      <div className="h-[300px] w-full flex items-end gap-2 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg" 
            style={{ 
              height: `${Math.floor(Math.random() * 60) + 20}%`,
              opacity: (i + 1) / 12 * 0.5
            }} 
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-bg-surface/50">
      <div className="bg-white/3 border-b border-white/5 px-6 py-4 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 opacity-20" />
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-5 flex gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1 opacity-40" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
