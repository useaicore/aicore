interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="h-[56px] bg-[var(--bg-surface)] border-b border-[var(--text-faint)] px-6 flex items-center justify-between flex-shrink-0">
      <h2 className="text-[var(--text-primary)] font-medium text-sm">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-base)] rounded-full border border-[var(--text-faint)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-[var(--text-muted)] text-[10px] font-medium whitespace-nowrap">
            All systems operational
          </span>
        </div>

        <div className="w-px h-4 bg-[var(--text-faint)]" />

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
