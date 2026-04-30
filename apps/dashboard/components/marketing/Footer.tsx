import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      ['Dashboard',    '/overview'],
      ['API Reference','#'],
      ['Pricing',      '#pricing'],
      ['Changelog',    '#'],
      ['Status',       '#'],
    ],
  },
  {
    title: 'Developers',
    links: [
      ['Documentation', '#'],
      ['SDK Reference',  '#'],
      ['CLI Quickstart', '#'],
      ['GitHub',         '#'],
      ['npm Package',    '#'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About',   '#'],
      ['Blog',    '#'],
      ['Careers', '#'],
      ['Contact', '#'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy',  '#'],
      ['Terms',    '#'],
      ['Security', '#'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative" style={{ background: 'var(--bg-surface)' }}>
      {/* Gradient top line */}
      <div className="footer-top-line h-px w-full" />

      <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-12">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-14">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="relative flex items-center justify-center w-6 h-6">
                <span
                  className="absolute inset-0 rounded-[5px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(circle at 40% 40%, rgba(232,184,75,0.3), transparent 70%)' }}
                />
                <span className="relative text-[var(--gold-bright)] text-sm group-hover:scale-110 transition-transform duration-200 leading-none">◆</span>
              </div>
              <span className="text-[var(--text-primary)] font-bold text-base tracking-tight">AICore</span>
            </Link>

            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[170px] mb-6">
              AI infrastructure. Finally under control.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2">
              <div
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] w-fit"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-[var(--success)] text-[10px]">⬡</span>
                <span className="text-[var(--text-muted)] text-[10px] font-medium">99.9% Uptime SLA</span>
              </div>
              <div
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] w-fit"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-[var(--sky-mid)] text-[10px]">⬡</span>
                <span className="text-[var(--text-muted)] text-[10px] font-medium">Cloudflare Edge</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[var(--text-muted)] text-[11px] font-medium tracking-wide">
            © 2026 AICore, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {[
              ['Twitter / X', '#'],
              ['GitHub', '#'],
              ['Discord', '#'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold-mid)] transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
