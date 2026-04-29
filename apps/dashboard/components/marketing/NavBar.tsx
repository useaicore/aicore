import Link from 'next/link';
import NavMobile from './NavMobile';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-[var(--bg-base)]/90 backdrop-blur-md border-b border-[var(--text-faint)]/50">
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[var(--gold-mid)] text-xl group-hover:scale-110 transition-transform">◆</span>
          <span className="text-[var(--gold-bright)] font-bold text-lg tracking-tight">AICore</span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">Docs</Link>
          <Link href="#pricing" className="text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
          <Link href="#" className="text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">Changelog</Link>
          <Link href="#" className="text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">Status</Link>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors">
            Sign in
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] font-semibold text-sm px-4 py-2 rounded-[var(--radius-md)] hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            Get started free
          </Link>
          
          <NavMobile />
        </div>
      </div>
    </nav>
  );
}
