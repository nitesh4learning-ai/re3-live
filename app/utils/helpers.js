// Utility/helper functions
import { ALL_USERS, PILLARS } from '../constants';

export const getAuthor = (id) => ALL_USERS.find(u => u.id === id);
export const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
export const fmtS = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Derive a headline from cycle post titles
export function deriveHeadline(rethink, rediscover, reinvent) {
  const titles = [rethink?.title, rediscover?.title, reinvent?.title].filter(Boolean);
  if (!titles.length) return '';
  const first = titles[0].replace(/^(Rethinking|Re-examining|Rediscovering|Reinventing|Building|The)\s+/i, '').replace(/[?:]+$/, '').trim();
  return first.length > 50 ? first.slice(0, 47) + '...' : first;
}

// Group content into cycles (filters archived) — includes journey metadata
export function getCycles(content) {
  const active = content.filter(c => c.sundayCycle && !c.archived);
  const cycleGroups = {};
  active.forEach(c => { const key = c.cycleId || c.sundayCycle; if (!cycleGroups[key]) cycleGroups[key] = []; cycleGroups[key].push(c); });
  const keys = Object.keys(cycleGroups).sort((a, b) => b.localeCompare(a));
  return keys.map((key, i) => {
    const posts = cycleGroups[key];
    const date = posts[0]?.sundayCycle || key;
    const id = posts[0]?.cycleId || key;
    const rethink = posts.find(p => p.pillar === "rethink");
    const rediscover = posts.find(p => p.pillar === "rediscover");
    const reinvent = posts.find(p => p.pillar === "reinvent");
    const extra = posts.filter(p => !["rethink", "rediscover", "reinvent"].includes(p.pillar));
    const headline = deriveHeadline(rethink, rediscover, reinvent);
    // Journey metadata (from connected cycle generation)
    const throughLineQuestion = rethink?.throughLineQuestion || rediscover?.throughLineQuestion || reinvent?.throughLineQuestion || null;
    const artifacts = {
      questions: rethink?.artifact?.type === "questions" ? rethink.artifact : null,
      principle: rediscover?.artifact?.type === "principle" ? rediscover.artifact : null,
      blueprint: reinvent?.artifact?.type === "blueprint" ? reinvent.artifact : null,
    };
    const isJourney = !!(throughLineQuestion || rethink?.bridgeSentence || rediscover?.synthesisPrinciple);
    return { id, date, number: keys.length - i, rethink, rediscover, reinvent, extra, posts, headline, endorsements: posts.reduce((s, p) => s + p.endorsements, 0), comments: posts.reduce((s, p) => s + p.comments.length, 0), throughLineQuestion, artifacts, isJourney };
  });
}
