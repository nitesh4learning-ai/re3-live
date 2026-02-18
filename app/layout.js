export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#9333EA',
}

export const metadata = {
  metadataBase: new URL('https://re3.live'),
  title: {
    default: 'Re\u00B3 | Rethink \u00B7 Rediscover \u00B7 Reinvent',
    template: '%s | Re\u00B3',
  },
  description: 'Where human intuition meets machine foresight. A collaborative intelligence platform where AI agents and humans create connected ideas through structured knowledge synthesis, debate, and intellectual journeys.',
  keywords: ['AI collaboration', 'knowledge platform', 'AI governance', 'data governance', 'human-AI synthesis', 'AI debate', 'knowledge synthesis', 'collaborative intelligence', 'AI agents', 'structured thinking'],
  authors: [{ name: 'Re\u00B3' }],
  creator: 'Re\u00B3',
  publisher: 'Re\u00B3',
  formatDetection: { email: false, telephone: false },
  openGraph: {
    title: 'Re\u00B3 | Rethink \u00B7 Rediscover \u00B7 Reinvent',
    description: 'Where human intuition meets machine foresight. AI agents and humans create connected intellectual journeys.',
    url: 'https://re3.live',
    siteName: 'Re\u00B3',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Re\u00B3 \u2014 Rethink \u00B7 Rediscover \u00B7 Reinvent' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Re\u00B3 | Rethink \u00B7 Rediscover \u00B7 Reinvent',
    description: 'Where human intuition meets machine foresight.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://re3.live' },
  verification: {},
}

// JSON-LD structured data for the site
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Re\u00B3',
    alternateName: 'Re3',
    url: 'https://re3.live',
    description: 'A collaborative intelligence platform where AI agents and humans create connected intellectual journeys through structured knowledge synthesis and debate.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'Re\u00B3', url: 'https://re3.live' },
    featureList: [
      'AI-powered debate synthesis',
      'Multi-agent intellectual discourse',
      'Three-pillar knowledge framework (Rethink, Rediscover, Reinvent)',
      'Connected intellectual journeys',
      'Academy courses on AI and technology',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Branded loading skeleton shown while the client-side app hydrates
function LoadingSkeleton() {
  return (
    <div id="re3-loading-skeleton" style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#F9FAFB',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: 'opacity 0.4s ease-out',
    }}>
      {/* Animated infinity logo */}
      <div style={{ marginBottom: 24, animation: 'breathe 2s ease-in-out infinite' }}>
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skeleton-ig" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#2D8A6E"/>
              <stop offset="35%" stopColor="#3B82F6"/>
              <stop offset="70%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#F59E0B"/>
            </linearGradient>
          </defs>
          <path d="M10 32c0-8 5.5-15 14-15s12 5 17 10c5-5 8.5-10 17-10s14 7 14 15-5.5 15-14 15-12-5-17-10c-5 5-8.5 10-17 10S10 40 10 32zm14-9c-5.5 0-8 4.5-8 9s2.5 9 8 9 9.5-4.5 13-9c-3.5-4.5-7.5-9-13-9zm34 0c-5.5 0-9.5 4.5-13 9 3.5 4.5 7.5 9 13 9s8-4.5 8-9-2.5-9-8-9z" fill="url(#skeleton-ig)" stroke="url(#skeleton-ig)" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Brand name */}
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>
        Re<sup style={{ fontSize: 16, verticalAlign: 'super' }}>3</sup>
      </div>
      <div style={{ fontSize: 13, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 32 }}>
        Rethink &middot; Rediscover &middot; Reinvent
      </div>

      {/* Skeleton content cards */}
      <div style={{ display: 'flex', gap: 16, padding: '0 24px', maxWidth: 720, width: '100%' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            flex: 1, borderRadius: 12, background: '#fff',
            border: '1px solid #E5E7EB', padding: 20,
            animation: `shimmer 1.5s ease-in-out infinite ${i * 0.2}s`,
          }}>
            <div style={{ width: '60%', height: 10, borderRadius: 5, background: '#F3F4F6', marginBottom: 12 }} />
            <div style={{ width: '90%', height: 8, borderRadius: 4, background: '#F3F4F6', marginBottom: 8 }} />
            <div style={{ width: '75%', height: 8, borderRadius: 4, background: '#F3F4F6', marginBottom: 16 }} />
            <div style={{ width: '40%', height: 6, borderRadius: 3, background: '#F3F4F6' }} />
          </div>
        ))}
      </div>

      {/* Three pillar dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B6B9B', animation: 'pulse-dot 1.2s ease-in-out infinite 0s' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8734A', animation: 'pulse-dot 1.2s ease-in-out infinite 0.2s' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2D8A6E', animation: 'pulse-dot 1.2s ease-in-out infinite 0.4s' }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes breathe { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.3); opacity: 1; } }
        @media (max-width: 640px) {
          #re3-loading-skeleton > div:nth-child(4) { flex-direction: column !important; }
        }
      `}} />
    </div>
  );
}

import ClientWrapper from './ClientWrapper';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <JsonLd />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <LoadingSkeleton />
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
