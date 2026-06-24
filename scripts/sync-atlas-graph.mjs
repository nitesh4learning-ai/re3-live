import { copyFileSync, existsSync } from 'node:fs';
const src = 'graphify-out/graph.html';
const dest = 'public/atlas-graph.html';
if (!existsSync(src)) {
  console.warn(`[sync-atlas-graph] ${src} not found — skipping (keeping committed ${dest}). Run "graphify update ." to regenerate.`);
  process.exit(0);
}
copyFileSync(src, dest);
console.log(`[sync-atlas-graph] synced ${src} -> ${dest}`);
