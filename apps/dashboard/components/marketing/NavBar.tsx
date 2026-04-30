import Link from 'next/link';
import NavMobile from './NavMobile';

const navLinks = [
  ['Product', '#features'],
  ['Docs',    '#'],
  ['Pricing', '#pricing'],
  ['Changelog', '#'],
] as const;

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 h-[60px]"
      style={{
        background: 'rgba(9, 8, 10, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative flex items-center justify-center w-7 h-7">
            <span
              className="absolute inset-0 rounded-[6px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle at 40% 40%, rgba(232,184,75,0.35), transparent 70%)' }}
            />
            <span className="relative text-[var(--gold-bright)] text-base group-hover:scale-110 transition-transform duration-200 leading-none">◆</span>
          </div>
          <span
            className="font-bold text-[17px] tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            AICore
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="relative px-3.5 py-2 text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors duration-150 rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/auth/login"
            className="hidden sm:block text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="btn-primary px-4 py-2 text-sm"
          >
            Get started free
          </Link>
          <NavMobile />
        </div>

      </div>

      {/* Bottom line */}
      <div className="nav-bottom-line h-px w-full absolute bottom-0 left-0" />
    </nav>
  );
}
