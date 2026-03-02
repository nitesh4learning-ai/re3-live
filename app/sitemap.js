// Dynamic sitemap generation for SEO and Google Search Console indexing.
// Next.js serves this at /sitemap.xml automatically.
// Queries Firestore for dynamic content (posts, forge sessions) at request time.

export default async function sitemap() {
  const baseUrl = 'https://re3.live';
  const now = new Date().toISOString();

  // Static pages — match robots.txt Allow/Disallow rules
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

  // Academy course pages (from course metadata files)
  let coursePages = [];
  try {
    const { getAllCourseIds } = await import('./academy/lib/course-loader');
    coursePages = getAllCourseIds().map(id => ({
      url: `${baseUrl}/academy/${id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // Course loader unavailable — skip
  }

  // Dynamic pages from Firestore
  let dynamicPages = [];
  try {
    const { adminDb } = await import('../lib/firebase-admin');

    // Fetch published posts (individual article pages)
    const contentSnap = await adminDb.collection('content').orderBy('updatedAt', 'desc').limit(200).get();
    const postPages = contentSnap.docs.map(doc => ({
      url: `${baseUrl}/post/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate?.()?.toISOString?.() || now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // Fetch forge sessions (debate session pages)
    const forgeSnap = await adminDb.collection('forge_sessions').orderBy('updatedAt', 'desc').limit(100).get();
    const forgePages = forgeSnap.docs.map(doc => ({
      url: `${baseUrl}/forge/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate?.()?.toISOString?.() || now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // Collect loom cycle dates from content
    const loomDates = new Set();
    contentSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.sundayCycle) loomDates.add(d.sundayCycle);
      if (d.cycleId) loomDates.add(d.cycleId);
    });
    const loomPages = [...loomDates].map(date => ({
      url: `${baseUrl}/loom/${date}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    dynamicPages = [...postPages, ...forgePages, ...loomPages];
  } catch (e) {
    // Firestore unavailable (build without creds) — use hardcoded fallback
    console.warn('Sitemap: Firestore unavailable, using static fallback:', e.message);
    const knownCycles = ['2026-02-02', '2026-02-09'];
    dynamicPages = knownCycles.map(date => ({
      url: `${baseUrl}/loom/${date}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  return [...staticPages, ...coursePages, ...dynamicPages];
}
