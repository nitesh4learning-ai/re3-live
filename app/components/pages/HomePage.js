"use client";
import { useState, useEffect, lazy, Suspense } from "react";
import { useApp } from '../../providers';
import { GIM, PILLARS, isAdmin } from '../../constants';
import { getCycles } from '../../utils/helpers';
import { FadeIn, renderInline } from '../shared/UIComponents';
import { listRuns as listArenaRuns } from '../../../lib/orchestration/run-store';
import { COURSES as ACADEMY_COURSES } from '../../constants/courses';

const LandingPage = lazy(() => import('./LandingPage'));

export default function HomePage(){
  const app = useApp();
  const { content, themes, articles, forgeSessions, agents, registry, editorPicks } = app;
  const { user: currentUser, nav: onNavigate, voteTheme: onVoteTheme, addTheme: onAddTheme, editTheme: onEditTheme, deleteTheme: onDeleteTheme, addEditorPick, removeEditorPick, navToForge } = app;
  const onSubmitTopic = app.addTheme;

  const cycles = getCycles(content);
  const hero = cycles[0];
  const[communityTopic,setCommunityTopic]=useState("");
  const[topicSubmitted,setTopicSubmitted]=useState(false);
  const[newThemeTxt,setNewThemeTxt]=useState("");
  const[editingTheme,setEditingTheme]=useState(null);
  const[editThemeTxt,setEditThemeTxt]=useState("");
  const[showPickModal,setShowPickModal]=useState(false);
  const[pickTab,setPickTab]=useState("debate");
  const[visitCount,setVisitCount]=useState(null);

  useEffect(()=>{
    fetch("/api/visits",{method:"POST"})
      .then(r=>r.json())
      .then(data=>{if(data.count)setVisitCount(data.count)})
      .catch(()=>{});
  },[]);

  // Show landing page for logged-out visitors
  if (!currentUser) {
    return <Suspense fallback={null}>
      <LandingPage onSignIn={() => app.setShowLogin(true)} onNavigate={onNavigate} editorPicks={editorPicks||[]} forgeSessions={forgeSessions} content={content} academyCourses={ACADEMY_COURSES} visitCount={visitCount} />
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

  return <div className="min-h-screen glass-bg-mesh" style={{paddingTop:56}}>

    {/* ===== HERO ===== */}
    <section style={{overflow:"hidden",position:"relative"}}>
      {/* Background node animation */}
      <div className="absolute inset-0 overflow-hidden" style={{opacity:0.08}}>
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
        <FadeIn><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 glass-pill">
          <span className="relative flex" style={{width:6,height:6}}><span className="animate-ping absolute inline-flex rounded-full opacity-75" style={{width:"100%",height:"100%",background:GIM.primary}}/><span className="relative inline-flex rounded-full" style={{width:6,height:6,background:GIM.primary}}/></span>
          <span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:"0.08em",color:GIM.primary}}>FREE DURING ALPHA</span>
        </div></FadeIn>

        <FadeIn delay={60}><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:"clamp(32px,5.5vw,52px)",lineHeight:1.08,letterSpacing:"-0.03em",marginBottom:16,maxWidth:720}}>
          <span style={{color:GIM.headingText}}>Drop in any topic.</span><br/>
          <span style={{whiteSpace:"nowrap"}}><span style={{color:"#E8734A"}}>5 AI Agents</span><span style={{color:GIM.headingText}}> debate and build it.</span></span><br/>
          <span style={{color:GIM.primary,whiteSpace:"nowrap"}}>You get the insights nobody saw.</span>
        </h1></FadeIn>

        <FadeIn delay={100}><p style={{fontFamily:GIM.fontMain,fontSize:"clamp(14px,1.5vw,17px)",maxWidth:560,color:GIM.bodyText,lineHeight:1.7,marginBottom:28}}>Re{'\u00b3'} assembles a panel from {totalAgents.toLocaleString()}+ AI agents &mdash; CTOs, economists, ethicists, scientists &mdash; who argue your topic across 3 structured rounds. Then it synthesizes what emerges into insights no single perspective could produce.</p></FadeIn>

        <FadeIn delay={130}><div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={()=>onNavigate("forge")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-lg" style={{fontFamily:GIM.fontMain,background:GIM.primary,color:"white",borderRadius:GIM.buttonRadius,boxShadow:"0 4px 16px rgba(147,51,234,0.25)"}}>Start a Debate &rarr;</button>
          <button onClick={()=>onNavigate("loom")} className="px-6 py-3 font-semibold text-sm transition-all hover:shadow-sm glass-pill" style={{fontFamily:GIM.fontMain,color:GIM.bodyText,borderRadius:GIM.buttonRadius}}>See past debates</button>
        </div></FadeIn>

        {visitCount!==null&&<FadeIn delay={160}><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill" style={{background:"rgba(255,255,255,0.55)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.5)"}}>
          <span className="w-2 h-2 rounded-full" style={{background:"#2D8A6E"}}/>
          <span className="font-semibold" style={{fontFamily:GIM.fontMain,fontSize:13,color:GIM.bodyText}}>Site Visits: {visitCount.toLocaleString()}</span>
        </div></FadeIn>}
      </div>
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
        <FadeIn><div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:"rgba(147,51,234,0.08)",color:GIM.primary,border:"1px solid rgba(147,51,234,0.12)"}}>LIVE EXAMPLE</span>
              <span style={{fontFamily:GIM.fontMain,fontSize:11,color:GIM.mutedText}}>A real debate from this platform</span>
            </div>
            <h3 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:18,color:GIM.headingText}}>{title}</h3>
            <div className="flex items-center gap-2 mt-2 mb-3">
              {panelAgents.map((a,i)=><div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full glass-pill" style={{background:`${a.color||"#999"}08`}}>
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
                return <div key={i} className="p-3 rounded-xl" style={{background:"rgba(255,255,255,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderLeft:`3px solid ${agent.color||"#999"}`,border:`1px solid rgba(255,255,255,0.4)`,borderLeftWidth:3,borderLeftColor:agent.color||"#999"}}>
                  <div className="font-bold mb-1" style={{fontSize:12,color:agent.color||"#444"}}>{agent.name}</div>
                  <p style={{fontSize:12,color:GIM.bodyText,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{q.response?.replace(/\*\*/g,"").slice(0,180)}...</p>
                </div>;
              })}
            </div>
          </div>}

          {/* Synthesis — the money shot */}
          {loomPreview&&<div className="mx-5 mb-5 p-4 rounded-xl glass-card-accent">
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{fontSize:12}}>&#10024;</span>
              <span className="font-bold" style={{fontSize:10,letterSpacing:"0.08em",color:GIM.primary}}>EMERGENT SYNTHESIS</span>
              <span style={{fontSize:10,color:GIM.mutedText}}>&mdash; insights no single agent produced</span>
            </div>
            <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.7,fontStyle:"italic"}}>{renderInline(loomPreview)}{loomPreview.length>=300?"...":""}</p>
          </div>}

          <div className="px-5 pb-5 flex items-center gap-3">
            <button onClick={()=>onNavigate(isSession?"forge":"post",sampleDebate.id)} className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md" style={{background:GIM.primary,color:"white",boxShadow:"0 2px 12px rgba(147,51,234,0.2)"}}>Read full debate &rarr;</button>
            <button onClick={()=>onNavigate("forge")} className="px-4 py-2 rounded-lg font-semibold text-sm glass-pill" style={{color:GIM.bodyText}}>Start your own</button>
          </div>
        </div></FadeIn>
      </section>;
    })()}

    {/* ===== EDITOR'S PICKS ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold mb-0.5" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:20}}>Editor&rsquo;s Picks</h2>
          <p style={{fontFamily:GIM.fontMain,fontSize:12,color:GIM.mutedText}}>Hand-picked highlights from the platform</p>
        </div>
        {isAdmin(currentUser)&&<button onClick={()=>setShowPickModal(true)} className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:GIM.primary,color:"white",boxShadow:"0 2px 12px rgba(147,51,234,0.2)"}}>+ Add Pick</button>}
      </div></FadeIn>

      {editorPicks.length>0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {editorPicks.map((pick,i)=>{
          const admin = isAdmin(currentUser);
          // Resolve live data from source
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
              onClick: ()=>onNavigate(session?"forge":"post",pick.sourceId),
            };
          } else if(pick.type==="arena"){
            const run = arenaRuns.find(r=>r.runId===pick.sourceId);
            data={
              title: run?.useCase?.title||pick.title,
              icon:"\ud83c\udfd7\ufe0f", color:"#9333EA", badge:"ARENA",
              subtitle: run ? `${run.team?.length||0} agents${run.metrics?.elapsedMs?" \u00b7 "+Math.round(run.metrics.elapsedMs/1000)+"s":""}` : null,
              date: run?.completedAt ? new Date(run.completedAt).toLocaleDateString() : null,
              onClick: ()=>onNavigate("arena",pick.sourceId),
            };
          } else {
            const course = ACADEMY_COURSES?.find(c=>c.id===pick.sourceId);
            const tierColors={1:"#3B6B9B",2:"#E8734A",3:"#9333EA",4:"#2D8A6E"};
            data={
              title: course?.title||pick.title,
              icon: course?.icon||"\ud83c\udf93", color: tierColors[course?.tier]||"#2D8A6E",
              badge: course ? `TIER ${course.tier}` : "COURSE",
              subtitle: course ? `${course.timeMinutes}min \u00b7 ${course.difficulty}` : null,
              date: null,
              onClick: ()=>onNavigate("academy",pick.sourceId),
            };
          }
          return <FadeIn key={pick.id} delay={i*40}><div className="glass-card rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md group relative" onClick={data.onClick} style={{borderLeft:`3px solid ${data.color}`}}>
            {admin&&<button onClick={e=>{e.stopPropagation();if(window.confirm("Remove this pick?"))removeEditorPick(pick.id)}} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50" style={{fontSize:12,color:GIM.mutedText,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(4px)",zIndex:2}} title="Remove pick">{"\u2715"}</button>}
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
          </div></FadeIn>;
        })}
      </div>
      : <FadeIn><div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:"rgba(147,51,234,0.06)",fontSize:24,border:"1px solid rgba(147,51,234,0.1)"}}>{"\ud83d\udccc"}</div>
          <p className="font-medium mb-1" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>
            {isAdmin(currentUser) ? "No picks yet" : "Curated picks coming soon"}
          </p>
          <p className="mb-4" style={{fontSize:12,color:GIM.mutedText,lineHeight:1.5}}>
            {isAdmin(currentUser) ? "Showcase the best debates, builds, and courses from the platform." : "The editor is curating the best content from the platform."}
          </p>
          {isAdmin(currentUser)&&<button onClick={()=>setShowPickModal(true)} className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:GIM.primary,color:"white",boxShadow:"0 2px 12px rgba(147,51,234,0.2)"}}>Add your first pick &rarr;</button>}
        </div></FadeIn>}
    </section>

    {/* ===== ADD PICK MODAL ===== */}
    {showPickModal&&<div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)setShowPickModal(false)}}>
      <div className="glass-card rounded-2xl w-full mx-4" style={{maxWidth:540,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between" style={{borderBottom:"1px solid rgba(255,255,255,0.3)"}}>
          <div>
            <h3 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:17,color:GIM.headingText}}>Add Editor&rsquo;s Pick</h3>
            <p style={{fontSize:11,color:GIM.mutedText}}>Select content to feature on the homepage</p>
          </div>
          <button onClick={()=>setShowPickModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/50" style={{fontSize:16,color:GIM.mutedText}}>{"\u2715"}</button>
        </div>
        {/* Tab bar */}
        <div className="flex gap-1 px-5 pt-3">
          {[{key:"debate",label:"Debates",icon:"\ud83e\uddf5",color:"#E8734A"},{key:"arena",label:"Arena",icon:"\ud83c\udfd7\ufe0f",color:"#9333EA"},{key:"course",label:"Academy",icon:"\ud83c\udf93",color:"#2D8A6E"}].map(tab=>
            <button key={tab.key} onClick={()=>setPickTab(tab.key)} className="px-3 py-2 rounded-lg font-semibold text-xs transition-all" style={{background:pickTab===tab.key?`${tab.color}12`:"transparent",color:pickTab===tab.key?tab.color:GIM.mutedText,border:pickTab===tab.key?`1px solid ${tab.color}20`:"1px solid transparent"}}>
              <span style={{marginRight:4}}>{tab.icon}</span>{tab.label}
            </button>
          )}
        </div>
        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 py-3" style={{maxHeight:400}}>
          {pickTab==="debate"&&(()=>{
            const items = (forgeSessions||[]).filter(s=>s.topic?.title);
            if(items.length===0) return <div className="py-8 text-center"><p style={{fontSize:12,color:GIM.mutedText}}>No debates available yet</p></div>;
            return items.map(s=>{
              const already = editorPicks.some(p=>p.sourceId===s.id);
              const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
              return <div key={s.id} className="flex items-center justify-between py-3" style={{borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold" style={{fontSize:9,color:modeColors[s.mode]||GIM.mutedText,textTransform:"uppercase"}}>{s.mode}</span>
                    <span style={{fontSize:9,color:GIM.mutedText}}>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                  <div className="font-medium" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.topic?.title}</div>
                  <div style={{fontSize:10,color:GIM.mutedText}}>{s.results?.panel?.agents?.length||0} agents &middot; {s.results?.rounds?.length||0} rounds</div>
                </div>
                {already
                  ? <span className="px-3 py-1.5 rounded-lg font-semibold text-xs" style={{color:"#2D8A6E",background:"rgba(45,138,110,0.06)",border:"1px solid rgba(45,138,110,0.1)"}}>Added {"\u2713"}</span>
                  : <button onClick={()=>addEditorPick({id:"ep_"+Date.now(),type:"debate",sourceId:s.id,title:s.topic?.title||"Untitled",addedAt:Date.now()})} className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:shadow-sm" style={{background:GIM.primary,color:"white"}}>Add</button>
                }
              </div>;
            });
          })()}
          {pickTab==="arena"&&(()=>{
            if(arenaRuns.length===0) return <div className="py-8 text-center"><p style={{fontSize:12,color:GIM.mutedText}}>No arena runs available yet</p></div>;
            return arenaRuns.map(run=>{
              const already = editorPicks.some(p=>p.sourceId===run.runId);
              return <div key={run.runId} className="flex items-center justify-between py-3" style={{borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-medium" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{run.useCase?.title||"Untitled Build"}</div>
                  <div className="flex items-center gap-2" style={{fontSize:10,color:GIM.mutedText}}>
                    <span>{run.team?.length||0} agents</span>
                    {run.metrics?.elapsedMs&&<span>{Math.round(run.metrics.elapsedMs/1000)}s</span>}
                    {run.completedAt&&<span>{new Date(run.completedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                {already
                  ? <span className="px-3 py-1.5 rounded-lg font-semibold text-xs" style={{color:"#2D8A6E",background:"rgba(45,138,110,0.06)",border:"1px solid rgba(45,138,110,0.1)"}}>Added {"\u2713"}</span>
                  : <button onClick={()=>addEditorPick({id:"ep_"+Date.now(),type:"arena",sourceId:run.runId,title:run.useCase?.title||"Untitled",addedAt:Date.now()})} className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:shadow-sm" style={{background:"#9333EA",color:"white"}}>Add</button>
                }
              </div>;
            });
          })()}
          {pickTab==="course"&&(()=>{
            const courses = ACADEMY_COURSES?.filter(c=>c.status==="available")||[];
            if(courses.length===0) return <div className="py-8 text-center"><p style={{fontSize:12,color:GIM.mutedText}}>No courses available yet</p></div>;
            const tierColors={1:"#3B6B9B",2:"#E8734A",3:"#9333EA",4:"#2D8A6E"};
            return courses.map(c=>{
              const already = editorPicks.some(p=>p.sourceId===c.id);
              return <div key={c.id} className="flex items-center justify-between py-3" style={{borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{fontSize:13}}>{c.icon}</span>
                    <span className="font-bold" style={{fontSize:9,color:tierColors[c.tier],letterSpacing:"0.04em"}}>TIER {c.tier}</span>
                  </div>
                  <div className="font-medium" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain}}>{c.title}</div>
                  <div style={{fontSize:10,color:GIM.mutedText}}>{c.timeMinutes}min &middot; {c.difficulty}</div>
                </div>
                {already
                  ? <span className="px-3 py-1.5 rounded-lg font-semibold text-xs" style={{color:"#2D8A6E",background:"rgba(45,138,110,0.06)",border:"1px solid rgba(45,138,110,0.1)"}}>Added {"\u2713"}</span>
                  : <button onClick={()=>addEditorPick({id:"ep_"+Date.now(),type:"course",sourceId:c.id,title:c.title,addedAt:Date.now()})} className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:shadow-sm" style={{background:"#2D8A6E",color:"white"}}>Add</button>
                }
              </div>;
            });
          })()}
        </div>
      </div>
    </div>}

    {/* ===== ON THE HORIZON (compact) ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="flex items-center justify-between mb-2"><h3 className="font-bold" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:16}}>Trending Topics</h3><p style={{fontSize:11,color:GIM.mutedText}}>Vote on what we explore next</p></div></FadeIn>
      <FadeIn delay={20}><div className="flex flex-wrap gap-2">
        {themes.slice(0,6).map(th=>{
          const admin = isAdmin(currentUser);
          // Inline edit mode
          if(admin && editingTheme===th.id) return <div key={th.id} className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-xl" style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:"1px solid rgba(147,51,234,0.25)",boxShadow:"0 2px 12px rgba(147,51,234,0.08)"}}>
            <input autoFocus value={editThemeTxt} onChange={e=>setEditThemeTxt(e.target.value)} className="px-2 py-1 rounded-lg text-sm focus:outline-none" style={{fontFamily:GIM.fontMain,fontSize:13,color:GIM.headingText,background:"rgba(255,255,255,0.6)",border:"1px solid rgba(147,51,234,0.15)",width:Math.max(120,editThemeTxt.length*8+20)}} onKeyDown={e=>{if(e.key==="Enter"&&editThemeTxt.trim()){onEditTheme(th.id,editThemeTxt.trim());setEditingTheme(null)}if(e.key==="Escape")setEditingTheme(null)}}/>
            <button onClick={()=>{if(editThemeTxt.trim()){onEditTheme(th.id,editThemeTxt.trim());setEditingTheme(null)}}} title="Save" className="p-1 rounded-md transition-all hover:bg-green-50" style={{fontSize:13,lineHeight:1}}>✓</button>
            <button onClick={()=>setEditingTheme(null)} title="Cancel" className="p-1 rounded-md transition-all hover:bg-red-50" style={{fontSize:13,lineHeight:1,color:GIM.mutedText}}>✕</button>
          </div>;
          // Normal topic pill with admin controls
          return <div key={th.id} className="inline-flex items-center gap-0 rounded-xl transition-all group" style={{background:th.voted?"rgba(232,115,74,0.08)":"rgba(255,255,255,0.55)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:`1px solid ${th.voted?"rgba(232,115,74,0.25)":"rgba(255,255,255,0.5)"}`,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}} onMouseEnter={e=>{if(!th.voted)e.currentTarget.style.background="rgba(255,255,255,0.75)"}} onMouseLeave={e=>{e.currentTarget.style.background=th.voted?"rgba(232,115,74,0.08)":"rgba(255,255,255,0.55)"}}>
            <button onClick={()=>onVoteTheme(th.id)} className="inline-flex items-center gap-2 px-3 py-2 text-sm">
              <span className="font-medium" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:13}}>{th.title}</span>
              <span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:10,background:th.voted?"rgba(232,115,74,0.15)":"rgba(0,0,0,0.04)",color:th.voted?"#E8734A":GIM.mutedText}}>{th.votes}</span>
            </button>
            {admin&&<span className="inline-flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e=>{e.stopPropagation();setEditingTheme(th.id);setEditThemeTxt(th.title)}} title="Edit topic" className="p-1 rounded-md transition-all hover:bg-purple-50" style={{fontSize:11,lineHeight:1,color:GIM.mutedText}}>✏️</button>
              <button onClick={e=>{e.stopPropagation();if(window.confirm(`Delete "${th.title}"?`))onDeleteTheme(th.id)}} title="Delete topic" className="p-1 rounded-md transition-all hover:bg-red-50" style={{fontSize:11,lineHeight:1,color:GIM.mutedText}}>🗑️</button>
            </span>}
          </div>;
        })}
        {themes.length>6&&<span className="self-center text-xs" style={{color:GIM.mutedText}}>+{themes.length-6} more</span>}
      </div></FadeIn>
      {currentUser&&<FadeIn delay={40}><div className="mt-3 flex gap-2">
        <input value={communityTopic} onChange={e=>setCommunityTopic(e.target.value)} placeholder="Suggest a topic..." className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none" style={{background:"rgba(255,255,255,0.55)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.5)",fontFamily:GIM.fontMain,maxWidth:320,boxShadow:"inset 0 1px 2px rgba(0,0,0,0.04)"}} onKeyDown={e=>{if(e.key==="Enter"&&communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}}/>
        {topicSubmitted?<span className="self-center text-xs font-semibold" style={{color:"#2D8A6E"}}>Submitted!</span>
        :<button onClick={()=>{if(communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}} className="px-4 py-2 rounded-xl font-semibold text-xs" style={{background:communityTopic.trim()?"#E8734A":"rgba(0,0,0,0.06)",color:communityTopic.trim()?"white":GIM.mutedText}}>Submit</button>}
      </div></FadeIn>}
      {isAdmin(currentUser)&&<div className="mt-2 flex gap-2"><input value={newThemeTxt} onChange={e=>setNewThemeTxt(e.target.value)} placeholder="Add topic (admin)..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:GIM.border,fontFamily:GIM.fontMain,maxWidth:320}} onKeyDown={e=>{if(e.key==="Enter"&&newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}}/><button onClick={()=>{if(newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}} className="px-4 py-2 rounded-xl font-semibold text-xs" style={{background:"#2D8A6E",color:"white"}}>Add</button></div>}
    </section>

    {/* ===== WHY NOT CHATGPT? ===== */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <FadeIn><div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold mb-3" style={{fontFamily:GIM.fontMain,color:GIM.headingText,fontSize:16}}>Why not just ask ChatGPT?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{background:"rgba(255,255,255,0.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.5)"}}>
            <div className="font-bold mb-2" style={{fontSize:11,color:GIM.mutedText,letterSpacing:"0.05em"}}>SINGLE LLM</div>
            <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>&ldquo;Here are some perspectives on your topic...&rdquo;</p>
            <p className="mt-2" style={{fontSize:11,color:GIM.mutedText}}>One voice, listed bullet points. No tension, no discovery.</p>
          </div>
          <div className="p-4 rounded-xl glass-card-accent">
            <div className="font-bold mb-2" style={{fontSize:11,color:GIM.primary,letterSpacing:"0.05em"}}>RE{'\u00b3'} DEBATE</div>
            <p style={{fontSize:13,color:GIM.headingText,lineHeight:1.6}}>5 specialists with competing worldviews argue across 3 rounds, reference each other, and a synthesizer extracts what nobody individually saw.</p>
            <p className="mt-2 font-semibold" style={{fontSize:11,color:GIM.primary}}>Structured disagreement produces emergent insight.</p>
          </div>
        </div>
      </div></FadeIn>
    </section>
  </div>
}
