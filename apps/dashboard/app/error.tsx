'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AICore]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin:0, padding:0, background:'#09080A', fontFamily:'system-ui,sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '0 24px',
          }}
        >
          <style>{`
            @keyframes shard-a {
              0%,100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: .8; }
              30%  { transform: translate(-8px,-12px) rotate(-15deg) scale(.9); opacity:.5; }
              60%  { transform: translate(6px,8px) rotate(8deg) scale(1.05); opacity:.7; }
            }
            @keyframes shard-b {
              0%,100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: .6; }
              40%  { transform: translate(10px,-8px) rotate(20deg) scale(.85); opacity:.4; }
              70%  { transform: translate(-5px,10px) rotate(-12deg) scale(1.1); opacity:.65; }
            }
            @keyframes shard-c {
              0%,100% { transform: translate(0,0) rotate(0deg) scale(1); opacity:.5; }
              25%  { transform: translate(5px,14px) rotate(-18deg) scale(.92); opacity:.3; }
              55%  { transform: translate(-9px,-6px) rotate(10deg) scale(1.08); opacity:.55; }
            }
            @keyframes fade-up {
              from { opacity:0; transform:translateY(20px); }
              to   { opacity:1; transform:translateY(0); }
            }
            @keyframes pulse-ring {
              0%   { transform: scale(1); opacity: .4; }
              100% { transform: scale(1.8); opacity: 0; }
            }
            @keyframes error-glow {
              0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.08); }
              50%     { box-shadow: 0 0 40px rgba(239,68,68,0.18); }
            }
            .shard-a { animation: shard-a 5s ease-in-out infinite; }
            .shard-b { animation: shard-b 6.5s ease-in-out .8s infinite; }
            .shard-c { animation: shard-c 4.5s ease-in-out 1.5s infinite; }
            .fu-1 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .1s both; }
            .fu-2 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .3s both; }
            .fu-3 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .5s both; }
            .fu-4 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .7s both; }
            .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
            .error-frame { animation: error-glow 3s ease-in-out infinite; }
            .btn-retry { transition: all .15s; }
            .btn-retry:hover { transform: translateY(-1px); opacity: .9; }
            .btn-ghost:hover { background: rgba(255,255,255,0.06); }
            .btn-ghost { transition: background .15s; }
          `}</style>

          {/* Dot grid */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />

          {/* Error glow */}
          <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 68%)', pointerEvents:'none' }} />

          <div style={{ position:'relative', textAlign:'center', maxWidth:520, width:'100%' }}>

            {/* Broken diamond logo */}
            <div className="fu-1" style={{ display:'flex', justifyContent:'center', marginBottom:40 }}>
              <div style={{ position:'relative', width:72, height:72 }}>
                {/* Pulse ring */}
                <div className="pulse-ring" style={{ position:'absolute', inset:0, border:'1px solid rgba(239,68,68,0.3)', borderRadius:'50%' }} />

                {/* Shards of the broken ◆ */}
                <div className="shard-a" style={{ position:'absolute', top:'10%', left:'15%', fontSize:28, color:'rgba(232,184,75,0.7)', userSelect:'none', fontWeight:900 }}>◆</div>
                <div className="shard-b" style={{ position:'absolute', top:'30%', left:'40%', fontSize:16, color:'rgba(239,68,68,0.5)', userSelect:'none', fontWeight:900 }}>◇</div>
                <div className="shard-c" style={{ position:'absolute', top:'45%', left:'20%', fontSize:12, color:'rgba(74,143,170,0.4)', userSelect:'none', fontWeight:900 }}>◆</div>
              </div>
            </div>

            {/* Error code badge */}
            <div className="fu-2" style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <div
                className="error-frame"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:100 }}
              >
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(239,68,68,0.85)', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'var(--font-geist-mono,monospace)' }}>
                  {error.digest ? `Error · ${error.digest.slice(0,8)}` : 'Internal Error'}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="fu-2" style={{ fontSize:'clamp(28px,6vw,42px)', fontWeight:900, color:'#F2E0B0', letterSpacing:'-0.025em', lineHeight:1.15, marginBottom:12 }}>
              Something broke<br />
              <span style={{ color:'rgba(239,68,68,0.75)' }}>in the pipeline.</span>
            </h1>

            {/* Subtext */}
            <p className="fu-3" style={{ color:'rgba(168,152,120,0.6)', fontSize:14, lineHeight:1.65, marginBottom:20, maxWidth:380, margin:'0 auto 20px' }}>
              An unexpected error occurred while processing your request. Our team has been notified.
            </p>

            {/* Error message box */}
            {error.message && (
              <div className="fu-3" style={{ display:'inline-block', textAlign:'left', width:'100%', maxWidth:420, background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:10, padding:'10px 16px', marginBottom:32, fontFamily:'var(--font-geist-mono,monospace)', fontSize:11 }}>
                <span style={{ color:'rgba(239,68,68,0.5)', marginRight:8 }}>✗</span>
                <span style={{ color:'rgba(245,236,215,0.45)', wordBreak:'break-all' }}>{error.message}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="fu-4" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop: error.message ? 0 : 32 }}>
              <button
                onClick={reset}
                className="btn-retry"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'linear-gradient(135deg,#C49230,#E8B84B)', color:'#09080A', fontWeight:800, fontSize:13, borderRadius:9, border:'none', cursor:'pointer', letterSpacing:'-0.01em' }}
              >
                ↺ Try again
              </button>
              <Link
                href="/"
                className="btn-ghost"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(245,236,215,0.65)', fontWeight:600, fontSize:13, borderRadius:9, textDecoration:'none' }}
              >
                Home
              </Link>
            </div>

            {/* Status line */}
            <div style={{ marginTop:52, fontSize:11, color:'rgba(255,255,255,0.12)', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'var(--font-geist-mono,monospace)' }}>
              HTTP 500 · Internal Server Error
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
