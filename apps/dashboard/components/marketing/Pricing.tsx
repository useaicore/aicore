import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      desc: 'For individual developers and side projects.',
      features: ['10,000 requests/month', '7-day log retention', '2 API keys', 'All providers', 'Community support'],
      cta: 'Get started free',
      href: '/auth/signup',
      featured: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      desc: 'For production apps and growing teams.',
      features: ['500,000 requests/month', '90-day log retention', 'Unlimited API keys', 'All providers + failover', 'Usage alerts (email)', 'Priority support'],
      cta: 'Start free trial',
      href: '/auth/signup',
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For teams with high volume and compliance needs.',
      features: ['Unlimited requests', 'Custom log retention', 'SSO / SAML', 'SLA guarantee', 'Dedicated support', 'Custom contracts'],
      cta: 'Talk to us',
      href: 'mailto:hi@aicore.dev',
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-24 max-w-[1000px] mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Pricing</span>
        <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Simple, transparent pricing.</h2>
        <p className="text-[var(--text-secondary)] text-lg opacity-80">Start free. Scale when you need to.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div 
            key={tier.name}
            className={cn(
              "relative flex flex-col p-8 rounded-[var(--radius-lg)] border transition-all duration-300",
              tier.featured 
                ? "bg-[var(--bg-surface)] border-gradient-gold glow-gold scale-105 z-10" 
                : "bg-transparent border-[var(--text-faint)] hover:border-[var(--text-muted)]"
            )}
          >
            {tier.featured && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <h3 className={cn("text-xl font-bold mb-2", tier.featured ? "text-[var(--gold-cream)]" : "text-[var(--text-primary)]")}>
              {tier.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-[var(--gold-cream)]">{tier.price}</span>
              <span className="text-[var(--text-muted)] text-sm font-medium">{tier.period}</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-8 min-h-[40px] opacity-80">{tier.desc}</p>

            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="text-[var(--gold-bright)] font-bold">✓</span>
                  <span className="text-[var(--text-secondary)] text-xs font-medium">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              className={cn(
                "w-full py-3 rounded-[var(--radius-md)] text-sm font-bold text-center transition-all",
                tier.featured
                  ? "bg-gradient-to-br from-[var(--gold-mid)] to-[var(--gold-bright)] text-[var(--bg-base)] hover:brightness-110"
                  : "border border-[var(--gold-dim)] text-[var(--gold-mid)] hover:bg-[var(--bg-elevated)]"
              )}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-[var(--text-muted)] text-[10px] text-center mt-12 uppercase tracking-widest opacity-60">
        All plans include: OpenAI-compatible API · Real-time logs · Cost tracking · 99.9% uptime SLA
      </p>
    </section>
  );
}
