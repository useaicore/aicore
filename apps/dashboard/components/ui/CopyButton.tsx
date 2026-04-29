'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  size?: 'sm' | 'xs';
  className?: string;
}

export default function CopyButton({ value, size = 'sm', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === 'xs' ? '12' : '14';

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "text-[var(--text-muted)] hover:text-[var(--gold-mid)] transition-colors p-1",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)]">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
