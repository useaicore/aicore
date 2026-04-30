'use client';

import { useState, useEffect } from 'react';
import { createKeyAction } from '@/app/actions/keys';
import CopyButton from '@/components/ui/CopyButton';

export default function CreateKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'development'>('development');
  const [loading, setLoading] = useState(false);
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('environment', environment);
    try {
      const result = await createKeyAction(formData);
      setPlainKey(result.plainKey);
    } catch {
      alert('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused?: boolean) => ({
    width: '100%',
    background: 'var(--bg-base)',
    border: `1px solid ${focused ? 'rgba(196,146,48,0.45)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused ? '0 0 0 3px rgba(196,146,48,0.08)' : 'none',
    borderRadius: 9,
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    boxSizing: 'border-box' as const,
  });

  /* Success screen */
  if (plainKey) {
    return (
      <Backdrop onClose={onClose}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          {/* Animated check */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <div
              style={{
                width:52, height:52, borderRadius:14,
                background:'rgba(34,197,94,0.1)',
                border:'1px solid rgba(34,197,94,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, color:'#22C55E',
                animation:'check-pop .4s cubic-bezier(0.34,1.56,0.64,1) both',
              }}
            >
              ✓
            </div>
          </div>
          <h3 style={{ color:'#F2E0B0', fontWeight:800, fontSize:18, letterSpacing:'-0.02em', marginBottom:6 }}>
            Key created
          </h3>
          <p style={{ color:'rgba(168,152,120,0.7)', fontSize:13, lineHeight:1.6 }}>
            Copy it now — this is the only time it&apos;ll be shown.
          </p>
        </div>

        {/* Key display */}
        <div
          style={{
            background:'rgba(0,0,0,0.35)',
            border:'1px solid rgba(196,146,48,0.2)',
            borderRadius:10,
            padding:'12px 14px',
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            gap:12,
            marginBottom:24,
          }}
        >
          <code
            style={{
              color:'var(--sky-bright)',
              fontSize:11,
              fontFamily:'var(--font-geist-mono,monospace)',
              wordBreak:'break-all',
              lineHeight:1.6,
            }}
          >
            {plainKey}
          </code>
          <CopyButton value={plainKey} className="flex-shrink-0" />
        </div>

        {/* Warning */}
        <div
          style={{
            display:'flex', alignItems:'flex-start', gap:10,
            background:'rgba(232,184,75,0.05)',
            border:'1px solid rgba(232,184,75,0.15)',
            borderRadius:8, padding:'10px 14px', marginBottom:24,
          }}
        >
          <span style={{ color:'#E8B84B', fontSize:14, flexShrink:0, marginTop:1 }}>⚠</span>
          <p style={{ color:'rgba(232,184,75,0.75)', fontSize:12, lineHeight:1.55, margin:0 }}>
            Store this key in your environment variables. You won&apos;t be able to view it again.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width:'100%', padding:'11px', background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:9, color:'var(--text-primary)', fontWeight:600,
            fontSize:13, cursor:'pointer',
          }}
        >
          Done
        </button>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClose={onClose}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div
            style={{
              width:32, height:32, borderRadius:8,
              background:'linear-gradient(135deg,rgba(196,146,48,0.2),rgba(74,143,170,0.1))',
              border:'1px solid rgba(196,146,48,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, color:'#E8B84B',
            }}
          >
            ◆
          </div>
          <h3 style={{ color:'#F2E0B0', fontWeight:800, fontSize:17, letterSpacing:'-0.02em', margin:0 }}>
            Create API Key
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            width:28, height:28, borderRadius:7,
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(168,152,120,0.6)',
            fontSize:14, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center',
            transition:'all .15s',
          }}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {/* Name */}
        <div>
          <label style={{ display:'block', color:'rgba(168,152,120,0.7)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>
            Key Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production App"
            style={inputStyle()}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(196,146,48,0.45)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,146,48,0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Environment */}
        <div>
          <label style={{ display:'block', color:'rgba(168,152,120,0.7)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:12 }}>
            Environment
          </label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {(['development', 'live'] as const).map((env) => {
              const active = environment === env;
              const isLive = env === 'live';
              const activeColor = isLive ? 'var(--error)' : 'var(--sky-bright)';
              const activeBg = isLive ? 'rgba(239,68,68,0.07)' : 'rgba(74,143,170,0.07)';
              const activeBorder = isLive ? 'rgba(239,68,68,0.3)' : 'rgba(74,143,170,0.3)';
              return (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  style={{
                    padding:'10px 14px',
                    background: active ? activeBg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? activeBorder : 'rgba(255,255,255,0.07)'}`,
                    borderRadius:9,
                    cursor:'pointer',
                    display:'flex', alignItems:'center', gap:9,
                    transition:'all .15s',
                  }}
                >
                  <div
                    style={{
                      width:10, height:10, borderRadius:'50%', flexShrink:0,
                      background: active ? activeColor : 'rgba(255,255,255,0.12)',
                      boxShadow: active ? `0 0 8px ${activeColor}` : 'none',
                      transition:'all .15s',
                    }}
                  />
                  <span style={{ fontSize:13, fontWeight:600, color: active ? 'var(--text-primary)' : 'rgba(168,152,120,0.6)', textTransform:'capitalize', letterSpacing:'-0.01em' }}>
                    {env}
                  </span>
                </button>
              );
            })}
          </div>
          {environment === 'live' && (
            <p style={{ marginTop:8, fontSize:11.5, color:'rgba(239,68,68,0.6)', lineHeight:1.5 }}>
              Live keys are rate-limited and billed against your plan.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            width:'100%', padding:'11px',
            background: loading || !name.trim() ? 'rgba(196,146,48,0.4)' : 'linear-gradient(135deg,#C49230,#E8B84B)',
            color: loading || !name.trim() ? 'rgba(9,8,10,0.5)' : '#09080A',
            fontWeight:800, fontSize:13, borderRadius:9,
            border:'none', cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            letterSpacing:'-0.01em', transition:'all .15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
        >
          {loading ? (
            <>
              <Spinner />
              Generating...
            </>
          ) : (
            'Generate API Key →'
          )}
        </button>
      </form>

      <style>{`
        @keyframes check-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position:'fixed', inset:0,
        background:'rgba(0,0,0,0.65)',
        backdropFilter:'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:100, padding:16,
        animation:'backdrop-in .2s ease both',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes backdrop-in { from { opacity:0 } to { opacity:1 } }
        @keyframes modal-in {
          from { opacity:0; transform:scale(0.95) translateY(8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:'var(--bg-elevated)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16,
          padding:24, width:'100%', maxWidth:420,
          boxShadow:'0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          animation:'modal-in .25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width:14, height:14, borderRadius:'50%',
        border:'2px solid rgba(9,8,10,0.3)',
        borderTopColor:'rgba(9,8,10,0.8)',
        animation:'spin .6s linear infinite',
        flexShrink:0,
      }}
    />
  );
}
