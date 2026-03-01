# Re3 Implementation Plan — From Prototype to Product

## What's Already Done (Security & SEO — Shipped)

- Zod input validation on all 14 POST API routes
- LLM prompt injection sanitization (`lib/sanitize.js`)
- Rate limiter fixed for serverless (`globalThis`)
- Firestore rules: config writes restricted to admin, custom claims support added
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- API route cache-control headers
- Environment variable validation at build time
- Sitemap expanded, robots.txt updated

---

## Phase 1: Safety Nets (Week 1-2)

The codebase has zero tests, zero CI/CD, and zero error tracking. Nothing else matters until these exist.

### 1.1 Add Testing Framework + Critical Path Tests

**Why:** You currently deploy blind. One broken import crashes the whole app.

**Install:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Config:** Create `vitest.config.js`:
```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // if needed

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
});
```

**Add script to package.json:**
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Write 20 critical tests (prioritized):**

| # | Test File | What It Covers |
|---|-----------|----------------|
| 1 | `tests/lib/sanitize.test.js` | `sanitizeForLLM()` strips injection patterns, handles edge cases |
| 2 | `tests/lib/sanitize.test.js` | `sanitizeShort()` truncates, strips control chars |
| 3 | `tests/lib/llm-parse.test.js` | `parseLLMResponse()` extracts JSON from markdown blocks |
| 4 | `tests/lib/llm-parse.test.js` | Handles trailing commas, single quotes, unquoted keys |
| 5 | `tests/lib/llm-parse.test.js` | Returns error for empty/non-string input |
| 6 | `tests/lib/rate-limit.test.js` | Allows requests within limit |
| 7 | `tests/lib/rate-limit.test.js` | Blocks requests exceeding limit |
| 8 | `tests/lib/rate-limit.test.js` | Sliding window expires old timestamps |
| 9 | `tests/lib/schemas.test.js` | `validateInput()` returns 400 for invalid input |
| 10 | `tests/lib/schemas.test.js` | `validateInput()` returns parsed data for valid input |
| 11 | `tests/lib/schemas.test.js` | `SelectInputSchema` rejects missing articleTitle |
| 12 | `tests/lib/schemas.test.js` | `SelectInputSchema` rejects articleText > 50000 chars |
| 13 | `tests/lib/schemas.test.js` | `RoundInputSchema` rejects roundNumber > 5 |
| 14 | `tests/lib/schemas.test.js` | `CommentInputSchema` rejects missing agentName |
| 15 | `tests/api/health.test.js` | Health endpoint returns 200 |
| 16 | `tests/lib/llm-parse.test.js` | Zod validation warns but still returns data |
| 17 | `tests/lib/sanitize.test.js` | Handles null/undefined input gracefully |
| 18 | `tests/lib/rate-limit.test.js` | Different identifiers have separate windows |
| 19 | `tests/lib/schemas.test.js` | `CycleGenerateInputSchema` validates step enum |
| 20 | `tests/lib/schemas.test.js` | `OrchestrationRunInputSchema` caps maxAgents at 6 |

**Files to create:**
- `tests/setup.js`
- `tests/lib/sanitize.test.js`
- `tests/lib/llm-parse.test.js`
- `tests/lib/rate-limit.test.js`
- `tests/lib/schemas.test.js`
- `tests/api/health.test.js`

### 1.2 Add GitHub Actions CI

**Why:** Every push should lint + test automatically. No more "push and pray."

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
        env:
          ANTHROPIC_API_KEY: dummy-for-build
          FIREBASE_PROJECT_ID: dummy
          FIREBASE_CLIENT_EMAIL: dummy@dummy.iam.gserviceaccount.com
          FIREBASE_PRIVATE_KEY: dummy
```

**Add lint script to package.json:**
```json
"lint": "eslint app/ lib/ --max-warnings 0"
```

### 1.3 Add Error Tracking (Sentry)

**Why:** You have zero visibility into production errors.

**Install:**
```bash
npx @sentry/wizard@latest -i nextjs
```

This auto-creates:
- `sentry.client.config.js`
- `sentry.server.config.js`
- `sentry.edge.config.js`
- Updates `next.config.js` with `withSentryConfig()`

**Key config:**
```js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,    // 10% of requests traced (keep costs low)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,  // Capture replay on every error
});
```

**Update API routes error handling** (example pattern):
```js
catch (e) {
  Sentry.captureException(e, { tags: { route: "debate/select" } });
  console.error("Ada select error:", e);
  return NextResponse.json({ error: e.message }, { status: 500 });
}
```

**Environment variable:** Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel.

---

## Phase 2: Code Organization (Week 2-3)

The two biggest files are Re3App.js (1,913 LOC) and PageRenderer.js (2,036 LOC). PageRenderer.js **duplicates all 28 components** from Re3App.js.

### 2.1 Delete PageRenderer.js

**Why:** It's a complete duplicate of Re3App.js. 2,036 lines of dead weight.

**Steps:**
1. Search for all imports of `PageRenderer` across the codebase
2. Replace any references with the actual page components from `app/components/pages/`
3. Delete `app/PageRenderer.js`
4. Verify build passes

**Risk:** Low — the App Router page files (`app/loom/page.js`, etc.) already import from `app/components/pages/`, not from PageRenderer.

### 2.2 Delete Re3App.js

**Why:** All 28 components inside Re3App.js already have proper equivalents in `app/components/pages/`. The App Router handles routing. Re3App.js is a legacy monolith from before the migration.

**Steps:**
1. Audit every component in Re3App.js against `app/components/pages/`
2. For any component only in Re3App.js (like `CycleCard`, `TriptychCard`, `ArtifactBox`), extract to `app/components/shared/`
3. Update all imports
4. Remove `Re3App.js` from `.eslintrc.json` ignorePatterns
5. Delete `app/Re3App.js`
6. Run lint on the whole codebase

**Shared components to extract (if not already in components/):**
- `CycleCard` → `app/components/shared/CycleCard.js`
- `TriptychCard` → `app/components/shared/TriptychCard.js`
- `TriptychExpanded` → `app/components/shared/TriptychExpanded.js`
- `ArtifactBox` → `app/components/shared/ArtifactBox.js`
- `BridgeTransition` → `app/components/shared/BridgeTransition.js`
- `DebateIdentityPanel` → `app/components/shared/DebateIdentityPanel.js`
- `DebatePanel` → `app/components/shared/DebatePanel.js`
- `DebateExport` → `app/components/shared/DebateExport.js`
- `MiniDebate` → `app/components/shared/MiniDebate.js`

### 2.3 Fix Prop Drilling

**Why:** ForgePage takes 15 props. HomePage takes 13. All of these are available via Context already.

**Current state:** `providers.js` already exposes all state + actions via `useApp()` hook. The page components in `app/components/pages/` already use `useApp()`. The prop drilling only exists in the legacy Re3App.js.

**After deleting Re3App.js (2.2), this problem is solved.** The page components accessed through the App Router already use Context.

**Verify:** After 2.2, grep for any component accepting >8 destructured props. If found, refactor to use `useApp()`.

### 2.4 Add API Middleware

**Why:** Auth + rate-limit + try/catch is repeated in every API route. One function replaces 17 copies.

**Create `lib/api-handler.js`:**
```js
import { getAuthUser } from "./auth";
import { llmRateLimit } from "./rate-limit";
import { validateInput } from "./schemas";
import { NextResponse } from "next/server";

export function createHandler(schema, handler, options = {}) {
  const { allowGuest = false, rateLimit = true } = options;

  return async function POST(req) {
    try {
      const { user, error, status } = await getAuthUser(req, { allowGuest });
      if (error) return NextResponse.json({ error }, { status });

      if (rateLimit) {
        const { allowed } = llmRateLimit.check(user.uid);
        if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }

      let body = {};
      if (schema) {
        const raw = await req.json();
        const { data, error: inputError, status: inputStatus } = validateInput(raw, schema);
        if (inputError) return NextResponse.json({ error: inputError }, { status: inputStatus });
        body = data;
      }

      return await handler(body, user);
    } catch (e) {
      console.error(`API error:`, e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  };
}
```

**Before (each route):**
```js
export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    const { data: body, error: inputError, status: inputStatus } = validateInput(await req.json(), Schema);
    if (inputError) return NextResponse.json({ error: inputError }, { status: inputStatus });
    // ... business logic
  } catch (e) {
    console.error("...", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

**After:**
```js
import { createHandler } from "../../../../lib/api-handler";
import { SelectInputSchema } from "../../../../lib/schemas";

export const POST = createHandler(SelectInputSchema, async (body, user) => {
  // ... just business logic, no boilerplate
  return NextResponse.json({ selected, rationale });
});
```

**Priority:** Medium. The current approach works — this is a quality-of-life improvement. Do after 2.1 and 2.2.

---

## Phase 3: Data Reliability (Week 3-4)

### 3.1 Make Firestore the Source of Truth

**Why:** localStorage is currently primary storage. If a user clears their browser data, everything is gone.

**Current flow:** localStorage (instant) → Firestore (background sync)
**Target flow:** Firestore (source of truth) → localStorage (offline cache)

**Steps:**
1. In `providers.js`, change the hydration logic:
   - Phase 1: Load from localStorage (instant, for perceived speed)
   - Phase 2: Load from Firestore (authoritative)
   - Phase 3: If Firestore data is newer, **replace** localStorage data (not merge)
2. On every write, write to Firestore **first**, then update localStorage
3. Add a `lastModified` timestamp to all saved data for conflict detection
4. On Firestore load failure, fall back to localStorage (offline support preserved)

**Key change in `providers.js`:**
```js
// Current: localStorage wins
const mergedContent = [...localContent, ...firestoreOnlyContent];

// Target: Firestore wins
const mergedContent = firestoreContent.length > 0 ? firestoreContent : localContent;
```

### 3.2 Add Conflict Detection

**Why:** Two tabs editing the same post → last write wins → data loss.

**Simple approach:** Add `updatedAt` to every content item. On save, check if `updatedAt` has changed since last load. If so, show a toast: "This content was edited in another tab. Refresh to see changes."

**Implementation:**
- Add `updatedAt: Date.now()` to every `saveContent()` call
- Before overwriting, compare `updatedAt` with the loaded version
- If mismatch, surface a toast via `ToastProvider` instead of silently overwriting

---

## Phase 4: User Experience (Week 4-5)

### 4.1 Distributed Rate Limiting (Upstash Redis)

**Why:** The globalThis fix only works within a single process. Different API routes or cold starts still have separate state.

**Install:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Replace `lib/rate-limit.js`:**
```js
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const llmRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

// Usage: const { success } = await llmRateLimit.limit(userId);
```

**Environment variables:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel (Upstash free tier: 10K requests/day).

**API route change:** `llmRateLimit.check(uid)` → `await llmRateLimit.limit(uid)` (now async).

### 4.2 Add LLM Streaming to Debate Routes

**Why:** Users stare at a blank screen for 30+ seconds during debate rounds. The orchestration route already proves SSE works.

**Priority routes to add streaming:**
1. `/api/cycle/generate` — 4 sequential LLM calls, 45-90 seconds total
2. `/api/debate/round` — 5 parallel LLM calls, 15-30 seconds total
3. `/api/debate/loom` — 2 sequential LLM calls, 30-45 seconds total

**Pattern (already proven in `/api/orchestration/run`):**
```js
const stream = new ReadableStream({
  async start(controller) {
    const send = (payload) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
    };

    // Send progress events as each agent completes
    send({ type: "agent_start", agent: agent.name });
    const result = await callLLM(...);
    send({ type: "agent_complete", agent: agent.name, response: result });

    controller.close();
  },
});
```

**Client-side:** Use `EventSource` or `fetch` with `ReadableStream` reader.

---

## Phase 5: Landing & Positioning (Week 5-6)

### 5.1 Create a Landing Page for Non-Users

**Why:** Someone visiting re3.live for the first time has no idea what it is.

**Current:** Home page shows content that only makes sense if you already know Re3.
**Target:** Add a hero section at the top for logged-out users explaining:

1. **What it is:** "A collaborative human-AI thinking platform"
2. **What you can do:** 3 clear actions (Explore Cycles, Run Debates, Browse Agents)
3. **How it works:** Brief visual showing the 3-pillar flow
4. **Social proof:** Number of agents, debates run, cycles generated

**Implementation:** In `app/components/pages/HomePage.js`, check `user` from `useApp()`. If no user, show the landing hero above the normal content. If logged in, show the dashboard as-is.

### 5.2 Submit to Google Search Console

**Why:** Even with a perfect sitemap, Google won't index you until you explicitly submit.

**Steps (manual, not code):**
1. Go to https://search.google.com/search-console
2. Add property: `re3.live`
3. Verify ownership (the `google-site-verification` meta tag is already in `layout.js`)
4. Submit sitemap: `https://re3.live/sitemap.xml`
5. Request indexing for the homepage
6. Monitor coverage report for any crawl errors

---

## Priority Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| **P0** | 1.1 Testing framework + 20 tests | 1 day | Critical safety net |
| **P0** | 1.2 GitHub Actions CI | 2 hours | Automated guard |
| **P0** | 1.3 Sentry error tracking | 1 hour | Production visibility |
| **P1** | 2.1 Delete PageRenderer.js | 2 hours | -2,036 lines of duplication |
| **P1** | 2.2 Delete Re3App.js | 1 day | -1,913 lines, enables linting |
| **P1** | 5.2 Submit to Google Search Console | 30 min | SEO indexing begins |
| **P2** | 2.4 API middleware abstraction | 3 hours | DRY, maintainability |
| **P2** | 3.1 Firestore as source of truth | 1 day | Data reliability |
| **P2** | 4.1 Upstash rate limiting | 2 hours | Real rate limiting |
| **P3** | 3.2 Conflict detection | 4 hours | Multi-tab safety |
| **P3** | 4.2 LLM streaming | 2 days | UX improvement |
| **P3** | 5.1 Landing page for non-users | 1 day | Conversion |
| **P3** | 2.3 Fix prop drilling | Auto | Solved by 2.2 |

---

## What NOT to Do

- **Don't migrate to TypeScript now.** It's a multi-week effort with zero user-facing benefit. Do it later when the team grows.
- **Don't add E2E tests yet.** Unit tests on the critical paths (LLM parsing, validation, rate limiting) give 90% of the value at 10% of the cost.
- **Don't refactor state management.** The Context-based approach in `providers.js` is fine for this scale. Redux/Zustand would add complexity without benefit.
- **Don't add CORS middleware.** Firebase Auth tokens already protect API routes. CORS headers are a defense-in-depth nice-to-have, not urgent.
