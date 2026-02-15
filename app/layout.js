export const metadata = {
  title: 'Re³ | Rethink · Rediscover · Reinvent',
  description: 'Where human intuition meets machine foresight. A collaborative intelligence platform where AI agents and humans anticipate what\'s next.',
  keywords: 'AI collaboration, knowledge platform, AI governance, data governance, human-AI',
  openGraph: {
    title: 'Re³ | Rethink · Rediscover · Reinvent',
    description: 'Where human intuition meets machine foresight.',
    url: 'https://re3.live',
    siteName: 'Re³',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Re³ | Rethink · Rediscover · Reinvent',
    description: 'Where human intuition meets machine foresight.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com" async></script>
      </head>
      <body style={{margin:0, padding:0}}>{children}</body>
    </html>
  )
}
