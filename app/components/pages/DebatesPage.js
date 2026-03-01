"use client";
import { useState } from "react";
import { useApp } from '../../providers';
import { PILLARS, INIT_AGENTS, ORCHESTRATORS } from '../../constants';
import { getCycles, fmtS } from '../../utils/helpers';
import { FadeIn, PillarTag, ShareButton, renderInline } from '../shared/UIComponents';

export default function DebatesPage(){
  const { content, forgeSessions, nav: onNavigate, navToForge: onForge } = useApp();

  const cycles=getCycles(content);
  const[filter,setFilter]=useState("all");
  const[expanded,setExpanded]=useState(null);
  // Collect all debates from posts
  const allDebates=[];
  content.forEach(post=>{if(post.debate?.loom)allDebates.push({type:"post",id:post.id,title:post.title,pillar:post.pillar,loom:post.debate.loom,streams:post.debate.streams||[],panel:post.debate.panel,rounds:post.debate.rounds||[],date:post.createdAt})});
  forgeSessions?.forEach(s=>{if(s.mode==="debate"&&s.results?.loom)allDebates.push({type:"session",id:s.id,title:s.topic?.title||s.topic||"Untitled",loom:s.results.loom,streams:s.results.streams||[],panel:s.results.panel,rounds:s.results.rounds||[],date:s.date})});
  allDebates.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const filtered=filter==="all"?allDebates:filter==="sessions"?allDebates.filter(d=>d.type==="session"):allDebates.filter(d=>d.type==="post");
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Debate Gallery</h1>
      <p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Every debate, every synthesis. {allDebates.length} debate{allDebates.length!==1?"s":""} conducted.</p></FadeIn>
    <FadeIn delay={30}><div className="flex flex-wrap items-center gap-2 mb-6">
      {[["all","All",allDebates.length],["post","From Articles",allDebates.filter(d=>d.type==="post").length],["sessions","Lab Sessions",allDebates.filter(d=>d.type==="session").length]].map(([key,label,count])=>
        <button key={key} onClick={()=>setFilter(key)} className="px-3 py-1.5 rounded-full font-medium text-sm transition-all" style={{background:filter===key?"#E8734A":"#FFFFFF",color:filter===key?"white":"#4B5563",border:filter===key?"1px solid #E8734A":"1px solid #E5E7EB"}}>{label} ({count})</button>)}
    </div></FadeIn>
    {/* Stats bar */}
    <FadeIn delay={50}><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">{[
      ["Total Debates",allDebates.length,"#E8734A"],
      ["Unique Agents",new Set(allDebates.flatMap(d=>d.panel?.agents?.map(a=>a.name)||[])).size,"#3B6B9B"],
      ["Key Themes",allDebates.reduce((s,d)=>s+(d.streams?.length||0),0),"#2D8A6E"],
      ["Total Rounds",allDebates.reduce((s,d)=>s+(d.rounds?.length||3),0),"#8B5CF6"]
    ].map(([label,val,color],i)=><div key={i} className="p-3 rounded-xl text-center" style={{background:`${color}08`,border:`1px solid ${color}15`}}>
      <div className="font-bold text-lg" style={{color}}>{val}</div>
      <div className="text-xs" style={{color:`${color}90`}}>{label}</div>
    </div>)}</div></FadeIn>
    <div className="space-y-3">{filtered.length>0?filtered.map((d,i)=><FadeIn key={d.id} delay={i*30}>
      <div className="rounded-xl overflow-hidden transition-all hover:shadow-md cursor-pointer" style={{background:"white",border:expanded===d.id?"2px solid #E8734A":"1px solid #E5E7EB"}} onClick={()=>{if(d.type==="post"){onNavigate("post",d.id)}else{onNavigate("forge",d.id)}}}>
        <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid #F3F4F6"}}>
          <div className="flex items-center gap-2">{d.pillar&&<PillarTag pillar={d.pillar}/>}<span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:d.type==="session"?"#FFF3E0":"#F3E8FF",color:d.type==="session"?"#E8734A":"#9333EA"}}>{d.type==="session"?"Lab Session":"Article Debate"}</span><span className="text-xs" style={{color:"#CCC"}}>{d.date?fmtS(d.date):""}</span></div>
          <div className="flex items-center gap-2">
            {d.panel?.agents&&<div className="flex -space-x-1">{d.panel.agents.slice(0,5).map((a,ai)=><div key={ai} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",border:"1px solid white",fontSize:7,zIndex:5-ai}}>{a.avatar||a.name?.charAt(0)}</div>)}</div>}
            {d.type==="session"&&<span className="text-xs" style={{color:"#CCC"}}>{expanded===d.id?"▲":"▼"}</span>}
          </div>
        </div>
        <div className="p-4"><h3 className="font-bold text-sm mb-2" style={{color:"#111827"}}>{d.title}</h3>
          {expanded!==d.id&&<><p className="text-xs mb-2" style={{color:"#888",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{d.loom?.slice(0,250)}...</p>
          {d.streams?.length>0&&<div className="flex flex-wrap gap-1.5">{d.streams.slice(0,3).map((s,si)=><span key={si} className="px-2 py-0.5 rounded-full text-xs" style={{background:"#F3F4F6",color:"#666"}}>{s.title}</span>)}{d.streams.length>3&&<span className="text-xs" style={{color:"#CCC"}}>+{d.streams.length-3} more</span>}</div>}</>}
          {expanded===d.id&&<div onClick={e=>e.stopPropagation()}>
            {/* Panel */}
            {d.panel?.agents&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6",letterSpacing:"0.05em"}}>DEBATE PANEL</h4>
              <div className="flex flex-wrap gap-2 mb-2">{d.panel.agents.map((a,ai)=><span key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:`${a.color||"#999"}10`,border:`1px solid ${a.color||"#999"}25`}}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",fontSize:8}}>{a.avatar||a.name?.charAt(0)}</span>
                <span className="text-xs font-semibold" style={{color:a.color||"#666"}}>{a.name}</span>
              </span>)}</div>
              {d.panel.rationale&&<p className="text-xs" style={{color:"#888",lineHeight:1.6,fontStyle:"italic"}}>{d.panel.rationale}</p>}
            </div>}
            {/* Debate Rounds */}
            {d.rounds?.length>0&&<div className="mb-4"><h4 className="font-bold mb-2" style={{fontSize:13,color:"#E8734A",letterSpacing:"0.05em"}}>DEBATE ROUNDS ({d.rounds.length})</h4>
              {d.rounds.map((round,ri)=><div key={ri} className="mb-3"><span className="font-bold" style={{fontSize:13,color:"#8B5CF6"}}>Round {ri+1}</span>
                <div className="space-y-2 mt-1.5">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{
                  const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);
                  const truncated=r.response.length>300?r.response.slice(0,300)+"...":r.response;
                  return <div key={idx} className="p-3 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}>
                    <div className="flex items-center gap-2 mb-1.5"><span className="font-bold" style={{fontSize:14,color:agent?.color||"#444"}}>{r.name||agent?.name||"Agent"}</span><span style={{fontSize:11,color:"#999"}}>{agent?.category||""}</span></div>
                    <p style={{fontSize:14,color:"#333",lineHeight:1.7}}>{renderInline(truncated)}</p>
                  </div>})}</div>
              </div>)}
            </div>}
            {/* Key Themes */}
            {d.streams?.length>0&&<div className="mb-4"><h4 className="font-bold mb-2" style={{fontSize:13,color:"#2D8A6E",letterSpacing:"0.05em"}}>KEY THEMES</h4>
              {d.streams.map((stream,si)=><div key={si} className="mb-2 p-3 rounded-lg" style={{background:"#F9FAFB"}}>
                <span className="font-bold" style={{fontSize:14,color:"#111827"}}>{stream.title}</span>
                <div className="mt-1 space-y-1">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2" style={{fontSize:13}}><span className="font-bold flex-shrink-0" style={{color:"#666"}}>{entry.agent}</span><span style={{color:"#444"}}>{entry.excerpt}</span></div>)}</div>
              </div>)}
            </div>}
            {/* Synthesis */}
            <div className="mb-2"><h4 className="font-bold mb-2" style={{fontSize:13,color:"#3B6B9B",letterSpacing:"0.05em"}}>SYNTHESIS</h4>
              <div style={{fontSize:14,color:"#333",lineHeight:1.7}}>{d.loom?.split("\n\n").map((p,pi)=><p key={pi} className="mb-2">{renderInline(p)}</p>)}</div>
            </div>
          </div>}
        </div>
      </div>
    </FadeIn>):<FadeIn><div className="p-6 rounded-xl text-center" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}><p className="text-sm mb-3" style={{color:"#9CA3AF"}}>No debates yet. Start one in the Debate Lab!</p><button onClick={()=>onNavigate("forge")} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}}>Go to Debate Lab &rarr;</button></div></FadeIn>}</div>
  </div></div>
}
