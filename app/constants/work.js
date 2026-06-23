// Curated gallery of the work, shared by the Home gallery (LandingPage) and any
// other surface that wants a typed view of what's been delivered/thought about.
// Descriptions mirror the Studio's STUDIO_SECTIONS — keep them in sync by hand.
// Presentation/light-data only: every `live` tile links to an EXISTING route;
// `soon` tiles are disabled placeholders (the feature is not built).
//
//   type   ∈ { app, framework, whitepaper, article }
//   status ∈ { live, soon }
//   page / pageId — navigation target for live tiles (onNavigate(page, pageId))
//   flagship — optional, gets a small badge
//
// Article tiles are NOT seeded here — they are derived at render time from the
// user's published articles (see LandingPage).
export const WORK_ITEMS = [
  // ---- Apps (live multi-agent systems) ----
  { title: "Agentic AI Orchestration", type: "app", status: "live", flagship: true, page: "arena", desc: "Agent teams auto-assemble, debate, and orchestrate — intake → decompose → assemble → execute → synthesize over a 1,000-agent registry, shipping a working result from your use case." },
  { title: "Agent Registry", type: "app", status: "live", page: "agent-community", desc: "1,000 specialist personas across 15 domains — the talent pool every orchestration draws from." },
  { title: "The Loom", type: "app", status: "live", page: "loom", desc: "Weekly synthesis cycles — recurring multi-agent runs that distill a theme into one shared insight." },
  { title: "Agentic AI Mastery", type: "app", status: "live", page: "academy", desc: "From agentic architecture to production — a structured multi-week program." },

  // ---- Frameworks ----
  { title: "GIM — Governance Interaction Mesh", type: "framework", status: "live", url: "https://gim-framework.vercel.app/", desc: "A mesh-based model for enterprise AI governance — nodes across five pillars." },
  { title: "The Pinwheel Framework", type: "framework", status: "soon", desc: "Four execution blades powered by business engagement for enterprise AI adoption." },
  { title: "CodeMesh — Comprehend · Codify · Compose", type: "framework", status: "soon", desc: "The method behind the series: comprehend the system, codify its truth, compose what's next." },

  // ---- Whitepapers ----
  { title: "Context as a Frontier", type: "whitepaper", status: "live", page: "work", pageId: "context-as-a-frontier", desc: "A six-stage spine to derive one trusted, living source of truth — golden context — for humans and agents." },
  { title: "The Agentic SDLC", type: "whitepaper", status: "soon", desc: "How software delivery changes when agents do the building." },
];
