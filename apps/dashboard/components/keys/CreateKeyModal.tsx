'use client';

import { useState, useEffect } from 'react';
import { createKeyAction } from '@/app/actions/keys';
import CopyButton from '@/components/ui/CopyButton';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle, KeySquare } from 'lucide-react';

export default function CreateKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'development'>('development');
  const [loading, setLoading] = useState(false);
  const [plainKey, setPlainKey] = useState<string | null>(null);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('environment', environment);
    try {
      const result = await createKeyAction(formData);
      setPlainKey(result.plainKey);
    } catch {
      alert('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  /* Success screen */
  if (plainKey) {
    return (
      <Backdrop onClose={onClose}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/25 flex items-center justify-center text-success animate-float-up">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <h3 className="text-gold-cream font-bold text-xl tracking-tight mb-2">
            Key Created Successfully
          </h3>
          <p className="text-text-secondary/70 text-sm leading-relaxed">
            Copy your secret key now. For security, we won't show it again.
          </p>
        </div>

        {/* Key display */}
        <div className="bg-black/40 border border-gold-mid/20 rounded-xl p-4 flex items-center justify-between gap-4 mb-6 group transition-all hover:border-gold-mid/40">
          <code className="text-sky-bright text-xs font-mono break-all leading-relaxed">
            {plainKey}
          </code>
          <CopyButton value={plainKey} className="flex-shrink-0" />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 bg-gold-mid/5 border border-gold-mid/15 rounded-lg p-4 mb-8">
          <AlertTriangle size={18} className="text-gold-mid shrink-0 mt-0.5" />
          <p className="text-gold-mid/80 text-xs leading-relaxed">
            Store this key in your environment variables. It cannot be recovered if lost.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-ghost py-3 text-sm font-bold"
        >
          Done
        </button>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-mid/20 to-sky-mid/10 border border-gold-mid/25 flex items-center justify-center text-gold-bright">
            <KeySquare size={20} />
          </div>
          <h3 className="text-gold-cream font-bold text-lg tracking-tight">
            Create API Key
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-text-secondary/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-text-secondary/70 text-[10px] font-bold uppercase tracking-widest">
            Key Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production App"
            className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-mid/40 focus:ring-4 focus:ring-gold-mid/5 transition-all"
          />
        </div>

        {/* Environment */}
        <div className="space-y-3">
          <label className="block text-text-secondary/70 text-[10px] font-bold uppercase tracking-widest">
            Environment
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['development', 'live'] as const).map((env) => {
              const active = environment === env;
              const isLive = env === 'live';
              return (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={cn(
                    'px-4 py-3 rounded-xl border flex items-center gap-3 transition-all',
                    active 
                      ? isLive ? 'bg-error/10 border-error/30 text-text-primary' : 'bg-sky-mid/10 border-sky-mid/30 text-text-primary'
                      : 'bg-white/3 border-white/10 text-text-secondary/60 hover:border-white/20'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    active 
                      ? isLive ? 'bg-error shadow-[0_0_10px_var(--error)]' : 'bg-sky-bright shadow-[0_0_10px_var(--sky-bright)]'
                      : 'bg-white/20'
                  )} />
                  <span className="text-sm font-bold capitalize tracking-tight">
                    {env}
                  </span>
                </button>
              );
            })}
          </div>
          {environment === 'live' && (
            <p className="text-[11px] text-error/70 leading-relaxed italic">
              Live keys are rate-limited and billed against your plan.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-2',
            loading || !name.trim() 
              ? 'bg-gold-mid/30 text-bg-base/50 cursor-not-allowed'
              : 'btn-primary'
          )}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base animate-spin rounded-full" />
              Generating...
            </>
          ) : (
            'Generate API Key →'
          )}
        </button>
      </form>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-8 w-full max-w-[440px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {children}
      </div>
    </div>
  );
}

