'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';

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
      await signIn.email({
        email,
        password,
        callbackURL: '/overview',
      }, {
        onError: (ctx) => {
          setError(ctx.error.message || 'Failed to sign in');
        }
      });
    } catch (err: any) {
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
      await signIn.magicLink({
        email: magicEmail,
        callbackURL: '/overview',
      }, {
        onSuccess: () => {
          setMagicSent(true);
          setMagicEmail('');
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Failed to send magic link');
        }
      });
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: 'github', callbackURL: '/overview' });
  };

  const handleGoogle = async () => {
    await signIn.social({ provider: 'google', callbackURL: '/overview' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Log in to your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {magicSent && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm rounded-lg">
          Check your inbox — a sign-in link is on its way.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {/* Magic Link Section */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">or sign in with a link</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <input
          type="email"
          required
          value={magicEmail}
          onChange={(e) => setMagicEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          placeholder="email@example.com"
        />
        <button
          type="submit"
          disabled={magicLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
        >
          {magicLoading ? 'Sending...' : 'Send sign-in link'}
        </button>
      </form>

      {/* Social Section */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleGoogle}
          className="bg-[var(--bg-elevated)] border border-[var(--text-faint)] hover:border-[var(--gold-dim)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          onClick={handleGitHub}
          className="bg-[var(--bg-elevated)] border border-[var(--text-faint)] hover:border-[var(--gold-dim)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
