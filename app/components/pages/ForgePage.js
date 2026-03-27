"use client";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { PILLARS, ORCHESTRATORS, INIT_AGENTS, isAdmin } from '../../constants';
import { getCycles } from '../../utils/helpers';
import { FadeIn, PillarTag, ShareButton, renderInline } from '../shared/UIComponents';
import { AgentWorkshop, AgentPanel, DebateInsightsPanel } from '../shared/DebateComponents';
import { authFetch } from '../../utils/firebase-client';

export default function ForgePage(){
  const app = useApp();
  const { content, themes, agents, registry, registryIndex, forgeSessions, forgePreload } = app;
  const { user: currentUser, nav: onNavigate, saveForgeSession: onSaveForgeSession, deleteForgeSession: onDeleteForgeSession, addPost: onPostGenerated, autoComment: onAutoComment, updatePost: onUpdatePost } = app;

  const params = useParams();
  const sessionId = params?.sessionId;

  const[topicSource,setTopicSource]=useState(null);
  const[selectedTopic,setSelectedTopic]=useState(null);
  const[workshopActive,setWorkshopActive]=useState(false);
  const[customTitle,setCustomTitle]=useState("");
  const[customText,setCustomText]=useState("");
  const[urlInput,setUrlInput]=useState("");
  const[viewingSession,setViewingSession]=useState(null);
  const admin=isAdmin(currentUser);
  const cycles=getCycles(content);

  // Consume forgePreload
  useEffect(()=>{if(forgePreload){setSelectedTopic(forgePreload);setWorkshopActive(true)}},[forgePreload]);

  // Deep link: auto-open session by ID
  useEffect(()=>{if(sessionId&&forgeSessions?.length>0){const s=forgeSessions.find(fs=>fs.id===sessionId);if(s)setViewingSession(s)}},[sessionId,forgeSessions]);

  const confirmTopic=(topic)=>{setSelectedTopic(topic);setTopicSource(null)};
  const startSession=()=>{if(selectedTopic)setWorkshopActive(true)};
  const resetSession=()=>{setSelectedTopic(null);setWorkshopActive(false);setTopicSource(null);setCustomTitle("");setCustomText("");setUrlInput("")};

  const handleSaveSession=(sessionData)=>{
    if(!admin||!onSaveForgeSession)return;
    onSaveForgeSession({id:"fs_"+Date.now(),topic:selectedTopic,date:new Date().toISOString(),mode:sessionData.mode,results:sessionData.results,status:"saved"});
  };

  // When a cycle debate completes, save debate data back to the cycle posts
  const handleDebateComplete=(debate)=>{
    if(selectedTopic?.sourceType==="cycle"&&(selectedTopic?.cycleId||selectedTopic?.cycleDate)&&onUpdatePost){
      const cyclePosts=selectedTopic.cycleId?content.filter(c=>c.cycleId===selectedTopic.cycleId):content.filter(c=>c.sundayCycle===selectedTopic.cycleDate);
      cyclePosts.forEach(p=>{onUpdatePost({...p,debate})});
    }
  };

  // Viewing a saved session
  if(viewingSession){
    const s=viewingSession;
    const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
    return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <FadeIn><div className="flex items-center gap-3 mb-6">
        <button onClick={()=>{setViewingSession(null);onNavigate("forge")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.5)"}}>← Back</button>
        <div><h1 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>{s.topic?.title||"Session"}</h1>
          <div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${modeColors[s.mode]||"#999"}15`,color:modeColors[s.mode]||"#999"}}>{s.mode}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.35)"}}>{new Date(s.date).toLocaleDateString()}</span></div>
        </div>
        <div className="ml-auto"><ShareButton title={`Re³ Ada: ${s.topic?.title}`} text={`${s.mode} session on "${s.topic?.title}"`}/></div>
      </div></FadeIn>
      <FadeIn delay={60}><div className="p-4 rounded-2xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
        {s.mode==="debate"&&s.results&&<div>
          {s.results.panel?.agents&&<div className="mb-5"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6",letterSpacing:"0.05em"}}>DEBATE PANEL</h4>
            <div className="flex flex-wrap gap-2 mb-2">{s.results.panel.agents.map((a,ai)=><span key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:`${a.color||"#999"}10`,border:`1px solid ${a.color||"#999"}25`}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",fontSize:8}}>{a.avatar||a.name?.charAt(0)}</span>
              <span className="text-xs font-semibold" style={{color:a.color||"#666"}}>{a.name}</span>
            </span>)}</div>
            {s.results.panel.rationale&&<p className="text-xs" style={{color:"#888",lineHeight:1.6,fontStyle:"italic"}}>{s.results.panel.rationale}</p>}
          </div>}
          {s.results.rounds?.length>0&&<div className="mb-5"><h4 className="font-bold mb-2" style={{fontSize:13,color:"#E8734A",letterSpacing:"0.05em"}}>DEBATE ROUNDS ({s.results.rounds.length})</h4>
            {s.results.rounds.map((round,ri)=><div key={ri} className="mb-4"><span className="font-bold" style={{fontSize:13,color:"#8B5CF6"}}>Round {ri+1}</span>
              <div className="space-y-2 mt-1.5">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{
                const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);
                const truncated=r.response.length>300?r.response.slice(0,300)+"...":r.response;
                return <div key={idx} className="p-3 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}>
                  <div className="flex items-center gap-2 mb-1.5"><span className="font-bold" style={{fontSize:14,color:agent?.color||"#444"}}>{r.name||agent?.name||"Agent"}</span><span style={{fontSize:11,color:"#999"}}>{agent?.category||""}</span></div>
                  <p style={{fontSize:14,color:"#333",lineHeight:1.7}}>{renderInline(truncated)}</p>
                </div>})}</div>
            </div>)}
          </div>}
          {s.results.streams?.length>0&&<div className="mb-5"><h4 className="font-bold mb-2" style={{fontSize:13,color:"#2D8A6E",letterSpacing:"0.05em"}}>KEY THEMES</h4>
            {s.results.streams.map((stream,si)=><div key={si} className="mb-2 p-3 rounded-lg" style={{background:"#F9FAFB"}}>
              <span className="font-bold" style={{fontSize:14,color:"#111827"}}>{stream.title}</span>
              <div className="mt-1 space-y-1">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2" style={{fontSize:13}}><span className="font-bold flex-shrink-0" style={{color:"#666"}}>{entry.agent}</span><span style={{color:"#444"}}>{entry.excerpt}</span></div>)}</div>
            </div>)}
          </div>}
          {s.results.loom&&<div><h4 className="font-bold mb-2" style={{fontSize:13,color:"#3B6B9B",letterSpacing:"0.05em"}}>SYNTHESIS</h4>
            <div style={{fontSize:14,color:"#333",lineHeight:1.8}}>{s.results.loom.split("\n\n").map((p,i)=><p key={i} className="mb-2">{renderInline(p)}</p>)}</div>
          </div>}
        </div>}
        {s.mode==="ideate"&&s.results?.clusters?.map((cl,ci)=><div key={ci} className="mb-3"><h4 className="font-bold text-sm mb-1" style={{color:"#3B6B9B"}}>{cl.theme}</h4><div className="space-y-1">{(cl.ideas||[]).map((idea,ii)=><div key={ii} className="p-2 rounded-lg text-xs" style={{background:"rgba(0,0,0,0.02)"}}><span className="font-bold" style={{color:idea.color||"#999"}}>{idea.agent}: </span>{idea.concept}</div>)}</div></div>)}
        {s.mode==="implement"&&s.results?.architecture&&<div><p className="mb-3" style={{fontSize:13,color:"#555",lineHeight:1.7}}>{s.results.architecture}</p>{s.results.components?.filter(c=>c.status==="success").map((comp,i)=><div key={i} className="p-2 rounded-lg mb-1 text-xs" style={{background:"rgba(0,0,0,0.02)"}}><span className="font-bold" style={{color:comp.color||"#999"}}>{comp.agent}: </span>{comp.component} — {comp.approach?.slice(0,150)}</div>)}</div>}
        {!s.results&&<p style={{fontSize:13,color:"rgba(0,0,0,0.3)"}}>Session data not available.</p>}
      </div></FadeIn>
    </div></div>;
  }

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    {/* Header */}
    <FadeIn><div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{background:"#F3E8FF"}}><span style={{fontSize:24}}>🔨</span></div>
      <h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(24px,4vw,36px)"}}>Debate Lab</h1>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(0,0,0,0.45)"}}>Submit any topic. 5 AI specialists debate and build it from every angle. You get the synthesis.</p>
    </div></FadeIn>

    {/* SECTION A: Cycle Creator (admin only) */}
    {admin&&onPostGenerated&&<FadeIn delay={40}><div className="mb-8">
      <div className="flex items-center gap-2 mb-4"><span style={{fontSize:18}}>⚡</span><div><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#9333EA",fontSize:20}}>Edition Creator</h2><p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(0,0,0,0.4)"}}>Generate a new edition — 3 articles across Rethink, Rediscover, Reinvent</p></div></div>
      <AgentPanel onPostGenerated={onPostGenerated} onAutoComment={onAutoComment} agents={agents} registry={registry}/>
    </div></FadeIn>}

    {/* Divider between sections */}
    {admin&&onPostGenerated&&<div className="mb-8 flex items-center gap-3"><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/><span className="text-xs font-bold px-3 py-1" style={{color:"#9CA3AF"}}>OR</span><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/></div>}

    {/* SECTION B: Brainstorm Workshop */}
    <FadeIn delay={60}><div className="mb-8">
      <div className="flex items-center gap-2 mb-4"><span style={{fontSize:18}}>🧠</span><div><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#9333EA",fontSize:20}}>Brainstorm Workshop</h2><p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(0,0,0,0.4)"}}>Pick any topic and run Debate, Ideate, or Implement sessions with AI agents</p></div></div>

    {/* Topic Picker — only show if no active workshop */}
    {!workshopActive&&<div className="rounded-2xl p-5 mb-6" style={{background:"white",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Pick a Topic</h3>

      {/* Source buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[["loom","📖 From Loom"],["horizon","🔮 From Horizon"],["custom","✏️ Custom Topic"],["url","🔗 From URL"]].map(([key,label])=>
          <button key={key} onClick={()=>setTopicSource(topicSource===key?null:key)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{background:topicSource===key?"#F3E8FF":"#FFFFFF",color:topicSource===key?"#9333EA":"#4B5563",border:`1px solid ${topicSource===key?"rgba(147,51,234,0.3)":"#E5E7EB"}`}}>{label}</button>
        )}
      </div>

      {/* Source panels */}
      {topicSource==="loom"&&<div className="space-y-1.5 mb-4" style={{maxHeight:300,overflowY:"auto"}}>
        {/* Full cycles first — debate all 3 articles together */}
        {cycles.slice(0,10).map(c=>{
          const fullText=c.posts.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n");
          return <button key={c.id} onClick={()=>confirmTopic({title:c.throughLineQuestion||c.headline||c.rethink?.title||"Edition "+c.number,text:fullText,sourceType:"cycle",cycleDate:c.date,cycleId:c.id})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(139,92,246,0.03)",border:"1px solid rgba(139,92,246,0.1)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(139,92,246,0.03)"}>
            <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:"#F3E8FF",color:"#9333EA"}}>Full Edition {c.number}</span>{c.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E"}}>Connected Journey</span>}</div>
            <span className="font-semibold text-sm" style={{color:"#111827"}}>{c.throughLineQuestion||c.headline||"Edition "+c.number}</span>
            <div className="flex items-center gap-2 mt-1">{(c.dynamicPillars?c.posts:([c.rethink,c.rediscover,c.reinvent].filter(Boolean))).map((post,i)=>{const dp=c.dynamicPillars?.[i];const color=dp?.color||PILLARS[post?.pillar]?.color||"#999";return post?<span key={post.id||i} className="text-xs" style={{color}}>{post.title?.slice(0,30)}...</span>:null})}</div>
          </button>})}
        <div className="my-2 flex items-center gap-2"><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/><span className="text-xs" style={{color:"#CCC"}}>or pick a single article</span><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/></div>
        {/* Individual posts as fallback */}
        {cycles.flatMap(c=>c.posts).slice(0,15).map(post=>
        <button key={post.id} onClick={()=>confirmTopic({title:post.title,text:post.paragraphs?.[0]||"",sourceType:"loom"})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(0,0,0,0.02)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.02)"}>
          <div className="flex items-center gap-2"><PillarTag pillar={post.pillar}/><span className="font-semibold text-sm" style={{color:"#111827"}}>{post.title}</span></div>
        </button>
      )}</div>}

      {topicSource==="horizon"&&<div className="space-y-1.5 mb-4">{themes.map(th=>
        <button key={th.id} onClick={()=>confirmTopic({title:th.title,text:"",sourceType:"horizon"})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(0,0,0,0.02)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(232,115,74,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.02)"}>
          <span className="font-semibold text-sm" style={{color:"#111827"}}>{th.title}</span>
          <span className="ml-2 text-xs" style={{color:"rgba(0,0,0,0.3)"}}>{th.votes} votes</span>
        </button>
      )}</div>}

      {topicSource==="custom"&&<div className="mb-4 space-y-2">
        <input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder="Topic title..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/>
        <textarea value={customText} onChange={e=>setCustomText(e.target.value)} placeholder="Context or description (optional)..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",minHeight:80,resize:"vertical"}}/>
        <button onClick={()=>{if(customTitle.trim())confirmTopic({title:customTitle.trim(),text:customText.trim(),sourceType:"custom"})}} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}} disabled={!customTitle.trim()}>Set Topic</button>
      </div>}

      {topicSource==="url"&&<div className="mb-4 space-y-2">
        <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/>
        <button onClick={()=>{if(urlInput.trim())confirmTopic({title:urlInput.trim(),text:"Discuss content from: "+urlInput.trim(),sourceType:"url"})}} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}} disabled={!urlInput.trim()}>Set URL Topic</button>
      </div>}

      {/* Selected topic display */}
      {selectedTopic&&<div className="p-3 rounded-xl mb-4" style={{background:"#FAF5FF",border:"1px solid rgba(45,138,110,0.15)"}}>
        <div className="flex items-center justify-between"><div>
          <span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.3)"}}>SELECTED TOPIC</span>
          <h4 className="font-bold text-sm mt-0.5" style={{color:"#111827"}}>{selectedTopic.title}</h4>
          {selectedTopic.text&&<p className="text-xs mt-1" style={{color:"rgba(0,0,0,0.4)",lineHeight:1.5}}>{selectedTopic.text.slice(0,200)}{selectedTopic.text.length>200?"...":""}</p>}
        </div><button onClick={()=>setSelectedTopic(null)} className="text-xs" style={{color:"rgba(0,0,0,0.3)"}}>✕</button></div>
      </div>}

      {/* Start session button */}
      {selectedTopic&&<button onClick={startSession} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Start Session →</button>}
    </div>}

    {/* Active Workshop */}
    {workshopActive&&selectedTopic&&<div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div><span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.3)"}}>FORGING</span><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>{selectedTopic.title}</h2></div>
        <div className="flex items-center gap-2"><ShareButton title={`Re³ Debate Lab: ${selectedTopic.title}`} text={`Exploring "${selectedTopic.title}" in Debate Lab`}/><button onClick={resetSession} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.4)"}}>New Topic</button></div>
      </div>
      <AgentWorkshop key={selectedTopic?.title||''} topic={selectedTopic} agents={agents} registry={registry} registryIndex={registryIndex} onDebateComplete={handleDebateComplete} onSaveSession={handleSaveSession} currentUser={currentUser}/>
    </div>}
    </div></FadeIn>

    {/* Saved Sessions */}
    {forgeSessions&&forgeSessions.length>0&&<FadeIn delay={120}><div className="rounded-2xl p-5" style={{background:"white",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Saved Sessions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{forgeSessions.map(s=>{
        const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
        const modeIcons={debate:"⚔️",ideate:"💡",implement:"🔨"};
        return <div key={s.id} className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" style={{background:"rgba(0,0,0,0.02)",border:"1px solid #E5E7EB"}} onClick={()=>onNavigate("forge",s.id)}>
          <div className="flex items-center gap-2 mb-1"><span style={{fontSize:14}}>{modeIcons[s.mode]||"📝"}</span><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:`${modeColors[s.mode]||"#999"}15`,color:modeColors[s.mode]||"#999"}}>{s.mode}</span><span style={{fontSize:10,color:"rgba(0,0,0,0.3)"}}>{new Date(s.date).toLocaleDateString()}</span></div>
          <h4 className="font-semibold text-sm" style={{color:"#111827"}}>{s.topic?.title||"Untitled"}</h4>
          {admin&&onDeleteForgeSession&&<button onClick={e=>{e.stopPropagation();onDeleteForgeSession(s.id)}} className="text-xs mt-1 font-semibold transition-all" style={{color:"rgba(229,62,62,0.5)"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(229,62,62,1)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(229,62,62,0.5)"}>Delete</button>}
        </div>
      })}</div>
    </div></FadeIn>}

    {/* Debate Insights Dashboard */}
    <FadeIn delay={140}><DebateInsightsPanel content={content} forgeSessions={forgeSessions}/></FadeIn>

  </div></div>;
}
