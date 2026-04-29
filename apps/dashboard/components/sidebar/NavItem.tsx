'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils.js';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
}

export default function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname();
  
  const isActive = href === '/overview' 
    ? pathname === '/overview' 
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm transition-all duration-150 group",
        isActive 
          ? "bg-[var(--bg-elevated)] text-[var(--gold-cream)] border-l-2 border-[var(--gold-bright)] rounded-r-[var(--radius-md)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      )}
    >
      <span className={cn(
        "text-lg",
        isActive ? "text-[var(--gold-bright)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
      )}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
