import Link from 'next/link';
import NavMobile from './NavMobile';

export default function NavBar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[60px]"
      style={{
        background: 'rgba(14, 12, 9, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[var(--gold-mid)] text-xl group-hover:scale-110 transition-transform duration-200">◆</span>
          <span className="text-[var(--gold-bright)] font-bold text-lg tracking-tight">AICore</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[['Docs', '#'], ['Pricing', '#pricing'], ['Changelog', '#'], ['Status', '#']] .map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="hidden sm:block text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] font-semibold text-sm px-4 py-2 rounded-[var(--radius-md)] hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-150 shadow-[0_4px_16px_rgba(212,168,50,0.2)]"
          >
            Get started free
          </Link>
          <NavMobile />
        </div>
      </div>

      {/* Gradient bottom line — premium hardware aesthetic */}
      <div className="nav-bottom-line h-px w-full absolute bottom-0 left-0" />
    </nav>
  );
}
