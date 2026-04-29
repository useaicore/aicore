import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  getTotalRequests, 
  getTotalSpend, 
  getAvgLatency, 
  getActiveKeyCount 
} from '@/lib/queries/overview';
import { getDailySpend } from '@/lib/queries/usage';
import { getLogs } from '@/lib/queries/logs';
import { formatCents, formatLatency, relativeTime, formatNumber } from '@/lib/format';
import StatCard from '@/components/ui/StatCard';
import SpendAreaChart from '@/components/charts/SpendAreaChart';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

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

  const [requests, spend, latency, activeKeys, dailySpend, recentLogs] = await Promise.all([
    getTotalRequests(workspaceId, days),
    getTotalSpend(workspaceId, days),
    getAvgLatency(workspaceId, days),
    getActiveKeyCount(workspaceId),
    getDailySpend(workspaceId, days),
    getLogs({ workspaceId, page: 1, pageSize: 10 }),
  ]);

  const periods = [
    { label: '7d', value: '7' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-1">Overview</h1>
          <p className="text-[var(--text-muted)] text-sm">Monitor your API performance and usage.</p>
        </div>

        <div className="flex bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-lg p-1">
          {periods.map((p) => (
            <Link
              key={p.value}
              href={`/overview?period=${p.value}`}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === p.value
                  ? 'bg-[var(--bg-elevated)] border border-[var(--gold-dim)] text-[var(--gold-cream)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Requests" 
          value={formatNumber(requests.count)} 
          change={requests.change} 
        />
        <StatCard 
          label="Total Spend" 
          value={formatCents(spend.cents)} 
          change={spend.change} 
        />
        <StatCard 
          label="Avg Latency" 
          value={latency.ms} 
          unit="ms" 
          change={latency.change} 
        />
        <StatCard 
          label="Active Keys" 
          value={activeKeys} 
          change={null} 
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[var(--text-secondary)] text-sm font-medium">Spend over time</h3>
          <span className="text-[var(--text-faint)] text-[10px] uppercase font-bold tracking-widest">USD</span>
        </div>
        <SpendAreaChart data={dailySpend} />
      </div>

      {/* Recent Requests Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--text-secondary)] text-sm font-medium">Recent Requests</h3>
          <Link href="/logs" className="text-[var(--sky-mid)] text-xs font-medium hover:text-[var(--sky-bright)] transition-colors">
            View all logs →
          </Link>
        </div>

        {recentLogs.rows.length === 0 ? (
          <EmptyState message="No requests yet. Make your first API call." />
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--text-faint)] bg-[var(--bg-subtle)]/30">
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Tokens</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Cost</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Latency</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--text-faint)]">
                  {recentLogs.rows.map((log) => (
                    <tr key={log.callId} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{relativeTime(log.timestampMs)}</td>
                      <td className="px-4 py-3">
                        <code className="text-[var(--sky-bright)] text-xs font-mono">{log.model}</code>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] capitalize">{log.provider}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] tabular-nums">{formatNumber(log.totalTokens)}</td>
                      <td className="px-4 py-3 text-[var(--text-primary)] text-right tabular-nums">{formatCents(log.costCents)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={
                          log.latencyMs < 500 ? 'text-[var(--success)]' :
                          log.latencyMs < 2000 ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                        }>
                          {formatLatency(log.latencyMs)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge 
                          variant={log.statusCode < 400 ? 'success' : log.statusCode < 500 ? 'warning' : 'error'}
                          label={log.statusCode}
                          size="xs"
                        />
                        {log.isError && <span className="ml-1 text-[var(--error)]" title="Error">⚠</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
