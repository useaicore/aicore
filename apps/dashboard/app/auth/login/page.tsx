'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';

const inputCls =
  'w-full px-4 py-3 rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm outline-none transition-all duration-150 placeholder:text-[var(--text-faint)]';

const inputStyle = {
  background: 'rgba(9,8,10,0.8)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(196,146,48,0.45)';
    e.target.style.boxShadow = '0 0 0 3px rgba(196,146,48,0.08)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn.email({ email, password, callbackURL: '/overview' }, {
        onError: (ctx) => setError(ctx.error.message || 'Failed to sign in'),
      });
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    setError('');
    setMagicSent(false);
    try {
      await signIn.magicLink({ email: magicEmail, callbackURL: '/overview' }, {
        onSuccess: () => { setMagicSent(true); setMagicEmail(''); },
        onError: (ctx) => setError(ctx.error.message || 'Failed to send magic link'),
      });
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGitHub = () => signIn.social({ provider: 'github', callbackURL: '/overview' });
  const handleGoogle = () => signIn.social({ provider: 'google', callbackURL: '/overview' });

  return (
    <div
      className="rounded-[var(--radius-xl)] p-8"
      style={{
        background: 'rgba(13,11,16,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(196,146,48,0.14)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1.5" style={{ letterSpacing: '-0.02em' }}>
          Welcome back
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[var(--gold-mid)] hover:text-[var(--gold-bright)] font-semibold transition-colors">
            Sign up free
          </Link>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-[var(--radius-md)] text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--error)',
          }}
        >
          {error}
        </div>
      )}

      {/* Magic link sent */}
      {magicSent && (
        <div
          className="mb-5 px-4 py-3 rounded-[var(--radius-md)] text-sm"
          style={{
            background: 'rgba(74,143,170,0.08)',
            border: '1px solid rgba(74,143,170,0.2)',
            color: 'var(--sky-bright)',
          }}
        >
          ✓ Check your inbox — a sign-in link is on its way.
        </div>
      )}

      {/* Social login — top position for highest conversion */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={handleGoogle} className="btn-ghost py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button onClick={handleGitHub} className="btn-ghost py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[var(--text-faint)] text-[11px] font-medium uppercase tracking-widest">or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Email + password form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label className="block text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-widest mb-2">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            style={inputStyle}
            placeholder="name@company.com"
            {...inputFocusHandlers}
          />
        </div>
        <div>
          <label className="block text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-widest mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            style={inputStyle}
            placeholder="••••••••"
            {...inputFocusHandlers}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      {/* Magic link */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <span className="text-[var(--text-faint)] text-[11px] font-medium uppercase tracking-widest">or magic link</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      <form onSubmit={handleMagicLink} className="flex gap-2">
        <input
          type="email"
          required
          value={magicEmail}
          onChange={(e) => setMagicEmail(e.target.value)}
          className={`${inputCls} flex-1`}
          style={inputStyle}
          placeholder="your@email.com"
          {...inputFocusHandlers}
        />
        <button
          type="submit"
          disabled={magicLoading}
          className="btn-ghost px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {magicLoading ? '…' : 'Send link'}
        </button>
      </form>
    </div>
  );
}
