"use client";
// Atlas — re3.live's own codebase framed as a knowledge graph: a stylized
// annotated overview + a button to the full live interactive graph served at
// /atlas-graph.html. Reuses the GIM design tokens + FadeIn, like LandingPage.
import { FadeIn } from '../shared/UIComponents';

const GIM = {
  primary:'#9333EA', fontMain:"'Inter',system-ui,sans-serif",
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', cardBg:'#FFFFFF',
};

const CAPTION_CARDS = [
  { title: "The system maps itself", desc: "No manual upkeep — the graph rebuilds on every merge to main." },
  { title: "Comprehension-first, live", desc: "The thesis from Context as a Frontier, running on this codebase." },
  { title: "Proof, not slideware", desc: "What I argue for in modernization, operationalized in public." },
];

export default function AtlasPage({ onNavigate }) {
  return <div className="min-h-screen" style={{ background: '#FAFAFA', paddingTop: 56 }}>

    {/* a) Header band */}
    <section className="max-w-5xl mx-auto px-6" style={{ paddingTop: 64, paddingBottom: 24 }}>
      <FadeIn>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#F3E8FF', border: '1px solid #E9D5FF' }}>
          <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 11, letterSpacing: '0.06em', color: GIM.primary }}>Under the hood</span>
        </div>
      </FadeIn>
      <FadeIn delay={60}>
        <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(34px,5vw,52px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: GIM.headingText, marginBottom: 16 }}>
          Re3.Live Mapped !
        </h1>
      </FadeIn>
      <FadeIn delay={100}>
        <p className="max-w-2xl" style={{ fontFamily: GIM.fontMain, fontSize: 16, color: GIM.bodyText, lineHeight: 1.7, marginBottom: 16 }}>
          The whole system as one knowledge graph &mdash; every module, every dependency, and the agent code itself. Regenerated automatically on every merge to main.
        </p>
      </FadeIn>
      <FadeIn delay={130}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#EBF5F1', border: '1px solid #C6E8DA' }}>
          <span className="font-semibold" style={{ fontFamily: GIM.fontMain, fontSize: 11.5, color: '#2D8A6E' }}>&#8635; Auto-regenerated on every release &middot; Graphify</span>
        </div>
      </FadeIn>
    </section>

    {/* b) Graph hero */}
    <section className="max-w-5xl mx-auto px-6" style={{ marginTop: 24 }}>
      <FadeIn>
        <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${GIM.border}` }}>
          <svg viewBox="0 0 640 300" style={{ width:'100%', height:'auto', display:'block' }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="re3.live codebase as a knowledge graph">
            <rect x="0.5" y="0.5" width="639" height="299" rx="14" fill="#14132A" stroke="rgba(255,255,255,0.08)"/>
            <g stroke="#8E92B0" strokeOpacity="0.22" strokeWidth="0.6">
              <line x1="310" y1="150" x2="290" y2="135"/><line x1="310" y1="150" x2="332" y2="140"/>
              <line x1="310" y1="150" x2="296" y2="168"/><line x1="310" y1="150" x2="330" y2="168"/>
              <line x1="310" y1="150" x2="310" y2="126"/><line x1="310" y1="150" x2="346" y2="154"/>
              <line x1="310" y1="150" x2="161" y2="211"/><line x1="310" y1="150" x2="285" y2="120"/>
              <line x1="310" y1="150" x2="412" y2="146"/><line x1="310" y1="150" x2="462" y2="236"/>
              <line x1="285" y1="120" x2="270" y2="105"/><line x1="270" y1="105" x2="255" y2="92"/>
              <line x1="255" y1="92" x2="242" y2="78"/><line x1="242" y1="78" x2="230" y2="66"/>
              <line x1="230" y1="66" x2="218" y2="57"/><line x1="412" y1="146" x2="428" y2="153"/>
            </g>
            <g>
              <circle cx="112" cy="202" r="3" fill="#5DCAA5"/><circle cx="126" cy="212" r="3" fill="#85B7EB"/><circle cx="140" cy="206" r="3" fill="#5DCAA5"/><circle cx="133" cy="224" r="3" fill="#85B7EB"/><circle cx="119" cy="230" r="3" fill="#5DCAA5"/><circle cx="151" cy="219" r="3" fill="#85B7EB"/><circle cx="123" cy="196" r="3" fill="#85B7EB"/><circle cx="146" cy="229" r="3" fill="#5DCAA5"/><circle cx="161" cy="211" r="3" fill="#85B7EB"/><circle cx="136" cy="239" r="3" fill="#5DCAA5"/><circle cx="110" cy="219" r="3" fill="#85B7EB"/><circle cx="153" cy="236" r="3" fill="#5DCAA5"/>
              <circle cx="310" cy="150" r="6" fill="#ED93B1"/><circle cx="290" cy="135" r="3.5" fill="#F0997B"/><circle cx="332" cy="140" r="3.5" fill="#ED93B1"/><circle cx="296" cy="168" r="3" fill="#F0997B"/><circle cx="330" cy="168" r="3" fill="#ED93B1"/><circle cx="310" cy="126" r="3" fill="#F0997B"/><circle cx="346" cy="154" r="3.5" fill="#F0997B"/>
              <circle cx="285" cy="120" r="3" fill="#EF9F27"/><circle cx="270" cy="105" r="3" fill="#97C459"/><circle cx="255" cy="92" r="3" fill="#EF9F27"/><circle cx="242" cy="78" r="3" fill="#97C459"/><circle cx="230" cy="66" r="3" fill="#EF9F27"/><circle cx="218" cy="57" r="2.5" fill="#97C459"/><circle cx="262" cy="112" r="2.5" fill="#EF9F27"/>
              <circle cx="510" cy="85" r="3" fill="#97C459"/><circle cx="523" cy="92" r="3" fill="#97C459"/><circle cx="516" cy="102" r="2.5" fill="#97C459"/><circle cx="531" cy="84" r="2.5" fill="#97C459"/><circle cx="556" cy="168" r="3" fill="#F0997B"/><circle cx="569" cy="174" r="3" fill="#F0997B"/><circle cx="560" cy="183" r="2.5" fill="#F0997B"/><circle cx="548" cy="178" r="2.5" fill="#F0997B"/><circle cx="462" cy="236" r="3" fill="#AFA9EC"/><circle cx="478" cy="243" r="3" fill="#AFA9EC"/><circle cx="470" cy="251" r="2.5" fill="#AFA9EC"/><circle cx="485" cy="233" r="2.5" fill="#AFA9EC"/><circle cx="412" cy="146" r="3" fill="#85B7EB"/><circle cx="428" cy="153" r="3" fill="#85B7EB"/><circle cx="420" cy="161" r="2.5" fill="#85B7EB"/>
            </g>
            <g stroke="#B8BCD8" strokeOpacity="0.65" strokeWidth="0.6" strokeDasharray="3 3">
              <line x1="158" y1="52" x2="226" y2="65"/><line x1="356" y1="108" x2="324" y2="144"/><line x1="188" y1="246" x2="160" y2="224"/>
            </g>
            <text x="24" y="46" fontFamily="'Inter',sans-serif" fontSize="12" fill="#E6E8F2">Academy curriculum · ~120 lessons</text>
            <text x="362" y="106" fontFamily="'Inter',sans-serif" fontSize="12" fill="#E6E8F2">Orchestration · runOrchestration()</text>
            <text x="192" y="252" fontFamily="'Inter',sans-serif" fontSize="12" fill="#E6E8F2">Agent registry · 68-node cluster</text>
            <circle cx="500" cy="26" r="4" fill="#ED93B1"/><circle cx="512" cy="26" r="4" fill="#5DCAA5"/><circle cx="524" cy="26" r="4" fill="#EF9F27"/>
            <text x="533" y="30" fontFamily="'JetBrains Mono',monospace" fontSize="11.5" fill="#AEB2CC">602 communities</text>
            <text x="20" y="290" fontFamily="'JetBrains Mono',monospace" fontSize="11.5" fill="#AEB2CC">2,343 nodes · 2,852 edges</text>
          </svg>
        </div>
      </FadeIn>

      {/* c) Action row */}
      <FadeIn delay={60}>
        <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 16 }}>
          <a href="/atlas-graph.html" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:shadow-sm" style={{ fontFamily: GIM.fontMain, fontSize: 13, background: '#F5F0FA', color: GIM.primary, textDecoration: 'none' }}>Explore the live graph &#8599;</a>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: GIM.mutedText }}>2,343 nodes &middot; 602 communities &middot; rebuilt on every release</span>
        </div>
      </FadeIn>
    </section>

    {/* d) Caption cards */}
    <section className="max-w-5xl mx-auto px-6 pb-24" style={{ marginTop: 24 }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CAPTION_CARDS.map((c, i) =>
          <FadeIn key={c.title} delay={i * 40}>
            <div className="p-4 rounded-2xl h-full" style={{ background: GIM.cardBg, border: `0.5px solid ${GIM.border}` }}>
              <h3 className="font-bold mb-1" style={{ fontFamily: GIM.fontMain, fontSize: 14.5, color: GIM.headingText }}>{c.title}</h3>
              <p style={{ fontFamily: GIM.fontMain, fontSize: 12.5, color: GIM.bodyText, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>

  </div>;
}
