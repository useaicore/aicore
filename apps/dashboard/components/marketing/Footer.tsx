import Link from 'next/link';

export default function Footer() {
  const sections = [
    {
      title: 'Product',
      links: ['Overview', 'Changelog', 'Status', 'Docs']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security']
    }
  ];

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--text-faint)] py-16">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-[var(--gold-mid)] text-xl">◆</span>
              <span className="text-[var(--gold-bright)] font-bold text-lg tracking-tight">AICore</span>
            </Link>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[200px]">
              The unified API gateway for AI infrastructure.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-5">{s.title}</h4>
              <ul className="space-y-3">
                {s.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[var(--text-faint)]/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--text-muted)] text-[10px] uppercase font-medium tracking-wider">
            © 2026 AICore. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--gold-mid)] transition-colors">
              <span className="text-xs font-bold uppercase tracking-widest">Twitter</span>
            </Link>
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--gold-mid)] transition-colors">
              <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
            </Link>
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--gold-mid)] transition-colors">
              <span className="text-xs font-bold uppercase tracking-widest">Discord</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
