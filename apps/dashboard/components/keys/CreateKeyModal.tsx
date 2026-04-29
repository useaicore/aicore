'use client';

import { useState } from 'react';
import { createKeyAction } from '@/app/actions/keys';
import CopyButton from '@/components/ui/CopyButton';
import Badge from '@/components/ui/Badge';

export default function CreateKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'development'>('development');
  const [loading, setLoading] = useState(false);
  const [plainKey, setPlainKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('environment', environment);

    try {
      const result = await createKeyAction(formData);
      setPlainKey(result.plainKey);
    } catch (err) {
      alert('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  if (plainKey) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6 w-full max-w-[440px] shadow-2xl">
          <h3 className="text-[var(--gold-cream)] font-bold text-lg mb-2">Key Created Successfully</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Save this key now — it won't be shown again for security reasons.
          </p>

          <div className="bg-[var(--bg-surface)] border border-[var(--gold-dim)] rounded-[var(--radius-md)] p-3 flex items-center justify-between gap-4 mb-8">
            <code className="text-[var(--sky-bright)] text-xs break-all font-mono">
              {plainKey}
            </code>
            <CopyButton value={plainKey} className="flex-shrink-0" />
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] p-6 w-full max-w-[440px] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[var(--text-primary)] font-bold text-lg">Create API Key</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
              Key Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-md)] px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold-dim)] transition-colors"
              placeholder="e.g. Production App"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-3">
              Environment
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="environment"
                  value="development"
                  checked={environment === 'development'}
                  onChange={() => setEnvironment('development')}
                  className="hidden"
                />
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                  environment === 'development' ? "border-[var(--gold-bright)] bg-[var(--gold-dim)]/20" : "border-[var(--text-faint)]"
                )}>
                  {environment === 'development' && <div className="w-2 h-2 rounded-full bg-[var(--gold-bright)]" />}
                </div>
                <span className="text-sm text-[var(--text-primary)]">Development</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  checked={environment === 'live'}
                  onChange={() => setEnvironment('live')}
                  className="hidden"
                />
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                  environment === 'live' ? "border-[var(--error)] bg-[var(--error)]/20" : "border-[var(--text-faint)]"
                )}>
                  {environment === 'live' && <div className="w-2 h-2 rounded-full bg-[var(--error)]" />}
                </div>
                <span className="text-sm text-[var(--text-primary)]">Live</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--gold-bright)] text-black font-bold py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--gold-cream)] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
