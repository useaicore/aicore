import NavItem from './NavItem';
import SignOutButton from './SignOutButton';

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  const firstName = userName?.split(' ')[0] ?? 'You';
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <aside
      className="w-[240px] h-screen flex flex-col fixed left-0 top-0 z-50"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex items-center justify-center w-7 h-7 rounded-[6px]"
            style={{ background: 'radial-gradient(circle at 40% 40%, rgba(232,184,75,0.25), transparent 70%)', border: '1px solid rgba(196,146,48,0.2)' }}
          >
            <span className="text-[var(--gold-bright)] text-sm leading-none">◆</span>
          </div>
          <span className="text-[var(--text-primary)] font-bold text-[15px] tracking-tight">AICore</span>
          <span
            className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: 'rgba(196,146,48,0.1)', color: 'var(--gold-dim)', border: '1px solid rgba(196,146,48,0.15)' }}
          >
            Beta
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavItem href="/overview" icon="◈" label="Overview" />
        <NavItem href="/logs"     icon="▦" label="Logs" />
        <NavItem href="/keys"     icon="⬡" label="API Keys" />
        <NavItem href="/usage"    icon="◎" label="Usage" />

        <div className="py-3 px-3">
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <NavItem href="/settings" icon="⚙" label="Settings" />
      </nav>

      {/* Workspace + user */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Workspace pill */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] mb-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="live-dot" style={{ width: '5px', height: '5px' }} />
          <span className="text-[var(--text-muted)] text-[11px] font-medium truncate">my-workspace</span>
          <span className="ml-auto text-[var(--text-faint)] text-[10px]">Free</span>
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(196,146,48,0.25), rgba(74,143,170,0.15))',
              border: '1px solid rgba(196,146,48,0.2)',
              color: 'var(--gold-bright)',
            }}
          >
            {initial}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[var(--text-secondary)] text-[12px] font-medium truncate leading-none mb-0.5">
              {firstName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
