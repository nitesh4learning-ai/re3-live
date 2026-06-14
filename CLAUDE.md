# CLAUDE.md — Re³ Platform

Re³ (Rethink · Rediscover · Reinvent) is a multi-agent AI **debate + orchestration** platform with a gated **Academy** course section. AI agents argue, critique, and refine positions under orchestrators; humans drop in topics and get synthesized insight. Deployed at https://re3.live (Vercel).

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
- `app/components/pages/` — page-level components (Home, Debates, Forge, Loom, Arena, Playground, Admin, …).
- `app/components/orchestration/`, `app/components/playground/`, `app/components/shared/` — feature UIs.
- `app/api/<feature>/route.js` — serverless routes: `debate/*`, `orchestration/*`, `agents/*`, `cycle/*`, `academy/*`, `access/*`, `admin/*`, `health`, `visits`, `og`.
- `app/academy/` — Academy hub, course shells, MDX components/widgets, hooks, `lib/course-loader.js`; `app/academy/plus/` — gated multi-week programs.
- `app/constants/` — `agents.js` (orchestrators + 25 debaters), `courses.js` (catalog), `ui.js` (`ADMIN_EMAIL`, `isAdmin`).
- `lib/` — `llm-router.js`, `ai-gateway.js`, `auth.js`, `api-handler.js`, `rate-limit.js`, `schemas.js`, `sanitize.js`, `agent-registry.js`, `firestore.js`, `firebase{,-admin}.js`, and `lib/orchestration/*` (the engine).
- `content/courses/<id>/` and `content/programs/<id>/` — course/program content (git-tracked, read at build time).

## The two multi-agent systems

**1. Debate → synthesis cycle** (`app/api/debate/*`, Debates/Forge/Loom UIs). Uses the **3 orchestrators** and **25 debater agents** defined in `app/constants/agents.js`:

- **Orchestrators** (`ORCHESTRATORS`): **Hypatia** (`agent_sage`, First Lens — deconstructs assumptions), **Socratia** (`agent_atlas`, Second Lens — finds cross-domain patterns), **Ada** (`agent_forge`, Third Lens — turns principles into buildable architecture). Internal IDs keep the old `sage/atlas/forge` names; the user-facing names are Hypatia/Socratia/Ada.
- **25 debaters** (`INIT_AGENTS`) across 6 categories: Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, Industry.
- Flow: Forge/Ada selects a panel → debate rounds (`debate/round`, parallel agents, SSE streaming) → Atlas/Socratia moderates → Sage/Hypatia weaves "The Loom".

**2. Orchestration engine** (`lib/orchestration/*`, `app/api/orchestration/*`, Arena/Playground UIs). A separate pipeline: intake → decompose → assemble team → execute layers → reflect → cross-pollinate → synthesize, with a blackboard ("common consciousness"), A2A handshakes, MCP tools, and an event bus streamed over SSE. It draws agents from the **1,000-agent registry** in `public/agents-registry.json` (loaded by `lib/agent-registry.js`) — this is distinct from the 25 debaters. Use case input passes guardrails in `intake-analyzer.js` before running.

## Academy & Academy Plus

- **Courses:** each lives in `content/courses/<id>/` with a `meta.json` plus MDX files under two depth folders — `visionary/` and `deep/` (files like `01-intro.mdx`). `course-loader.js` reads them server-side. `app/constants/courses.js` is the broader catalog (tiers 1–3); not every catalog entry has authored MDX yet.
- **MDX components:** `app/academy/components/mdx-components.js` maps tags (CodeBlock, Quiz, AnalogyBox, dozens of interactive widgets) for `<MDXRemote />`.
- **Academy Plus** (`app/academy/plus/`): admin-only multi-week programs from `content/programs/<id>/program.json` (e.g. the 12-week "Agentic AI Mastery" roadmap). Loaded by `plus/lib/program-loader.js`.

### ⚠️ base64-encoded CodeBlock — deliberate, do not "simplify"

`app/academy/components/CodeBlock.js` accepts a **`b64` prop** that it decodes with `atob()`. Course MDX passes code as base64 (`<CodeBlock b64="..."/>`, ~247 files) **on purpose**: MDX v3 parses raw `{`/`}` in code as JSX expressions and breaks the build. Base64 sidesteps that. Do **not** "clean this up" by inlining the raw code into MDX — it will reintroduce curly-brace parse failures. New code samples with braces should be base64-encoded the same way.

## Access gating & auth (do not loosen)

- **Client auth:** Firebase Auth + Google OAuth. Admin is `ADMIN_EMAIL` (`nitesh4learning@gmail.com`) via `isAdmin(user)` in `app/constants/ui.js`; client pages redirect non-admins, but that is UX only — never the real gate.
- **Server auth:** `lib/auth.js` `getAuthUser(req, {allowGuest})` verifies the `Authorization: Bearer <Firebase ID token>` via firebase-admin. Most POST routes go through `lib/api-handler.js` `createHandler(schema, handler, {allowGuest, rateLimit})`, which chains auth → rate-limit → zod validation. Admin/access routes hand-roll the same `user.email === ADMIN_EMAIL` check and return 403 otherwise.
- **Feature gating:** users request features (`arena`, `loom_extras`) via `api/access/request`; status from `api/access/status`; admin approves in `api/admin/requests`. Backed by the Firestore `access_requests` collection.
- **Firestore rules** (`firestore.rules`) are the last line of defense: public read on content, authed write, admin-only delete. Keep server check + rules in sync; never widen rules to close a client bug.
- **Known inconsistency:** `firestore.rules` `isAdmin()` keys off `einsteinrethink@gmail.com` (or a custom claim `admin:true`), while app code uses `nitesh4learning@gmail.com`. Verify which email you actually need before relying on either; don't "fix" one to match the other without confirming intent.

## Secrets & env

All keys come from `process.env` — **never hardcode or commit them**. No secrets were found in source; keep it that way.

- LLM: `ANTHROPIC_API_KEY` (required), `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `GROQ_API_KEY` (optional).
- Firebase admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- Infra: `UPSTASH_REDIS_REST_URL`/`_TOKEN` (rate limit; in-memory fallback if unset), `SENTRY_AUTH_TOKEN`.
- Client Firebase: `next.config.js` maps `REACT_APP_FIREBASE_*` → `NEXT_PUBLIC_FIREBASE_*` at build (quirk — set the `REACT_APP_*` names). `next.config.js` warns on missing required prod keys; `.env*.local` is gitignored; CI/Vercel inject real values.

## LLM router

`callLLM(model, systemPrompt, userMessage, opts)` in `lib/llm-router.js` routes by `model` (`anthropic`/`openai`/`gemini`/`llama`) and falls back to Anthropic on failure. `opts.tier` (`light`/`standard`/`heavy`) maps to Anthropic Haiku/Sonnet/Sonnet. `lib/ai-gateway.js` wraps it with cost estimation, complexity-based model routing, and budget tracking. LLM JSON is extracted with a regex (`lib/llm-parse.js`); user text is run through `lib/sanitize.js` before prompts. When touching model IDs, prefer the latest Claude models.

## Codebase knowledge graph (Graphify)

When you need to understand how parts of this codebase connect — especially across the two agent systems, the API/handler/auth chain, or Academy loading — **query the graph instead of grepping many files**:

- `/graphify query "<question>"` — find relevant nodes/edges for a question.
- `/graphify path <A> <B>` — trace how two parts connect.
- `/graphify explain <node>` — explain a component and why it's built that way.

Outputs live in `graphify-out/` (`graph.json` is the queryable graph, `GRAPH_REPORT.md` the human-readable report). The graph regenerates on merge to `main`, so treat it as current. *(Graphify is not set up in this repo yet — use these commands once it is.)*

## Working style

- **Plan mode for multi-file changes** — propose the plan and wait for approval before editing.
- **Small, scoped commits**; don't bundle unrelated changes. Commit only when asked.
- **If you've corrected the same issue twice, stop and resync** with the user rather than trying a third variation.
- No secrets in code or commits; don't loosen access gating or Firestore rules to paper over a client bug.
