import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLogs, getLogFilters } from '@/lib/queries/logs';
import { formatCents, formatLatency, formatDate, formatNumber } from '@/lib/format';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import CopyButton from '@/components/ui/CopyButton';

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
        <form className="flex flex-wrap items-center gap-2">
          {[
            {
              name: 'model',
              defaultValue: params.model,
              options: [['', 'All Models'], ...filters.models.map((m) => [m, m])],
              onChange: `(function(e){var u=new URL(window.location.href);e.target.value?u.searchParams.set('model',e.target.value):u.searchParams.delete('model');u.searchParams.set('page','1');window.location.href=u.toString()})`,
            },
            {
              name: 'provider',
              defaultValue: params.provider,
              options: [['', 'All Providers'], ...filters.providers.map((p) => [p, p])],
              onChange: `(function(e){var u=new URL(window.location.href);e.target.value?u.searchParams.set('provider',e.target.value):u.searchParams.delete('provider');u.searchParams.set('page','1');window.location.href=u.toString()})`,
            },
            {
              name: 'environment',
              defaultValue: params.environment || 'all',
              options: [['all', 'All Envs'], ['live', 'Live'], ['development', 'Dev']],
              onChange: `(function(e){var u=new URL(window.location.href);u.searchParams.set('environment',e.target.value);u.searchParams.set('page','1');window.location.href=u.toString()})`,
            },
          ].map((sel) => (
            <select
              key={sel.name}
              name={sel.name}
              defaultValue={sel.defaultValue}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                color: 'var(--text-secondary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {sel.options.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          ))}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              background: params.isError === 'true' ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface)',
              border: `1px solid ${params.isError === 'true' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8,
            }}
          >
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
            <Link
              href="/logs"
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                padding: '6px 12px',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Clear ×
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
        <EmptyState
          message={hasActiveFilters ? 'No requests match your filters.' : 'No requests yet.'}
          sub={hasActiveFilters ? 'Try clearing your filters to see all logs.' : 'Logs will appear here after your first API call.'}
          action={hasActiveFilters ? { label: 'Clear filters', href: '/logs' } : { label: 'View setup guide', href: '/docs' }}
        />
      ) : (
        <>
          <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
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
                <tbody>
                  {logs.rows.map((log, i) => (
                    <tr
                      key={log.callId}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                      style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                    >
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
