'use client';

import { useState } from 'react';
import { signUp, signIn } from '@/lib/auth-client';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
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
      await signUp.email({
        email,
        password,
        name,
        callbackURL: '/overview',
      }, {
        onError: (ctx) => {
          setError(ctx.error.message || 'Failed to sign up');
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
    await signIn.social({
      provider: 'github',
      callbackURL: '/overview',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {magicSent && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm rounded-lg">
          Check your inbox — a sign-up link is on its way.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="John Doe"
          />
        </div>

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
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      {/* Magic Link Section */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">or sign up with email link</span>
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
          {magicLoading ? 'Sending...' : 'Send sign-up link'}
        </button>
      </form>

      {/* GitHub Section */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">or</span>
        </div>
      </div>

      <button
        onClick={handleGitHub}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--text-faint)] hover:border-[var(--gold-dim)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
        Continue with GitHub
      </button>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-slate-400 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
