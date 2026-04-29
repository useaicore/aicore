import { headers } from 'next/headers';
import { auth } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  getDailySpend, 
  getSpendByModel, 
  getSpendByProvider, 
  getTokenUsage 
} from '@/lib/queries/usage.js';
import { getTotalRequests, getTotalSpend } from '@/lib/queries/overview.js';
import { formatCents, formatNumber } from '@/lib/format.js';
import StatCard from '@/components/ui/StatCard.js';
import SpendAreaChart from '@/components/charts/SpendAreaChart.js';
import SpendBarChart from '@/components/charts/SpendBarChart.js';
import SpendPieChart from '@/components/charts/SpendPieChart.js';
import TokenChart from '@/components/charts/TokenChart.js';

export default async function UsagePage({
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

  const [dailySpend, byModel, byProvider, tokenUsage, requests, totalSpend] = await Promise.all([
    getDailySpend(workspaceId, days),
    getSpendByModel(workspaceId, days),
    getSpendByProvider(workspaceId, days),
    getTokenUsage(workspaceId, days),
    getTotalRequests(workspaceId, days),
    getTotalSpend(workspaceId, days),
  ]);

  const totalTokens = tokenUsage.reduce((acc, curr) => acc + curr.inputTokens + curr.outputTokens, 0);

  const periods = [
    { label: '7d', value: '7' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-1">Usage Analytics</h1>
          <p className="text-[var(--text-muted)] text-sm">Deep dive into your API consumption.</p>
        </div>

        <div className="flex bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-lg p-1">
          {periods.map((p) => (
            <Link
              key={p.value}
              href={`/usage?period=${p.value}`}
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

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Spend" value={formatCents(totalSpend.cents)} change={totalSpend.change} />
        <StatCard label="Total Tokens" value={formatNumber(totalTokens)} change={null} />
        <StatCard label="Total Requests" value={formatNumber(requests.count)} change={requests.change} />
      </div>

      {/* Spend Area Chart */}
      <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6 mb-6">
        <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-8">Spend Over Time</h3>
        <SpendAreaChart data={dailySpend} height={280} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spend by Model */}
        <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6">
          <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-8">Spend by Model</h3>
          <SpendBarChart data={byModel} />
        </div>

        {/* Spend by Provider */}
        <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6">
          <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-8">Spend by Provider</h3>
          <SpendPieChart data={byProvider} />
        </div>
      </div>

      {/* Token Usage Chart */}
      <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-8">Token Consumption</h3>
        <TokenChart data={tokenUsage} />
      </div>
    </div>
  );
}
