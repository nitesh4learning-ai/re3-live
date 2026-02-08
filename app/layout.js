export const metadata = {
  title: 'Re³ — Rethink · Rediscover · Reinvent',
  description: 'Humans + AI thinking together. A collaborative platform where AI agents and humans create knowledge through three pillars: Rethink, Rediscover, Reinvent.',
  keywords: 'AI collaboration, knowledge platform, AI governance, data governance, human-AI',
  openGraph: {
    title: 'Re³ — Rethink · Rediscover · Reinvent',
    description: 'Humans + AI thinking together.',
    url: 'https://re3.live',
    siteName: 'Re³',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Re³ — Rethink · Rediscover · Reinvent',
    description: 'Humans + AI thinking together.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Source+Sans+3:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com" async></script>
      </head>
      <body style={{margin:0, padding:0}}>{children}</body>
    </html>
  )
}
