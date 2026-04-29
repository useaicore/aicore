'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandBar } from './CommandBarProvider.js';
import { useSearch } from '@/hooks/useSearch.js';
import { formatCents, relativeTime } from '@/lib/format.js';
import Badge from '@/components/ui/Badge.js';
import { authClient } from '@/lib/auth-client.js';
import { cn } from '@/lib/utils.js';

export function CommandBarModal() {
  const { open, setOpen, workspaceId } = useCommandBar();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const { results, loading } = useSearch(query);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animation handling
  useEffect(() => {
    if (open) {
      setMounted(true);
      setTimeout(() => setVisible(true), 10);
      setQuery('');
      setActiveIndex(0);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Static items
  const staticItems = useMemo(() => [
    { id: 'nav-overview', label: 'Go to Overview', href: '/overview', icon: '◈', group: 'Navigation' },
    { id: 'nav-logs', label: 'Go to Logs', href: '/logs', icon: '▦', group: 'Navigation' },
    { id: 'nav-keys', label: 'Go to API Keys', href: '/keys', icon: '⬡', group: 'Navigation' },
    { id: 'nav-usage', label: 'Go to Usage', href: '/usage', icon: '◎', group: 'Navigation' },
    { id: 'nav-settings', label: 'Go to Settings', href: '/settings', icon: '⚙', group: 'Navigation' },
    { id: 'act-create', label: 'Create API Key', action: 'CREATE_KEY', icon: '+', group: 'Actions' },
    { id: 'act-copy', label: 'Copy Workspace ID', action: 'COPY_ID', icon: '⎘', group: 'Actions' },
    { id: 'act-signout', label: 'Sign Out', action: 'SIGNOUT', icon: '↪', group: 'Actions' },
  ], []);

  const filteredStatic = useMemo(() => 
    staticItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    [query, staticItems]
  );

  const flatResults = useMemo(() => {
    const items: any[] = [...filteredStatic];
    if (results?.logs) {
      results.logs.forEach(log => items.push({ ...log, type: 'log', id: `log-${log.callId}` }));
    }
    if (results?.keys) {
      results.keys.forEach(key => items.push({ ...key, type: 'key', id: `key-${key.id}` }));
    }
    return items;
  }, [filteredStatic, results]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Actions
  const executeItem = (item: any) => {
    if (item.href) {
      router.push(item.href);
      setOpen(false);
    } else if (item.action === 'CREATE_KEY') {
      setOpen(false);
      window.dispatchEvent(new CustomEvent('open-create-key-modal'));
    } else if (item.action === 'COPY_ID') {
      navigator.clipboard.writeText(workspaceId);
      setCopiedId(item.id);
      setTimeout(() => {
        setCopiedId(null);
        setOpen(false);
      }, 1000);
    } else if (item.action === 'SIGNOUT') {
      authClient.signOut();
      router.push('/auth/login');
      setOpen(false);
    } else if (item.type === 'log') {
      router.push(`/logs?search=${item.callId}`);
      setOpen(false);
    } else if (item.type === 'key') {
      router.push('/keys');
      setOpen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % flatResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[activeIndex]) executeItem(flatResults[activeIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, flatResults, activeIndex, setOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )} 
        onClick={() => setOpen(false)} 
      />

      {/* Panel */}
      <div className={cn(
        "relative w-full max-w-[560px] bg-[var(--bg-elevated)] border border-[var(--gold-dim)] rounded-[var(--radius-lg)] shadow-[0_24px_48px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-150 ease-out",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.98]"
      )}>
        {/* Input */}
        <div className="h-[52px] border-b border-[var(--text-faint)] flex items-center px-4 gap-3">
          {loading ? (
            <div className="w-4 h-4 border-2 border-[var(--gold-mid)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          )}
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]"
            placeholder="Search logs, keys, or jump to..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <kbd className="hidden sm:flex h-5 items-center gap-1 rounded border border-[var(--text-faint)] bg-[var(--bg-subtle)] px-1.5 font-sans text-[10px] font-medium text-[var(--text-muted)]">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div 
          ref={scrollRef}
          className="max-h-[400px] overflow-y-auto custom-scrollbar"
        >
          {flatResults.length === 0 && query && !loading ? (
            <div className="py-12 px-4 text-center">
              <p className="text-[var(--text-muted)] text-sm mb-1">No results for "{query}"</p>
              <p className="text-[var(--text-faint)] text-xs">Try searching by call ID, model, or key name</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {/* Render Groups */}
              {renderGroup('Navigation', flatResults.filter(i => i.group === 'Navigation'), activeIndex, flatResults, executeItem, copiedId)}
              {renderGroup('Actions', flatResults.filter(i => i.group === 'Actions'), activeIndex, flatResults, executeItem, copiedId)}
              {renderGroup('Logs', flatResults.filter(i => i.type === 'log'), activeIndex, flatResults, executeItem, copiedId)}
              {renderGroup('API Keys', flatResults.filter(i => i.type === 'key'), activeIndex, flatResults, executeItem, copiedId)}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--text-faint); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--gold-dim); }
      `}</style>
    </div>
  );
}

function renderGroup(title: string, items: any[], activeIndex: number, flatResults: any[], executeItem: (i: any) => void, copiedId: string | null) {
  if (items.length === 0) return null;
  return (
    <div key={title}>
      <div className="px-3 py-2 text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">{title}</div>
      <div className="space-y-0.5">
        {items.map(item => {
          const index = flatResults.findIndex(i => i.id === item.id);
          const active = index === activeIndex;
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => executeItem(item)}
              onMouseEnter={() => {}} // Could sync index here if desired
              className={cn(
                "h-[44px] px-3 flex items-center gap-3 cursor-pointer rounded-md transition-all duration-100",
                active ? "bg-[var(--bg-subtle)] shadow-[inset_2px_0_0_0_var(--gold-bright)]" : "hover:bg-[var(--bg-subtle)]/40"
              )}
            >
              {item.type === 'log' ? (
                <>
                  <span className={cn("text-[var(--error)] text-sm", !item.isError && "invisible")}>⚠</span>
                  <div className="flex-1 flex flex-col min-w-0">
                    <code className="text-[var(--sky-bright)] text-[10px] font-mono truncate">{item.callId}</code>
                    <div className="flex gap-2">
                      <span className="text-[var(--text-faint)] text-[10px] uppercase">{item.model}</span>
                      <span className="text-[var(--text-faint)] text-[10px] uppercase opacity-50">/</span>
                      <span className="text-[var(--text-faint)] text-[10px] uppercase">{item.provider}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[var(--text-primary)] text-xs tabular-nums">{formatCents(item.costCents)}</span>
                    <span className="text-[var(--text-faint)] text-[10px]">{relativeTime(item.timestampMs)}</span>
                  </div>
                </>
              ) : item.type === 'key' ? (
                <>
                  <span className="text-[var(--gold-cream)]">⬡</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[var(--text-primary)] text-sm">{item.name}</span>
                    <code className="text-[var(--sky-bright)] text-[10px] font-mono">{item.keyPrefix}...</code>
                  </div>
                  <Badge variant={item.environment === 'live' ? 'error' : 'info'} label={item.environment} size="xs" />
                </>
              ) : (
                <>
                  <span className={cn("text-lg", active ? "text-[var(--gold-cream)]" : "text-[var(--text-muted)]")}>
                    {item.icon}
                  </span>
                  <span className={cn("text-sm font-medium", active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                    {isCopied ? 'Copied!' : item.label}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
