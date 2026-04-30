'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AICore]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg-base text-text-primary m-0 p-0 font-sans antialiased">
        <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
          {/* Background grid/glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative text-center max-w-lg w-full animate-float-up">
            {/* Error Icon */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-error/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-error/10 border border-error/30 flex items-center justify-center text-error">
                  <AlertCircle size={40} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/10 border border-error/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-error rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-error/80 font-mono">
                  {error.digest ? `Error ID: ${error.digest.slice(0, 8)}` : 'Internal Error'}
                </span>
              </div>

              <h1 className="text-gold-cream text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                Something went <br />
                <span className="text-error">critically wrong.</span>
              </h1>

              <p className="text-text-secondary/60 text-sm leading-relaxed max-w-sm mx-auto">
                The pipeline encountered an unexpected failure. Our engineers have been alerted.
              </p>
            </div>

            {/* Error Details */}
            {error.message && (
              <div className="bg-error/5 border border-error/15 rounded-xl p-4 mb-10 text-left font-mono text-[11px] leading-relaxed group">
                <p className="text-error/40 mb-1 font-bold uppercase tracking-widest">Diagnostic Message:</p>
                <p className="text-text-primary/40 break-all">{error.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm"
              >
                <RefreshCw size={16} />
                Try to Recover
              </button>
              <Link
                href="/"
                className="btn-ghost flex items-center justify-center gap-2 px-8 py-3 text-sm"
              >
                <Home size={16} />
                Return Home
              </Link>
            </div>

            <p className="mt-16 text-text-faint text-[10px] font-black uppercase tracking-[0.3em] font-mono">
              Status Code: 500 — Internal Server Error
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}

