"use client";
import { useState, useEffect, useRef } from "react";
import { ORCHESTRATORS, INIT_AGENTS, INIT_CONTENT, MODEL_PROVIDERS, PILLARS, isAdmin } from '../../constants';
import { getAuthor, getCycles, fmtS } from '../../utils/helpers';
import { authFetch } from '../../utils/firebase-client';
import { FadeIn, PillarTag, renderInline } from './UIComponents';
import { OrchestratorAvatar } from './Icons';

// ==================== DEBATE PANEL — Live debate visualization ====================
export function DebateIdentityPanel({panelAgents,rounds,status,isOpen,onToggle}){
  const stanceSummaries={};
  panelAgents?.forEach(agent=>{
    const agentResponses=rounds.flatMap(round=>round.filter(r=>r.id===agent.id&&r.status==="success"));
    stanceSummaries[agent.id]=agentResponses.map(r=>(r.response||"").slice(0,80)+"...");
  });
  const currentRoundData=rounds[rounds.length-1]||[];
  const activeIds=status==="running"?currentRoundData.filter(r=>r.status==="success").map(r=>r.id):[];
  const providerLabel=(model)=>{const mp=MODEL_PROVIDERS.find(m=>m.id===model);return mp?mp.label:model||"Claude"};
  return <div style={{width:isOpen?280:0,minWidth:isOpen?280:0,transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",overflow:"hidden",borderLeft:isOpen?"1px solid #E5E7EB":"none",background:"#FAFAFA",flexShrink:0}}>
    <div style={{width:280,padding:16}}>
      <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-sm" style={{color:"#111827"}}>Panel</h4><button onClick={onToggle} style={{fontSize:10,color:"#9CA3AF"}}>Close &times;</button></div>
      {panelAgents?.map(agent=>{const isActive=activeIds.includes(agent.id);const stances=stanceSummaries[agent.id]||[];
        return <div key={agent.id} className="mb-3 p-3 rounded-xl transition-all" style={{background:isActive?`${agent.color}08`:"white",border:`1px solid ${isActive?agent.color+"40":"#E5E7EB"}`,boxShadow:isActive?`0 0 12px ${agent.color}15`:"none"}}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{background:`${agent.color}20`,color:agent.color,fontSize:9,border:`1.5px solid ${agent.color}40`}}>{agent.avatar}</div>
            <div><h5 className="font-bold text-xs" style={{color:"#111827"}}>{agent.name}</h5><span style={{fontSize:9,color:"#9CA3AF"}}>{agent.category||agent.role||""}</span></div>
            {isActive&&<span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{background:agent.color}}/>}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded mb-1.5" style={{fontSize:8,background:"#F3F4F6",color:"#9CA3AF"}}>{providerLabel(agent.model)}</span>
          {stances.length>0&&<div className="mt-1.5 space-y-1">{stances.map((s,i)=><div key={i} className="text-xs p-1.5 rounded" style={{background:"#F9FAFB",color:"#6B7280",fontSize:10}}><span className="font-semibold" style={{color:agent.color}}>R{i+1}: </span>{s}</div>)}</div>}
        </div>})}
    </div>
  </div>;
}

export function DebatePanel({article,topic,agents,onDebateComplete,onSaveSession,currentUser}){
  const isCycleDebate=topic?.sourceType==="cycle";
  const topicTitle=isCycleDebate?(topic?.title||"Full Cycle Debate"):(article?.title||topic?.title||"");
  const topicText=isCycleDebate?(topic?.text||""):(article?.paragraphs?.join("\n\n")||article?.htmlContent?.replace(/<[^>]*>/g," ")||topic?.text||"");
  const existingDebate=article?.debate;
  const[status,setStatus]=useState(existingDebate?"complete":"idle");const[step,setStep]=useState(existingDebate?"Complete!":"");const[panel,setPanel]=useState(existingDebate?.panel||null);const[rounds,setRounds]=useState(existingDebate?.rounds||[]);const[atlas,setAtlas]=useState(existingDebate?.atlas||null);const[loom,setLoom]=useState(existingDebate?.loom||null);const[streams,setStreams]=useState(existingDebate?.streams||[]);const[error,setError]=useState("");const[progress,setProgress]=useState(existingDebate?100:0);const[toast,setToast]=useState("");const debateRef=useRef(null);
  const[sidePanelOpen,setSidePanelOpen]=useState(false);
  useEffect(()=>{setSidePanelOpen(window.innerWidth>=768)},[]);

  const scrollToBottom=()=>{if(debateRef.current)debateRef.current.scrollIntoView({behavior:"smooth",block:"end"})};
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(""),4000)};
  const admin=isAdmin(currentUser);

  const startDebate=async()=>{
    if(!admin)return;
    setStatus("running");setError("");setProgress(0);
    const articleText=topicText;
    const activeAgents=agents.filter(a=>a.status==="active");
    if(activeAgents.length===0){setError("No active agents available. Add agents in Agent Community first.");setStatus("error");return}
    try{
      // Step 1: Ada selects panel
      setStep("Selecting panel...");setProgress(5);
      const sel=await authFetch("/api/debate/select",{articleTitle:topicTitle,articleText,agents:activeAgents,forgePersona:ORCHESTRATORS.forge.persona});
      let selectedAgents=activeAgents.filter(a=>sel.selected.includes(a.id));
      // Fallback: if LLM returned names instead of IDs, try matching by name
      if(selectedAgents.length===0&&sel.selected?.length>0){
        selectedAgents=activeAgents.filter(a=>sel.selected.some(s=>s.toLowerCase()===a.name.toLowerCase()||s.toLowerCase()===a.id.toLowerCase()||a.id.includes(s.toLowerCase().replace(/\s+/g,"_"))));
      }
      // Final fallback: pick first 5 active agents rather than failing
      if(selectedAgents.length===0){selectedAgents=activeAgents.slice(0,5);showToast("Couldn't select agents — using default panel")}
      setPanel({agents:selectedAgents,rationale:sel.rationale});setProgress(15);
      scrollToBottom();

      // Steps 2-4: Three rounds
      const allRounds=[];
      for(let r=1;r<=3;r++){
        const responded=allRounds.flat().filter(x=>x.status==="success").length;
        const total=selectedAgents.length*r;
        setStep(`Round ${r}/3: ${r===1?"Initial positions":r===2?"Cross-responses":"Final positions"} (${responded}/${selectedAgents.length*3} total responses)`);
        const roundData=await authFetch("/api/debate/round",{articleTitle:topicTitle,articleText,agents:selectedAgents,roundNumber:r,previousRounds:allRounds});
        // Add timestamps to responses
        const timestampedResponses=roundData.responses.map(resp=>({...resp,timestamp:new Date().toISOString()}));
        allRounds.push(timestampedResponses);
        setRounds([...allRounds]);
        setProgress(15+r*20);
        scrollToBottom();
        // Check if all agents failed in this round
        const successCount=timestampedResponses.filter(r=>r.status==="success").length;
        if(successCount===0){showToast(`All agents failed in Round ${r}. Ending debate early.`);break}
      }

      // Check if we have any successful responses at all
      const totalSuccessful=allRounds.flat().filter(r=>r.status==="success").length;
      if(totalSuccessful===0){setError("No agents were able to participate. Check API keys and agent configurations.");setStatus("error");return}

      // Step 5: Socratia moderation
      setStep("Reviewing discussion...");setProgress(80);
      showToast("Debate rounds complete — Socratia is reviewing...");
      const modData=await authFetch("/api/debate/moderate",{articleTitle:topicTitle,rounds:allRounds,atlasPersona:ORCHESTRATORS.atlas.persona});
      setAtlas(modData);setProgress(88);
      scrollToBottom();

      // Step 6: Hypatia Loom + clustering
      setStep("Hypatia weaving The Loom...");setProgress(90);
      showToast("Debate complete — Hypatia is weaving the Loom...");
      const loomData=await authFetch("/api/debate/loom",{articleTitle:topicTitle,articleText,rounds:allRounds,atlasNote:modData.intervention,forgeRationale:sel.rationale,panelNames:selectedAgents.map(a=>a.name),sagePersona:ORCHESTRATORS.sage.persona});
      setLoom(loomData.loom);setStreams(loomData.streams||[]);setProgress(100);

      setStep("Complete!");setStatus("complete");
      showToast("Loom ready! Hypatia has woven the synthesis.");
      scrollToBottom();
      if(onDebateComplete)onDebateComplete({panel:{agents:selectedAgents,rationale:sel.rationale},rounds:allRounds,atlas:modData,loom:loomData.loom,streams:loomData.streams||[]});
      if(onSaveSession&&admin)onSaveSession({mode:"debate",topic:topicTitle,results:{panel:{agents:selectedAgents.map(a=>({id:a.id,name:a.name,color:a.color,avatar:a.avatar})),rationale:sel.rationale},rounds:allRounds,loom:loomData.loom,streams:loomData.streams||[]}});
    }catch(e){console.error("Debate error:",e);setError(e.message);setStatus("error")}
  };

  const getAgentColor=(name)=>{const a=[...agents,...Object.values(ORCHESTRATORS)].find(x=>x.name===name);return a?.color||"#999"};
  const getAgentAvatar=(name)=>{const a=agents.find(x=>x.name===name);return a?.avatar||name.charAt(0)};

  if(status==="idle"){
    if(!admin)return <div className="p-4 rounded-xl text-center" style={{background:"#F9FAFB",border:"1px solid #E5E7EB"}}><p className="text-sm" style={{color:"#CCC"}}>No debate has been run for this article yet.</p></div>;
    return <button onClick={startDebate} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Start Agent Debate</button>;
  }

  return <div className="flex rounded-2xl border overflow-hidden" style={{background:"white",borderColor:"#E5E7EB"}}>
    <div ref={debateRef} className="flex-1 min-w-0">
    {panel&&!sidePanelOpen&&<button onClick={()=>setSidePanelOpen(true)} className="absolute right-2 top-2 px-2 py-1 rounded-lg text-xs font-semibold z-10" style={{background:"#F3E8FF",color:"#9333EA"}}>Panel ▸</button>}
    {toast&&<div className="mx-4 mt-3 p-2.5 rounded-xl animate-pulse" style={{background:"#EBF5F1",border:"1px solid #B2DFDB"}}><p className="text-xs font-semibold" style={{color:"#2D8A6E"}}>{toast}</p></div>}
    {status==="running"&&<div className="p-4" style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm" style={{color:"#111827"}}>Debate in Progress</span><span className="text-xs font-bold" style={{color:"#E8734A"}}>{progress}%</span></div>
      <div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"#E5E7EB"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#3B6B9B,#E8734A,#2D8A6E)",transition:"width 0.5s ease"}}/></div>
      <p className="text-xs" style={{color:"#999"}}>{step}</p>
      {rounds.length===0&&<div className="mt-3 space-y-2">{[1,2,3].map(i=><div key={i} className="animate-pulse flex items-center gap-2 p-2 rounded-lg" style={{background:"#F3F4F6"}}><div className="w-5 h-5 rounded-full" style={{background:"#E8E8E8"}}/><div className="flex-1"><div className="h-2.5 rounded" style={{background:"#E8E8E8",width:`${60+i*10}%`}}/><div className="h-2 rounded mt-1.5" style={{background:"#E5E7EB",width:`${40+i*15}%`}}/></div></div>)}</div>}
    </div>}

    {error&&<div className="p-3 m-3 rounded-xl" style={{background:"#FFF5F5"}}><p className="text-xs" style={{color:"#E53E3E"}}>Error: {error}</p><button onClick={()=>{setStatus("idle");setError("")}} className="text-xs font-semibold mt-1" style={{color:"#3B6B9B"}}>Retry</button></div>}

    {panel&&<div className="p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-full flex items-center justify-center" style={{border:"1.5px dashed #2D8A6E40"}}><OrchestratorAvatar type="ada" size={18}/></div><span className="font-bold text-xs" style={{color:"#2D8A6E"}}>Panel selected by Forge</span></div>
      <div className="flex flex-wrap gap-2 mb-3">{panel.agents.map(a=><div key={a.id} className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-default transition-all" style={{background:`${a.color}08`,border:`1px solid ${a.color}20`}} onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}15`;e.currentTarget.style.borderColor=`${a.color}40`}} onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}08`;e.currentTarget.style.borderColor=`${a.color}20`}}>
        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:9}}>{a.avatar}</span>
        <div><span className="font-semibold block" style={{fontSize:11,color:a.color,lineHeight:1.2}}>{a.name}</span><span style={{fontSize:9,color:`${a.color}90`,lineHeight:1}}>{a.category||a.role||''}</span></div>
      </div>)}</div>
      <div className="p-2.5 rounded-lg" style={{background:"#F0FDF4",border:"1px solid #D1FAE520"}}><p className="text-xs" style={{color:"#2D8A6E",lineHeight:1.5,fontStyle:"italic"}}><b>Why this panel:</b> {panel.rationale}</p></div>
    </div>}

    {streams.length>0?<div className="p-4">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:15}}>Key Themes</h3>
      {streams.map((stream,si)=><div key={si} className="mb-4">
        <div className="flex items-center gap-2 mb-2"><div className="w-1.5 rounded-full" style={{height:14,background:"linear-gradient(180deg,#E8734A,#3B6B9B)"}}/><h4 className="font-bold text-xs" style={{color:"#111827"}}>{stream.title}</h4></div>
        <div className="ml-3 space-y-1.5" style={{borderLeft:"2px solid #F3F4F6",paddingLeft:12}}>
          {stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5" style={{background:`${getAgentColor(entry.agent)}15`,color:getAgentColor(entry.agent),fontSize:7}}>{getAgentAvatar(entry.agent)}</div>
            <div><span className="font-bold" style={{fontSize:10,color:getAgentColor(entry.agent)}}>{entry.agent}</span><span className="text-xs" style={{color:"#CCC"}}> R{entry.round}</span><p className="text-xs mt-0.5" style={{color:"#666",lineHeight:1.5}}>{entry.excerpt}</p></div>
          </div>)}
        </div>
      </div>)}
    </div>:rounds.length>0&&<div className="p-4">
      {rounds.map((round,ri)=><div key={ri} className="mb-3"><h4 className="font-bold mb-1.5" style={{fontSize:13,color:"#999"}}>Round {ri+1}</h4>
        <div className="space-y-2">{round.map(r=><div key={r.id} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{background:r.status==="failed"?"#FFF5F5":"#F9FAFB"}}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${getAgentColor(r.name)}15`,color:getAgentColor(r.name),fontSize:9}}>{getAgentAvatar(r.name)}</div>
          <div className="flex-1"><div className="flex items-center gap-1.5"><span className="font-bold" style={{fontSize:13,color:getAgentColor(r.name)}}>{r.name}</span>{r.model&&<span className="px-1 py-0 rounded" style={{fontSize:8,background:"#F3F4F6",color:"#AAA"}}>{r.model}</span>}{r.timestamp&&<span style={{fontSize:9,color:"#BBB"}}>{new Date(r.timestamp).toLocaleTimeString()}</span>}</div>{r.status==="failed"?<span style={{fontSize:13,color:"#E53E3E"}}>Response unavailable — {r.error||"agent timed out"}</span>:<p className="mt-1" style={{fontSize:14,color:"#333",lineHeight:1.7}}>{renderInline(r.response?.length>300?r.response.slice(0,300)+"...":r.response)}</p>}</div>
        </div>)}</div>
      </div>)}
    </div>}

    {atlas&&<div className="mx-4 mb-3 p-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5"}}>
      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{border:"1px dashed #E8734A40"}}><OrchestratorAvatar type="socratia" size={16}/></div><span className="font-bold text-xs" style={{color:"#E8734A"}}>Socratia</span><span className="text-xs" style={{color:"#CCC"}}>{atlas.on_topic?"On topic":"Intervention"}</span></div>
      <p className="text-xs" style={{color:"#888",lineHeight:1.5}}>{atlas.intervention}</p>
      {atlas.missing_perspectives&&<p className="text-xs mt-1" style={{color:"#BBB",fontStyle:"italic"}}>Missing: {atlas.missing_perspectives}</p>}
    </div>}

    {loom&&<div className="m-4 p-4 rounded-2xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-2 mb-3"><span style={{fontSize:16}}>&#128296;</span><h3 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#3B6B9B",fontSize:16}}>Hypatia&apos;s Loom &mdash; A Synthesis</h3></div>
      <div style={{fontSize:13,color:"#555",lineHeight:1.9}}>{loom.split("\n\n").map((p,i)=><p key={i} className="mb-2">{p}</p>)}</div>
    </div>}

    {status==="complete"&&<div className="px-4 pb-3"><DebateExport panel={panel} rounds={rounds} loom={loom} streams={streams} atlas={atlas} topicTitle={topicTitle}/></div>}
    {status==="complete"&&admin&&<div className="p-3 mx-4 mb-4"><button onClick={()=>{setStatus("idle");setPanel(null);setRounds([]);setAtlas(null);setLoom(null);setStreams([]);setProgress(0);setToast("")}} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:shadow-sm" style={{border:"1.5px solid #E5E7EB",color:"#999"}}>Run New Debate</button></div>}
    </div>{/* end content wrapper */}
    {panel&&<DebateIdentityPanel panelAgents={panel.agents} rounds={rounds} status={status} isOpen={sidePanelOpen} onToggle={()=>setSidePanelOpen(!sidePanelOpen)}/>}
  </div>
}

// ==================== AGENT WORKSHOP — Tabbed Debate + Implement ====================
export function AgentWorkshop({article,topic,agents,registry,registryIndex,onDebateComplete,onSaveSession,currentUser}){
  const wsTitle=article?.title||topic?.title||"";
  const wsText=article?.paragraphs?.join("\n\n")||article?.htmlContent?.replace(/<[^>]*>/g," ")||topic?.text||"";
  const[activeTab,setActiveTab]=useState("debate");
  const[implStatus,setImplStatus]=useState("idle");const[implStep,setImplStep]=useState("");const[implProgress,setImplProgress]=useState(0);const[implResult,setImplResult]=useState(null);const[implError,setImplError]=useState("");
  const admin=isAdmin(currentUser);

  // Helper: Pre-filter agents by capability from registry
  const getRegistryAgents=(capability,count=15)=>{
    if(!registryIndex?.byId)return[];
    return Object.values(registryIndex.byId).sort((a,b)=>(b.capabilities?.[capability]||0)-(a.capabilities?.[capability]||0)).slice(0,count);
  };

  // Combine registry + custom agents, picking best by capability
  const selectAgentPool=(capability)=>{
    const customActive=agents.filter(a=>a.status==="active");
    const registryTop=getRegistryAgents(capability,40);
    const combined=[...customActive,...registryTop];
    const seen=new Set();
    return combined.filter(a=>{if(seen.has(a.id))return false;seen.add(a.id);return true}).slice(0,60);
  };

  const startImplementation=async()=>{
    if(!admin)return;
    setImplStatus("running");setImplError("");setImplResult(null);setImplProgress(0);
    const pool=selectAgentPool("implement");
    if(pool.length===0){setImplError("No agents available.");setImplStatus("error");return}
    try{
      setImplStep("Selecting builder panel...");setImplProgress(10);
      const sel=await authFetch("/api/debate/select",{articleTitle:wsTitle,articleText:wsText.slice(0,2000),agents:pool,forgePersona:ORCHESTRATORS.forge.persona+" For this implementation session, prioritize agents with strong architecture and implementation capabilities.",activityType:"implement"});
      let selected=pool.filter(a=>sel.selected.includes(a.id));
      if(selected.length===0)selected=pool.slice(0,6);
      if(selected.length<4)selected=pool.slice(0,Math.min(6,pool.length));
      setImplProgress(25);setImplStep(`${selected.length} agents architecting...`);
      // Build context from debate conclusions if available
      let priorContext=wsText.slice(0,1500);
      const debate=article?.debate;
      if(debate){
        const debateCtx=[];
        if(debate.loom)debateCtx.push("DEBATE SYNTHESIS (Hypatia's Loom):\n"+debate.loom.slice(0,600));
        if(debate.streams?.length)debateCtx.push("THEMATIC STREAMS:\n"+debate.streams.map(s=>`- ${s.theme}: ${s.insight}`).join("\n").slice(0,400));
        if(debate.panel?.agents?.length)debateCtx.push("DEBATE PANEL: "+debate.panel.agents.map(a=>a.name).join(", "));
        if(debateCtx.length>0)priorContext=debateCtx.join("\n\n")+"\n\nORIGINAL CONTEXT:\n"+wsText.slice(0,800);
      }
      const data=await authFetch("/api/agents/implement",{concept:wsTitle,agents:selected,priorContext});
      setImplResult(data);setImplProgress(100);setImplStep("Complete!");setImplStatus("complete");
      if(onSaveSession&&admin)onSaveSession({mode:"implement",topic:wsTitle,results:data});
    }catch(e){setImplError(e.message);setImplStatus("error")}
  };

  const tabColors={debate:"#E8734A",implement:"#2D8A6E"};
  const tabLabels={debate:"Debate",implement:"Implement"};
  const tabIcons={debate:"\u2694",implement:"\u{1F528}"};

  return <div>
    {/* Tab selector */}
    <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{background:"#F3F4F6"}}>
      {["debate","implement"].map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-sm transition-all" style={{background:activeTab===tab?"#FFFFFF":"transparent",color:activeTab===tab?tabColors[tab]:"rgba(0,0,0,0.35)",boxShadow:activeTab===tab?"0 1px 4px rgba(0,0,0,0.08)":"none"}}><span style={{fontSize:14}}>{tabIcons[tab]}</span>{tabLabels[tab]}</button>)}
    </div>

    {/* Debate tab */}
    {activeTab==="debate"&&<DebatePanel article={article} topic={topic} agents={agents} onDebateComplete={onDebateComplete} onSaveSession={onSaveSession} currentUser={currentUser}/>}

    {/* Implement tab — Implementation Canvas */}
    {activeTab==="implement"&&<div className="rounded-2xl border overflow-hidden" style={{background:"white",borderColor:"rgba(45,138,110,0.15)"}}>
      <div className="p-4" style={{background:"rgba(45,138,110,0.04)",borderBottom:"1px solid rgba(45,138,110,0.1)"}}>
        <h3 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#2D8A6E",fontSize:16}}>Implementation Canvas</h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)"}}>{article?.debate?.loom?"Build on debate conclusions — agents design components informed by synthesis.":"Builder agents design components from their expertise, then Hypatia synthesizes a unified architecture."}</p>
      </div>

      {/* Debate context preview when available */}
      {article?.debate?.loom&&implStatus==="idle"&&<div className="mx-4 mt-4 p-3 rounded-xl" style={{background:"rgba(147,51,234,0.04)",border:"1px solid rgba(147,51,234,0.12)"}}>
        <div className="flex items-center gap-2 mb-2"><span style={{fontSize:12}}>🧵</span><span className="font-bold text-xs" style={{color:"#9333EA"}}>Debate Conclusions Available</span></div>
        <p className="text-xs" style={{color:"rgba(0,0,0,0.5)",lineHeight:1.6}}>{article.debate.loom.slice(0,200)}{article.debate.loom.length>200?"…":""}</p>
        {article.debate.streams?.length>0&&<div className="flex flex-wrap gap-1 mt-2">{article.debate.streams.slice(0,4).map((s,i)=><span key={i} className="px-2 py-0.5 rounded-full" style={{fontSize:9,background:"rgba(147,51,234,0.08)",color:"#7C3AED"}}>{s.theme}</span>)}</div>}
      </div>}

      {implStatus==="idle"&&(admin?<div className="p-4"><button onClick={startImplementation} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>{article?.debate?.loom?"Build on Debate Conclusions":"Start Implementation Planning"}</button></div>:<div className="p-4"><p className="text-sm text-center" style={{color:"rgba(0,0,0,0.3)"}}>No implementation session has been run yet.</p></div>)}

      {implStatus==="running"&&<div className="p-4">
        <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm" style={{color:"#2D8A6E"}}>Implementation Planning in Progress</span><span className="text-xs font-bold" style={{color:"#2D8A6E"}}>{implProgress}%</span></div>
        <div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"rgba(0,0,0,0.06)"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${implProgress}%`,background:"linear-gradient(90deg,#2D8A6E,#5CC4A0)",transition:"width 0.5s ease"}}/></div>
        <p className="text-xs" style={{color:"rgba(0,0,0,0.4)"}}>{implStep}</p>
      </div>}

      {implError&&<div className="p-3 m-3 rounded-xl" style={{background:"rgba(229,62,62,0.06)"}}><p className="text-xs" style={{color:"#E53E3E"}}>Error: {implError}</p><button onClick={()=>{setImplStatus("idle");setImplError("")}} className="text-xs font-semibold mt-1" style={{color:"#2D8A6E"}}>Retry</button></div>}

      {implResult&&<div className="p-4">
        {/* Architecture overview */}
        {implResult.architecture&&<div className="mb-4 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid rgba(45,138,110,0.15)"}}>
          <h4 className="font-bold mb-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:14,color:"#111827"}}>Architecture Overview</h4>
          <p style={{fontSize:12,color:"rgba(0,0,0,0.5)",lineHeight:1.7}}>{implResult.architecture}</p>
          {implResult.totalWeeks>0&&<span className="inline-block mt-2 px-2 py-0.5 rounded-full font-semibold" style={{fontSize:10,background:"rgba(45,138,110,0.1)",color:"#2D8A6E"}}>Est. {implResult.totalWeeks} weeks</span>}
        </div>}

        {/* Components from agents */}
        {implResult.components?.filter(c=>c.status==="success").length>0&&<div className="mb-4">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Agent Components</h4>
          <div className="space-y-2">{implResult.components.filter(c=>c.status==="success").map((comp,i)=><div key={i} className="p-3 rounded-xl" style={{background:"rgba(0,0,0,0.02)",border:"1px solid rgba(0,0,0,0.05)"}}>
            <div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{background:`${comp.color||"#999"}20`,color:comp.color||"#999",fontSize:7}}>{comp.avatar||"?"}</div><span className="font-bold text-xs" style={{color:comp.color||"#999"}}>{comp.agent}</span>{comp.timelineWeeks&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)"}}>{comp.timelineWeeks}w</span>}</div>
            <h5 className="font-semibold text-sm mb-1" style={{color:"#111827"}}>{comp.component}</h5>
            <p className="text-xs mb-1.5" style={{color:"rgba(0,0,0,0.45)",lineHeight:1.5}}>{comp.approach}</p>
            {comp.integrations?.length>0&&<div className="flex flex-wrap gap-1">{comp.integrations.map((int,ii)=><span key={ii} className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(59,107,155,0.08)",color:"#3B6B9B"}}>{int}</span>)}</div>}
          </div>)}</div>
        </div>}

        {/* Implementation sequence */}
        {implResult.sequence?.length>0&&<div className="mb-4">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Implementation Sequence</h4>
          <div className="space-y-1.5">{implResult.sequence.map((phase,i)=><div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{background:"rgba(0,0,0,0.02)"}}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:"rgba(45,138,110,0.1)",color:"#2D8A6E",fontSize:10}}>{i+1}</div>
            <div className="flex-1"><div className="flex items-center gap-2"><h5 className="font-semibold text-xs" style={{color:"#111827"}}>{phase.phase}</h5><span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)"}}>{phase.weeks}</span></div>
              <p className="text-xs mt-0.5" style={{color:"rgba(0,0,0,0.45)"}}>{phase.description}</p>
            </div>
          </div>)}</div>
        </div>}

        {/* Risks */}
        {implResult.risks?.length>0&&<div className="mb-3">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Cross-Cutting Risks</h4>
          <div className="space-y-1">{implResult.risks.map((risk,i)=>{const sevColors={high:"#E53E3E",medium:"#E8734A",low:"#2D8A6E"};
            return <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:risk.severity==="high"?"rgba(229,62,62,0.04)":"rgba(0,0,0,0.02)"}}>
              <span className="px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{fontSize:8,background:`${sevColors[risk.severity]||"#999"}15`,color:sevColors[risk.severity]||"#999"}}>{(risk.severity||"").toUpperCase()}</span>
              <div className="flex-1"><p className="text-xs font-semibold" style={{color:"#111827"}}>{risk.risk}</p><p className="text-xs" style={{color:"rgba(0,0,0,0.4)"}}>{risk.mitigation}</p></div>
            </div>})}</div>
        </div>}

        {admin&&implStatus==="complete"&&<button onClick={()=>{setImplStatus("idle");setImplResult(null)}} className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{border:"1.5px solid rgba(0,0,0,0.08)",color:"rgba(0,0,0,0.4)"}}>Run New Implementation</button>}
      </div>}
    </div>}
  </div>
}

// ==================== AGENT PANEL (Cycle Creator — Sequential Pipeline) ====================
export function AgentPanel({onPostGenerated,onAutoComment,agents:allAgents,registry}){
  const[loading,setLoading]=useState(false);const[step,setStep]=useState('idle');const[topics,setTopics]=useState([]);const[selectedTopic,setSelectedTopic]=useState(null);const[generating,setGenerating]=useState('');const[posts,setPosts]=useState([]);const[error,setError]=useState('');
  const[customCycleTopic,setCustomCycleTopic]=useState('');const[commentProgress,setCommentProgress]=useState('');
  const[throughLine,setThroughLine]=useState(null);const[genProgress,setGenProgress]=useState(0);
  const suggestTopics=async()=>{setLoading(true);setError('');try{const d=await authFetch('/api/agents/suggest-topics',{currentTopics:INIT_CONTENT.map(c=>c.title),pastCycles:['AI Governance Reimagined','The Death of the Dashboard']});if(d.topics&&d.topics.length>0){setTopics(d.topics);setStep('topics')}else{setError('No topics returned.')}}catch(e){setError(e.message||'Failed to reach API')}setLoading(false)};

  // New sequential pipeline with dynamic pillars
  const generateCycle=async(topic)=>{setSelectedTopic(topic);setStep('generating');setPosts([]);setThroughLine(null);setGenProgress(0);setError('');
    try{
      // Step 0: Through-line question + dynamic pillars
      setGenerating('through-line');setGenProgress(5);
      const tlData=await authFetch('/api/cycle/generate',{topic,step:'through-line'});
      const tl=tlData.data;
      setThroughLine(tl);setGenProgress(15);

      // Step 1: First pillar (reads nothing)
      setGenerating('act_0');setGenProgress(20);
      const act0Data=await authFetch('/api/cycle/generate',{topic,step:'act_0',previousData:{throughLine:tl}});
      const act0=act0Data.data;
      setPosts(prev=>[...prev,act0]);setGenProgress(45);

      // Step 2: Second pillar (reads first)
      setGenerating('act_1');setGenProgress(50);
      const act1Data=await authFetch('/api/cycle/generate',{topic,step:'act_1',previousData:{throughLine:tl,sage:act0}});
      const act1=act1Data.data;
      setPosts(prev=>[...prev,act1]);setGenProgress(75);

      // Step 3: Third pillar (reads first + second)
      setGenerating('act_2');setGenProgress(80);
      const act2Data=await authFetch('/api/cycle/generate',{topic,step:'act_2',previousData:{throughLine:tl,sage:act0,atlas:act1}});
      const act2=act2Data.data;
      setPosts(prev=>[...prev,act2]);setGenProgress(100);

      setGenerating('');setStep('done');
    }catch(e){console.error('Cycle generation error:',e);setError(e.message||'Generation failed');setStep('idle');setGenerating('')}
  };

  // Derive dynamic pillar labels/colors from throughLine
  const dynPillars=throughLine?.pillars||[];
  const orchNames=['Hypatia','Socratia','Ada'];

  const publishAll=async()=>{const cycleDate=new Date().toISOString().split('T')[0];const ts=Date.now();const cycleId='cy_'+ts;
    const publishedIds=[];
    // Build dynamicPillars metadata to store on each post
    const pillarsMeta=dynPillars.length>=3?dynPillars.map((p,i)=>({key:p.key||`pillar_${i+1}`,label:p.label,tagline:p.tagline||'',color:p.color||['#3B6B9B','#E8734A','#2D8A6E'][i],number:p.number||String(i+1).padStart(2,'0')})):null;
    posts.forEach((p,i)=>{const postId='p_'+ts+'_'+i;publishedIds.push(postId);const post={id:postId,authorId:p.authorId,pillar:p.pillar,type:'post',title:p.title,paragraphs:p.paragraphs,reactions:{},highlights:{},marginNotes:[],tags:p.tags||[],createdAt:cycleDate,sundayCycle:cycleDate,cycleId:cycleId,featured:true,endorsements:0,comments:[],challenges:[],
      // Journey metadata
      throughLineQuestion:throughLine?.through_line_question||null,
      openQuestions:p.open_questions||null,
      bridgeSentence:p.bridge_sentence||null,
      patterns:p.patterns||null,
      synthesisPrinciple:p.synthesis_principle||null,
      architectureComponents:p.architecture_components||null,
      openThread:p.open_thread||null,
      artifact:p.artifact||null,
      tldr:p.tldr||null,
      // Dynamic pillars metadata — stored on each post so getCycles can find it
      dynamicPillars:pillarsMeta
    };onPostGenerated(post)});
    setStep('published');
    // Auto-batch agent comments
    if(onAutoComment){
      setStep('commenting');setCommentProgress('Selecting agents...');
      try{
        let commentAgents=INIT_AGENTS.slice(0,5);
        try{const sel=await authFetch('/api/debate/select',{articleTitle:selectedTopic?.title||'cycle',articleText:posts.map(p=>p.title).join('. '),agents:INIT_AGENTS.slice(0,25),forgePersona:ORCHESTRATORS.forge.persona});const matched=INIT_AGENTS.filter(a=>sel.selected?.includes(a.id)||sel.selected?.some(s=>s.toLowerCase()===a.name.toLowerCase()));if(matched.length>=3)commentAgents=matched.slice(0,5)}catch(e){console.warn('Agent selection for comments failed, using defaults:',e.message)}
        let done=0;const total=publishedIds.length*commentAgents.length;
        for(const postId of publishedIds){
          const postData=posts[publishedIds.indexOf(postId)];
          const batchPromises=commentAgents.map(agent=>
            authFetch('/api/agents/comment',{postTitle:postData.title,postContent:postData.paragraphs?.[0]||'',agentName:agent.name,agentPersona:agent.persona,agentModel:agent.model||'anthropic'})
            .then(data=>{if(data?.comment){onAutoComment(postId,agent.id,data.comment)}done++;setCommentProgress(`Generating agent comments... (${done}/${total})`)})
            .catch(err=>{console.error('Comment failed for',agent.name,':',err.message||err);done++;setCommentProgress(`Generating agent comments... (${done}/${total})`)})
          );
          await Promise.allSettled(batchPromises);
          if(publishedIds.indexOf(postId)<publishedIds.length-1)await new Promise(r=>setTimeout(r,500));
        }
        setCommentProgress('');setStep('published');
      }catch(e){console.error('Auto-comment failed:',e);setCommentProgress('');setStep('published')}
    }
  };

  // Dynamic step labels from throughLine pillars
  const STEP_LABELS=dynPillars.length>=3?[
    ['through-line','Crafting the guiding question + dynamic lenses...','#8B5CF6'],
    ['act_0',`${orchNames[0]} is exploring "${dynPillars[0].label}"...`,dynPillars[0].color||'#3B6B9B'],
    ['act_1',`${orchNames[1]} is exploring "${dynPillars[1].label}"...`,dynPillars[1].color||'#E8734A'],
    ['act_2',`${orchNames[2]} is exploring "${dynPillars[2].label}"...`,dynPillars[2].color||'#2D8A6E'],
  ]:[
    ['through-line','Crafting the guiding question + dynamic lenses...','#8B5CF6'],
    ['act_0','Hypatia is writing Act 1...','#3B6B9B'],
    ['act_1','Socratia is writing Act 2...','#E8734A'],
    ['act_2','Ada is writing Act 3...','#2D8A6E'],
  ];
  const currentStepIdx=STEP_LABELS.findIndex(s=>s[0]===generating);
  const progressGradient=dynPillars.length>=3?`linear-gradient(90deg,${dynPillars.map(p=>p.color||'#999').join(',')})`:'linear-gradient(90deg,#3B6B9B,#E8734A,#2D8A6E)';

  return <div className="p-5 rounded-2xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
    <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Generate a connected 3-part edition with dynamic topic-specific lenses. Each agent reads the previous agent&apos;s work.</p>
    {(step==='idle'||loading)&&<><div className="flex flex-wrap gap-3 items-end">
      <button onClick={suggestTopics} disabled={loading} className="px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white",opacity:loading?0.7:1}}>{loading?'Analyzing trends with Claude...':'Suggest Topics'}</button>
      <div className="flex items-center gap-2"><span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.2)"}}>OR</span></div>
      <div className="flex-1 flex gap-2"><input value={customCycleTopic} onChange={e=>setCustomCycleTopic(e.target.value)} placeholder="Enter your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",minWidth:180}} onKeyDown={e=>{if(e.key==='Enter'&&customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}}/><button onClick={()=>{if(customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}} disabled={!customCycleTopic.trim()} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:customCycleTopic.trim()?"#9333EA":"rgba(0,0,0,0.08)",color:customCycleTopic.trim()?"white":"rgba(0,0,0,0.3)"}}>Generate</button></div>
    </div>{error&&<p className="mt-2 p-2 rounded-lg text-xs" style={{background:"#FFF5F5",color:"#E53E3E"}}>{error}</p>}</>}
    {step==='topics'&&<div><p className="text-xs mb-2 font-semibold" style={{color:"rgba(0,0,0,0.3)"}}>SELECT A TOPIC TO GENERATE</p><div className="space-y-1.5">{topics.map((t,i)=><button key={i} onClick={()=>generateCycle(t)} className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm" style={{borderColor:"#E5E7EB"}}>
      <div className="flex items-center justify-between mb-0.5"><span className="font-semibold text-sm" style={{color:"#111827"}}>{t.title}</span><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:t.urgency==='high'?'#FDF0EB':'#F3F4F6',color:t.urgency==='high'?'#E8734A':'#999'}}>peaks {t.predicted_peak}</span></div>
      <p className="text-xs" style={{color:"#999"}}>{t.rationale}</p>
    </button>)}</div><div className="mt-3 flex gap-2 items-center"><span className="text-xs" style={{color:"rgba(0,0,0,0.2)"}}>OR</span><input value={customCycleTopic} onChange={e=>setCustomCycleTopic(e.target.value)} placeholder="Enter your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/><button onClick={()=>{if(customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}} disabled={!customCycleTopic.trim()} className="px-3 py-2 rounded-xl text-sm font-semibold" style={{background:customCycleTopic.trim()?"#9333EA":"rgba(0,0,0,0.08)",color:customCycleTopic.trim()?"white":"rgba(0,0,0,0.3)"}}>Generate</button></div></div>}
    {step==='generating'&&<div>
      <p className="text-sm mb-3 font-semibold" style={{color:"#111827"}}>Generating: <b>{selectedTopic?.title}</b></p>
      {throughLine&&<div className="mb-3 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
        <span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Guiding Question</span>
        <p className="text-sm mt-1" style={{color:"#555",fontStyle:"italic"}}>{throughLine.through_line_question}</p>
        {dynPillars.length>=3&&<div className="flex flex-wrap gap-2 mt-2">{dynPillars.map((dp,di)=><span key={di} className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${dp.color||'#999'}15`,color:dp.color||'#999'}}>{dp.label}: {dp.tagline}</span>)}</div>}
      </div>}
      <div className="w-full rounded-full overflow-hidden mb-3" style={{height:4,background:"#E5E7EB"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${genProgress}%`,background:progressGradient,transition:"width 0.8s ease"}}/></div>
      {STEP_LABELS.map(([key,label,color],i)=>{const isActive=key===generating;const completed=(key==='through-line'&&throughLine)||(key.startsWith('act_')&&posts.length>parseInt(key.split('_')[1]));
        return <div key={key} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{background:isActive?`${color}08`:completed?'#EBF5F1':'#FAFAFA',border:isActive?`1px solid ${color}25`:'1px solid transparent'}}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background:completed?'#2D8A6E':isActive?color:'#E5E7EB'}}>{completed?<span style={{color:'white',fontSize:10}}>&#10003;</span>:isActive?<span className="animate-pulse w-2 h-2 rounded-full" style={{background:'white'}}/>:<span style={{color:'#CCC',fontSize:10}}>{i+1}</span>}</div>
          <span className="font-semibold text-xs" style={{color:isActive?color:completed?'#2D8A6E':'#CCC'}}>{isActive?label:completed?(key==='through-line'?'Guiding question + lenses ready':posts[parseInt(key.split('_')[1])]?.title||'Done'):'Waiting'}</span>
        </div>})}
    </div>}
    {step==='done'&&<div>
      {throughLine&&<div className="mb-3 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
        <span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Guiding Question</span>
        <p className="text-sm mt-1" style={{color:"#555",fontStyle:"italic"}}>{throughLine.through_line_question}</p>
      </div>}
      <p className="text-sm mb-2 font-semibold" style={{color:"#2D8A6E"}}>Journey complete! All 3 acts are connected.</p>
      <div className="space-y-1 mb-3">{posts.map((p,i)=>{const dp=dynPillars[i];const color=dp?.color||['#3B6B9B','#E8734A','#2D8A6E'][i];const label=dp?`Act ${i+1}: ${dp.label}`:['Act 1: Rethink','Act 2: Rediscover','Act 3: Reinvent'][i];
        return <div key={i} className="text-xs p-2.5 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${color}`}}><span className="font-bold" style={{color}}>{label}</span> &mdash; {p.title}</div>})}</div>
      <button onClick={publishAll} className="px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Publish Journey & Generate Comments</button></div>}
    {step==='commenting'&&<div><p className="text-sm mb-2 font-semibold" style={{color:"#8B5CF6"}}>Published! Now generating agent comments...</p><div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"#E5E7EB"}}><div className="rounded-full animate-pulse" style={{height:"100%",width:"60%",background:progressGradient}}/></div><p className="text-xs" style={{color:"#8B5CF6"}}>{commentProgress}</p></div>}
    {step==='published'&&<div><p className="text-sm font-semibold" style={{color:"#2D8A6E"}}>Published! {onAutoComment?'Agent comments generated.':'Go to home to see the new cycle.'}</p><button onClick={()=>{setStep('idle');setPosts([]);setCustomCycleTopic('');setThroughLine(null);setGenProgress(0)}} className="mt-1 text-xs underline" style={{color:"#CCC"}}>Generate another</button></div>}
  </div>
}

// ==================== DEBATE EXPORT — Markdown, LinkedIn, Copy ====================
export function DebateExport({panel,rounds,loom,streams,atlas,topicTitle}){
  const[format,setFormat]=useState(null);const[copied,setCopied]=useState(false);
  const generateMarkdown=()=>{
    let md=`# ${topicTitle}\n\n`;
    md+=`*Debate conducted on Re³ — re3.live*\n\n`;
    if(panel?.agents?.length)md+=`**Panel:** ${panel.agents.map(a=>a.name).join(", ")}\n\n`;
    if(panel?.rationale)md+=`> ${panel.rationale}\n\n`;
    md+=`---\n\n`;
    if(rounds?.length){rounds.forEach((round,ri)=>{md+=`## Round ${ri+1}\n\n`;round.forEach(r=>{if(r.status==="success"&&r.response)md+=`### ${r.name}\n${r.response}\n\n`})});md+=`---\n\n`}
    if(atlas?.intervention)md+=`## Moderation Note\n${atlas.intervention}\n\n`;
    if(loom){md+=`## The Loom — Synthesis\n\n${loom}\n\n`}
    if(streams?.length){md+=`## Key Themes\n\n`;streams.forEach(s=>{md+=`### ${s.title}\n`;s.entries?.forEach(e=>{md+=`- **${e.agent}** (R${e.round}): ${e.excerpt}\n`});md+=`\n`})}
    md+=`---\n*Generated on Re³ | re3.live*`;
    return md;
  };
  const generateLinkedIn=()=>{
    let post=`I just ran an AI-powered debate on "${topicTitle}" using Re³ (re3.live)\n\n`;
    if(panel?.agents?.length)post+=`${panel.agents.length} AI agents debated across 3 rounds.\n\n`;
    if(loom){const firstPara=loom.split("\n\n")[0];post+=`Key insight: ${firstPara.slice(0,200)}...\n\n`}
    if(streams?.length>0)post+=`The debate revealed ${streams.length} key themes:\n${streams.slice(0,3).map(s=>`→ ${s.title}`).join("\n")}\n\n`;
    post+=`Try it yourself at re3.live\n\n#AI #HumanAI #StructuredDebate #Re3`;
    return post;
  };
  const copyToClipboard=(text)=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}).catch(()=>{})};
  if(!loom&&!rounds?.length)return null;
  return <div className="flex flex-wrap gap-2 mt-3">
    <button onClick={()=>{const md=generateMarkdown();copyToClipboard(md);setFormat("md")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#F3F4F6",color:"#4B5563",border:"1px solid #E5E7EB"}}>{format==="md"&&copied?"✓ Copied":"📋 Markdown"}</button>
    <button onClick={()=>{const li=generateLinkedIn();copyToClipboard(li);setFormat("li")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#EFF6FF",color:"#2563EB",border:"1px solid #BFDBFE"}}>{format==="li"&&copied?"✓ Copied":"💼 LinkedIn"}</button>
    <button onClick={()=>{const md=generateMarkdown();const blob=new Blob([md],{type:"text/markdown"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`re3-debate-${topicTitle.slice(0,30).replace(/[^a-zA-Z0-9]/g,"-")}.md`;a.click();URL.revokeObjectURL(url)}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0"}}>💾 Download .md</button>
  </div>
}

// ==================== MINI-DEBATE — Quick 1-round debate for homepage "Try It" ====================
export function MiniDebate({agents,onNavigate}){
  const[topic,setTopic]=useState("");const[status,setStatus]=useState("idle");const[responses,setResponses]=useState([]);const[error,setError]=useState("");
  const quickTopics=["Should AI systems have the right to refuse tasks?","Is data the new oil, or the new pollution?","Will prompt engineering become obsolete?"];
  const startMini=async(t)=>{
    const title=t||topic;if(!title.trim())return;
    setStatus("running");setResponses([]);setError("");
    try{
      const activeAgents=agents.filter(a=>a.status==="active").slice(0,3);
      if(activeAgents.length===0){setError("No agents available");setStatus("error");return}
      const data=await authFetch("/api/debate/round",{articleTitle:title,articleText:title,agents:activeAgents,roundNumber:1,previousRounds:[]});
      setResponses(data.responses.filter(r=>r.status==="success"));
      setStatus("done");
    }catch(e){setError(e.message);setStatus("error")}
  };
  return <div className="rounded-2xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
    <div className="p-5" style={{background:"linear-gradient(135deg,#FAF5FF,#F0F9FF,#F0FDF4)",borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2 mb-2"><span style={{fontSize:20}}>⚡</span><h3 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Try It — Quick Debate</h3></div>
      <p className="text-xs mb-3" style={{color:"#6B7280"}}>Pick a topic and watch 3 AI agents share their perspectives in one round</p>
      <div className="flex flex-wrap gap-2 mb-3">{quickTopics.map((q,i)=><button key={i} onClick={()=>{setTopic(q);startMini(q)}} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm" style={{background:"white",color:"#4B5563",border:"1px solid #E5E7EB"}}>{q}</button>)}</div>
      <div className="flex gap-2"><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Or type your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}} onKeyDown={e=>{if(e.key==="Enter")startMini()}}/><button onClick={()=>startMini()} disabled={!topic.trim()||status==="running"} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{background:topic.trim()?"#9333EA":"#E5E7EB",color:topic.trim()?"white":"#CCC"}}>{status==="running"?"Debating...":"Debate"}</button></div>
    </div>
    {status==="running"&&<div className="p-5"><div className="space-y-2">{[1,2,3].map(i=><div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl" style={{background:"#F9FAFB"}}><div className="w-8 h-8 rounded-full" style={{background:"#E5E7EB"}}/><div className="flex-1"><div className="h-2.5 rounded mb-2" style={{background:"#E5E7EB",width:`${50+i*15}%`}}/><div className="h-2 rounded" style={{background:"#F3F4F6",width:`${30+i*20}%`}}/></div></div>)}</div></div>}
    {status==="done"&&responses.length>0&&<div className="p-5 space-y-3">
      {responses.map((r,i)=>{const agent=agents.find(a=>a.id===r.id);const color=agent?.color||"#999";
        return <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all" style={{background:`${color}05`,border:`1px solid ${color}15`}}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${color}15`,color,fontSize:10}}>{agent?.avatar||r.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-bold text-sm" style={{color}}>{r.name}</span>{r.model&&<span className="px-1.5 py-0.5 rounded text-xs" style={{background:"#F3F4F6",color:"#BBB",fontSize:8}}>{r.model}</span>}</div>
            <p className="text-xs" style={{color:"#555",lineHeight:1.7}}>{r.response?.slice(0,300)}{r.response?.length>300?"...":""}</p>
          </div>
        </div>})}
      <div className="flex items-center justify-between pt-2" style={{borderTop:"1px solid #E5E7EB"}}>
        <span className="text-xs" style={{color:"#CCC"}}>Quick 1-round preview — run a full 3-round debate in Debate Lab</span>
        <button onClick={()=>onNavigate("forge")} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#9333EA",color:"white"}}>Full Debate &rarr;</button>
      </div>
    </div>}
    {error&&<div className="p-4"><p className="text-xs" style={{color:"#E53E3E"}}>{error}</p><button onClick={()=>setStatus("idle")} className="text-xs font-semibold mt-1" style={{color:"#3B6B9B"}}>Try again</button></div>}
  </div>
}

// ==================== DEBATE INSIGHTS DASHBOARD ====================
export function DebateInsightsPanel({content,forgeSessions}){
  const cycles=getCycles(content);
  // Collect stats from all debates
  const allDebates=[];
  content.forEach(post=>{if(post.debate?.loom)allDebates.push({panel:post.debate.panel,rounds:post.debate.rounds||[],streams:post.debate.streams||[],loom:post.debate.loom,pillar:post.pillar})});
  forgeSessions?.forEach(s=>{if(s.mode==="debate"&&s.results?.loom)allDebates.push({panel:s.results.panel,streams:s.results.streams||[],loom:s.results.loom})});
  // Agent participation frequency
  const agentCounts={};allDebates.forEach(d=>{d.panel?.agents?.forEach(a=>{agentCounts[a.name]=(agentCounts[a.name]||0)+1})});
  const topAgents=Object.entries(agentCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  // Most common stream themes (word freq)
  const allStreamTitles=allDebates.flatMap(d=>d.streams?.map(s=>s.title)||[]);
  const wordFreq={};allStreamTitles.forEach(t=>{t.split(/\s+/).forEach(w=>{const lw=w.toLowerCase().replace(/[^a-z]/g,"");if(lw.length>3)wordFreq[lw]=(wordFreq[lw]||0)+1})});
  const topWords=Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,12);
  // Pillar distribution
  const pillarCounts={rethink:0,rediscover:0,reinvent:0};allDebates.forEach(d=>{if(d.pillar&&pillarCounts[d.pillar]!==undefined)pillarCounts[d.pillar]++});
  const totalPillar=Object.values(pillarCounts).reduce((s,v)=>s+v,0)||1;

  if(allDebates.length===0)return null;
  return <div className="rounded-2xl p-5" style={{background:"white",border:"1px solid #E5E7EB"}}>
    <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Debate Insights</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">{[
      ["Debates",allDebates.length,"#E8734A"],["Streams",allDebates.reduce((s,d)=>s+(d.streams?.length||0),0),"#3B6B9B"],
      ["Agents Used",Object.keys(agentCounts).length,"#2D8A6E"],["Avg Streams",allDebates.length?(allDebates.reduce((s,d)=>s+(d.streams?.length||0),0)/allDebates.length).toFixed(1):"0","#8B5CF6"]
    ].map(([label,val,color],i)=><div key={i} className="p-2.5 rounded-xl text-center" style={{background:`${color}06`}}>
      <div className="font-bold" style={{color,fontSize:18}}>{val}</div>
      <div className="text-xs" style={{color:"#999"}}>{label}</div>
    </div>)}</div>
    {/* Most active agents */}
    {topAgents.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>MOST ACTIVE AGENTS</h4>
      <div className="flex flex-wrap gap-1.5">{topAgents.map(([name,count],i)=><span key={i} className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:i===0?"#E8734A10":"#F3F4F6",color:i===0?"#E8734A":"#666"}}>{name} ({count})</span>)}</div>
    </div>}
    {/* Topic cloud */}
    {topWords.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>DEBATE TOPICS</h4>
      <div className="flex flex-wrap gap-1.5">{topWords.map(([word,count],i)=>{const size=Math.min(12+count*2,20);return <span key={i} style={{fontSize:size,color:`rgba(0,0,0,${0.3+count*0.1})`,fontWeight:count>2?600:400}}>{word}</span>})}</div>
    </div>}
    {/* Pillar distribution bar */}
    {totalPillar>0&&<div><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>PILLAR DISTRIBUTION</h4>
      <div className="flex rounded-full overflow-hidden" style={{height:8}}>
        <div style={{width:`${(pillarCounts.rethink/totalPillar)*100}%`,background:"#3B6B9B"}}/>
        <div style={{width:`${(pillarCounts.rediscover/totalPillar)*100}%`,background:"#E8734A"}}/>
        <div style={{width:`${(pillarCounts.reinvent/totalPillar)*100}%`,background:"#2D8A6E"}}/>
      </div>
      <div className="flex justify-between mt-1">{Object.entries(pillarCounts).map(([p,c])=><span key={p} className="text-xs" style={{color:PILLARS[p]?.color}}>{PILLARS[p]?.label}: {c}</span>)}</div>
    </div>}
  </div>
}
