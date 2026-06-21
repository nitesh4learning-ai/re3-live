"use client";
// WorkPage — renders an in-house piece of work at /work/<slug>.
// Each project in the studio registry with `internal:true` opens here.
// Real page components are registered in WORK_PAGES by slug; anything not yet
// built falls back to a Re³-branded "Coming soon" placeholder.
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { FadeIn } from '../shared/UIComponents';

// slug -> in-app page component. Append here as in-house work is built.
// (Phase 2 registers "context-as-a-frontier".)
const WORK_PAGES = {};

function ComingSoon({ project, onNavigate }) {
  return <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}>
    <FadeIn><div className="text-center px-6" style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{project?.icon || "\u{1F9ED}"}</div>
      <h1 className="font-bold mb-1" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 26 }}>{project?.title || "Coming soon"}</h1>
      {project?.subtitle && <p className="mb-2" style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>{project.subtitle}</p>}
      <p className="mb-6" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{project?.description || "This piece is being brought in-house. Check back soon."}</p>
      <span className="inline-block mb-6 px-3 py-1 rounded-full font-bold" style={{ fontSize: 10, background: "#F1F5F9", color: "#94A3B8", letterSpacing: "0.08em" }}>COMING SOON</span>
      <div><button onClick={() => onNavigate("studio")} className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{ background: "#9333EA", color: "white" }}>{"←"} Back to My Studio</button></div>
    </div></FadeIn>
  </div>;
}

export default function WorkPage() {
  const { slug } = useParams() || {};
  const { projects, nav: onNavigate } = useApp();
  const project = projects.find(p => p.slug === slug);
  const PageComponent = WORK_PAGES[slug];
  if (PageComponent) return <PageComponent />;
  return <ComingSoon project={project} onNavigate={onNavigate} />;
}
