"use client";
import { Fragment } from "react";
import { PILLARS, isAdmin } from '../../constants';
import { getAuthor, fmtS } from '../../utils/helpers';
import { FadeIn, AuthorBadge, PillarTag, ShareButton, renderParagraph } from './UIComponents';
import { OrchestratorAvatar } from './Icons';

// ==================== CYCLE CARD — The core visual unit (journey-aware) ====================
export function CycleCard({cycle,onNavigate,variant="default"}){
  const isHero = variant==="hero";
  return <div className="rounded-xl overflow-hidden transition-all hover:shadow-md" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onMouseEnter={e=>{if(!isHero)e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{if(!isHero)e.currentTarget.style.transform="translateY(0)"}}>
    {/* Through-line question for journey cycles */}
    {cycle.isJourney&&cycle.throughLineQuestion&&isHero&&<div className="px-5 pt-4 pb-2">
      <p className="text-sm font-semibold text-center" style={{color:"#8B5CF6",fontStyle:"italic",lineHeight:1.5}}>"{cycle.throughLineQuestion}"</p>
    </div>}
    <div className={isHero?"p-5 sm:p-6":"p-4"}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontFamily:"'Inter',sans-serif",fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Edition {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>{cycle.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E",fontWeight:700}}>Journey</span>}<span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
        <div className="flex items-center gap-3" style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#9CA3AF"}}><span>{cycle.endorsements} endorsements</span><span>{cycle.comments} replies</span></div>
      </div>
      {/* Journey progress dots */}
      {isHero&&(()=>{
        const dp=cycle.dynamicPillars;
        const dots=dp?dp.map((p,i)=>[p.key,p.label,p.color]):[["rethink","Rethink","#3B6B9B"],["rediscover","Rediscover","#E8734A"],["reinvent","Reinvent","#2D8A6E"]];
        return <div className="flex items-center justify-center gap-1.5 mb-4">
          {dots.map(([key,label,color],i)=>{const post=dp?cycle.posts?.[i]:cycle[key];return <Fragment key={key}>{i>0&&<div style={{width:24,height:2,background:`linear-gradient(90deg,${dots[i-1][2]},${color})`,borderRadius:4}}/>}<button onClick={()=>post&&onNavigate(cycle.isJourney?"loom-cycle":"post",cycle.isJourney?cycle.id:post.id)} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{background:post?color:"#E5E7EB"}}/><span className="text-xs font-semibold hidden sm:inline" style={{color:post?color:"#CCC"}}>{post?.title?.slice(0,25)||(label+"...")}{post?.title?.length>25?"...":""}</span></button></Fragment>})}
        </div>;
      })()}
      <div className={`grid grid-cols-1 ${isHero?"md:grid-cols-3":""} gap-3`}>
        {(()=>{const classicPosts=[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);const allPosts=classicPosts.length>0?classicPosts:cycle.posts||[];return allPosts;})().map((post,idx)=>{const author=getAuthor(post.authorId);const dp=cycle.dynamicPillars?.find(p=>p.key===post.pillar);const pc=dp?.color||PILLARS[post.pillar]?.color||"#9CA3AF";return <button key={post.id||idx} onClick={()=>onNavigate(cycle.isJourney?"loom-cycle":"post",cycle.isJourney?cycle.id:post.id)} className="text-left p-4 rounded-xl transition-all group" style={{background:"#FFFFFF",borderLeft:`4px solid ${pc}`,border:"1px solid #E5E7EB",borderLeftWidth:4,borderLeftColor:pc}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center gap-1.5 mb-2">{dp?<span className="inline-block px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${pc}15`,color:pc}}>{dp.label}</span>:<PillarTag pillar={post.pillar}/>}</div>
          <h3 className="font-bold leading-snug mb-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:isHero?16:14}}>{post.title}</h3>
          <p className="mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6B7280",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{(post.paragraphs?.[0]||"").replace(/\*\*/g,"").replace(/^- /gm,"").slice(0,isHero?140:100)}...</p>
          {author&&<AuthorBadge author={author}/>}
          <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all mt-1 inline-block" style={{color:"#9333EA"}}>{cycle.isJourney?"View journey":"Read"} &rarr;</span>
        </button>})}
      </div>
      {/* Journey artifact summary */}
      {isHero&&cycle.isJourney&&<div className="flex items-center justify-center gap-2 mt-3">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts[type];return a?<span key={type} className="px-2 py-0.5 rounded-full text-xs" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E",fontSize:10}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Qs":type==="principle"?"💡 Principle":"🔧 Blueprint"}</span>:null})}</div>}
      {cycle.extra?.length>0&&<div className="mt-2 text-xs" style={{color:"#9CA3AF"}}>+{cycle.extra.length} more</div>}
    </div>
  </div>
}

// ==================== TRIPTYCH COMPONENTS ====================
export function TriptychCard({cycle,onExpand,onArchiveCycle,currentUser}){
  const pillars=cycle.dynamicPillars?cycle.posts:[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const connectionDensity=cycle.posts.reduce((sum,p)=>sum+(p.debate?.streams?.length||0),0);
  return <div className="cursor-pointer rounded-xl overflow-hidden transition-all hover:shadow-md" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onClick={()=>onExpand(cycle.id)}>
    <div className="flex items-center justify-between p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Edition {cycle.number}{cycle.headline?': '+cycle.headline:''}</span><span style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
      <div className="flex items-center gap-3" style={{fontSize:11,color:"#9CA3AF"}}><span>{cycle.endorsements} endorsements</span>{connectionDensity>0&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:9,background:"#F3E8FF",color:"#9333EA"}}>{connectionDensity} threads</span>}
        <span onClick={e=>e.stopPropagation()}><ShareButton title={`Re³ Edition ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this edition on Re³" url={typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:''}/></span>
        {isAdmin(currentUser)&&onArchiveCycle&&<button onClick={e=>{e.stopPropagation();if(confirm('Archive this cycle? It will be hidden from views.'))onArchiveCycle(cycle.id)}} className="px-2 py-0.5 rounded-full font-semibold transition-all hover:bg-red-50" style={{fontSize:9,color:"rgba(229,62,62,0.6)",border:"1px solid rgba(229,62,62,0.2)"}}>Archive</button>}
      </div>
    </div>
    <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(pillars.length,3)} gap-0`}>{pillars.map((post,i)=>{const dp=cycle.dynamicPillars?.find(p=>p.key===post.pillar);const pc=dp?.color||PILLARS[post.pillar]?.color||"#9CA3AF";return <div key={post.id} className="p-4" style={{borderRight:i<pillars.length-1?"1px solid #E5E7EB":"none",borderLeft:`4px solid ${pc}`}}>
      {dp?<span className="inline-block px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${pc}15`,color:pc}}>{dp.label}</span>:<PillarTag pillar={post.pillar}/>}
      <h4 className="font-bold mt-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:"#111827",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</h4>
      <p className="mt-1" style={{fontSize:12,color:"#6B7280",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.paragraphs?.[0]?.replace(/\*\*/g,"").replace(/^- /gm,"").slice(0,180)}...</p>
    </div>})}</div>
    <div className="text-center py-2" style={{borderTop:"1px solid #E5E7EB"}}><span className="text-xs font-medium" style={{color:"#9333EA"}}>Click to explore &rarr;</span></div>
  </div>
}

export function TriptychExpanded({cycle,onNavigate,onCollapse,onForge,onArchiveCycle,currentUser}){
  const pillars=cycle.dynamicPillars?cycle.posts:[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const getAgentPerspectives=(post)=>{if(!post?.debate?.rounds)return[];return post.debate.rounds.flat().filter(r=>r.status==="success"&&r.response).slice(0,2).map(r=>({name:r.name,excerpt:(r.response||"").slice(0,120)+"..."}))};
  const synthesisPost=pillars.find(p=>p?.debate?.loom);
  return <div className="rounded-xl overflow-hidden mb-2" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
    <div className="flex items-center justify-between p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Edition {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>{cycle.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E"}}>Connected Journey</span>}<span style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
      <div className="flex items-center gap-2">
        <ShareButton title={`Re³ Edition ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this edition on Re³" url={typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:''}/>
        {isAdmin(currentUser)&&onArchiveCycle&&<button onClick={()=>{if(confirm('Archive this cycle? It will be hidden from views.'))onArchiveCycle(cycle.id)}} className="px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:bg-red-50" style={{color:"rgba(229,62,62,0.6)",border:"1px solid rgba(229,62,62,0.2)"}}>Archive</button>}
        <button onClick={onCollapse} className="px-2 py-1 rounded-lg text-xs" style={{color:"rgba(0,0,0,0.3)",border:"1px solid rgba(0,0,0,0.08)"}}>Collapse</button>
      </div>
    </div>
    {/* Through-line question (for journey cycles) */}
    {cycle.throughLineQuestion&&<div className="px-4 py-2" style={{background:"#FAF5FF",borderBottom:"1px solid #E9D5FF"}}>
      <p className="text-xs font-semibold text-center" style={{color:"#8B5CF6",fontStyle:"italic"}}>"{cycle.throughLineQuestion}"</p>
    </div>}
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(pillars.length,3)}`}>{pillars.map((post,i)=>{const dp=cycle.dynamicPillars?.find(p=>p.key===post.pillar);const pillarColor=dp?.color||PILLARS[post.pillar]?.color||"#9CA3AF";const perspectives=getAgentPerspectives(post);
      return <div key={post.id} className="p-4" style={{borderRight:i<pillars.length-1?"1px solid #E5E7EB":"none",borderLeft:`4px solid ${pillarColor}`}}>
        {dp?<span className="inline-block px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${pillarColor}15`,color:pillarColor}}>{dp.label}</span>:<PillarTag pillar={post.pillar}/>}
        <h3 className="font-bold mt-2 mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,color:"#111827",lineHeight:1.3}}>{post.title}</h3>
        <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.45)",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.paragraphs?.[0]?.replace(/\*\*/g,"").replace(/^- /gm,"").slice(0,180)}...</p>
        {perspectives.length>0&&<div className="mb-3"><span className="font-bold" style={{fontSize:9,color:"rgba(0,0,0,0.3)",letterSpacing:"0.1em"}}>PERSPECTIVES</span><div className="mt-1 space-y-1">{perspectives.map((p,pi)=><div key={pi} className="p-2 rounded-lg" style={{background:"rgba(0,0,0,0.02)",fontSize:11,color:"#888"}}><span className="font-bold" style={{color:pillarColor}}>{p.name}: </span>{p.excerpt}</div>)}</div></div>}
        <button onClick={()=>onNavigate("post",post.id)} className="text-xs font-semibold" style={{color:"#9333EA"}}>Read full post &rarr;</button>
      </div>})}</div>
    {/* Action bar with full-cycle debate option */}
    <div className="flex items-center gap-3 px-4 py-3" style={{borderTop:"1px solid #E5E7EB",background:"#FAFAFA"}}>
      <button onClick={()=>onNavigate("loom-cycle",cycle.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid #E9D5FF",color:"#9333EA"}}>View Journey</button>
    </div>
    {synthesisPost?.debate?.loom&&<div className="p-4" style={{background:"#FAF5FF",borderTop:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-1.5 mb-1"><span style={{fontSize:12}}>&#128296;</span><span className="font-bold text-xs" style={{color:"#9333EA"}}>Hypatia&apos;s Synthesis</span></div>
      <p style={{fontSize:12,color:"rgba(0,0,0,0.5)",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{synthesisPost.debate.loom.slice(0,300)}...</p>
    </div>}
  </div>
}

// ==================== ARTIFACT BOX — Reusable component for journey artifacts ====================
export function ArtifactBox({type,data,pillar}){
  if(!data)return null;
  const configs={questions:{icon:"🔍",label:"Questions Raised",color:"#3B6B9B",bg:"#E8EEF5"},principle:{icon:"💡",label:"Principle Extracted",color:"#E8734A",bg:"#FDE8E0"},blueprint:{icon:"🔧",label:"Blueprint",color:"#2D8A6E",bg:"#E0F2EC"}};
  const c=configs[type]||configs.questions;
  return <div className="rounded-xl p-4 mt-4" style={{background:c.bg,border:`1px solid ${c.color}30`}}>
    <div className="flex items-center gap-2 mb-2"><span style={{fontSize:14}}>{c.icon}</span><span className="font-bold text-xs" style={{color:c.color,letterSpacing:"0.05em"}}>{c.label.toUpperCase()}</span></div>
    {type==="questions"&&data.items?.map((q,i)=><div key={i} className="flex items-start gap-2 mb-1.5"><span className="font-bold text-xs mt-0.5" style={{color:c.color}}>{i+1}.</span><p className="text-sm" style={{color:"#444",lineHeight:1.5}}>{q}</p></div>)}
    {type==="principle"&&<><p className="text-sm font-semibold mb-2" style={{color:"#333",lineHeight:1.5,fontStyle:"italic"}}>"{data.statement}"</p>{data.evidence?.map((e,i)=><p key={i} className="text-xs mb-1" style={{color:"#888"}}>Evidence: {e}</p>)}</>}
    {type==="blueprint"&&<><div className="flex flex-wrap gap-1.5 mb-2">{data.components?.map((comp,i)=><span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:`${c.color}15`,color:c.color}}>{comp}</span>)}</div>{data.principle_applied&&<p className="text-xs" style={{color:"#888"}}>Principle applied: {data.principle_applied}</p>}{data.code_summary&&<p className="text-xs mt-1" style={{color:"#666"}}>{data.code_summary}</p>}</>}
  </div>
}

// ==================== BRIDGE TRANSITION — Visual divider between acts ====================
export function BridgeTransition({from,to,bridgeSentence}){
  const fromColor=PILLARS[from]?.color||"#999";const toColor=PILLARS[to]?.color||"#999";
  const transitionTexts={rethink_rediscover:"The question echoes across time...",rediscover_reinvent:"The pattern crystallizes into a blueprint..."};
  const hint=transitionTexts[`${from}_${to}`]||"The thread continues...";
  return <div className="my-6 relative">
    <div className="w-full rounded-full" style={{height:3,background:`linear-gradient(90deg,${fromColor},${toColor})`}}/>
    {bridgeSentence&&<div className="mt-3 px-4 py-3 rounded-xl" style={{background:"rgba(147,51,234,0.04)",border:"1px solid rgba(147,51,234,0.1)"}}>
      <p className="text-sm" style={{color:"#666",fontStyle:"italic",lineHeight:1.6}}>{bridgeSentence}</p>
    </div>}
    <p className="text-center mt-2 text-xs font-semibold" style={{color:"rgba(0,0,0,0.2)"}}>{hint}</p>
  </div>
}
