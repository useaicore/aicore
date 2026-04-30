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
import Link from 'next/link';
import { cn } from '@/lib/utils';


export async function OverviewStats({ workspaceId, days }: { workspaceId: string, days: number }) {
  const [requests, spend, latency, activeKeys] = await Promise.all([
    getTotalRequests(workspaceId, days),
    getTotalSpend(workspaceId, days),
    getAvgLatency(workspaceId, days),
    getActiveKeyCount(workspaceId),
  ]);

  return (
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
  );
}

export async function OverviewChart({ workspaceId, days }: { workspaceId: string, days: number }) {
  const dailySpend = await getDailySpend(workspaceId, days);

  return (
    <div className="glass-strong rounded-2xl p-6 mb-10 border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-mid/[0.02] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest">Spend over time</h3>
          <p className="text-text-muted text-[10px]">Usage across all API keys</p>
        </div>
        <span className="text-text-faint text-[10px] uppercase font-black tracking-[0.2em] bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">USD</span>
      </div>
      <div className="relative z-10">
        <SpendAreaChart data={dailySpend} />
      </div>
    </div>
  );
}

export async function OverviewLogs({ workspaceId }: { workspaceId: string }) {
  const recentLogs = await getLogs({ workspaceId, page: 1, pageSize: 10 });

  if (recentLogs.rows.length === 0) {
    return (
      <EmptyState
        message="No requests yet."
        sub="Make your first API call to see logs appear here in real time."
        action={{ label: 'View setup guide', href: '/docs' }}
        icon="◈"
      />
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest">Model</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest">Tokens</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest text-right">Cost</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest text-right">Latency</th>
              <th className="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentLogs.rows.map((log) => (
              <tr key={log.callId} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-text-secondary whitespace-nowrap text-xs">{relativeTime(log.timestampMs)}</td>
                <td className="px-6 py-4">
                  <code className="text-sky-bright text-[11px] font-mono bg-sky-mid/10 px-1.5 py-0.5 rounded border border-sky-mid/20">{log.model}</code>
                </td>
                <td className="px-6 py-4 text-text-muted text-xs capitalize">{log.provider}</td>
                <td className="px-6 py-4 text-text-secondary tabular-nums text-xs">{formatNumber(log.totalTokens)}</td>
                <td className="px-6 py-4 text-text-primary text-right tabular-nums text-xs font-bold">{formatCents(log.costCents)}</td>
                <td className="px-6 py-4 text-right tabular-nums text-xs">
                  <span className={cn(
                    "font-bold",
                    log.latencyMs < 500 ? 'text-success' :
                    log.latencyMs < 2000 ? 'text-warning' : 'text-error'
                  )}>
                    {formatLatency(log.latencyMs)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge
                    variant={log.statusCode < 400 ? 'success' : log.statusCode < 500 ? 'warning' : 'error'}
                    label={log.statusCode}
                    size="xs"
                    dot
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
