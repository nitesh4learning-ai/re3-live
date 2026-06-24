"use client";
// Home — personal-brand presentation. Nitesh Srivastava is the protagonist; the
// work is surfaced as a type-tagged gallery (#work). Presentation only: every live
// tile links to an existing route; "soon" tiles are disabled placeholders. Reuses
// the GIM design tokens + FadeIn.
import { useState, useRef, useEffect } from "react";
import { FadeIn } from '../shared/UIComponents';
import { WORK_ITEMS } from '../../constants';

const GIM = {
  primary:'#9333EA', fontMain:"'Inter',system-ui,sans-serif",
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', cardBg:'#FFFFFF',
};

// Type tag colors (text on bg) + display label. Status maps to a dot/pill.
const TYPE_STYLE = {
  app:        { color: '#9333EA', bg: '#FAF5FF', label: 'App' },
  framework:  { color: '#2D8A6E', bg: '#EBF5F1', label: 'Framework' },
  whitepaper: { color: '#C2410C', bg: '#FFF7ED', label: 'Whitepaper' },
  article:    { color: '#3B6B9B', bg: '#EEF3F8', label: 'Article' },
};

// Filter chips — order + label; the type key drives both the filter and the count.
const FILTERS = [
  ['all', 'All'],
  ['app', 'Apps'],
  ['framework', 'Frameworks'],
  ['whitepaper', 'Whitepapers'],
  ['article', 'Articles'],
];

// Live agent-orchestration visual: a network of agents where collaborating agents
// link up and existing agents periodically spawn new ones (the counter climbs).
// Canvas in a useEffect with full cleanup; updates the counter via ref (no re-render).
function AgentOrchestration() {
  const canvasRef = useRef(null);
  const countRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => { const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W*DPR; canvas.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); };
    resize(); window.addEventListener('resize', resize);
    const P = [147,51,234], rnd = (a,b)=>a+Math.random()*(b-a);
    const mk = (x,y,hub)=>({x,y,vx:rnd(-0.18,0.18),vy:rnd(-0.18,0.18),r:hub?rnd(4.5,6):rnd(1.6,3.2),hub:!!hub,born:performance.now(),scale:1,dying:false,dieAt:0});
    let nodes = [];
    for (let i=0;i<46;i++) nodes.push(mk(rnd(20,Math.max(40,W)-20), rnd(20,Math.max(40,H)-20), i<5));
    const count = 1025; // static real count; only changes when real agents are added (future: dynamic agent generation)
    const render = () => { if (countRef.current) countRef.current.textContent = count.toLocaleString(); };
    render();
    const spawn = setInterval(() => {
      if (!W) return;
      const alive = nodes.filter(n=>!n.dying); const p = alive[Math.floor(Math.random()*alive.length)]; if (!p) return;
      const child = mk(p.x+rnd(-14,14), p.y+rnd(-14,14), false); child.scale = 0; nodes.push(child);
      const nh = nodes.filter(n=>!n.hub && !n.dying); if (nh.length>58){ nh[0].dying=true; nh[0].dieAt=performance.now(); }
    }, 1500);
    let raf;
    const frame = (now) => {
      ctx.clearRect(0,0,W,H);
      for (const n of nodes){ n.x+=n.vx; n.y+=n.vy; if(n.x<8||n.x>W-8)n.vx*=-1; if(n.y<8||n.y>H-8)n.vy*=-1; if(n.scale<1&&!n.dying)n.scale=Math.max(0,Math.min(1,(now-n.born)/600)); if(n.dying)n.scale=Math.max(0,1-(now-n.dieAt)/500); }
      nodes = nodes.filter(n=>!(n.dying && n.scale<=0));
      for (let a=0;a<nodes.length;a++) for (let b=a+1;b<nodes.length;b++){ const dx=nodes[a].x-nodes[b].x,dy=nodes[a].y-nodes[b].y,d=Math.sqrt(dx*dx+dy*dy); if(d<104){ const op=(1-d/104)*0.32*Math.min(nodes[a].scale,nodes[b].scale); ctx.strokeStyle=`rgba(${P[0]},${P[1]},${P[2]},${op})`; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(nodes[a].x,nodes[a].y); ctx.lineTo(nodes[b].x,nodes[b].y); ctx.stroke(); } }
      for (let k=0;k<nodes.length;k++){ const m=nodes[k]; const pulse=1+0.12*Math.sin(now/600+k); const r=Math.max(0,m.r*m.scale*pulse); if(m.hub){ const g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,r*4); g.addColorStop(0,`rgba(${P[0]},${P[1]},${P[2]},0.18)`); g.addColorStop(1,`rgba(${P[0]},${P[1]},${P[2]},0)`); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(m.x,m.y,r*4,0,6.283); ctx.fill(); } ctx.fillStyle=`rgba(${P[0]},${P[1]},${P[2]},${m.hub?0.95:0.7})`; ctx.beginPath(); ctx.arc(m.x,m.y,r,0,6.283); ctx.fill(); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { window.removeEventListener('resize', resize); clearInterval(spawn); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background:'radial-gradient(120% 120% at 70% 20%, #fff, #FAF7FF 60%, #F3EBFF)', border:'1px solid #E9D5FF', minHeight:320 }}>
      <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:320 }} />
      <div className="absolute" style={{ top:14, left:14 }}>
        <div className="rounded-xl" style={{ background:'rgba(255,255,255,0.82)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', border:'1px solid #E9D5FF', padding:'8px 12px' }}>
          <div ref={countRef} style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:22, color:'#9333EA', lineHeight:1, letterSpacing:'-0.02em' }}>1,025</div>
          <div style={{ fontSize:10, color:'#6B7280', marginTop:3 }}><span className="inline-block rounded-full" style={{ width:6, height:6, background:'#22c55e', marginRight:5, verticalAlign:'middle' }} />agents orchestrating</div>
        </div>
      </div>
      <div className="absolute" style={{ bottom:12, left:14, right:14, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:'#7c5bbf' }}>self-assembling teams &middot; agents that spawn new agents</div>
    </div>
  );
}

export default function LandingPage({ onNavigate, visitCount = null, articles = [] }) {
  const [activeType, setActiveType] = useState('all');

  const scrollToWork = () => {
    if (typeof document !== "undefined") document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  // Article tiles are derived from the user's PUBLISHED articles (passed in); the
  // curated WORK_ITEMS supply apps/frameworks/whitepapers. Combined into one grid.
  const articleTiles = articles.map((a) => ({
    key: "article-" + a.id,
    title: a.title,
    type: "article",
    status: "live",
    desc: a.excerpt || a.subtitle || (a.pillar ? `Published in ${a.pillar}.` : "Published article."),
    articleId: a.id,
  }));
  const allTiles = [...WORK_ITEMS.map((w) => ({ ...w, key: w.title })), ...articleTiles];

  const countFor = (type) => type === 'all' ? allTiles.length : allTiles.filter((t) => t.type === type).length;
  const visibleTiles = activeType === 'all' ? allTiles : allTiles.filter((t) => t.type === activeType);

  const openTile = (t) => {
    if (t.status !== 'live') return;
    if (t.type === 'article') onNavigate?.("article", t.articleId);
    else onNavigate?.(t.page, t.pageId);
  };

  return <div className="min-h-screen" style={{ background: '#FAFAFA', paddingTop: 56 }}>

    {/* ===== HERO ===== */}
    <section className="relative overflow-hidden" style={{ paddingTop: 64, paddingBottom: 48 }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,51,234,0.06) 0%, transparent 70%)' }} />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#F3E8FF', border: '1px solid #E9D5FF' }}>
            <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 11, letterSpacing: '0.06em', color: GIM.primary }}>Nitesh Srivastava &middot; Re&#179; Lab</span>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(38px, 6.5vw, 66px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: GIM.headingText, marginBottom: 20 }}>
            Systems to think with.
          </h1>
        </FadeIn>

        <FadeIn delay={100}>
          <p style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(15px, 1.7vw, 19px)', maxWidth: 640, color: GIM.bodyText, lineHeight: 1.7, marginBottom: 28 }}>
            I make enterprise data trustworthy and governable &mdash; and build the agentic systems, and the frameworks behind them, that make AI legible at enterprise scale.
          </p>
        </FadeIn>

        <FadeIn delay={130}>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button onClick={scrollToWork} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-lg" style={{ fontFamily: GIM.fontMain, background: GIM.primary, color: 'white', borderRadius: 8, boxShadow: '0 4px 16px rgba(147,51,234,0.25)' }}>Explore the work &darr;</button>
          </div>
        </FadeIn>

        {/* Credibility row — role / sector / frameworks. No years-of-experience claims. */}
        <FadeIn delay={160}>
          <div id="about" className="flex flex-wrap items-center gap-x-3 gap-y-2" style={{ scrollMarginTop: 72 }}>
            {[
              ["Focus", "Enterprise data & AI governance"],
              ["Builds", "Agentic systems · multi-agent orchestration"],
              ["Frameworks", "GIM · CodeMesh · Pinwheel"],
            ].map(([k, v]) =>
              <span key={k} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: GIM.cardBg, border: `1px solid ${GIM.border}` }}>
                <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: GIM.primary }}>{k}</span>
                <span style={{ fontFamily: GIM.fontMain, fontSize: 12, color: GIM.bodyText }}>{v}</span>
              </span>
            )}
          </div>
        </FadeIn>

        {visitCount !== null && <FadeIn delay={190}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-6" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#2D8A6E' }} />
            <span className="font-semibold" style={{ fontFamily: GIM.fontMain, fontSize: 13, color: GIM.bodyText }}>Site Visits: {visitCount.toLocaleString()}</span>
          </div>
        </FadeIn>}
          </div>
          <FadeIn delay={120}><AgentOrchestration /></FadeIn>
        </div>
      </div>
    </section>

    {/* ===== ORCHESTRATION STAT STRIP ===== */}
    <div style={{ borderTop:'1px solid #E5E7EB', borderBottom:'1px solid #E5E7EB', background:'#fff' }}>
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center" style={{ gap:'8px 22px', paddingTop:15, paddingBottom:15, fontFamily:GIM.fontMain, fontSize:12.5, color:GIM.bodyText }}>
        <span><b style={{color:GIM.headingText}}>1,000+</b> agents</span><span style={{color:'#E9D5FF'}}>&middot;</span>
        <span><b style={{color:GIM.headingText}}>15</b> domains</span><span style={{color:'#E9D5FF'}}>&middot;</span>
        <span>teams <b style={{color:GIM.headingText}}>auto-assemble</b></span><span style={{color:'#E9D5FF'}}>&middot;</span>
        <span>agents <b style={{color:GIM.headingText}}>spawn new agents</b></span><span style={{color:'#E9D5FF'}}>&middot;</span>
        <span><b style={{color:GIM.headingText}}>3</b>-round debate &rarr; synthesis</span>
      </div>
    </div>

    {/* ===== WORK GALLERY ===== */}
    <section id="work" className="max-w-5xl mx-auto px-6 pb-20" style={{ scrollMarginTop: 72 }}>
      <FadeIn>
        <h2 className="font-bold mb-1" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(22px,3vw,30px)', color: GIM.headingText, letterSpacing: '-0.02em' }}>The Work</h2>
        <p className="mb-6" style={{ fontFamily: GIM.fontMain, fontSize: 14, color: GIM.mutedText }}>Everything I&rsquo;ve delivered and thought about &mdash; the systems, the frameworks, and the writing.</p>
      </FadeIn>

      {/* Filter chips with live counts */}
      <FadeIn delay={40}>
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(([key, label]) => {
            const active = activeType === key;
            return <button key={key} onClick={() => setActiveType(key)} className="px-3.5 py-1.5 rounded-full font-semibold transition-all" style={{ fontFamily: GIM.fontMain, fontSize: 12.5, background: active ? GIM.primary : GIM.cardBg, color: active ? 'white' : GIM.bodyText, border: `1px solid ${active ? GIM.primary : GIM.border}` }}>
              {label} <span style={{ opacity: 0.6, marginLeft: 2 }}>{countFor(key)}</span>
            </button>;
          })}
        </div>
      </FadeIn>

      {/* Tile grid (3 / 2 / 1) */}
      {visibleTiles.length === 0
        ? <FadeIn delay={60}><div className="p-8 rounded-2xl text-center" style={{ background: GIM.cardBg, border: `1px dashed ${GIM.border}` }}>
            <p style={{ fontFamily: GIM.fontMain, fontSize: 13, color: GIM.mutedText }}>Nothing here yet.</p>
          </div></FadeIn>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleTiles.map((t, i) => {
              const ts = TYPE_STYLE[t.type] || TYPE_STYLE.app;
              const live = t.status === 'live';
              const actionLabel = (t.type === 'whitepaper' || t.type === 'article') ? 'Read →' : 'Open →';
              return <FadeIn key={t.key} delay={60 + i * 25}>
                <div className="p-4 rounded-2xl h-full flex flex-col" style={{ background: live ? GIM.cardBg : '#FBFBFC', border: `1px solid ${t.flagship ? '#E9D5FF' : GIM.border}`, opacity: live ? 1 : 0.75 }}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontFamily: GIM.fontMain, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', background: ts.bg, color: ts.color }}>{ts.label}</span>
                    {t.flagship && <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: 8.5, letterSpacing: '0.06em', background: '#F3E8FF', color: '#9333EA' }}>FLAGSHIP</span>}
                    {live
                      ? <span className="inline-flex items-center gap-1" style={{ fontFamily: GIM.fontMain, fontSize: 10.5, fontWeight: 600, color: '#2D8A6E' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2D8A6E' }} />Live</span>
                      : <span style={{ fontFamily: GIM.fontMain, fontSize: 10.5, fontWeight: 600, color: '#94A3B8' }}>Coming soon</span>}
                  </div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: GIM.fontMain, color: GIM.headingText, fontSize: 14.5, lineHeight: 1.3 }}>{t.title}</h3>
                  <p className="flex-1 mb-3" style={{ fontFamily: GIM.fontMain, fontSize: 12.5, color: GIM.bodyText, lineHeight: 1.6 }}>{t.desc}</p>
                  {live
                    ? (t.url
                        ? <a href={t.url} target="_blank" rel="noopener noreferrer" className="self-start px-3 py-1.5 rounded-lg font-semibold transition-all hover:shadow-sm" style={{ fontFamily: GIM.fontMain, fontSize: 11, background: '#F5F0FA', color: GIM.primary, textDecoration: 'none' }}>Open ↗</a>
                        : <button onClick={() => openTile(t)} className="self-start px-3 py-1.5 rounded-lg font-semibold transition-all hover:shadow-sm" style={{ fontFamily: GIM.fontMain, fontSize: 11, background: '#F5F0FA', color: GIM.primary }}>{actionLabel}</button>)
                    : <span className="self-start px-3 py-1.5 rounded-lg font-semibold" style={{ fontFamily: GIM.fontMain, fontSize: 11, background: '#F3F4F6', color: '#9CA3AF' }}>Soon</span>}
                </div>
              </FadeIn>;
            })}
          </div>}
    </section>

    {/* ===== ATLAS TEASER ===== */}
    <section className="max-w-5xl mx-auto px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#F3E8FF', border: '1px solid #E9D5FF' }}>
              <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 11, letterSpacing: '0.06em', color: GIM.primary }}>Under the hood</span>
            </div>
            <h2 className="font-semibold mb-3" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-0.02em', color: GIM.headingText }}>The system maps itself</h2>
            <p className="mb-5" style={{ fontFamily: GIM.fontMain, fontSize: 15, color: GIM.bodyText, lineHeight: 1.7, maxWidth: 460 }}>
              Re3.live&rsquo;s own codebase as a living knowledge graph of ~2500 modules regenerated automatically on every release.
            </p>
            <button onClick={() => onNavigate?.('atlas')} className="px-3 py-1.5 rounded-lg font-semibold transition-all hover:shadow-sm" style={{ fontFamily: GIM.fontMain, fontSize: 11, background: '#F5F0FA', color: GIM.primary }}>Explore the Atlas &rarr;</button>
          </div>
          {/* RIGHT — decorative thumbnail, also navigates to the Atlas */}
          <button onClick={() => onNavigate?.('atlas')} aria-label="Explore the Atlas" className="rounded-2xl overflow-hidden transition-all hover:shadow-md" style={{ cursor: 'pointer', display: 'block', width: '100%', padding: 0, border: `1px solid ${GIM.border}`, background: 'transparent' }}>
            <svg viewBox="0 0 200 96" style={{ width:'100%', height:'auto', display:'block' }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="0.5" y="0.5" width="199" height="95" rx="10" fill="#14132A" stroke="rgba(255,255,255,0.08)"/>
              <g stroke="#8E92B0" strokeOpacity="0.25" strokeWidth="0.6">
                <line x1="60" y1="48" x2="45" y2="38"/><line x1="60" y1="48" x2="78" y2="42"/>
                <line x1="60" y1="48" x2="50" y2="62"/><line x1="60" y1="48" x2="75" y2="61"/>
                <line x1="78" y1="42" x2="96" y2="46"/><line x1="96" y1="46" x2="112" y2="62"/>
              </g>
              <circle cx="60" cy="48" r="5" fill="#ED93B1"/>
              <circle cx="45" cy="38" r="3" fill="#F0997B"/><circle cx="78" cy="42" r="3" fill="#5DCAA5"/>
              <circle cx="50" cy="62" r="3" fill="#85B7EB"/><circle cx="75" cy="61" r="3" fill="#F0997B"/>
              <circle cx="40" cy="50" r="2.5" fill="#97C459"/><circle cx="96" cy="46" r="2.5" fill="#AFA9EC"/>
              <circle cx="112" cy="62" r="2.5" fill="#85B7EB"/>
              <circle cx="132" cy="30" r="3" fill="#97C459"/><circle cx="150" cy="54" r="3" fill="#EF9F27"/>
              <circle cx="120" cy="70" r="2.5" fill="#F0997B"/><circle cx="162" cy="38" r="2.5" fill="#AFA9EC"/>
              <circle cx="170" cy="68" r="2.5" fill="#5DCAA5"/>
            </svg>
          </button>
        </div>
      </FadeIn>
    </section>

    {/* ===== CLOSE ===== */}
    <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
      <FadeIn>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="https://www.linkedin.com/in/nitesh-srivastava-8233099b/" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText, background: '#fff', textDecoration: 'none', display: 'inline-block' }}>Get in touch</a>
        </div>
      </FadeIn>
    </section>

  </div>;
}
