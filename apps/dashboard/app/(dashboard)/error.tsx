'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AICore Dashboard]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <style>{`
        @keyframes err-fade-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes err-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 8px rgba(239,68,68,0.08); }
        }
        .err-1 { animation: err-fade-up .6s cubic-bezier(0.16,1,0.3,1) .05s both; }
        .err-2 { animation: err-fade-up .6s cubic-bezier(0.16,1,0.3,1) .2s both; }
        .err-3 { animation: err-fade-up .6s cubic-bezier(0.16,1,0.3,1) .35s both; }
        .err-icon { animation: err-pulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Icon */}
      <div className="err-1" style={{ marginBottom:24 }}>
        <div
          className="err-icon"
          style={{
            width:56, height:56,
            borderRadius:14,
            background:'rgba(239,68,68,0.08)',
            border:'1px solid rgba(239,68,68,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, color:'rgba(239,68,68,0.7)',
            margin:'0 auto',
          }}
        >
          ◇
        </div>
      </div>

      {/* Headline */}
      <h2 className="err-2" style={{ fontSize:22, fontWeight:800, color:'#F2E0B0', letterSpacing:'-0.02em', marginBottom:8 }}>
        Something went wrong
      </h2>

      <p className="err-2" style={{ color:'rgba(168,152,120,0.65)', fontSize:13.5, lineHeight:1.6, maxWidth:320, marginBottom:24 }}>
        This page hit an unexpected error. You can try again or head back to the overview.
      </p>

      {/* Error detail */}
      {error.message && (
        <div
          className="err-3"
          style={{
            display:'inline-block',
            padding:'8px 16px',
            background:'rgba(239,68,68,0.04)',
            border:'1px solid rgba(239,68,68,0.12)',
            borderRadius:8,
            fontFamily:'var(--font-geist-mono,monospace)',
            fontSize:11,
            color:'rgba(245,236,215,0.4)',
            marginBottom:28,
            maxWidth:380,
            wordBreak:'break-all',
            textAlign:'left',
          }}
        >
          <span style={{ color:'rgba(239,68,68,0.45)', marginRight:8 }}>✗</span>
          {error.message}
        </div>
      )}

      {/* Actions */}
      <div className="err-3" style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <button
          onClick={reset}
          style={{
            padding:'9px 22px',
            background:'linear-gradient(135deg,#C49230,#E8B84B)',
            color:'#09080A',
            fontWeight:800,
            fontSize:13,
            borderRadius:8,
            border:'none',
            cursor:'pointer',
            letterSpacing:'-0.01em',
          }}
        >
          ↺ Try again
        </button>
        <Link
          href="/overview"
          style={{
            display:'inline-flex', alignItems:'center',
            padding:'9px 22px',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)',
            color:'rgba(245,236,215,0.6)',
            fontWeight:600,
            fontSize:13,
            borderRadius:8,
            textDecoration:'none',
          }}
        >
          ← Overview
        </Link>
      </div>
    </div>
  );
}
