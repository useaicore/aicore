interface DashboardHeaderProps {
  title: string;
}

import { CommandBarTrigger } from '../command/CommandBarTrigger';

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40 flex-shrink-0"
      style={{
        background: 'rgba(9,8,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h2
          className="text-[var(--text-primary)] text-sm font-semibold"
          style={{ letterSpacing: '-0.01em' }}
        >
          {title}
        </h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <CommandBarTrigger />

        <div className="hidden md:block h-5 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <a
          href="#"
          className="hidden md:block text-[var(--text-muted)] text-xs font-medium hover:text-[var(--text-secondary)] transition-colors duration-150"
        >
          Docs
        </a>

        {/* User avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer transition-opacity hover:opacity-80"
          style={{
            background: 'linear-gradient(135deg, rgba(196,146,48,0.3), rgba(74,143,170,0.2))',
            border: '1px solid rgba(196,146,48,0.25)',
            color: 'var(--gold-bright)',
          }}
        >
          AI
        </div>
      </div>
    </header>
  );
}
