import Link from 'next/link';
import { type ReactNode } from 'react';

export const metadata = {
  title: 'AICore — Sign in',
  description: 'Log in or sign up for AICore',
};

const features = [
  { icon: '◆', text: 'One key for OpenAI, Anthropic, Gemini, and Groq' },
  { icon: '◈', text: 'Full cost visibility — every cent, every call' },
  { icon: '◉', text: 'Shadow mode: test providers on live traffic, zero risk' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">

      {/* ── Left branding panel — desktop only ── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-14 overflow-hidden flex-shrink-0">

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute animate-drift-gold"
            style={{
              top: '-20%', left: '-10%',
              width: '120%', height: '80%',
              background: 'radial-gradient(ellipse 70% 60% at 40% 20%, rgba(196,146,48,0.1) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute animate-drift-sky"
            style={{
              bottom: '-10%', right: '-10%',
              width: '80%', height: '60%',
              background: 'radial-gradient(ellipse 60% 50% at 70% 80%, rgba(74,143,170,0.07) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
            }}
          />
          {/* Vertical separator */}
          <div
            className="absolute top-0 right-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(196,146,48,0.15) 30%, rgba(74,143,170,0.1) 70%, transparent)' }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 group w-fit">
          <div className="relative flex items-center justify-center w-8 h-8">
            <span
              className="absolute inset-0 rounded-[7px] opacity-70"
              style={{ background: 'radial-gradient(circle at 40% 40%, rgba(232,184,75,0.35), transparent 70%)' }}
            />
            <span className="relative text-[var(--gold-bright)] text-lg leading-none">◆</span>
          </div>
          <span className="text-[var(--text-primary)] font-bold text-xl tracking-tight">AICore</span>
        </Link>

        {/* Center copy */}
        <div className="relative">
          <p className="text-[var(--gold-mid)] text-[11px] font-bold uppercase tracking-[0.3em] mb-5">
            AI Infrastructure
          </p>
          <h2
            className="text-4xl font-black text-[var(--text-primary)] leading-tight mb-6"
            style={{ letterSpacing: '-0.025em' }}
          >
            The missing layer<br />
            <span className="gradient-gold">between your app<br />and every AI.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-10 max-w-[380px]">
            Route every AI call through one endpoint. Get full visibility into
            cost, latency, and errors — from the first request.
          </p>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <span className="text-[var(--gold-bright)] text-base mt-0.5 flex-shrink-0">{f.icon}</span>
                <span className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom trust line */}
        <p className="relative text-[var(--text-muted)] text-[11px] font-medium">
          No credit card required · 14-day free trial on Pro · Cancel anytime
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">

        {/* Mobile logo */}
        <Link href="/" className="flex lg:hidden items-center gap-2 mb-10">
          <span className="text-[var(--gold-bright)] text-lg">◆</span>
          <span className="text-[var(--text-primary)] font-bold text-lg">AICore</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {children}
        </div>

        <p className="lg:hidden mt-8 text-[var(--text-muted)] text-[11px] text-center">
          No credit card required · 14-day free trial
        </p>
      </div>

    </div>
  );
}
