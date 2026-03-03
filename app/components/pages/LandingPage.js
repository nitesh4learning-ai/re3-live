"use client";
import { FadeIn } from '../shared/UIComponents';
import { listRuns as listArenaRuns } from '../../../lib/orchestration/run-store';

const GIM = {
  primary:'#9333EA', fontMain:"'Inter',system-ui,sans-serif",
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', cardBg:'#FFFFFF',
};

export default function LandingPage({ onSignIn, onNavigate, editorPicks=[], forgeSessions=[], content=[], academyCourses=[] }) {
  const arenaRuns = listArenaRuns();
  return <div className="min-h-screen" style={{ background: '#FAFAFA', paddingTop: 56 }}>

    {/* ===== HERO ===== */}
    <section className="relative overflow-hidden" style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,51,234,0.06) 0%, transparent 70%)' }} />
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <FadeIn delay={60}>
          <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.03em', color: GIM.headingText, marginBottom: 20 }}>
            Drop in any topic.<br/>
            <span style={{ color: '#E8734A' }}>AI specialists debate and build it.</span><br/>
            <span style={{ color: GIM.primary }}>You get the insights nobody saw.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={100}>
          <p style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(15px, 1.6vw, 18px)', maxWidth: 560, margin: '0 auto 32px', color: GIM.bodyText, lineHeight: 1.7 }}>
            Re&#179; assembles a panel from 1,000+ AI agents &mdash; CTOs, economists, ethicists, scientists &mdash; who argue your topic across 3 structured rounds. Then it synthesizes what emerges into insights no single perspective could produce.
          </p>
        </FadeIn>

        <FadeIn delay={130}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <button onClick={() => onNavigate?.("loom")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-md rounded-xl" style={{ background: '#E8734A', color: 'white' }}>The Loom</button>
            <button onClick={() => onNavigate?.("arena")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-md rounded-xl" style={{ background: GIM.primary, color: 'white' }}>Arena</button>
            <button onClick={() => onNavigate?.("academy")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-md rounded-xl" style={{ background: '#2D8A6E', color: 'white' }}>Academy</button>
          </div>
        </FadeIn>
      </div>
    </section>

    {/* ===== HOW IT WORKS ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1E1B2E 0%,#2D1B4E 50%,#1B2E3E 100%)', border: '1px solid rgba(147,51,234,0.2)' }}>
          <div className="p-6 pb-3 text-center">
            <h2 className="font-bold" style={{ fontFamily: GIM.fontMain, color: '#F9FAFB', fontSize: 22 }}>From Question to Insight in 4 Steps</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {[
              { num: "1", label: "Submit", desc: "Drop any topic, article, or question", icon: "\uD83D\uDCDD", color: "#A78BFA" },
              { num: "2", label: "Curate", desc: "AI selects the ideal 5-agent panel", icon: "\uD83C\uDFAF", color: "#E8734A" },
              { num: "3", label: "Debate", desc: "3 rounds: position, challenge, synthesis", icon: "\u2694\uFE0F", color: "#3B6B9B" },
              { num: "4", label: "Synthesize", desc: "Emergent insights no single agent could see", icon: "\uD83E\uDDF5", color: "#2D8A6E" },
            ].map((step, i) =>
              <FadeIn key={step.num} delay={i * 60}>
                <div className="p-5 text-center" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${step.color}25`, fontSize: 20 }}>{step.icon}</div>
                  <div className="font-bold mb-1" style={{ fontSize: 11, letterSpacing: '0.08em', color: step.color }}>{step.num}. {step.label.toUpperCase()}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </FadeIn>
    </section>

    {/* ===== WHAT YOU CAN DO ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <h2 className="font-bold text-center mb-10" style={{ fontFamily: GIM.fontMain, fontSize: 26, color: GIM.headingText, letterSpacing: '-0.02em' }}>What you can do on Re&#179;</h2>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "\u2694\uFE0F", title: "Debate Lab", desc: "Submit any topic. 5 AI specialists argue it across 3 rounds, then Hypatia synthesizes the insights.", color: "#E8734A", cta: "Explore debates", page: "forge" },
          { icon: "\uD83C\uDFD7\uFE0F", title: "Arena", desc: "Agent teams auto-assemble, architect solutions, and deliver working prototypes from your use case.", color: "#9333EA", cta: "Browse arena", page: "arena" },
          { icon: "\uD83C\uDF93", title: "Academy", desc: "37 courses across 4 tiers &mdash; from AI governance foundations to frontier research.", color: "#2D8A6E", cta: "Browse courses", page: "academy" },
        ].map((item, i) =>
          <FadeIn key={item.title} delay={i * 60}>
            <div className="p-6 rounded-2xl h-full flex flex-col" style={{ background: GIM.cardBg, border: `1px solid ${GIM.border}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}10`, fontSize: 24 }}>{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: GIM.headingText }}>{item.title}</h3>
              <p className="flex-1 mb-4" style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.desc }} />
              <button onClick={() => onNavigate?.(item.page)} className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-sm" style={{ background: `${item.color}10`, color: item.color }}>{item.cta} &rarr;</button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>

    {/* ===== EDITOR'S PICKS ===== */}
    {editorPicks.length>0&&<section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <h2 className="font-bold text-center mb-2" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Editor&rsquo;s Picks</h2>
        <p className="text-center mb-8" style={{fontSize:13,color:GIM.mutedText}}>Hand-picked highlights from the platform</p>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {editorPicks.map((pick,i)=>{
          let data;
          if(pick.type==="debate"){
            const session = forgeSessions?.find(s=>s.id===pick.sourceId);
            const post = content?.find(p=>p.id===pick.sourceId);
            const src = session||post;
            const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
            data={
              title: src?.topic?.title||src?.title||pick.title,
              icon:"\ud83e\uddf5", color: modeColors[session?.mode]||"#E8734A",
              badge: session?.mode?.toUpperCase()||"DEBATE",
              subtitle: session ? `${session.results?.panel?.agents?.length||0} agents \u00b7 ${session.results?.rounds?.length||0} rounds` : null,
              date: session?.date ? new Date(session.date).toLocaleDateString() : null,
              onClick: ()=>onNavigate?.(session?"forge":"post",pick.sourceId),
            };
          } else if(pick.type==="arena"){
            const run = arenaRuns.find(r=>r.runId===pick.sourceId);
            data={
              title: run?.useCase?.title||pick.title,
              icon:"\ud83c\udfd7\ufe0f", color:"#9333EA", badge:"ARENA",
              subtitle: run ? `${run.team?.length||0} agents${run.metrics?.elapsedMs?" \u00b7 "+Math.round(run.metrics.elapsedMs/1000)+"s":""}` : null,
              date: run?.completedAt ? new Date(run.completedAt).toLocaleDateString() : null,
              onClick: ()=>onNavigate?.("arena",pick.sourceId),
            };
          } else {
            const course = academyCourses?.find(c=>c.id===pick.sourceId);
            const tierColors={1:"#3B6B9B",2:"#E8734A",3:"#9333EA",4:"#2D8A6E"};
            data={
              title: course?.title||pick.title,
              icon: course?.icon||"\ud83c\udf93", color: tierColors[course?.tier]||"#2D8A6E",
              badge: course ? `TIER ${course.tier}` : "COURSE",
              subtitle: course ? `${course.timeMinutes}min \u00b7 ${course.difficulty}` : null,
              date: null,
              onClick: ()=>onNavigate?.("academy"),
            };
          }
          return <FadeIn key={pick.id} delay={i*40}>
            <div className="rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md" onClick={data.onClick} style={{background:GIM.cardBg,border:`1px solid ${GIM.border}`,borderLeft:`3px solid ${data.color}`}}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,letterSpacing:"0.04em",background:`${data.color}10`,color:data.color,border:`1px solid ${data.color}20`}}>{data.badge}</span>
                  {data.date&&<span style={{fontSize:10,color:GIM.mutedText}}>{data.date}</span>}
                </div>
                <div className="flex items-center gap-2.5">
                  <span style={{fontSize:18}}>{data.icon}</span>
                  <h4 className="font-semibold" style={{fontFamily:GIM.fontMain,fontSize:14,color:GIM.headingText,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{data.title}</h4>
                </div>
                {data.subtitle&&<p className="mt-2" style={{fontSize:11,color:GIM.mutedText}}>{data.subtitle}</p>}
              </div>
            </div>
          </FadeIn>;
        })}
      </div>
    </section>}

    {/* ===== AGENT ROSTER TEASER ===== */}
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <FadeIn>
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg,rgba(147,51,234,0.04),rgba(45,138,110,0.04))', border: `1px solid ${GIM.border}` }}>
          <h2 className="font-bold mb-2" style={{ fontSize: 22, color: GIM.headingText }}>1,000+ AI Agents Across 15 Domains</h2>
          <p className="mb-6 mx-auto" style={{ maxWidth: 480, fontSize: 14, color: GIM.bodyText, lineHeight: 1.7 }}>CTOs, behavioral economists, constitutional lawyers, quantum physicists, ethicists, data engineers, and more. Each with a distinct persona, worldview, and expertise.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["Executive Suite", "Builders", "Human Lens", "Cross-Domain", "Wild Cards", "Industry Specialists"].map(cat =>
              <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#F3F4F6', color: GIM.bodyText }}>{cat}</span>
            )}
          </div>
          <button onClick={() => onNavigate?.("agents")} className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{ background: GIM.primary, color: 'white' }}>Explore agents &rarr;</button>
        </div>
      </FadeIn>
    </section>

    {/* ===== FINAL CTA ===== */}
    <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
      <FadeIn>
        <h2 className="font-bold mb-3" style={{ fontSize: 28, color: GIM.headingText, letterSpacing: '-0.02em' }}>Ready to think differently?</h2>
        <p className="mb-6" style={{ fontSize: 15, color: GIM.bodyText, lineHeight: 1.7 }}>Explore debates, builds, and courses &mdash; or sign in to create your own.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => onNavigate?.("loom")} className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{ background: GIM.primary, color: 'white' }}>Browse The Loom &rarr;</button>
          <button onClick={onSignIn} className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText }}>Sign in</button>
        </div>
      </FadeIn>
    </section>

  </div>;
}
