'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils.js';

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const items = [
    { label: 'Overview', href: '/overview', icon: '◈' },
    { label: 'Logs', href: '/logs', icon: '▦' },
    { label: 'API Keys', href: '/keys', icon: '⬡' },
    { label: 'Usage', href: '/usage', icon: '◎' },
    { label: 'Settings', href: '/settings', icon: '⚙' },
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--text-faint)] rounded-md text-[var(--text-muted)] text-xs hover:border-[var(--gold-dim)] transition-all group"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span>Search...</span>
      <kbd className="ml-4 font-sans text-[10px] opacity-60">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-[560px] bg-[var(--bg-elevated)] border border-[var(--text-faint)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[var(--text-faint)] flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--gold-mid)]">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
              No results found for "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--gold-cream)] transition-all group"
                >
                  <span className="text-lg opacity-60 group-hover:opacity-100">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-40 font-mono">Go to</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-[var(--bg-subtle)]/30 border-t border-[var(--text-faint)] flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[var(--text-faint)] text-[10px] uppercase font-bold">
              <kbd className="bg-[var(--bg-elevated)] px-1 rounded border border-[var(--text-faint)]">ESC</kbd> to close
            </div>
          </div>
          <div className="text-[var(--text-faint)] text-[10px] font-medium italic">
            AICore Command Center
          </div>
        </div>
      </div>
    </div>
  );
}
