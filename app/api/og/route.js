import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const PILLAR_COLORS = {
  rethink: { bg: '#E3F2FD', color: '#3B6B9B', label: 'Rethink' },
  rediscover: { bg: '#FFF3E0', color: '#E8734A', label: 'Rediscover' },
  reinvent: { bg: '#E8F5E9', color: '#2D8A6E', label: 'Reinvent' },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Re\u00B3 | Rethink \u00B7 Rediscover \u00B7 Reinvent';
  const subtitle = searchParams.get('subtitle') || 'Where human intuition meets machine foresight';
  const pillar = searchParams.get('pillar') || '';
  const type = searchParams.get('type') || 'default'; // default, debate, cycle, article

  const pillarInfo = PILLAR_COLORS[pillar] || null;
  const isDebate = type === 'debate';
  const isCycle = type === 'cycle';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: '#F9FAFB',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Top bar with gradient */}
        <div style={{ display: 'flex', width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 0 }}>
          <div style={{ flex: 1, background: '#3B6B9B' }} />
          <div style={{ flex: 1, background: '#E8734A' }} />
          <div style={{ flex: 1, background: '#2D8A6E' }} />
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 16 }}>
          {/* Type badge */}
          {(isDebate || isCycle || pillarInfo) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {pillarInfo && (
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '6px 16px',
                  borderRadius: 20, background: pillarInfo.bg, color: pillarInfo.color,
                  fontSize: 18, fontWeight: 600, letterSpacing: '0.05em',
                }}>
                  {pillarInfo.label}
                </div>
              )}
              {isDebate && (
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '6px 16px',
                  borderRadius: 20, background: '#FAF5FF', color: '#9333EA',
                  fontSize: 18, fontWeight: 600,
                }}>
                  Debate Lab
                </div>
              )}
              {isCycle && (
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '6px 16px',
                  borderRadius: 20, background: '#F0FDF4', color: '#2D8A6E',
                  fontSize: 18, fontWeight: 600,
                }}>
                  Connected Journey
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div style={{
            fontSize: title.length > 60 ? 40 : 52,
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: '90%',
          }}>
            {title.length > 100 ? title.slice(0, 97) + '...' : title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div style={{
              fontSize: 22,
              color: '#6B7280',
              lineHeight: 1.4,
              maxWidth: '80%',
            }}>
              {subtitle.length > 120 ? subtitle.slice(0, 117) + '...' : subtitle}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Infinity logo as text approximation */}
            <div style={{
              fontSize: 28, fontWeight: 800, color: '#111827',
              letterSpacing: '-0.02em',
            }}>
              Re<span style={{ fontSize: 16, verticalAlign: 'super' }}>3</span>
            </div>
            <div style={{ width: 1, height: 24, background: '#D1D5DB' }} />
            <div style={{ fontSize: 14, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Rethink &middot; Rediscover &middot; Reinvent
            </div>
          </div>
          <div style={{ fontSize: 16, color: '#9CA3AF' }}>re3.live</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
