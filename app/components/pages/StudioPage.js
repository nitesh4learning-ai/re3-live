"use client";
import { useApp } from '../../providers';
import { FadeIn } from '../shared/UIComponents';

// Curated presentation of existing work, grouped by relationship to it. Every
// non-disabled item links to an EXISTING route; disabled items are placeholders
// for work that has no dedicated route yet. Sections differ by label + layout
// only — no per-section colors (the accent is the shared GIM purple). DELIVERED
// holds two labeled sub-rows: the live systems and the bodies of work.
const STUDIO_SECTIONS = [
  { id: "delivered", label: "Delivered", subRows: [
    { caption: "Live systems", items: [
      { title: "The Arena", flagship: true, desc: "Agentic debate & orchestration — agent teams auto-assemble, architect, and ship a working result from your use case.", page: "arena" },
      { title: "Use-Case Orchestration Engine", desc: "The pipeline inside the Arena: intake → decompose → assemble → execute → synthesize, drawing on a 1,000-agent registry.", page: "arena" },
      { title: "Agent Registry", desc: "1,000 specialist personas across 15 domains — the talent pool every orchestration draws from.", page: "agent-community" },
      { title: "The Loom", desc: "Weekly synthesis cycles — recurring multi-agent runs that distill a theme into one shared insight.", page: "loom" },
    ] },
    { caption: "Bodies of work", items: [
      { title: "Context as a Frontier", badge: "CodeMesh · Paper 01", desc: "A six-stage spine to derive one trusted, living source of truth — golden context — for humans and agents.", page: "work", pageId: "context-as-a-frontier" },
      { title: "The Agentic SDLC", badge: "Whitepaper", desc: "How software delivery changes when agents do the building.", disabled: true },
      { title: "Agentic AI Mastery", badge: "12-week curriculum", desc: "From agentic architecture to production — a structured multi-week program.", page: "academy", pageId: "plus" },
    ] },
  ] },
  { id: "thought-about", label: "Thought about", subRows: [
    { caption: "Frameworks", items: [
      { title: "GIM — Governance Interaction Mesh", desc: "A mesh-based model for enterprise AI governance — nodes across five pillars.", page: "academy", pageId: "gim-framework-2" },
      { title: "The Pinwheel Framework", desc: "Four execution blades powered by business engagement for enterprise AI adoption.", disabled: true },
      { title: "CodeMesh — Comprehend · Codify · Compose", desc: "The method behind the series: comprehend the system, codify its truth, compose what's next.", disabled: true },
    ] },
  ] },
];

export default function StudioPage(){
  const { nav: onNavigate } = useApp();

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,28px)"}}>The Studio</h1><p className="mb-8" style={{fontSize:14,color:"#6B7280",maxWidth:560,lineHeight:1.6}}>Everything I&rsquo;ve delivered and thought about &mdash; the work and the frameworks, in one place.</p></FadeIn>

    {/* ===== Curated sections ===== */}
    {STUDIO_SECTIONS.map((sec, si) => (
      <section key={sec.id} id={sec.id} style={{ scrollMarginTop: 72 }} className="mb-10">
        <FadeIn delay={si * 30}>
          <h2 className="font-bold mb-3" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sec.label}</h2>
        </FadeIn>
        {sec.subRows.map((row, ri) => (
          <div key={row.caption} className={ri > 0 ? "mt-6" : ""}>
            <FadeIn delay={si * 30 + ri * 20}>
              <div className="flex items-baseline gap-2 mb-3">
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>&mdash; {row.caption}</span>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {row.items.map((it, ii) => (
                <FadeIn key={it.title} delay={si * 30 + ri * 20 + ii * 30}>
                  <div className="p-4 rounded-2xl h-full flex flex-col" style={{ background: it.disabled ? "#FBFBFC" : "#FFFFFF", border: `1px solid ${it.flagship ? "#E9D5FF" : "#E5E7EB"}`, opacity: it.disabled ? 0.7 : 1 }}>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {it.flagship && <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: 8.5, letterSpacing: "0.06em", background: "#F3E8FF", color: "#9333EA" }}>FLAGSHIP</span>}
                      {it.badge && <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: 8.5, letterSpacing: "0.04em", background: "#F3F4F6", color: "#6B7280" }}>{it.badge}</span>}
                    </div>
                    <h3 className="font-bold mb-1" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 14.5, lineHeight: 1.3 }}>{it.title}</h3>
                    <p className="flex-1 mb-3" style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{it.desc}</p>
                    {it.disabled
                      ? <span className="self-start px-3 py-1.5 rounded-lg font-semibold" style={{ fontSize: 11, background: "#F3F4F6", color: "#9CA3AF" }}>Coming soon</span>
                      : <button onClick={() => onNavigate(it.page, it.pageId)} className="self-start px-3 py-1.5 rounded-lg font-semibold transition-all hover:shadow-sm" style={{ fontSize: 11, background: "#F5F0FA", color: "#9333EA" }}>Open &rarr;</button>}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </section>
    ))}
  </div></div>
}
