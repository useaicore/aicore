import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AICore — AI Infrastructure. Finally Under Control.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09080A',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Gold radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 900,
            height: 500,
            background: 'radial-gradient(ellipse at center, rgba(196,146,48,0.13) 0%, transparent 68%)',
          }}
        />

        {/* Sky accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '10%',
            width: 400,
            height: 300,
            background: 'radial-gradient(ellipse at center, rgba(74,143,170,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, rgba(232,184,75,0.35) 0%, rgba(74,143,170,0.18) 100%)',
              border: '1.5px solid rgba(232,184,75,0.4)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              color: '#E8B84B',
            }}
          >
            ◆
          </div>
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#E8B84B',
              letterSpacing: '-0.02em',
            }}
          >
            AICore
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            maxWidth: 920,
          }}
        >
          <span style={{ fontSize: 68, fontWeight: 900, color: '#F5ECD7', marginBottom: 8 }}>
            AI Infrastructure.
          </span>
          <span
            style={{
              fontSize: 68,
              fontWeight: 900,
              background: 'linear-gradient(130deg, #E8B84B 0%, #C49230 35%, #4A8FAA 70%, #6DB8CC 100%)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Finally Under Control.
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            color: 'rgba(245,236,215,0.45)',
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}
        >
          One endpoint · Every AI provider · Full cost visibility
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
          {['93% token savings', '$0 cold-start cost', '< 1ms overhead'].map((text) => (
            <div
              key={text}
              style={{
                padding: '9px 22px',
                background: 'rgba(196,146,48,0.07)',
                border: '1px solid rgba(196,146,48,0.22)',
                borderRadius: 100,
                fontSize: 14,
                color: 'rgba(232,184,75,0.85)',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            fontSize: 13,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          aicore.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
