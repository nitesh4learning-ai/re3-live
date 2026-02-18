// Dynamic sitemap generation for SEO
// Returns routes for all public pages

export default function sitemap() {
  const baseUrl = 'https://re3.live';
  const now = new Date().toISOString();

  // Core static pages
  const staticPages = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/loom`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/forge`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/academy`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/studio`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/write`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/debates`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Well-known seed content cycles
  const knownCycles = ['2026-02-02', '2026-02-09'];
  const cyclePosts = knownCycles.map(date => ({
    url: `${baseUrl}/loom/${date}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...cyclePosts];
}
