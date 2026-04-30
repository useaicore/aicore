import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="beam-highlight relative z-[60] flex items-center justify-center gap-3 px-4 py-2.5 text-center"
      style={{
        background: 'linear-gradient(90deg, rgba(109,80,25,0.18) 0%, rgba(196,146,48,0.1) 50%, rgba(74,143,170,0.08) 100%)',
        borderBottom: '1px solid rgba(196,146,48,0.14)',
      }}
    >
      <span
        className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
        style={{
          background: 'rgba(232,184,75,0.12)',
          border: '1px solid rgba(232,184,75,0.2)',
          color: 'var(--gold-bright)',
        }}
      >
        <span className="live-dot" style={{ width: '5px', height: '5px' }} />
        Beta
      </span>

      <p className="text-[var(--text-secondary)] text-xs font-medium">
        AICore is now in public beta — 14-day free trial, no credit card required.{' '}
        <Link
          href="/auth/signup"
          className="text-[var(--gold-mid)] hover:text-[var(--gold-bright)] font-semibold transition-colors duration-150 underline underline-offset-2 decoration-[rgba(196,146,48,0.4)]"
        >
          Start building free →
        </Link>
      </p>
    </div>
  );
}
