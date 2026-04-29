import Link from 'next/link';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'For individual developers and side projects.',
    features: [
      '10,000 requests/month',
      '7-day log retention',
      '2 API keys',
      'All providers',
      'Community support',
    ],
    cta: 'Get started free',
    href: '/auth/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For production apps and growing teams.',
    features: [
      '500,000 requests/month',
      '90-day log retention',
      'Unlimited API keys',
      'All providers + failover',
      'Shadow mode',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams with high volume and compliance needs.',
    features: [
      'Unlimited requests',
      'Custom log retention',
      'SSO / SAML',
      'SLA guarantee',
      'Dedicated support',
      'Custom contracts',
    ],
    cta: 'Talk to us',
    href: 'mailto:hi@aicore.dev',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-28 overflow-visible section-gold-ambient">
      {/* Gold ambient orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '80%',
          height: '50%',
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,50,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1000px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.25em] mb-4 block">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 leading-tight">
            Simple, transparent pricing.
          </h2>
          <p className="text-[var(--text-secondary)] text-lg opacity-80">
            Start free. Scale when you need to.
          </p>
        </div>

        {/* Cards */}
        {/* Outer wrapper is overflow-visible so the Pro badge can escape */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center overflow-visible">
          {tiers.map((tier) =>
            tier.featured ? (
              /* ── Pro card — animated border, elevated ── */
              <div key={tier.name} className="relative overflow-visible" style={{ zIndex: 10 }}>
                {/* Badge — outside the card, above overflow boundary */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 whitespace-nowrap bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_4px_16px_rgba(212,168,50,0.3)]">
                  Most Popular
                </div>

                {/* Spinning border wrapper */}
                <div
                  className="spin-border-wrap rounded-xl"
                  style={{ transform: 'translateY(-8px)' }}
                >
                  <div className="spin-border-layer animate-spin-border" />
                  <div
                    className="relative rounded-[11px] p-8 flex flex-col"
                    style={{
                      background: 'rgba(28, 24, 16, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      boxShadow:
                        '0 32px 64px rgba(0,0,0,0.4), 0 0 0 0px rgba(212,168,50,0.2)',
                    }}
                  >
                    <h3 className="text-xl font-bold text-[var(--gold-cream)] mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-black text-[var(--gold-cream)]">{tier.price}</span>
                      <span className="text-[var(--text-muted)] text-sm font-medium">{tier.period}</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-8 opacity-80 min-h-[40px]">
                      {tier.desc}
                    </p>
                    <ul className="space-y-3.5 mb-10 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <span className="text-[var(--gold-bright)] font-bold text-sm">✓</span>
                          <span className="text-[var(--text-secondary)] text-[13px] font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.href}
                      className="w-full py-3.5 rounded-[var(--radius-md)] text-sm font-bold text-center bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] hover:brightness-110 transition-all duration-150 shadow-[0_4px_16px_rgba(212,168,50,0.25)]"
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Free / Enterprise — glass-neutral ── */
              <div
                key={tier.name}
                className="glass-neutral rounded-xl p-8 flex flex-col hover:border-[rgba(255,255,255,0.14)] transition-colors duration-200"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[var(--gold-cream)]">{tier.price}</span>
                  <span className="text-[var(--text-muted)] text-sm font-medium">{tier.period}</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-8 opacity-80 min-h-[40px]">
                  {tier.desc}
                </p>
                <ul className="space-y-3.5 mb-10 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="text-[var(--gold-bright)] font-bold text-sm">✓</span>
                      <span className="text-[var(--text-secondary)] text-[13px] font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={cn(
                    'w-full py-3 rounded-[var(--radius-md)] text-sm font-bold text-center transition-all duration-150',
                    'border border-[var(--gold-dim)] text-[var(--gold-mid)] hover:bg-[rgba(212,168,50,0.06)] hover:border-[var(--gold-mid)]',
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ),
          )}
        </div>

        <p className="text-[var(--text-muted)] text-[10px] text-center mt-14 uppercase tracking-widest opacity-60">
          All plans include: OpenAI-compatible API · Real-time logs · Cost tracking · 99.9% uptime SLA
        </p>
      </div>
    </section>
  );
}
