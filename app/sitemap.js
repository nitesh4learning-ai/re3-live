// Dynamic sitemap generation for SEO and Google Search Console indexing.
// Next.js serves this at /sitemap.xml automatically.
// Excludes /studio and /write (blocked in robots.txt).

export default function sitemap() {
  const baseUrl = 'https://re3.live';
  const now = new Date().toISOString();

  // Public pages — match robots.txt Allow/Disallow rules
  const staticPages = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/loom`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/forge`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/debates`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/academy`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/arena`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  // Known seed content cycles for deep-link indexing
  const knownCycles = ['2026-02-02', '2026-02-09'];
  const cyclePosts = knownCycles.map(date => ({
    url: `${baseUrl}/loom/${date}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...cyclePosts];
}
