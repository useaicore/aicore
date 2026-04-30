import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09080A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-geist, system-ui, sans-serif)',
      }}
    >
      <style>{`
        @keyframes glitch-base {
          0%, 80%, 100% { transform: translate(0,0) skewX(0deg); }
          81%  { transform: translate(-3px, 0) skewX(-1deg); }
          83%  { transform: translate(4px, 0) skewX(0.5deg); }
          85%  { transform: translate(-2px, 0) skewX(1deg); }
          87%  { transform: translate(3px, 0) skewX(-0.5deg); }
          89%  { transform: translate(0, 0) skewX(0deg); }
        }
        @keyframes glitch-r {
          0%, 80%, 100% { opacity: 0; transform: translate(0,0); clip-path: none; }
          81%  { opacity: 0.75; transform: translate(5px, -2px); clip-path: polygon(0 8%,  100% 8%,  100% 32%, 0 32%); }
          83%  { opacity: 0.6;  transform: translate(-4px, 1px); clip-path: polygon(0 55%, 100% 55%, 100% 72%, 0 72%); }
          85%  { opacity: 0.8;  transform: translate(3px, 0);    clip-path: polygon(0 80%, 100% 80%, 100% 92%, 0 92%); }
          87%  { opacity: 0; }
        }
        @keyframes glitch-b {
          0%, 82%, 100% { opacity: 0; transform: translate(0,0); clip-path: none; }
          83%  { opacity: 0.65; transform: translate(-5px, 2px);  clip-path: polygon(0 20%, 100% 20%, 100% 45%, 0 45%); }
          85%  { opacity: 0.5;  transform: translate(4px, -1px);  clip-path: polygon(0 60%, 100% 60%, 100% 78%, 0 78%); }
          87%  { opacity: 0.7;  transform: translate(-2px, 1px);  clip-path: polygon(0 5%,  100% 5%,  100% 18%, 0 18%); }
          89%  { opacity: 0; }
        }
        @keyframes scanline {
          0%   { top: -3px; opacity: 0; }
          4%   { opacity: 1; }
          96%  { opacity: 0.8; }
          100% { top: calc(100% + 3px); opacity: 0; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb-drift-a {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(14px, -22px) scale(1.1); }
          70%     { transform: translate(-8px, 12px) scale(0.95); }
        }
        @keyframes orb-drift-b {
          0%,100% { transform: translate(0,0) scale(1); }
          35%     { transform: translate(-18px, 16px) scale(1.08); }
          65%     { transform: translate(10px, -10px) scale(0.92); }
        }
        .g-base { animation: glitch-base 7s ease-in-out infinite; }
        .g-red  { animation: glitch-r    7s ease-in-out infinite; pointer-events:none; }
        .g-blue { animation: glitch-b    7s ease-in-out 0.06s infinite; pointer-events:none; }
        .scan   { animation: scanline 3.5s linear infinite; }
        .cursor { animation: cursor-blink 1s step-end infinite; }
        .fu-1 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .1s both; }
        .fu-2 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .3s both; }
        .fu-3 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .55s both; }
        .fu-4 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .75s both; }
        .fu-5 { animation: fade-up .7s cubic-bezier(0.16,1,0.3,1) .95s both; }
        .orb-a { animation: orb-drift-a 9s ease-in-out infinite; }
        .orb-b { animation: orb-drift-b 12s ease-in-out 2s infinite; }
        .orb-c { animation: orb-drift-a 7s ease-in-out 4s infinite; }
        .terminal-line { animation: fade-up .5s cubic-bezier(0.16,1,0.3,1) both; }
        .cta-link:hover { opacity: .88; transform: translateY(-1px); }
        .cta-link { transition: opacity .15s, transform .15s; }
      `}</style>

      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(196,146,48,0.07) 0%, transparent 68%)', pointerEvents: 'none' }} />

      {/* Floating orbs */}
      <div className="orb-a" style={{ position: 'absolute', top: '18%', left: '12%', width: 8, height: 8, borderRadius: '50%', background: 'rgba(232,184,75,0.35)', filter: 'blur(2px)' }} />
      <div className="orb-b" style={{ position: 'absolute', top: '72%', left: '82%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(74,143,170,0.35)', filter: 'blur(1px)' }} />
      <div className="orb-c" style={{ position: 'absolute', top: '55%', left: '88%', width: 10, height: 10, borderRadius: '50%', background: 'rgba(232,184,75,0.12)', filter: 'blur(3px)' }} />
      <div className="orb-b" style={{ position: 'absolute', top: '30%', left: '5%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(122,204,224,0.2)', filter: 'blur(2px)' }} />

      {/* Main content */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 580, width: '100%' }}>

        {/* Logo */}
        <div className="fu-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 52 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,rgba(232,184,75,0.25),rgba(74,143,170,0.15))', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#E8B84B' }}>◆</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#E8B84B', letterSpacing: '-0.02em' }}>AICore</span>
        </div>

        {/* Glitch 404 */}
        <div className="fu-2" style={{ position: 'relative', display: 'inline-block', marginBottom: 44, lineHeight: 1 }}>
          {/* scan line */}
          <div className="scan" style={{ position: 'absolute', left: '-4px', right: '-4px', height: '2px', background: 'linear-gradient(90deg,transparent,rgba(232,184,75,0.7) 30%,rgba(255,255,255,0.5) 50%,rgba(232,184,75,0.7) 70%,transparent)', borderRadius: 2, zIndex: 10, pointerEvents: 'none' }} />

          {/* Red ghost */}
          <div className="g-red" style={{ position: 'absolute', inset: 0, fontSize: 'clamp(96px,18vw,172px)', fontWeight: 900, color: '#EF4444', letterSpacing: '-0.04em', fontFamily: 'var(--font-geist-mono,monospace)', userSelect: 'none' }}>404</div>

          {/* Cyan ghost */}
          <div className="g-blue" style={{ position: 'absolute', inset: 0, fontSize: 'clamp(96px,18vw,172px)', fontWeight: 900, color: '#7ACCE0', letterSpacing: '-0.04em', fontFamily: 'var(--font-geist-mono,monospace)', userSelect: 'none' }}>404</div>

          {/* Main */}
          <div className="g-base" style={{ fontSize: 'clamp(96px,18vw,172px)', fontWeight: 900, color: '#E8B84B', letterSpacing: '-0.04em', fontFamily: 'var(--font-geist-mono,monospace)', WebkitTextStroke: '1px rgba(232,184,75,0.2)' }}>404</div>
        </div>

        {/* Terminal block */}
        <div className="fu-3" style={{ display: 'inline-block', textAlign: 'left', width: '100%', maxWidth: 420, background: 'rgba(13,11,16,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', marginBottom: 28, fontFamily: 'var(--font-geist-mono,monospace)', fontSize: 11.5 }}>
          {/* macOS traffic lights */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', opacity: .7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', opacity: .7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', opacity: .7 }} />
          </div>
          <div className="terminal-line" style={{ animationDelay: '.7s', color: 'rgba(255,255,255,0.2)', marginBottom: 5 }}>
            $ aicore resolve --verbose
          </div>
          <div className="terminal-line" style={{ animationDelay: '.9s', color: 'rgba(232,184,75,0.8)', marginBottom: 4 }}>
            ▸ Scanning route registry...
          </div>
          <div className="terminal-line" style={{ animationDelay: '1.15s', color: 'rgba(245,236,215,0.4)', marginBottom: 4 }}>
            ▸ Checking edge cache... <span style={{ color: 'rgba(239,68,68,0.6)' }}>MISS</span>
          </div>
          <div className="terminal-line" style={{ animationDelay: '1.35s', color: 'rgba(245,236,215,0.4)', marginBottom: 6 }}>
            ▸ Querying fallback routes... <span style={{ color: 'rgba(239,68,68,0.6)' }}>empty</span>
          </div>
          <div className="terminal-line" style={{ animationDelay: '1.55s', color: '#EF4444', marginBottom: 6, fontWeight: 600 }}>
            ✗ ROUTE_NOT_FOUND — no handler matched (exit 1)
          </div>
          <div style={{ color: 'rgba(255,255,255,0.18)' }}>
            ▸ <span className="cursor" style={{ display: 'inline-block', width: 7, height: 13, background: 'rgba(232,184,75,0.45)', verticalAlign: 'middle', borderRadius: 1 }} />
          </div>
        </div>

        {/* Subtext */}
        <p className="fu-4" style={{ color: 'rgba(168,152,120,0.6)', fontSize: 13.5, lineHeight: 1.65, marginBottom: 36 }}>
          This page vanished into the void — or it was never here.<br />
          The router has no idea what you&apos;re looking for.
        </p>

        {/* CTAs */}
        <div className="fu-5" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/overview"
            className="cta-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg,#C49230,#E8B84B)', color: '#09080A', fontWeight: 800, fontSize: 13, borderRadius: 9, textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            ← Dashboard
          </Link>
          <Link
            href="/"
            className="cta-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(245,236,215,0.65)', fontWeight: 600, fontSize: 13, borderRadius: 9, textDecoration: 'none' }}
          >
            Home
          </Link>
        </div>

        {/* Status line */}
        <div style={{ marginTop: 56, fontSize: 11, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-geist-mono,monospace)' }}>
          HTTP 404 · Not Found
        </div>
      </div>
    </main>
  );
}
