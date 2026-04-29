import NavItem from './NavItem.js';
import SignOutButton from './SignOutButton.js';

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  const firstName = userName.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <aside className="w-[240px] h-screen bg-[var(--bg-surface)] border-r border-[var(--text-faint)] flex flex-col fixed left-0 top-0 z-50">
      {/* Top Section */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[var(--gold-mid)] text-xl">◆</span>
          <span className="text-[var(--gold-bright)] font-bold text-lg tracking-tight">AICore</span>
        </div>

        <nav className="space-y-1">
          <NavItem href="/overview" icon="◈" label="Overview" />
          <NavItem href="/logs" icon="▦" label="Logs" />
          <NavItem href="/keys" icon="⬡" label="API Keys" />
          <NavItem href="/usage" icon="◎" label="Usage" />
          
          <div className="py-4">
            <div className="h-px bg-[var(--text-faint)]" />
          </div>

          <NavItem href="/settings" icon="⚙" label="Settings" />
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-6 border-t border-[var(--text-faint)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--gold-dim)] flex items-center justify-center text-[var(--gold-bright)] text-xs font-bold">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[var(--text-secondary)] text-sm font-medium truncate">
              {firstName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
