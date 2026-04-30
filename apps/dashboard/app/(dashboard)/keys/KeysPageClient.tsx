'use client';

import { useState } from 'react';
import { KeyRow } from '@/lib/queries/keys';
import { formatDate, relativeTime, formatNumber } from '@/lib/format';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import CreateKeyModal from '@/components/keys/CreateKeyModal';
import { revokeKeyAction } from '@/app/actions/keys';
import { cn } from '@/lib/utils';

export default function KeysPageClient({ initialKeys }: { initialKeys: KeyRow[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    try {
      await revokeKeyAction(id);
      setRevokingId(null);
    } catch (err) {
      alert('Failed to revoke key');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--gold-cream)] text-2xl font-semibold mb-1">API Keys</h1>
          <p className="text-[var(--text-muted)] text-sm">Manage your authentication credentials.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold-mid)] text-black font-bold px-5 py-2.5 rounded-[var(--radius-md)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Create Key
        </button>
      </div>

      {initialKeys.length === 0 ? (
        <EmptyState
          message="No API keys yet."
          sub="Create your first key to start making authenticated requests to AICore."
          icon="◇"
        />
      ) : (
        <div
          className="rounded-[var(--radius-lg)] overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Prefix</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-center">Env</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">Last Used</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Usage</th>
                  <th className="px-4 py-3 text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialKeys.map((key, i) => (
                  <tr
                    key={key.id}
                    className={cn('hover:bg-[rgba(255,255,255,0.02)] transition-colors', !key.isActive && 'opacity-40 grayscale-[0.5]')}
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{key.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-[var(--sky-bright)] text-xs font-mono">{key.keyPrefix}...</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant={key.environment === 'live' ? 'error' : 'info'}
                        label={key.environment === 'live' ? 'live' : 'dev'}
                        size="xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]" title={formatDate(key.createdAt)}>
                      {formatDate(key.createdAt).split(' · ')[0]}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {key.lastUsedAt ? relativeTime(new Date(key.lastUsedAt).getTime()) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)] font-medium">
                      {formatNumber(key.usageCount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {key.isActive ? (
                        revokingId === key.id ? (
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold">Sure?</span>
                            <button 
                              onClick={() => setRevokingId(null)}
                              className="text-[var(--text-muted)] hover:text-white text-xs"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleRevoke(key.id)}
                              className="text-[var(--error)] hover:underline text-xs font-bold"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setRevokingId(key.id)}
                            className="text-[var(--error)]/70 hover:text-[var(--error)] hover:underline text-xs transition-colors"
                          >
                            Revoke
                          </button>
                        )
                      ) : (
                        <span className="text-[var(--text-faint)] text-xs italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && <CreateKeyModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
