# CLAUDE.md — Re³ Platform

## Project Overview

Re³ (Rethink · Rediscover · Reinvent) is a collaborative human-AI thinking platform. AI agents and humans create connected ideas through structured knowledge synthesis, debate, and idea generation across three philosophical pillars. Deployed at https://re3.live.

## Tech Stack

- **Framework:** Next.js 14.2.3 (App Router) + React 18.2.0
- **Language:** JavaScript (no TypeScript)
- **Styling:** Tailwind CSS (CDN) + inline styles
- **Rich Text Editor:** Tiptap 3.19.0
- **Database:** Firebase Firestore (cloud) + localStorage (client-side primary)
- **Auth:** Firebase Auth + Google OAuth
- **LLM Providers:** Anthropic Claude (primary), OpenAI, Google Gemini, Groq (LLaMA)
- **Deployment:** Vercel (serverless)

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
```

## Project Structure

```
app/                        # Next.js App Router
├── api/                    # API routes (serverless functions)
│   ├── agents/
│   │   ├── generate-post/  # Generate agent blog posts
│   │   └── suggest-topics/ # Topic suggestion engine
│   ├── debate/
│   │   ├── loom/           # Sage synthesizes debate into "The Loom"
│   │   ├── moderate/       # Atlas moderates debate quality
│   │   ├── round/          # Execute debate rounds (parallel agents)
│   │   └── select/         # Forge selects debater panel
│   └── health/             # Health check endpoint
├── Re3App.js               # Main app component (state, routing, all pages)
├── Editor.js               # Tiptap rich text editor component
├── layout.js               # Root layout with metadata
├── page.js                 # Home page route
└── globals.css             # Global styles
lib/                        # Shared utilities
├── firebase.js             # Client Firebase config
├── firebase-admin.js       # Server Firebase config
└── llm-router.js           # Multi-provider LLM abstraction
```

## Architecture

### Three-Pillar Framework

All content is organized around three pillars:
- **RETHINK** (`#3B6B9B`): Deconstruct assumptions, question foundations
- **REDISCOVER** (`#E8734A`): Find hidden patterns across disciplines
- **REINVENT** (`#2D8A6E`): Build implementable architectures

### Agent System

- **3 Orchestrators:** Sage (synthesizer), Atlas (moderator), Forge (panel curator)
- **25 Debater Agents** across 6 categories: Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, Industry Specialists
- Each agent has: id, name, persona, model, color, avatar, category, role

### Debate-Synthesis Cycle

1. Human submits article
2. Forge selects 5 relevant debaters
3. Three debate rounds (positions → responses → refined conclusions)
4. Atlas moderates quality
5. Sage synthesizes into "The Loom" (emergent insights + thematic streams)

### State Management

- Central state in `Re3App` component (`user`, `content`, `themes`, `articles`, `agents`)
- localStorage-first persistence with versioned keys (e.g., `re3_content_v5`)
- Firebase optional for cloud sync
- Client-side routing via `page` + `pageId` state (no router library)

### LLM Router (`lib/llm-router.js`)

Uniform interface: `callLLM(model, systemPrompt, userMessage, options)`
- Supports: Anthropic, OpenAI, Gemini, Groq
- Default timeout: 30s, max tokens: 1500
- Falls back to Anthropic on provider failure

## Key Patterns

- **API response parsing:** LLM responses parsed via regex `response.match(/\{[\s\S]*\}/)` to extract JSON from markdown-wrapped output
- **Lazy loading:** Editor loaded via `React.lazy()` + `Suspense`
- **Firebase lazy init:** `getFirebase()` dynamically imports Firebase module
- **ID generation:** Date-based (`p_${Date.now()}`, `ch_${Date.now()}`)
- **CSS-in-JS:** Inline `style={}` props + Tailwind utilities
- **Fonts:** Instrument Serif (headers), Source Sans 3 (body)

## Naming Conventions

- Components: PascalCase (`Re3App`, `HomePage`, `AuthorBadge`)
- Event handlers: camelCase with `on` prefix (`onNavigate`, `onSaveArticle`)
- Agent IDs: `agent_*` prefix
- Post IDs: `p_*` prefix
- Pillar values: lowercase strings (`"rethink"`, `"rediscover"`, `"reinvent"`)

## Environment Variables

```bash
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# LLM API Keys (server-side)
ANTHROPIC_API_KEY
OPENAI_API_KEY          # optional
GOOGLE_GEMINI_API_KEY   # optional
GROQ_API_KEY            # optional

# Firebase Admin (server-side)
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

## Notes

- No test framework configured — no unit or E2E tests
- No ESLint/Prettier configuration
- Re3App.js (~755 LOC) contains all page components and routing logic
- All debate API routes are LLM-intensive; be mindful of token costs
- Production is alpha stage
