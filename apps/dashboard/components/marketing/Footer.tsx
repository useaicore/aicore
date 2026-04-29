import Link from 'next/link';

const sections = [
  {
    title: 'Product',
    links: ['Overview', 'Changelog', 'Status', 'Docs'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security'],
  },
];

export default function Footer() {
  return (
    <footer className="relative" style={{ background: 'var(--bg-surface)' }}>
      {/* Gradient top line — gold to sky */}
      <div className="footer-top-line h-px w-full" />

      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-[var(--gold-mid)] text-xl group-hover:scale-110 transition-transform duration-200">
                ◆
              </span>
              <span className="text-[var(--gold-bright)] font-bold text-lg tracking-tight">AICore</span>
            </Link>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[180px]">
              Unified API gateway for AI infrastructure.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-5">
                {s.title}
              </h4>
              <ul className="space-y-3">
                {s.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors duration-150"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.04)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--text-muted)] text-[10px] uppercase font-medium tracking-wider">
            © 2026 AICore. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {[['Twitter', '#'], ['GitHub', '#'], ['Discord', '#']].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-[var(--text-muted)] hover:text-[var(--gold-mid)] transition-colors duration-150 group"
              >
                <span className="text-xs font-bold uppercase tracking-widest group-hover:drop-shadow-[0_0_8px_rgba(212,168,50,0.5)] transition-all duration-200">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
