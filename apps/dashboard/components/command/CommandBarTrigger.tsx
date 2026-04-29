'use client';

import { useCommandBar } from './CommandBarProvider';

export function CommandBarTrigger() {
  const { toggle } = useCommandBar();

  return (
    <button
      onClick={toggle}
      className="hidden md:flex items-center gap-2 px-3 h-8 bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-[var(--radius-md)] text-[var(--text-muted)] text-xs hover:border-[var(--gold-dim)] hover:text-[var(--text-secondary)] transition-all duration-150 group"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span>Search...</span>
      <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border border-[var(--text-faint)] bg-[var(--bg-subtle)] px-1.5 font-sans text-[10px] font-medium text-[var(--text-muted)] opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
