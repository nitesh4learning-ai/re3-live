import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Re\u00B3 \u2014 Rethink \u00B7 Rediscover \u00B7 Reinvent';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          background: '#F9FAFB',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Top gradient bar */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}>
          <div style={{ flex: 1, background: '#3B6B9B' }} />
          <div style={{ flex: 1, background: '#E8734A' }} />
          <div style={{ flex: 1, background: '#2D8A6E' }} />
        </div>

        {/* Logo area */}
        <div style={{
          display: 'flex',
          fontSize: 72,
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-0.03em',
          marginBottom: 16,
        }}>
          Re<span style={{ fontSize: 40, verticalAlign: 'super', marginTop: -8 }}>3</span>
        </div>

        <div style={{
          display: 'flex',
          fontSize: 18,
          color: '#9CA3AF',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 40,
        }}>
          Rethink &middot; Rediscover &middot; Reinvent
        </div>

        <div style={{
          display: 'flex',
          fontSize: 26,
          color: '#4B5563',
          maxWidth: 700,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Where human intuition meets machine foresight
        </div>

        {/* Pillar dots */}
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3B6B9B' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8734A' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2D8A6E' }} />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          bottom: 32,
          fontSize: 16,
          color: '#D1D5DB',
        }}>
          re3.live
        </div>
      </div>
    ),
    { ...size }
  );
}
