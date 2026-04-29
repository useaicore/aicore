import { headers } from 'next/headers';
import { auth } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLogs, getLogFilters } from '@/lib/queries/logs.js';
import { formatCents, formatLatency, formatDate, formatNumber } from '@/lib/format.js';
import Badge from '@/components/ui/Badge.js';
import EmptyState from '@/components/ui/EmptyState.js';
import CopyButton from '@/components/ui/CopyButton.js';

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    model?: string;
    provider?: string;
    environment?: string;
    isError?: string;
    search?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const pageSize = 50;
  const workspaceId = session.user.id;

  const [logs, filters] = await Promise.all([
    getLogs({
      workspaceId,
      page,
      pageSize,
      model: params.model,
      provider: params.provider,
      environment: params.environment,
      isError: params.isError === 'true' ? true : undefined,
      search: params.search,
      startDate: params.start,
      endDate: params.end,
    }),
    getLogFilters(workspaceId),
  ]);

  const hasActiveFilters = Object.keys(params).some(k => k !== 'page');

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-[var(--gold-cream)] text-2xl font-semibold">Request Logs</h1>
        
        {/* Filter Bar */}
        <form className="flex flex-wrap items-center gap-3">
          <select 
            name="model" 
            defaultValue={params.model}
            className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set('model', e.target.value);
              else url.searchParams.delete('model');
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            }}
          >
            <option value="">All Models</option>
            {filters.models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select 
            name="provider" 
            defaultValue={params.provider}
            className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set('provider', e.target.value);
              else url.searchParams.delete('provider');
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            }}
          >
            <option value="">All Providers</option>
            {filters.providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select 
            name="environment" 
            defaultValue={params.environment || 'all'}
            className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('environment', e.target.value);
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            }}
          >
            <option value="all">All Envs</option>
            <option value="live">Live</option>
            <option value="development">Dev</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
            <input 
              type="checkbox" 
              checked={params.isError === 'true'}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.checked) url.searchParams.set('isError', 'true');
                else url.searchParams.delete('isError');
                url.searchParams.set('page', '1');
                window.location.href = url.toString();
              }}
              className="accent-[var(--error)]"
            />
            Errors only
          </label>

          {hasActiveFilters && (
            <Link href="/logs" className="text-[var(--error)] text-xs font-medium hover:underline ml-2">
              Clear filters
            </Link>
          )}
        </form>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[var(--text-muted)] text-sm">
          Showing <span className="text-[var(--text-secondary)] font-medium">{Math.min(logs.total, (page - 1) * pageSize + 1)}–{Math.min(logs.total, page * pageSize)}</span> of <span className="text-[var(--text-secondary)] font-medium">{formatNumber(logs.total)}</span> requests
        </p>
      </div>

      {logs.rows.length === 0 ? (
        <EmptyState message="No requests match your filters." />
      ) : (
        <>
          <div className="bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--text-faint)] bg-[var(--bg-subtle)]/30">
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Call ID</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Env</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Tokens</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Cost</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Latency</th>
                    <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--text-faint)]">
                  {logs.rows.map((log) => (
                    <tr key={log.callId} className="hover:bg-[var(--bg-subtle)]/50 transition-colors group">
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap" title={formatDate(log.timestampMs)}>
                        {formatDate(log.timestampMs).split(' · ')[1]}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-[var(--text-muted)] text-[10px] font-mono group-hover:text-[var(--text-secondary)]">
                            {log.callId.substring(0, 8)}...
                          </code>
                          <CopyButton value={log.callId} size="xs" className="opacity-0 group-hover:opacity-100" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-[var(--sky-bright)] text-xs font-mono">{log.model}</code>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] capitalize">{log.provider}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={log.environment === 'live' ? 'error' : 'info'}
                          label={log.environment === 'live' ? 'live' : 'dev'}
                          size="xs"
                          className="opacity-70"
                        />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                        <span title={`Input: ${log.inputTokens} | Output: ${log.outputTokens}`}>
                          {formatNumber(log.totalTokens)}
                        </span>
                      </td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={page > 1 ? `/logs?page=${page - 1}&${new URLSearchParams(Object.entries(params).filter(([k]) => k !== 'page')).toString()}` : '#'}
                className={cn(
                  "px-4 py-2 text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-md transition-all",
                  page === 1 ? "opacity-40 cursor-not-allowed" : "hover:border-[var(--gold-dim)] text-[var(--text-primary)]"
                )}
              >
                Previous
              </Link>
              <Link
                href={page < logs.totalPages ? `/logs?page=${page + 1}&${new URLSearchParams(Object.entries(params).filter(([k]) => k !== 'page')).toString()}` : '#'}
                className={cn(
                  "px-4 py-2 text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-md transition-all",
                  page === logs.totalPages ? "opacity-40 cursor-not-allowed" : "hover:border-[var(--gold-dim)] text-[var(--text-primary)]"
                )}
              >
                Next
              </Link>
            </div>
            <span className="text-[var(--text-muted)] text-xs">
              Page {page} of {logs.totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
