'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    period: '/month',
    desc: 'For individual developers and side projects.',
    features: [
      '10,000 requests / month',
      '7-day log retention',
      '2 API keys',
      'All 4 providers',
      'Community support',
    ],
    cta: 'Get started free',
    href: '/auth/signup',
    featured: false,
    badge: null,
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    annualMonthlyPrice: 23,
    period: '/month',
    desc: 'For production apps that need full visibility and failover.',
    features: [
      '500,000 requests / month',
      '90-day log retention',
      'Unlimited API keys',
      'All providers + failover',
      'Shadow mode',
      'Budget alerts',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Team',
    monthlyPrice: 99,
    annualMonthlyPrice: 79,
    period: '/month',
    desc: 'For growing engineering teams shipping AI to production.',
    features: [
      '5,000,000 requests / month',
      '1-year log retention',
      'Up to 10 seats',
      'Audit logs',
      'Slack notifications',
      'Cost allocation by user',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: false,
    badge: null,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualMonthlyPrice: null,
    period: '',
    desc: 'For teams with high volume, compliance, and SLA requirements.',
    features: [
      'Unlimited requests',
      'Custom log retention',
      'Unlimited seats',
      'SSO / SAML',
      'SLA guarantee',
      'Dedicated Slack channel',
      'Custom contracts',
    ],
    cta: 'Talk to us',
    href: 'mailto:hi@aicore.dev',
    featured: false,
    badge: null,
  },
];

const faqs = [
  {
    q: 'Will my existing OpenAI code work without changes?',
    a: 'Yes. AICore is fully OpenAI SDK-compatible. Change your baseURL to api.aicore.dev/v1 and your OPENAI_API_KEY to your AICore key. Your prompts, retry logic, and streaming code stay exactly the same.',
  },
  {
    q: 'What happens if AICore goes down?',
    a: 'AICore runs on Cloudflare Workers across 300+ edge locations globally. In the unlikely event of an incident, automatic failover routes requests directly to your configured backup provider with no code changes required.',
  },
  {
    q: 'How is context compression different from just summarising?',
    a: 'npx aicore init reads your actual source files and generates a structured semantic snapshot — stack, deps, API patterns, and provider config. It\'s deterministic and lossless for the information your AI tools actually need. No LLM call required at generation time.',
  },
  {
    q: 'Is my provider API key secure?',
    a: 'Your provider API keys live in Cloudflare secrets and never appear in logs or responses. Your AICore API key is stored only as a SHA-256 hash in our database — we never store the plaintext.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrade or downgrade instantly from your dashboard. Annual plans are prorated if you upgrade mid-cycle. Downgrading takes effect at the next billing cycle.',
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="relative py-28 overflow-visible section-gold-ambient">
      {/* Gold ambient orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '80%',
          height: '50%',
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,146,48,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.25em] mb-4 block">
            Pricing
          </span>
          <h2
            className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 leading-tight"
            style={{ letterSpacing: '-0.025em' }}
          >
            Simple, transparent pricing.
          </h2>
          <p className="text-[var(--text-secondary)] text-lg opacity-80 mb-8">
            Start free. Scale when you need to.
          </p>

          {/* Annual / Monthly toggle */}
          <div className="inline-flex items-center gap-3">
            <span className={cn('text-sm font-medium transition-colors', !annual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
              style={{
                background: annual
                  ? 'linear-gradient(135deg, var(--gold-mid), var(--gold-bright))'
                  : 'rgba(255,255,255,0.1)',
                border: annual ? 'none' : '1px solid rgba(255,255,255,0.12)',
              }}
              aria-label="Toggle annual billing"
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{ transform: annual ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
            <span className={cn('text-sm font-medium transition-colors', annual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
              Annual
              <span
                className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: 'var(--success)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Cards — 4 tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start overflow-visible mb-20">
          {tiers.map((tier) =>
            tier.featured ? (
              /* Pro card — animated border */
              <div key={tier.name} className="relative overflow-visible sm:col-span-1" style={{ zIndex: 10 }}>
                {/* Badge */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 whitespace-nowrap text-[var(--bg-base)] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-mid), var(--gold-bright))',
                    boxShadow: '0 4px 16px rgba(196,146,48,0.3)',
                  }}
                >
                  {tier.badge}
                </div>

                <div className="spin-border-wrap rounded-xl" style={{ transform: 'translateY(-6px)' }}>
                  <div className="spin-border-layer animate-spin-border" />
                  <div
                    className="relative rounded-[11px] p-7 flex flex-col"
                    style={{
                      background: 'rgba(20,17,26,0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                    }}
                  >
                    <h3 className="text-lg font-bold text-[var(--gold-cream)] mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black text-[var(--gold-cream)]" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>
                        ${annual ? tier.annualMonthlyPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-[var(--text-muted)] text-sm">{tier.period}</span>
                    </div>
                    {annual && (
                      <p className="text-[11px] text-[var(--success)] mb-3 font-medium">
                        Billed ${(tier.annualMonthlyPrice! * 12)} / year
                      </p>
                    )}
                    <p className="text-[var(--text-secondary)] text-sm mb-7 opacity-80 min-h-[40px] leading-relaxed">
                      {tier.desc}
                    </p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="text-[var(--gold-bright)] font-bold text-sm mt-px flex-shrink-0">✓</span>
                          <span className="text-[var(--text-secondary)] text-[13px]">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.href}
                      className="btn-primary w-full py-3 text-sm text-center block"
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard card */
              <div
                key={tier.name}
                className="card-hover glass-neutral rounded-xl p-7 flex flex-col"
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {tier.monthlyPrice !== null ? (
                    <>
                      <span
                        className="text-4xl font-bold text-[var(--gold-cream)]"
                        style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                      >
                        ${annual ? tier.annualMonthlyPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-[var(--text-muted)] text-sm">{tier.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-[var(--text-primary)]">Custom</span>
                  )}
                </div>
                {annual && tier.annualMonthlyPrice !== null && tier.monthlyPrice !== 0 && (
                  <p className="text-[11px] text-[var(--success)] mb-3 font-medium">
                    Billed ${tier.annualMonthlyPrice! * 12} / year
                  </p>
                )}
                <p className="text-[var(--text-secondary)] text-sm mb-7 opacity-80 min-h-[40px] leading-relaxed">
                  {tier.desc}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-[var(--gold-bright)] font-bold text-sm mt-px flex-shrink-0">✓</span>
                      <span className="text-[var(--text-secondary)] text-[13px]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={cn(
                    'w-full py-3 rounded-[var(--radius-md)] text-sm font-bold text-center transition-all duration-150 block',
                    tier.name === 'Enterprise'
                      ? 'btn-ghost'
                      : 'border border-[var(--gold-dim)] text-[var(--gold-mid)] hover:bg-[rgba(196,146,48,0.06)] hover:border-[var(--gold-mid)]',
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ),
          )}
        </div>

        {/* All plans include */}
        <p className="text-[var(--text-muted)] text-[11px] text-center mb-20 uppercase tracking-widest opacity-60">
          All plans include: OpenAI-compatible API · Real-time logs · Cost tracking · Cloudflare edge proxy
        </p>

        {/* ── FAQ ── */}
        <div className="max-w-[720px] mx-auto">
          <h3
            className="text-2xl md:text-3xl font-black text-[var(--text-primary)] text-center mb-10"
            style={{ letterSpacing: '-0.02em' }}
          >
            Common questions
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-lg)] overflow-hidden transition-colors duration-150"
                style={{
                  background: openFaq === i ? 'rgba(196,146,48,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${openFaq === i ? 'rgba(196,146,48,0.18)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[var(--text-primary)] text-sm font-semibold leading-relaxed">
                    {faq.q}
                  </span>
                  <span
                    className="text-[var(--text-muted)] text-lg flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>

                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
