# CLAUDE.md — Re³ Platform

Re³ (Rethink · Rediscover · Reinvent) is a multi-agent AI **debate + orchestration** platform with a gated **Academy** course section. AI agents argue, critique, and refine positions under orchestrators; humans drop in topics and get synthesized insight. Deployed at https://re3.live (Vercel).

> 🔎 **Query the codebase graph BEFORE reading/grepping many files.** For any "how does X connect / where is Y used / what calls Z / what breaks if I change W" question, run `/graphify query|path|explain` (or `~/.graphify-venv/bin/graphify …`) first. It's a local traversal — **free, no API tokens** — and avoids burning tokens scanning the tree. The graph auto-rebuilds on every commit, so it's current. Details in [Codebase knowledge graph (Graphify)](#codebase-knowledge-graph-graphify).

## Stack

- **Next.js 14.2.3** (App Router) + **React 18** — JavaScript, not TypeScript (a tsconfig + `lib/types.ts` exist for tooling/types only).
- **Package manager: npm** (`package-lock.json`).
- **Tailwind CSS 3.4** compiled via PostCSS (not a CDN) + inline styles.
- **Tiptap 3.19** rich-text editor; **@xyflow/react** (React Flow) for the orchestration canvas; **framer-motion**.
- **next-mdx-remote** (RSC `compileMDX`) renders Academy courses.
- **Firebase** Firestore + Auth (Google OAuth); **firebase-admin** server-side.
- **LLMs:** Anthropic (primary), OpenAI, Gemini, Groq/LLaMA — via raw `fetch` in `lib/llm-router.js`.
- **zod** validation, **@upstash/ratelimit + redis** rate limiting, **Sentry** monitoring.
- **Tests:** Vitest + Testing Library + jsdom (`tests/`). **ESLint** configured.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (validates required env in prod)
npm start            # serve production build
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch
npm run lint         # eslint app/ lib/ --max-warnings 0  (zero-warning gate)
```

CI (`.github/workflows/ci.yml`) runs lint → test → build on push/PR to `main` with dummy env keys.

## Layout

- `app/page.js`, `app/<route>/page.js` — thin route entries that mostly `dynamic()`-import a real component from `app/components/pages/`. (There is no monolithic `Re3App.js` — that has been split up.)
- `app/components/pages/` — page-level components (Home, Debates, Forge, Loom, Arena, Playground, Admin, …). **Home is a personal-brand presentation:** `HomePage.js` lazy-loads `LandingPage.js` — a hero + a type-tagged **work gallery** (`id="work"`) driven by `WORK_ITEMS` (`app/constants/work.js`), with filter chips (Apps / Frameworks / Whitepapers / Articles) and live counts. Live tiles link to existing routes; `soon` tiles are disabled placeholders; **Article** tiles are derived at render time from the user's published articles (passed down from `HomePage`). The old debate-product marketing is gone from Home.
- `app/components/orchestration/`, `app/components/playground/`, `app/components/shared/` — feature UIs.
- `app/api/<feature>/route.js` — serverless routes: `debate/*`, `orchestration/*`, `agents/*`, `cycle/*`, `academy/*`, `access/*`, `admin/*`, `health`, `visits`, `og`.
- `app/academy/` — Academy hub, course shells, MDX components/widgets, hooks, `lib/course-loader.js`; `app/academy/plus/` — gated multi-week programs.
- `app/work/[slug]/` — **in-house work pages.** My Studio (`StudioPage.js`) is now a **curated presentation** — read-only `STUDIO_SECTIONS` cards (Delivered: live systems + bodies of work; Thought about: frameworks) linking to existing routes. (The old in-page **Workspace** — article authoring + the editable project-tile grid/admin form — was removed as redundant with these cards and the Home gallery.) Project `internal`/`slug`/`type`/`status` fields still come from `app/constants/seed-data.js`: `internal:true` tiles open in-app at `/work/<slug>`; external tiles use `link`. `WorkPage.js` resolves a slug against the `WORK_PAGES` registry (e.g. `context-as-a-frontier` → `ContextAsAFrontier.js`, a 1:1 port that keeps its own navy/teal/amber identity), falling back to a Re³-branded "Coming soon" placeholder. **Article authoring** now lives at `/write` (`WritePage`) + editing from `ArticlePage` — not the Studio.
  - `ContextAsAFrontier.js` also hosts the interactive **"Apply this framework" engine** (in the page's extension slot): a user describes a system → it runs a `context-comprehension` orchestration via the existing `/api/orchestration/run` SSE endpoint → renders the six stages live (with the persona handling each) + a roadmap. Completed runs persist via `lib/orchestration/context-store.js` to a **moderated library** (see Firestore rules). Sign-in required; CAF visual identity, not the Arena UI.
- `app/constants/` — `agents.js` (orchestrators + 25 debaters), `courses.js` (catalog), `ui.js` (`ADMIN_EMAIL`, `isAdmin`), `seed-data.js` (default projects/content), `work.js` (`WORK_ITEMS` — the curated Home work gallery; descriptions are hand-synced with the Studio's curated tiles). Barrel re-exports in `index.js`.
- `lib/` — `llm-router.js`, `ai-gateway.js`, `auth.js`, `api-handler.js`, `rate-limit.js`, `schemas.js`, `sanitize.js`, `agent-registry.js`, `firestore.js`, `firebase{,-admin}.js`, and `lib/orchestration/*` (the engine).
- `content/courses/<id>/` and `content/programs/<id>/` — course/program content (git-tracked, read at build time).

## The two multi-agent systems

**1. Debate → synthesis cycle** (`app/api/debate/*`, Debates/Forge/Loom UIs). Uses the **3 orchestrators** and **25 debater agents** defined in `app/constants/agents.js`:

- **Orchestrators** (`ORCHESTRATORS`): **Hypatia** (`agent_sage`, First Lens — deconstructs assumptions), **Socratia** (`agent_atlas`, Second Lens — finds cross-domain patterns), **Ada** (`agent_forge`, Third Lens — turns principles into buildable architecture). Internal IDs keep the old `sage/atlas/forge` names; the user-facing names are Hypatia/Socratia/Ada.
- **25 debaters** (`INIT_AGENTS`) across 6 categories: Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, Industry.
- Flow: Forge/Ada selects a panel → debate rounds (`debate/round`, parallel agents, SSE streaming) → Atlas/Socratia moderates → Sage/Hypatia weaves "The Loom".

**2. Orchestration engine** (`lib/orchestration/*`, `app/api/orchestration/*`, Arena/Playground UIs). A separate pipeline: intake → decompose → assemble team → execute layers → reflect → cross-pollinate → synthesize, with a blackboard ("common consciousness"), A2A handshakes, MCP tools, and an event bus streamed over SSE. It draws agents from the **1,000-agent registry** in `public/agents-registry.json` (loaded by `lib/agent-registry.js`) — this is distinct from the 25 debaters. Use case input passes guardrails in `intake-analyzer.js` before running.

- **Use-case types** are essentially free-form (`type` is a `z.string`, no enum). A type "exists" only by appearing in `TASK_PROFILES` (`lib/agent-scoring.js`, the per-type capability weights `selectTeam` uses) and optionally `TYPE_KEYWORDS`/the classifier prompt (`intake-analyzer.js`). Decomposition is **LLM-driven** (`task-decomposer.js`, Gemini, 3–6 variable tasks); synthesis is hardcoded to the **Arena deliverable** (Mermaid sequence diagram + ERD + React prototype, in `engine.js`). `maxAgents` is a per-run option (default 5, clamped to 6).
- **`context-comprehension`** is the one bespoke type, powering the "Apply this framework" engine on the Context as a Frontier page (`lib/orchestration/context-spine.js`). It is **deterministic** — two small type-gated branches in `engine.js`/`handshake.js`, everything else reused as-is: it always expands into the fixed **six-stage spine** (LOCATE → EXTRACT → RECONSTRUCT → VALIDATE → DECIDE → SUSTAIN, one persona per stage, `maxAgents` pinned to 6) instead of the LLM decomposer, and its synthesis emits a **sequenced roadmap** (`deliverable.roadmap`) instead of Mermaid/prototype. Each stage carries a canonical per-stage tooling-category scaffold the agent tailors to the user's stack. Reuses the same `runOrchestration`/registry/scoring/gateway — do not fork a parallel agent path.

## Academy & Academy Plus

- **Courses:** each lives in `content/courses/<id>/` with a `meta.json` plus MDX files under two depth folders — `visionary/` and `deep/` (files like `01-intro.mdx`). `course-loader.js` reads them server-side. `app/constants/courses.js` is the broader catalog (tiers 1–3); not every catalog entry has authored MDX yet.
- **MDX components:** `app/academy/components/mdx-components.js` maps tags (CodeBlock, Quiz, AnalogyBox, dozens of interactive widgets) for `<MDXRemote />`.
- **Academy Plus** (`app/academy/plus/`): admin-only multi-week programs from `content/programs/<id>/program.json` (e.g. the 12-week "Agentic AI Mastery" roadmap). Loaded by `plus/lib/program-loader.js`.

### ⚠️ base64-encoded CodeBlock — deliberate, do not "simplify"

`app/academy/components/CodeBlock.js` accepts a **`b64` prop** that it decodes with `atob()`. Course MDX passes code as base64 (`<CodeBlock b64="..."/>`, ~247 files) **on purpose**: MDX v3 parses raw `{`/`}` in code as JSX expressions and breaks the build. Base64 sidesteps that. Do **not** "clean this up" by inlining the raw code into MDX — it will reintroduce curly-brace parse failures. New code samples with braces should be base64-encoded the same way.

## Access gating & auth (do not loosen)

Admin identity has a deliberate **server/client split** — there is no single hardcoded admin email anymore:

- **Server gate (the real one):** `lib/admins.js` — `isAdminEmail(email)` backed by `ADMIN_EMAILS` (from the **server-only** `ADMIN_EMAILS` env var, comma-separated; falls back to the built-in defaults `nitesh4learning@gmail.com` + `einsteinrethink@gmail.com`). `ADMIN_EMAILS` is **not** `NEXT_PUBLIC`, so it is never shipped to the browser. The two admin/access API routes import `isAdminEmail` from here — that is the enforcement boundary.
- **Client check (UX only):** `app/constants/ui.js` exports `isAdminEmail`/`isAdmin` from a **separate** list read from `NEXT_PUBLIC_ADMIN_EMAILS`. This only shows/hides admin affordances; it is **not** a security boundary. There are no admin emails hardcoded on the client path. Academy and orchestration UIs consume this via the constants barrels.
- **Server auth:** `lib/auth.js` `getAuthUser(req, {allowGuest})` verifies the `Authorization: Bearer <Firebase ID token>` via firebase-admin. Most POST routes go through `lib/api-handler.js` `createHandler(schema, handler, {allowGuest, rateLimit})`, which chains auth → rate-limit → zod validation. The admin/access routes (`api/admin/requests`, `api/access/status`) hand-roll auth and check `isAdminEmail(user.email)`, returning 403 otherwise.
- **Feature gating:** users request features (`arena`, `loom_extras`) via `api/access/request`; status from `api/access/status`; admin approves in `api/admin/requests`. Backed by the Firestore `access_requests` collection.
- **Admin-only vs public surfaces:** the **Debate Lab** (page `forge` → `app/components/pages/ForgePage.js`, nav label "Debate") is **admin-only** — removed from public nav/home/footer, redirects non-admins home via `isAdmin(user)`, and is reachable by admins only through the nav "More" dropdown. The **Arena use-case library** is the opposite — deliberately **public**: completed runs persist to the public-read `orchestration_runs` Firestore collection (`lib/orchestration/run-store.js`), so anyone can browse them.
- **Nav visibility (UX only, not a gate):** `AppShell.js` shows signed-out visitors a **minimal public nav** (logo + Sign in); the Studio link plus the More/back-office tools and the mobile bottom bar appear only after sign-in. This only hides links — **routes are not blocked**, so direct URLs still work and real enforcement (server auth + Firestore rules) is unchanged. Don't mistake this for an access boundary.
- **Firestore rules** (`firestore.rules`) are the last line of defense: public read on content, authed write, admin-only delete (plus `orchestration_runs` — public read so the Arena library is shareable). **`context_runs`** (the Context "Apply this framework" library) is the **moderated** exception: owner-read / public-read-only-if-`approved==true` / admin approve (update) + delete; create is owner-only and forced `approved:false`, so new runs are **private until an admin publishes** them. `isAdmin()` there matches `einsteinrethink@gmail.com`, `nitesh4learning@gmail.com`, or the custom claim `admin:true`. Rules **cannot read env**, so this admin list is maintained by hand and must be kept in sync with `lib/admins.js`. Rules only take effect after `firebase deploy --only firestore:rules`. Never widen rules to close a client bug.

## Secrets & env

All keys come from `process.env` — **never hardcode or commit them**. No secrets were found in source; keep it that way.

- LLM: `ANTHROPIC_API_KEY` (required), `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `GROQ_API_KEY` (optional).
- Firebase admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- Infra: `UPSTASH_REDIS_REST_URL`/`_TOKEN` (rate limit; in-memory fallback if unset), `SENTRY_AUTH_TOKEN`.
- Admin: `ADMIN_EMAILS` (server-only, comma-separated; optional — defaults to both admins) and `NEXT_PUBLIC_ADMIN_EMAILS` (client UX, comma-separated). See the ⚠️ note below.
- Client Firebase: `next.config.js` maps `REACT_APP_FIREBASE_*` → `NEXT_PUBLIC_FIREBASE_*` at build (quirk — set the `REACT_APP_*` names). `next.config.js` warns on missing required prod keys; `.env*.local` is gitignored; CI/Vercel inject real values.

> ⚠️ **`NEXT_PUBLIC_ADMIN_EMAILS` must be set in Vercel** to `nitesh4learning@gmail.com,einsteinrethink@gmail.com` — otherwise the **admin UI will not appear in production** (the admin nav/panels stay hidden), even though server-side and Firestore admin powers still work. This is the deliberate cost of keeping admin emails out of the client bundle: the client has no hardcoded fallback. Set this env var after deploying. (Server enforcement uses the separate `ADMIN_EMAILS`, whose defaults are populated, so it never depends on this.)

## LLM router

`callLLM(model, systemPrompt, userMessage, opts)` in `lib/llm-router.js` routes by `model` (`anthropic`/`openai`/`gemini`/`llama`) and falls back to Anthropic on failure. `opts.tier` (`light`/`standard`/`heavy`) maps to Anthropic Haiku/Sonnet/Sonnet. `lib/ai-gateway.js` wraps it with cost estimation, complexity-based model routing, and budget tracking. LLM JSON is extracted with a regex (`lib/llm-parse.js`); user text is run through `lib/sanitize.js` before prompts. When touching model IDs, prefer the latest Claude models.

## Deploy & infra

- **Hosting:** Vercel — pushing to `main` auto-builds and deploys. The Vercel project is `re3-live`, owned by the **nitesh4learning** account.
- **GitHub:** the repo is `nitesh4learning-ai/re3-live`. Pushing requires the **nitesh4learning-ai** GitHub account; the `einsteinrethink-sudo` account has pull-only access (commits are authored as einsteinrethink-sudo but can't push). Use `gh` for auth.
- **Firestore rules deploy separately — Vercel does NOT touch them.** After editing `firestore.rules`:
  `firebase deploy --only firestore:rules --project re3-live --account nitesh4learning@gmail.com`
  (Firebase project ID is `re3-live`; rules can't read env, so their admin list is hand-maintained.)
- **After any deploy that changes admin behavior:** confirm `NEXT_PUBLIC_ADMIN_EMAILS` is set in Vercel (see the ⚠️ in Secrets & env) — without it, admin UI is hidden in prod even though server/Firestore admin works.

## Codebase knowledge graph (Graphify)

Graphify **is set up** in this repo. When you need to understand how parts connect — across the two agent systems, the route→handler→auth chain, or Academy loading — **query the graph instead of grepping many files**. (A pilot confirmed the graph cleanly separates the 25-debater system from the 1,000-agent registry and captures the `route → createHandler → getAuthUser` chain — so it's reliable for these questions.)

- `/graphify query "<question>"` — relevant nodes/edges for a question.
- `/graphify path <A> <B>` — trace how two parts connect.
- `/graphify explain <node>` — explain a component and its neighbors.

These queries are **local graph traversals — free, no API key**. The `/graphify` slash command appears after a Claude Code reload; until then run the CLI directly: `~/.graphify-venv/bin/graphify query "…"` (installed in a Python 3.12 venv).

Two freshness layers:
- **Structural** (files, functions, imports, calls) — auto-rebuilds on every commit via installed git hooks (`graphify update`, **free, no LLM**). Always current.
- **Semantic** (inferred edges + community names) — **manual and costs tokens**: needs `ANTHROPIC_API_KEY` in `.env.local`, then `graphify extract . && graphify label .` (~$1). Re-run after big refactors.

Outputs live in `graphify-out/` (`graph.json` queryable, `GRAPH_REPORT.md` human-readable, `graph.html` interactive) — **gitignored** (regenerable artifact, ~3.6 MB). `GRAPH_REPORT.md`'s "Graph Freshness" line shows the commit it was built from.

## Working style

- **Graph-first for code research** — before grepping/reading many files to understand structure, query the Graphify graph (see the 🔎 note at the top). It's free and avoids burning tokens; fall back to reading files when the graph is thin or you need exact source.
- **Keep this file current — check on EVERY commit.** Before each commit, ask: did this change alter architecture, the agent systems, auth/admin, access/visibility (who can see/do what), deploy steps, env vars, or commands? If yes, update `CLAUDE.md` in the **same commit**. (The Graphify graph auto-tracks code *structure* per commit; this prose does not — it's curated, so update it by hand when the mental model changes.) Pure refactors, styling, or copy tweaks that don't change the mental model don't need an update.
- **Plan mode for multi-file changes** — propose the plan and wait for approval before editing.
- **Small, scoped commits**; don't bundle unrelated changes. Commit only when asked.
- **If you've corrected the same issue twice, stop and resync** with the user rather than trying a third variation.
- No secrets in code or commits; don't loosen access gating or Firestore rules to paper over a client bug.
