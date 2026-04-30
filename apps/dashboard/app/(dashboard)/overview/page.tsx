import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { 
  OverviewStats, 
  OverviewChart, 
  OverviewLogs 
} from '@/components/overview/OverviewSections';
import { 
  StatCardSkeleton, 
  ChartSkeleton, 
  TableSkeleton 
} from '@/components/ui/DashboardSkeletons';

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  const { period = '30' } = await searchParams;
  const days = parseInt(period);
  const workspaceId = session.user.id;

  const periods = [
    { label: '7d', value: '7' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
  ];

  return (
    <div className="max-w-7xl animate-float-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-gold-cream text-3xl font-black tracking-tight mb-2">Overview</h1>
          <p className="text-text-muted text-sm font-medium">Monitor your API performance and usage metrics.</p>
        </div>

        <div className="flex glass border-white/5 rounded-xl p-1 shadow-xl">
          {periods.map((p) => (
            <Link
              key={p.value}
              href={`/overview?period=${p.value}`}
              className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                period === p.value
                  ? 'bg-gold-mid/10 border border-gold-mid/30 text-gold-cream shadow-inner'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <OverviewStats workspaceId={workspaceId} days={days} />
      </Suspense>

      {/* Main Chart Section */}
      <Suspense fallback={<ChartSkeleton />}>
        <OverviewChart workspaceId={workspaceId} days={days} />
      </Suspense>

      {/* Recent Requests Table */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="space-y-1">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest">Recent Requests</h3>
            <p className="text-text-muted text-[10px]">Latest traffic processed by AICore</p>
          </div>
          <Link href="/logs" className="text-sky-mid text-xs font-bold hover:text-sky-bright transition-colors bg-sky-mid/5 px-3 py-1.5 rounded-lg border border-sky-mid/10 hover:border-sky-mid/30">
            View all logs →
          </Link>
        </div>

        <Suspense fallback={<TableSkeleton rows={8} />}>
          <OverviewLogs workspaceId={workspaceId} />
        </Suspense>
      </div>
    </div>
  );
}

