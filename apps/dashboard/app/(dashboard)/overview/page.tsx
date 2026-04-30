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

  const isNewUser = requests.count === 0;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-1">Overview</h1>
          <p className="text-[var(--text-muted)] text-sm">Monitor your API performance and usage.</p>
        </div>

        <div className="flex bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-lg p-1">
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

      {/* Onboarding banner — shown only when no requests have been made */}
      {isNewUser && (
        <div
          className="mb-8 rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(196,146,48,0.05) 0%, rgba(74,143,170,0.04) 100%)',
            border: '1px solid rgba(196,146,48,0.15)',
          }}
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
                Getting Started
              </span>
              <h2 className="text-[var(--text-primary)] text-lg font-semibold mb-1">
                Make your first API call in 60 seconds
              </h2>
              <p className="text-[var(--text-muted)] text-sm max-w-[480px]">
                Point your existing OpenAI SDK at AICore. No new libraries needed — just two lines of config.
              </p>
            </div>
            <Link
              href="/keys"
              className="btn-primary flex-shrink-0 text-sm px-4 py-2"
            >
              Create API key →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Create an API key',
                desc: 'Generate a key from the Keys page. One key unlocks all providers.',
                href: '/keys',
                cta: 'Go to Keys',
              },
              {
                step: '02',
                title: 'Install & configure',
                desc: null,
                code: `import OpenAI from 'openai'\n\nconst ai = new OpenAI({\n  apiKey: process.env.AICORE_API_KEY,\n  baseURL: 'https://api.aicore.dev/v1',\n})`,
              },
              {
                step: '03',
                title: 'Make a call',
                desc: null,
                code: `const res = await ai.chat.completions.create({\n  model: 'gpt-4o-mini',\n  messages: [{ role: 'user',\n    content: 'Hello AICore!' }],\n})`,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(13,11,16,0.6)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-black tabular-nums"
                    style={{
                      color: 'var(--gold-mid)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}
                  >
                    {item.step}
                  </span>
                  <span className="text-[var(--text-secondary)] text-xs font-semibold">{item.title}</span>
                </div>
                {item.desc && (
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-3">{item.desc}</p>
                )}
                {item.code && (
                  <pre
                    className="text-[10.5px] leading-[1.7] rounded-md p-3 overflow-x-auto"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      background: 'rgba(0,0,0,0.4)',
                      color: 'rgba(245,236,215,0.7)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {item.code}
                  </pre>
                )}
                {item.cta && item.href && (
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-1 text-[var(--gold-mid)] text-xs font-semibold hover:text-[var(--gold-bright)] transition-colors"
                  >
                    {item.cta} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
      <div
        className="rounded-[var(--radius-lg)] p-6 mb-10"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
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
          <EmptyState
            message="No requests yet."
            sub="Make your first API call to see logs appear here in real time."
            action={{ label: 'View setup guide', href: '/docs' }}
            icon="◈"
          />
        ) : (
          <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Tokens</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Cost</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Latency</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.rows.map((log, i) => (
                    <tr
                      key={log.callId}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      style={{
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                      }}
                    >
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
