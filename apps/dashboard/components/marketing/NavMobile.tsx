'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-[60px] bg-[var(--bg-base)] z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 flex flex-col gap-6">
            <Link href="#" className="text-[var(--text-primary)] text-lg font-medium border-b border-[var(--text-faint)] pb-4">Docs</Link>
            <Link href="#pricing" className="text-[var(--text-primary)] text-lg font-medium border-b border-[var(--text-faint)] pb-4">Pricing</Link>
            <Link href="#" className="text-[var(--text-primary)] text-lg font-medium border-b border-[var(--text-faint)] pb-4">Changelog</Link>
            <Link href="#" className="text-[var(--text-primary)] text-lg font-medium border-b border-[var(--text-faint)] pb-4">Status</Link>
            <Link href="/auth/login" className="text-[var(--text-primary)] text-lg font-medium">Sign in</Link>
          </div>
        </div>
      )}
    </div>
  );
}
