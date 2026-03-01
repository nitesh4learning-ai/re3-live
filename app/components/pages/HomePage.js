"use client";
import { useState, lazy, Suspense } from "react";
import { useApp } from '../../providers';
import { GIM, PILLARS, isAdmin } from '../../constants';
import { getCycles } from '../../utils/helpers';
import { FadeIn, renderInline } from '../shared/UIComponents';
import { listRuns as listArenaRuns } from '../../../lib/orchestration/run-store';
import { COURSES as ACADEMY_COURSES } from '../../constants/courses';

const LandingPage = lazy(() => import('./LandingPage'));

export default function HomePage(){
  const app = useApp();
  const { content, themes, articles, forgeSessions, agents, registry } = app;
  const { user: currentUser, nav: onNavigate, voteTheme: onVoteTheme, addTheme: onAddTheme, editTheme: onEditTheme, deleteTheme: onDeleteTheme, navToForge } = app;
  const onSubmitTopic = app.addTheme;

  const cycles = getCycles(content);
  const hero = cycles[0];
  const[communityTopic,setCommunityTopic]=useState("");
  const[topicSubmitted,setTopicSubmitted]=useState(false);
  const[newThemeTxt,setNewThemeTxt]=useState("");
  const[editingTheme,setEditingTheme]=useState(null);
  const[editThemeTxt,setEditThemeTxt]=useState("");

  // Show landing page for logged-out visitors
  if (!currentUser) {
    return <Suspense fallback={null}>
      <LandingPage onSignIn={() => app.setShowLogin(true)} onNavigate={onNavigate} />
    </Suspense>;
  }

  // Platform-wide stats
  const registryAgentCount = registry?.totalAgents || 1000;
  const customAgentCount = agents?.filter(a=>a.status==="active").length || 0;
  const totalAgents = registryAgentCount + customAgentCount;
  const domainCount = registry?.domains?.length || 15;
  const totalDebates = (forgeSessions?.length||0) + content.filter(p=>p.debate?.loom).length;
  const arenaRuns = listArenaRuns();
  const courseCount = ACADEMY_COURSES?.length || 37;
  const availableCourses = ACADEMY_COURSES?.filter(c=>c.status==="available") || [];

  return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>

    {/* ===== HERO ===== */}
    <section style={{background:"linear-gradient(180deg,#FAF5FF 0%,#F9FAFB 100%)",overflow:"hidden",position:"relative"}}>
      {/* Background node animation */}
      <div className="absolute inset-0 overflow-hidden" style={{opacity:0.10}}>
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{position:"absolute",top:0,right:0,width:"60%",height:"100%"}}>
          {/* Debate cluster */}
          <circle cx="200" cy="140" r="4" fill="#E8734A"><animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite"/></circle>
          <circle cx="280" cy="100" r="3" fill="#E8734A"><animate attributeName="r" values="2;5;2" dur="2.8s" repeatCount="indefinite"/></circle>
          <circle cx="240" cy="200" r="3" fill="#E8734A"><animate attributeName="r" values="3;5;3" dur="3.5s" repeatCount="indefinite"/></circle>
          {/* Build cluster */}
          <circle cx="450" cy="160" r="5" fill="#9333EA"><animate attributeName="r" values="4;7;4" dur="4s" repeatCount="indefinite"/></circle>
          <circle cx="520" cy="120" r="3" fill="#9333EA"><animate attributeName="r" values="2;5;2" dur="3.2s" repeatCount="indefinite"/></circle>
          <circle cx="500" cy="220" r="3" fill="#9333EA"><animate attributeName="r" values="3;5;3" dur="2.6s" repeatCount="indefinite"/></circle>
          {/* Learn cluster */}
          <circle cx="680" cy="180" r="4" fill="#2D8A6E"><animate attributeName="r" values="3;6;3" dur="3.8s" repeatCount="indefinite"/></circle>
          <circle cx="720" cy="120" r="3" fill="#2D8A6E"><animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite"/></circle>
          <circle cx="650" cy="260" r="3" fill="#3B6B9B"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/></circle>
          {/* Cross-cluster connections */}
          <line x1="280" y1="100" x2="450" y2="160" stroke="#A78BFA" strokeWidth="0.6" opacity="0.4"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/></line>
          <line x1="450" y1="160" x2="680" y2="180" stroke="#A78BFA" strokeWidth="0.6" opacity="0.4"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.5s" repeatCount="indefinite"/></line>
          <line x1="200" y1="140" x2="240" y2="200" stroke="#E8734A" strokeWidth="0.5" opacity="0.3"/>
          <line x1="520" y1="120" x2="500" y2="220" stroke="#9333EA" strokeWidth="0.5" opacity="0.3"/>
          <line x1="680" y1="180" x2="650" y2="260" stroke="#2D8A6E" strokeWidth="0.5" opacity="0.3"/>
          <line x1="240" y1="200" x2="500" y2="220" stroke="rgba(147,51,234,0.3)" strokeWidth="0.4" strokeDasharray="4 4"><animate attributeName="opacity" values="0.1;0.4;0.1" dur="5s" repeatCount="indefinite"/></line>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative" style={{paddingTop:56,paddingBottom:48}}>
        {/* Badge */}
        <FadeIn><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{background:"rgba(147,51,234,0.06)",border:"1px solid rgba(147,51,234,0.12)"}}>
          <span className="relative flex" style={{width:6,height:6}}><span className="animate-ping absolute inline-flex rounded-full opacity-75" style={{width:"100%",height:"100%",background:GIM.primary}}/><span className="relative inline-flex rounded-full" style={{width:6,height:6,background:GIM.primary}}/></span>
          <span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:"0.08em",color:GIM.primary}}>FREE DURING ALPHA</span>
        </div></FadeIn>

        <FadeIn delay={60}><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:"clamp(32px,5.5vw,52px)",lineHeight:1.08,letterSpacing:"-0.03em",marginBottom:16,maxWidth:680}}>
          <span style={{color:GIM.headingText}}>Drop in any topic.</span><br/>
          <span style={{color:"#E8734A"}}>5 AI specialists</span>
          <span style={{color:GIM.headingText}}> debate and build it.</span><br/>
          <span style={{color:GIM.primary}}>You get the insights nobody saw.</span>
        </h1></FadeIn>

        <FadeIn delay={100}><p style={{fontFamily:GIM.fontMain,fontSize:"clamp(14px,1.5vw,17px)",maxWidth:560,color:GIM.bodyText,lineHeight:1.7,marginBottom:28}}>Re{'\u00b3'} assembles a panel from {totalAgents.toLocaleString()}+ AI agents &mdash; CTOs, economists, ethicists, scientists &mdash; who argue your topic across 3 structured rounds. Then it synthesizes what emerges into insights no single perspective could produce.</p></FadeIn>

        <FadeIn delay={130}><div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={()=>onNavigate("forge")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-lg" style={{fontFamily:GIM.fontMain,background:GIM.primary,color:"white",borderRadius:GIM.buttonRadius}}>Start a Debate &rarr;</button>
          <button onClick={()=>onNavigate("loom")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-sm" style={{fontFamily:GIM.fontMain,background:GIM.cardBg,color:GIM.bodyText,border:`1px solid ${GIM.border}`,borderRadius:GIM.buttonRadius}}>See past debates</button>
        </div></FadeIn>
      </div>
    </section>

    {/* ===== HOW IT WORKS ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="rounded-2xl overflow-hidden" style={{background:"linear-gradient(135deg,#1E1B2E 0%,#2D1B4E 50%,#1B2E3E 100%)",border:"1px solid rgba(147,51,234,0.2)"}}>
        <div className="p-6 pb-3">
          <div className="flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full" style={{background:"#A78BFA"}}/><span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:"0.12em",color:"#A78BFA"}}>THE DEBATE-SYNTHESIS CYCLE</span></div>
          <h2 className="font-bold" style={{fontFamily:GIM.fontMain,color:"#F9FAFB",fontSize:18}}>From Question to Insight in 4 Steps</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
          {[
            {num:"1",label:"Submit",desc:"Drop any topic, article, or question",icon:"\ud83d\udcdd",color:"#A78BFA"},
            {num:"2",label:"Curate",desc:"AI selects the ideal panel from 1,000+ agents",icon:"\ud83c\udfaf",color:"#E8734A"},
            {num:"3",label:"Debate",desc:"3 rounds: position, challenge, synthesis",icon:"\u2694\ufe0f",color:"#3B6B9B"},
            {num:"4",label:"Synthesize",desc:"Emergent insights woven into The Loom",icon:"\ud83e\uddf5",color:"#2D8A6E"},
          ].map((step,i)=><FadeIn key={step.num} delay={i*60}><div className="p-4 sm:p-5 text-center relative" style={{borderRight:i<3?"1px solid rgba(255,255,255,0.06)":"none"}}>
            {i<3&&<div className="hidden sm:block absolute top-1/2 -right-2 z-10" style={{transform:"translateY(-50%)",color:"rgba(255,255,255,0.2)",fontSize:12}}>&rarr;</div>}
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:`${step.color}25`,fontSize:18}}>{step.icon}</div>
            <div className="font-bold mb-0.5" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:"0.08em",color:step.color}}>{step.num}. {step.label.toUpperCase()}</div>
            <p style={{fontFamily:GIM.fontMain,fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5,marginTop:4}}>{step.desc}</p>
          </div></FadeIn>)}
        </div>
      </div></FadeIn>
    </section>

    {/* ===== DEBATE SAMPLE — Prove the value ===== */}
    {(()=>{
      // Find the best completed debate to showcase
      const sampleDebate = forgeSessions?.find(s=>s.mode==="debate"&&s.results?.rounds?.length>=2&&s.results?.loom&&s.results?.panel?.agents?.length>=3)
        || content.find(p=>p.debate?.rounds?.length>=2&&p.debate?.loom&&p.debate?.panel?.agents?.length>=3);
      if(!sampleDebate) return null;
      const isSession = !!sampleDebate.results;
      const debate = isSession ? sampleDebate.results : sampleDebate.debate;
      const title = isSession ? (sampleDebate.topic?.title||"") : sampleDebate.title;
      const panelAgents = debate.panel?.agents?.slice(0,4) || [];
      // Get one compelling quote from each of the first 3 agents in round 1
      const round1 = Array.isArray(debate.rounds?.[0]) ? debate.rounds[0] : [];
      const quotes = round1.filter(r=>r.status==="success"&&r.response).slice(0,3);
      const loomText = debate.loom || "";
      const loomPreview = loomText.split("\n\n")[0]?.slice(0,300) || loomText.slice(0,300);

      return <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <FadeIn><div className="rounded-2xl overflow-hidden" style={{background:GIM.cardBg,border:`1px solid ${GIM.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F3E8FF",color:GIM.primary}}>LIVE EXAMPLE</span>
              <span style={{fontFamily:GIM.fontMain,fontSize:11,color:GIM.mutedText}}>A real debate from this platform</span>
            </div>
            <h3 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:18,color:GIM.headingText}}>{title}</h3>
            <div className="flex items-center gap-2 mt-2 mb-3">
              {panelAgents.map((a,i)=><div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{background:`${a.color||"#999"}10`,border:`1px solid ${a.color||"#999"}20`}}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}20`,color:a.color||"#999",fontSize:7}}>{a.avatar||a.name?.charAt(0)}</span>
                <span className="font-semibold" style={{fontSize:10,color:a.color||"#666"}}>{a.name}</span>
              </div>)}
              {panelAgents.length<(debate.panel?.agents?.length||0)&&<span style={{fontSize:10,color:GIM.mutedText}}>+{(debate.panel?.agents?.length||0)-panelAgents.length} more</span>}
            </div>
          </div>

          {/* Agent perspectives — Round 1 snippets */}
          {quotes.length>0&&<div className="px-5 pb-3">
            <div className="font-bold mb-2" style={{fontSize:10,letterSpacing:"0.08em",color:"#E8734A"}}>ROUND 1 POSITIONS</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quotes.map((q,i)=>{
                const agent = panelAgents.find(a=>a.name===q.name) || {color:"#999",name:q.name};
                return <div key={i} className="p-3 rounded-xl" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent.color||"#999"}`}}>
                  <div className="font-bold mb-1" style={{fontSize:12,color:agent.color||"#444"}}>{agent.name}</div>
                  <p style={{fontSize:12,color:GIM.bodyText,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{q.response?.replace(/\*\*/g,"").slice(0,180)}...</p>
                </div>;
              })}
            </div>
          </div>}

          {/* Synthesis — the money shot */}
          {loomPreview&&<div className="mx-5 mb-5 p-4 rounded-xl" style={{background:"linear-gradient(135deg,rgba(147,51,234,0.04),rgba(45,138,110,0.04))",border:"1px solid rgba(147,51,234,0.1)"}}>
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{fontSize:12}}>&#10024;</span>
              <span className="font-bold" style={{fontSize:10,letterSpacing:"0.08em",color:GIM.primary}}>EMERGENT SYNTHESIS</span>
              <span style={{fontSize:10,color:GIM.mutedText}}>&mdash; insights no single agent produced</span>
            </div>
            <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7,fontStyle:"italic"}}>{renderInline(loomPreview)}{loomPreview.length>=300?"...":""}</p>
          </div>}

          <div className="px-5 pb-5 flex items-center gap-3">
            <button onClick={()=>onNavigate(isSession?"forge":"post",sampleDebate.id)} className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md" style={{background:GIM.primary,color:"white"}}>Read full debate &rarr;</button>
            <button onClick={()=>onNavigate("forge")} className="px-4 py-2 rounded-lg font-semibold text-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>Start your own</button>
          </div>
        </div></FadeIn>
      </section>;
    })()}

    {/* ===== LATEST ACTIVITY ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><h2 className="font-bold mb-1" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:20}}>Recent Debates &amp; Builds</h2><p className="mb-4" style={{fontFamily:GIM.fontMain,fontSize:12,color:GIM.mutedText}}>The latest from the community</p></FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Col 1: Latest Cycle / Loom */}
        <FadeIn delay={20}><div className="rounded-xl overflow-hidden" style={{background:GIM.cardBg,border:`1px solid ${GIM.border}`}}>
          <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${GIM.border}`}}>
            <div className="flex items-center gap-2"><span style={{fontSize:14}}>{"\ud83e\uddf5"}</span><span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:13,color:GIM.headingText}}>The Loom</span></div>
            <button onClick={()=>onNavigate("loom")} className="text-xs font-semibold" style={{color:GIM.primary}}>All &rarr;</button>
          </div>
          {hero?<div className="p-4 cursor-pointer transition-all hover:bg-gray-50" onClick={()=>onNavigate(hero.isJourney?"loom-cycle":"post",hero.isJourney?hero.id:hero.posts[0]?.id)}>
            <div className="font-bold mb-1" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{hero.label||"Latest Edition"}</div>
            <div className="flex flex-wrap gap-1.5 mb-2">{hero.posts.slice(0,3).map(p=><span key={p.id} className="px-2 py-0.5 rounded-full" style={{fontSize:9,fontWeight:600,background:`${PILLARS[p.pillar]?.color||GIM.primary}10`,color:PILLARS[p.pillar]?.color||GIM.primary}}>{p.title?.slice(0,30)}{p.title?.length>30?"...":""}</span>)}</div>
            <div className="flex items-center gap-3" style={{fontSize:11,color:GIM.mutedText}}><span>{hero.posts.length} posts</span>{hero.posts.some(p=>p.debate?.loom)&&<span className="font-semibold" style={{color:"#2D8A6E"}}>Loom woven</span>}</div>
          </div>:<div className="p-4 text-center"><p style={{fontSize:12,color:GIM.mutedText}}>No editions yet</p></div>}
          {/* Recent debates */}
          <div style={{borderTop:`1px solid ${GIM.border}`}}>
            {(forgeSessions||[]).slice(0,3).map(s=>{
              const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
              return <div key={s.id} onClick={()=>onNavigate("forge",s.id)} className="px-4 py-2.5 cursor-pointer transition-all hover:bg-gray-50" style={{borderBottom:`1px solid ${GIM.borderLight}`}}>
                <div className="flex items-center gap-2"><span className="font-bold" style={{fontSize:9,color:modeColors[s.mode]||GIM.mutedText,textTransform:"uppercase"}}>{s.mode}</span><span style={{fontSize:9,color:GIM.mutedText}}>{new Date(s.date).toLocaleDateString()}</span></div>
                <div className="font-medium" style={{fontSize:11,color:GIM.headingText,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.topic?.title||"Untitled"}</div>
              </div>})}
            {(!forgeSessions||forgeSessions.length===0)&&<div className="px-4 py-4 text-center"><button onClick={()=>onNavigate("forge")} className="text-xs font-semibold" style={{color:GIM.primary}}>Start a debate &rarr;</button></div>}
          </div>
        </div></FadeIn>

        {/* Col 2: Arena Runs */}
        <FadeIn delay={40}><div className="rounded-xl overflow-hidden" style={{background:GIM.cardBg,border:`1px solid ${GIM.border}`}}>
          <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${GIM.border}`}}>
            <div className="flex items-center gap-2"><span style={{fontSize:14}}>{"\ud83c\udfd7\ufe0f"}</span><span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:13,color:GIM.headingText}}>Arena</span></div>
            <button onClick={()=>onNavigate("arena")} className="text-xs font-semibold" style={{color:"#9333EA"}}>All &rarr;</button>
          </div>
          {arenaRuns.length>0?arenaRuns.slice(0,4).map(run=><div key={run.runId} onClick={()=>onNavigate("arena",run.runId)} className="px-4 py-3 cursor-pointer transition-all hover:bg-gray-50" style={{borderBottom:`1px solid ${GIM.borderLight}`}}>
            <div className="font-medium mb-1" style={{fontSize:12,color:GIM.headingText,fontFamily:GIM.fontMain,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{run.useCase?.title||"Untitled Build"}</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" style={{fontSize:10,color:GIM.mutedText}}>
                <span style={{fontSize:8}}>{"\ud83d\udc65"}</span> {run.team?.length||0} agents
              </span>
              {run.metrics?.elapsedMs&&<span style={{fontSize:10,color:GIM.mutedText}}>{Math.round(run.metrics.elapsedMs/1000)}s</span>}
              {run.completedAt&&<span style={{fontSize:10,color:GIM.mutedText}}>{new Date(run.completedAt).toLocaleDateString()}</span>}
            </div>
          </div>)
          :<div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:"rgba(147,51,234,0.08)",fontSize:20}}>{"\ud83c\udfd7\ufe0f"}</div>
            <p className="font-medium mb-1" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain}}>Multi-Agent Building</p>
            <p className="mb-3" style={{fontSize:11,color:GIM.mutedText,lineHeight:1.5}}>Agent teams auto-assemble, architect, and deliver prototypes.</p>
            <button onClick={()=>onNavigate("arena")} className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-all hover:shadow-sm" style={{background:"rgba(147,51,234,0.08)",color:"#9333EA"}}>Launch a Build &rarr;</button>
          </div>}
        </div></FadeIn>

        {/* Col 3: Academy Featured */}
        <FadeIn delay={60}><div className="rounded-xl overflow-hidden" style={{background:GIM.cardBg,border:`1px solid ${GIM.border}`}}>
          <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${GIM.border}`}}>
            <div className="flex items-center gap-2"><span style={{fontSize:14}}>{"\ud83c\udf93"}</span><span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:13,color:GIM.headingText}}>Academy</span></div>
            <button onClick={()=>onNavigate("academy")} className="text-xs font-semibold" style={{color:"#2D8A6E"}}>All Courses &rarr;</button>
          </div>
          {/* Featured courses — one from each tier */}
          {[1,2,3,4].map(tier=>{
            const tierCourse = availableCourses.find(c=>c.tier===tier);
            if(!tierCourse) return null;
            const tierLabels={1:"Foundations",2:"Protocols",3:"Production",4:"Frontier"};
            const tierColors={1:"#3B6B9B",2:"#E8734A",3:"#9333EA",4:"#2D8A6E"};
            return <div key={tier} onClick={()=>onNavigate("academy")} className="px-4 py-2.5 cursor-pointer transition-all hover:bg-gray-50" style={{borderBottom:`1px solid ${GIM.borderLight}`}}>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{fontSize:12}}>{tierCourse.icon}</span>
                <span className="font-bold" style={{fontSize:9,color:tierColors[tier],letterSpacing:"0.04em"}}>TIER {tier}: {tierLabels[tier]?.toUpperCase()}</span>
              </div>
              <div className="font-medium" style={{fontSize:12,color:GIM.headingText,fontFamily:GIM.fontMain}}>{tierCourse.title}</div>
              <div style={{fontSize:10,color:GIM.mutedText}}>{tierCourse.timeMinutes}min &middot; {tierCourse.difficulty}</div>
            </div>
          })}
          <div className="p-3 text-center" style={{background:"rgba(45,138,110,0.03)"}}>
            <span style={{fontSize:11,color:GIM.mutedText,fontFamily:GIM.fontMain}}>{courseCount} courses across 4 tiers</span>
          </div>
        </div></FadeIn>
      </div>
    </section>

    {/* ===== ON THE HORIZON (compact) ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="flex items-center justify-between mb-2"><h3 className="font-bold" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:16}}>Trending Topics</h3><p style={{fontSize:11,color:GIM.mutedText}}>Vote on what we explore next</p></div></FadeIn>
      <FadeIn delay={20}><div className="flex flex-wrap gap-2">
        {themes.slice(0,6).map(th=><button key={th.id} onClick={()=>onVoteTheme(th.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all" style={{background:th.voted?"rgba(232,115,74,0.08)":"#FFFFFF",border:`1px solid ${th.voted?"rgba(232,115,74,0.25)":"#E5E7EB"}`}} onMouseEnter={e=>{if(!th.voted)e.currentTarget.style.background="rgba(0,0,0,0.03)"}} onMouseLeave={e=>{if(!th.voted)e.currentTarget.style.background=th.voted?"rgba(232,115,74,0.08)":"#FFFFFF"}}>
          <span className="font-medium" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:13}}>{th.title}</span>
          <span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:10,background:th.voted?"rgba(232,115,74,0.15)":"#F3F4F6",color:th.voted?"#E8734A":GIM.mutedText}}>{th.votes}</span>
        </button>)}
        {themes.length>6&&<span className="self-center text-xs" style={{color:GIM.mutedText}}>+{themes.length-6} more</span>}
      </div></FadeIn>
      {currentUser&&<FadeIn delay={40}><div className="mt-3 flex gap-2">
        <input value={communityTopic} onChange={e=>setCommunityTopic(e.target.value)} placeholder="Suggest a topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:GIM.border,fontFamily:GIM.fontMain,maxWidth:320}} onKeyDown={e=>{if(e.key==="Enter"&&communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}}/>
        {topicSubmitted?<span className="self-center text-xs font-semibold" style={{color:"#2D8A6E"}}>Submitted!</span>
        :<button onClick={()=>{if(communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}} className="px-4 py-2 rounded-xl font-semibold text-xs" style={{background:communityTopic.trim()?"#E8734A":"rgba(0,0,0,0.06)",color:communityTopic.trim()?"white":GIM.mutedText}}>Submit</button>}
      </div></FadeIn>}
      {isAdmin(currentUser)&&<div className="mt-2 flex gap-2"><input value={newThemeTxt} onChange={e=>setNewThemeTxt(e.target.value)} placeholder="Add topic (admin)..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:GIM.border,fontFamily:GIM.fontMain,maxWidth:320}} onKeyDown={e=>{if(e.key==="Enter"&&newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}}/><button onClick={()=>{if(newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}} className="px-4 py-2 rounded-xl font-semibold text-xs" style={{background:"#2D8A6E",color:"white"}}>Add</button></div>}
    </section>

    {/* ===== WHY NOT CHATGPT? ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="rounded-2xl p-6" style={{background:"linear-gradient(135deg,rgba(147,51,234,0.03),rgba(45,138,110,0.03))",border:`1px solid ${GIM.border}`}}>
        <h3 className="font-bold mb-3" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:16}}>Why not just ask ChatGPT?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{background:"#FFFFFF",border:`1px solid ${GIM.border}`}}>
            <div className="font-bold mb-2" style={{fontSize:11,color:GIM.mutedText,letterSpacing:"0.05em"}}>SINGLE LLM</div>
            <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>&ldquo;Here are some perspectives on your topic...&rdquo;</p>
            <p className="mt-2" style={{fontSize:11,color:GIM.mutedText}}>One voice, listed bullet points. No tension, no discovery.</p>
          </div>
          <div className="p-4 rounded-xl" style={{background:"#FAF5FF",border:"1px solid rgba(147,51,234,0.15)"}}>
            <div className="font-bold mb-2" style={{fontSize:11,color:GIM.primary,letterSpacing:"0.05em"}}>RE{'\u00b3'} DEBATE</div>
            <p style={{fontSize:13,color:GIM.headingText,lineHeight:1.6}}>5 specialists with competing worldviews argue across 3 rounds, reference each other, and a synthesizer extracts what nobody individually saw.</p>
            <p className="mt-2 font-semibold" style={{fontSize:11,color:GIM.primary}}>Structured disagreement produces emergent insight.</p>
          </div>
        </div>
      </div></FadeIn>
    </section>
  </div>
}
