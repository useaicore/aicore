import Link from 'next/link';
import { ArrowLeft, Home, Terminal as TerminalIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-base flex flex-col items-center justify-center relative overflow-hidden px-6 font-sans antialiased">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(196,146,48,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Animated Orbs */}
      <div className="absolute top-[20%] left-[15%] w-32 h-32 bg-gold-mid/10 blur-[80px] rounded-full animate-drift-gold" />
      <div className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-sky-mid/10 blur-[100px] rounded-full animate-drift-sky" />

      <div className="relative text-center max-w-xl w-full animate-float-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-mid/30 to-sky-mid/10 border border-gold-mid/30 rounded-xl flex items-center justify-center text-gold-bright shadow-lg shadow-gold-mid/10">
            <span className="font-black">◆</span>
          </div>
          <span className="text-gold-cream font-black tracking-tighter text-xl">AICore</span>
        </div>

        {/* 404 Display */}
        <div className="relative inline-block mb-12">
          <h1 className="text-[120px] md:text-[180px] font-black tracking-tighter leading-none font-mono text-gold-mid opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-5xl font-black text-gold-cream tracking-tight">
              Page Lost in Space
            </h2>
          </div>
        </div>

        {/* Terminal Block */}
        <div className="glass-strong border-white/10 rounded-2xl p-6 mb-12 text-left font-mono text-xs shadow-2xl relative group">
          <div className="flex gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
          </div>
          <div className="space-y-2 opacity-80">
            <div className="flex items-center gap-2 text-text-muted">
              <TerminalIcon size={12} />
              <span>aicore routing --trace</span>
            </div>
            <p className="text-gold-mid/60">▸ Scanning route registry...</p>
            <p className="text-text-primary/40">▸ Checking edge cache... <span className="text-error/60 font-bold">MISS</span></p>
            <p className="text-text-primary/40">▸ Querying fallback routes... <span className="text-error/60 font-bold">EMPTY</span></p>
            <p className="text-error font-bold mt-2">✗ ERROR: ROUTE_NOT_FOUND (exit code 1)</p>
          </div>
          {/* Animated beam sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-beam-sweep" />
          </div>
        </div>

        {/* Subtext */}
        <p className="text-text-secondary/60 text-sm leading-relaxed max-w-sm mx-auto mb-10">
          The requested URL does not exist in our registry. It may have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/overview"
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm"
          >
            <ArrowLeft size={16} />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="btn-ghost flex items-center justify-center gap-2 px-8 py-3 text-sm"
          >
            <Home size={16} />
            Return Home
          </Link>
        </div>

        <p className="mt-16 text-text-faint text-[10px] font-black uppercase tracking-[0.3em] font-mono">
          HTTP 404 · Not Found
        </p>
      </div>
    </main>
  );
}

