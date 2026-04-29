'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CodeTabs() {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after');

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex gap-1 mb-px">
        <button 
          onClick={() => setActiveTab('before')}
          className={cn(
            "px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-t-2 rounded-t-md",
            activeTab === 'before' 
              ? "bg-[var(--bg-elevated)] border-[var(--gold-dim)] text-[var(--gold-cream)]" 
              : "bg-[var(--bg-surface)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          Before
        </button>
        <button 
          onClick={() => setActiveTab('after')}
          className={cn(
            "px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-t-2 rounded-t-md",
            activeTab === 'after' 
              ? "bg-[var(--bg-elevated)] border-[var(--gold-bright)] text-[var(--gold-cream)]" 
              : "bg-[var(--bg-surface)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          After
        </button>
      </div>

      {/* Code Area */}
      <div className={cn(
        "bg-[var(--bg-elevated)] border-gradient-gold rounded-b-lg rounded-tr-lg p-6 font-mono text-[13px] leading-relaxed transition-all duration-500",
        activeTab === 'after' && "glow-gold"
      )}>
        {activeTab === 'before' ? (
          <pre className="text-[var(--text-primary)]">
            <code>
<span className="text-[var(--sky-bright)]">import</span> OpenAI <span className="text-[var(--sky-bright)]">from</span> <span className="text-[var(--gold-cream)]">'openai'</span>{"\n\n"}
<span className="text-[var(--sky-bright)]">const</span> client = <span className="text-[var(--sky-bright)]">new</span> OpenAI({"{"}{"\n"}
  apiKey: <span className="text-[var(--sky-bright)]">process</span>.env.OPENAI_API_KEY,{"\n"}
{"})"}
            </code>
          </pre>
        ) : (
          <pre className="text-[var(--text-primary)]">
            <code>
<span className="text-[var(--sky-bright)]">import</span> OpenAI <span className="text-[var(--sky-bright)]">from</span> <span className="text-[var(--gold-cream)]">'openai'</span>{"\n\n"}
<span className="text-[var(--sky-bright)]">const</span> client = <span className="text-[var(--sky-bright)]">new</span> OpenAI({"{"}{"\n"}
<div className="bg-[var(--success)]/5 border-l-2 border-[var(--success)] -mx-6 px-6 py-0.5">
  apiKey: <span className="text-[var(--sky-bright)]">process</span>.env.AICORE_API_KEY,{"\n"}
  baseURL: <span className="text-[var(--gold-cream)]">'https://api.aicore.dev/v1'</span>,
</div>
{"})"}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
