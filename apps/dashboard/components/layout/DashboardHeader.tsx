interface DashboardHeaderProps {
  title: string;
}

import { CommandBarTrigger } from '../command/CommandBarTrigger';

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--text-faint)] bg-[var(--bg-base)]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="text-[var(--text-secondary)] text-sm font-medium">{title}</h2>
      
      <div className="flex items-center gap-4">
        <CommandBarTrigger />
        <div className="h-8 w-px bg-[var(--text-faint)] hidden md:block" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold-dim)] to-[var(--sky-dim)] flex items-center justify-center text-[10px] font-bold text-white">
            AI
          </div>
        </div>
        <a 
          href="#" 
          className="text-[var(--text-muted)] text-xs hover:text-[var(--gold-mid)] transition-colors"
        >
          Docs
        </a>
      </div>
    </header>
  );
}
