import Link from 'next/link';
import TerminalDemo from './TerminalDemo';

export default function Hero() {
  return (
    <section className="relative min-h-[100vh] pt-[60px] flex flex-col items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] opacity-10" 
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212, 168, 50, 0.8) 0%, transparent 100%)' }}
        />
        <div 
          className="absolute top-[40%] right-[10%] w-[40%] h-[30%] opacity-5" 
          style={{ background: 'radial-gradient(ellipse 40% 30% at 80% 60%, rgba(74, 143, 170, 0.6) 0%, transparent 100%)' }}
        />
        <div 
          className="absolute inset-0 opacity-40" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, var(--text-faint) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[800px] px-6 pt-20 pb-12 flex flex-col items-center text-center">
        {/* Announcement */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--gold-dim)] rounded-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="text-[var(--gold-bright)] text-[10px]">✦</span>
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider">Now in public beta</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold line-height-1.1 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <span className="text-[var(--text-primary)]">One key.</span><br />
          <span className="gradient-gold">Every AI provider.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-[520px] text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Route all your AI calls through a single endpoint. 
          Get full logs, cost tracking, and automatic failover — 
          without changing your code.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] font-bold text-base rounded-[var(--radius-md)] shadow-[0_8px_24px_rgba(212,168,50,0.3)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
          >
            Start for free →
          </Link>
          <Link 
            href="#"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-[var(--text-faint)] text-[var(--text-secondary)] font-semibold text-base rounded-[var(--radius-md)] hover:border-[var(--gold-dim)] hover:text-[var(--text-primary)] transition-all"
          >
            View docs
          </Link>
        </div>

        {/* Trust Line */}
        <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-[0.2em] mb-16 opacity-60">
          No credit card required · Free up to 10,000 requests/month
        </div>

        {/* Terminal Demo */}
        <TerminalDemo />
      </div>

    </section>
  );
}
