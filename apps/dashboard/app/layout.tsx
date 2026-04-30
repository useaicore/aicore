import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AICore — AI Infrastructure. Finally Under Control.',
  description:
    'One endpoint. Every AI provider. Full cost visibility, automatic failover, and shared context. Built for developers, teams, and enterprises.',
  metadataBase: new URL('https://aicore.dev'),
  openGraph: {
    title: 'AICore — AI Infrastructure. Finally Under Control.',
    description:
      'One endpoint. Every AI provider. Full cost visibility, automatic failover, and shared context.',
    url: 'https://aicore.dev',
    siteName: 'AICore',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AICore — AI Infrastructure. Finally Under Control.',
    description:
      'One endpoint. Every AI provider. Full cost visibility, automatic failover, and shared context.',
  },
  keywords: [
    'AI API gateway',
    'LLM proxy',
    'AI cost tracking',
    'OpenAI proxy',
    'AI infrastructure',
    'LLM routing',
    'AI observability',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
