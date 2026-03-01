// Utility/helper functions
import { ALL_USERS, PILLARS } from '../constants';

export const getAuthor = (id) => ALL_USERS.find(u => u.id === id);
export const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
export const fmtS = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Derive a headline from cycle post titles — supports both classic and dynamic pillars
export function deriveHeadline(rethink, rediscover, reinvent, posts) {
  const titles = [rethink?.title, rediscover?.title, reinvent?.title].filter(Boolean);
  // Fallback to dynamic pillar post titles if no classic pillars
  if (!titles.length && posts?.length) {
    posts.forEach(p => { if (p?.title) titles.push(p.title); });
  }
  if (!titles.length) return '';
  const first = titles[0].replace(/^(Rethinking|Re-examining|Rediscovering|Reinventing|Building|The)\s+/i, '').replace(/[?:]+$/, '').trim();
  return first.length > 50 ? first.slice(0, 47) + '...' : first;
}

// Group content into cycles (filters archived) — includes journey metadata
// Supports both classic 3-pillar (rethink/rediscover/reinvent) and dynamic pillars
export function getCycles(content) {
  const active = content.filter(c => c.sundayCycle && !c.archived);
  const cycleGroups = {};
  active.forEach(c => { const key = c.cycleId || c.sundayCycle; if (!cycleGroups[key]) cycleGroups[key] = []; cycleGroups[key].push(c); });
  const keys = Object.keys(cycleGroups);
  const cycles = keys.map((key) => {
    const posts = cycleGroups[key];
    const date = posts[0]?.sundayCycle || key;
    const id = posts[0]?.cycleId || key;
    const rethink = posts.find(p => p.pillar === "rethink");
    const rediscover = posts.find(p => p.pillar === "rediscover");
    const reinvent = posts.find(p => p.pillar === "reinvent");
    const extra = posts.filter(p => !["rethink", "rediscover", "reinvent"].includes(p.pillar));
    const headline = deriveHeadline(rethink, rediscover, reinvent, posts);
    // Journey metadata (from connected cycle generation)
    const throughLineQuestion = rethink?.throughLineQuestion || rediscover?.throughLineQuestion || reinvent?.throughLineQuestion || posts[0]?.throughLineQuestion || null;
    const artifacts = {
      questions: rethink?.artifact?.type === "questions" ? rethink.artifact : null,
      principle: rediscover?.artifact?.type === "principle" ? rediscover.artifact : null,
      blueprint: reinvent?.artifact?.type === "blueprint" ? reinvent.artifact : null,
    };
    const isJourney = !!(throughLineQuestion || rethink?.bridgeSentence || rediscover?.synthesisPrinciple);
    // Dynamic pillars: if any post has dynamicPillars metadata, use it
    const dynamicPillars = posts[0]?.dynamicPillars || null;
    // Use createdAt from the newest post for reliable sorting
    const latestCreatedAt = posts.reduce((latest, p) => {
      const t = new Date(p.createdAt || date).getTime();
      return t > latest ? t : latest;
    }, 0);
    return { id, date, latestCreatedAt, rethink, rediscover, reinvent, extra, posts, headline, endorsements: posts.reduce((s, p) => s + p.endorsements, 0), comments: posts.reduce((s, p) => s + p.comments.length, 0), throughLineQuestion, artifacts, isJourney, dynamicPillars };
  });
  // Sort by actual date (newest first), not by key string
  cycles.sort((a, b) => b.latestCreatedAt - a.latestCreatedAt);
  // Assign cycle numbers after sorting (oldest = 1, newest = N)
  cycles.forEach((c, i) => { c.number = cycles.length - i; });
  return cycles;
}
