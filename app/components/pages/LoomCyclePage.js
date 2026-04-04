"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { PILLARS, ORCHESTRATORS, INIT_AGENTS, isAdmin } from '../../constants';
import { getAuthor, getCycles, fmtS } from '../../utils/helpers';
import { FadeIn, AuthorBadge, PillarTag, ShareButton, renderParagraph } from '../shared/UIComponents';
import { OrchestratorAvatar } from '../shared/Icons';
import { ArtifactBox, BridgeTransition } from '../shared/LoomComponents';

export default function LoomCyclePage(){
  const { id: cycleDate } = useParams() || {};
  const app = useApp();
  const { content, nav: onNavigate, user: currentUser, navToForge: onForge } = app;

  const cycles=getCycles(content);
  const cycle=cycles.find(c=>c.id===cycleDate)||cycles.find(c=>c.date===cycleDate);
  const[activeAct,setActiveAct]=useState(()=>cycle?.dynamicPillars?.[0]?.key||"rethink");
  const rethinkRef=useRef(null);const rediscoverRef=useRef(null);const reinventRef=useRef(null);
  const isJourney=cycle?.isJourney;
  useEffect(()=>{
    if(!isJourney)return;
    const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){setActiveAct(e.target.dataset.act)}})},{rootMargin:"-100px 0px -50% 0px",threshold:0.1});
    [rethinkRef,rediscoverRef,reinventRef].forEach(ref=>{if(ref.current)observer.observe(ref.current)});
    return()=>observer.disconnect();
  },[isJourney]);
  if(!cycle)return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
    <p style={{color:"#9CA3AF",fontSize:14}}>Edition not found.</p>
    <button onClick={()=>onNavigate("loom")} className="mt-4 text-sm font-semibold" style={{color:"#9333EA"}}>&larr; Back to The Loom</button>
  </div></div>;
  const classicPillars=[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const pillars=classicPillars.length>0?classicPillars:cycle.posts||[];
  const synthesisPost=pillars.find(p=>p?.debate?.loom);
  const allStreams=pillars.flatMap(p=>p?.debate?.streams||[]);
  const allParticipants=[...new Set(pillars.flatMap(p=>(p?.debate?.panel?.agents||[]).map(a=>a.name)))];
  const allRounds=pillars.flatMap(p=>p?.debate?.rounds||[]);
  const debatePanel=pillars.find(p=>p?.debate?.panel)?.debate?.panel;
  const cycleShareUrl=typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:'';

  const dp=cycle.dynamicPillars;
  const ACTS=dp?dp.map((p,i)=>[p.key,p.label,p.color,p.number||String(i+1).padStart(2,"0")]):[["rethink","Rethink","#3B6B9B","01"],["rediscover","Rediscover","#E8734A","02"],["reinvent","Reinvent","#2D8A6E","03"]];
  const scrollToAct=(act)=>{
    const refs={rethink:rethinkRef,rediscover:rediscoverRef,reinvent:reinventRef};
    if(dp){dp.forEach((p,i)=>{if(i===0)refs[p.key]=rethinkRef;if(i===1)refs[p.key]=rediscoverRef;if(i===2)refs[p.key]=reinventRef;});}
    refs[act]?.current?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}>
    {isJourney&&<div className="sticky z-40" style={{top:56,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",borderBottom:"1px solid #E5E7EB",padding:"8px 0"}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {cycle.throughLineQuestion&&<p className="text-xs font-semibold text-center mb-1.5" style={{color:"#8B5CF6",fontStyle:"italic"}}>"{cycle.throughLineQuestion}"</p>}
        <div className="flex items-center justify-center gap-2">{ACTS.map(([key,label,color,num],i)=>{const isActive=activeAct===key;const isPast=ACTS.findIndex(a=>a[0]===activeAct)>i;
          return <Fragment key={key}>{i>0&&<div style={{width:32,height:2,background:isPast||isActive?`linear-gradient(90deg,${ACTS[i-1][2]},${color})`:"#E5E7EB",borderRadius:4}}/>}
            <button onClick={()=>scrollToAct(key)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all" style={{background:isActive?`${color}12`:"transparent",border:isActive?`1px solid ${color}30`:"1px solid transparent"}}>
              <div className="w-3 h-3 rounded-full" style={{background:isActive||isPast?color:"#E5E7EB"}}/>
              <span className="font-bold text-xs hidden sm:inline" style={{color:isActive?color:isPast?"#666":"#CCC"}}>{label}</span>
            </button></Fragment>})}</div>
      </div>
    </div>}

    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center justify-between mb-6">
      <button onClick={()=>onNavigate("loom")} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.5)"}}>&larr; Back to The Loom</button>
      <div className="flex gap-2">
        <ShareButton title={`Re³ Edition ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this edition on Re³" url={cycleShareUrl}/>
        {onForge&&<button onClick={()=>onForge({title:cycle.throughLineQuestion||cycle.headline||pillars[0]?.title||"",text:pillars.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n"),sourceType:"cycle",cycleDate:cycle.date,cycleId:cycle.id})} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{background:"#9333EA",color:"white"}}>Debate Full Edition</button>}
      </div>
    </div></FadeIn>

    <FadeIn delay={40}><div className="mb-8 text-center">
      <span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Edition {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>
      <span className="ml-2" style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span>
      {isJourney&&<div className="flex items-center justify-center gap-1.5 mt-2">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts[type];return a?<span key={type} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E"}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Questions":type==="principle"?"💡 1 Principle":"🔧 1 Blueprint"}</span>:null})}</div>}
    </div></FadeIn>

    {isJourney ? <>
      {cycle.rethink&&<div ref={rethinkRef} data-act="rethink" className="mb-2">
        <FadeIn delay={80}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #3B6B9B`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#3B6B9B",letterSpacing:"0.1em"}}>01 &middot; RETHINK</span><OrchestratorAvatar type="hypatia" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.rethink.title}</h2>
            {cycle.rethink.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#F0F4F8",border:"1px solid #D5DDE5",fontSize:13,color:"#3B6B9B",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#3B6B9B",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#CBD5E0"}}>|</span>{cycle.rethink.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.rethink.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            <ArtifactBox type="questions" data={cycle.rethink.artifact}/>
            {cycle.rethink.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.rethink.comments.length})</h4><div className="space-y-1.5">{cycle.rethink.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
        {cycle.rediscover&&<BridgeTransition from="rethink" to="rediscover" bridgeSentence={cycle.rethink.bridgeSentence}/>}
      </div>}

      {cycle.rediscover&&<div ref={rediscoverRef} data-act="rediscover" className="mb-2">
        <FadeIn delay={120}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #E8734A`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#E8734A",letterSpacing:"0.1em"}}>02 &middot; REDISCOVER</span><OrchestratorAvatar type="socratia" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.rediscover.title}</h2>
            {cycle.rediscover.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5",fontSize:13,color:"#E8734A",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#E8734A",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#F5D5C0"}}>|</span>{cycle.rediscover.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.rediscover.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            {cycle.rediscover.patterns&&cycle.rediscover.patterns.length>0&&<div className="mt-4 p-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5"}}><span className="font-bold text-xs" style={{color:"#E8734A",letterSpacing:"0.05em"}}>PATTERNS DISCOVERED</span><div className="mt-2 space-y-2">{cycle.rediscover.patterns.map((pat,i)=><div key={i} className="flex items-start gap-2"><span className="font-bold text-xs mt-0.5" style={{color:"#E8734A"}}>{pat.domain}{pat.year?` (${pat.year})`:""}</span><span className="text-sm" style={{color:"#666"}}>{pat.summary}</span></div>)}</div></div>}
            <ArtifactBox type="principle" data={cycle.rediscover.artifact}/>
            {cycle.rediscover.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.rediscover.comments.length})</h4><div className="space-y-1.5">{cycle.rediscover.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
        {cycle.reinvent&&<BridgeTransition from="rediscover" to="reinvent" bridgeSentence={cycle.rediscover.bridgeSentence}/>}
      </div>}

      {cycle.reinvent&&<div ref={reinventRef} data-act="reinvent" className="mb-8">
        <FadeIn delay={160}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #2D8A6E`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#2D8A6E",letterSpacing:"0.1em"}}>03 &middot; REINVENT</span><OrchestratorAvatar type="ada" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.reinvent.title}</h2>
            {cycle.reinvent.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#E0F2EC",border:"1px solid #B8DFD0",fontSize:13,color:"#2D8A6E",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#2D8A6E",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#A8D5C4"}}>|</span>{cycle.reinvent.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.reinvent.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            <ArtifactBox type="blueprint" data={cycle.reinvent.artifact}/>
            {cycle.reinvent.openThread&&<div className="mt-4 p-3 rounded-xl" style={{background:"#E0F2EC",border:"1px solid #2D8A6E30"}}><span className="font-bold text-xs" style={{color:"#2D8A6E"}}>🌀 OPEN THREAD</span><p className="text-sm mt-1" style={{color:"#555",lineHeight:1.5}}>{cycle.reinvent.openThread}</p><p className="text-xs mt-1" style={{color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>This seeds the next cycle...</p></div>}
            {cycle.reinvent.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.reinvent.comments.length})</h4><div className="space-y-1.5">{cycle.reinvent.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
      </div>}

      {!cycle.rethink&&!cycle.rediscover&&!cycle.reinvent&&cycle.dynamicPillars&&cycle.posts?.map((post,idx)=>{
        const dpItem=cycle.dynamicPillars[idx]||{};
        const color=dpItem.color||"#6B7280";
        const num=dpItem.number||String(idx+1).padStart(2,"0");
        const label=(dpItem.label||post.pillar||"").toUpperCase();
        const actRef=idx===0?rethinkRef:idx===1?rediscoverRef:idx===2?reinventRef:null;
        const actKey=dpItem.key||post.pillar||`act-${idx}`;
        const tldrBg=`${color}10`;const tldrBorder=`${color}25`;
        const nextPost=cycle.posts[idx+1];
        return <div key={post.id||idx} ref={actRef} data-act={actKey} className={idx<cycle.posts.length-1?"mb-2":"mb-8"}>
          <FadeIn delay={80+idx*40}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid ${color}`}}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color,letterSpacing:"0.1em"}}>{num} &middot; {label}</span></div>
              <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{post.title}</h2>
              {post.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:tldrBg,border:`1px solid ${tldrBorder}`,fontSize:13,color,lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color,fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:`${color}50`}}>|</span>{post.tldr}</div>}
              <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{post.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
              {post.patterns&&post.patterns.length>0&&<div className="mt-4 p-3 rounded-xl" style={{background:tldrBg,border:`1px solid ${tldrBorder}`}}><span className="font-bold text-xs" style={{color,letterSpacing:"0.05em"}}>PATTERNS DISCOVERED</span><div className="mt-2 space-y-2">{post.patterns.map((pat,i)=><div key={i} className="flex items-start gap-2"><span className="font-bold text-xs mt-0.5" style={{color}}>{pat.domain}{pat.year?` (${pat.year})`:""}</span><span className="text-sm" style={{color:"#666"}}>{pat.summary}</span></div>)}</div></div>}
              {post.artifact&&<ArtifactBox type={post.artifact.type} data={post.artifact}/>}
              {post.openThread&&<div className="mt-4 p-3 rounded-xl" style={{background:tldrBg,border:`1px solid ${color}30`}}><span className="font-bold text-xs" style={{color}}>🌀 OPEN THREAD</span><p className="text-sm mt-1" style={{color:"#555",lineHeight:1.5}}>{post.openThread}</p><p className="text-xs mt-1" style={{color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>This seeds the next cycle...</p></div>}
              {post.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({post.comments.length})</h4><div className="space-y-1.5">{post.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
            </div>
          </div></FadeIn>
          {nextPost&&post.bridgeSentence&&<BridgeTransition from={actKey} to={cycle.dynamicPillars[idx+1]?.key||"next"} bridgeSentence={post.bridgeSentence}/>}
        </div>;
      })}

      <FadeIn delay={200}><div className="p-6 rounded-2xl text-center" style={{background:"white",border:"1px solid #E5E7EB"}}>
        <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Journey Complete</h3>
        <div className="flex items-center justify-center gap-3 mb-4">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts?.[type];return a?<span key={type} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E"}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Questions":type==="principle"?"💡 1 Principle":"🔧 1 Blueprint"}</span>:null})}</div>
        <div className="flex items-center justify-center gap-3">
          <ShareButton title={`Re³ Edition ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this edition on Re³" url={cycleShareUrl}/>
        </div>
      </div></FadeIn>
    </> : <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">{pillars.map((post,i)=>{const pillar=PILLARS[post.pillar];
        return <FadeIn key={post.id} delay={80+i*40}><div className="rounded-xl overflow-hidden" style={{background:"white",border:`1px solid ${pillar.color}25`,borderLeft:`4px solid ${pillar.color}`}}>
          <div className="p-4">
            <PillarTag pillar={post.pillar}/>
            <h3 className="font-bold mt-2 mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,color:"#111827",lineHeight:1.3}}>{post.title}</h3>
            <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.45)",lineHeight:1.6}}>{post.paragraphs?.[0]?.slice(0,250)}...</p>
            <button onClick={()=>onNavigate("post",post.id)} className="text-xs font-semibold" style={{color:"#9333EA"}}>Read full post &rarr;</button>
          </div>
        </div></FadeIn>})}</div>
    </>}

    {synthesisPost?.debate?.loom&&<FadeIn delay={200}><div className="p-6 rounded-2xl mb-8" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-2 mb-3"><OrchestratorAvatar type="hypatia" size={20}/><h3 className="font-bold" style={{color:"#3B6B9B",fontSize:18}}>{"Hypatia\u2019s Loom \u2014 A Synthesis"}</h3></div>
      <div style={{fontSize:14,color:"#555",lineHeight:1.9}}>{synthesisPost.debate.loom.split("\n\n").map((p,i)=><p key={i} className="mb-3">{p}</p>)}</div>
    </div></FadeIn>}
    {allStreams.length>0&&<FadeIn delay={260}><div className="mb-8">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Key Themes</h3>
      {allStreams.map((stream,si)=><div key={si} className="mb-4 p-4 rounded-xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
        <h4 className="font-bold text-sm mb-2" style={{color:"#111827"}}>{stream.title}</h4>
        <div className="space-y-1.5">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2 text-xs"><span className="font-bold" style={{color:"#999"}}>{entry.agent}</span><span style={{color:"#666"}}>{entry.excerpt}</span></div>)}</div>
      </div>)}
    </div></FadeIn>}
    {allParticipants.length>0&&<FadeIn delay={300}><div className="mb-8">
      <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Debate Participants</h3>
      <div className="flex flex-wrap gap-2">{allParticipants.map(name=><span key={name} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{background:"#F3F4F6",color:"#4B5563"}}>{name}</span>)}</div>
    </div></FadeIn>}
    {allRounds.length>0&&<FadeIn delay={320}><div className="mb-8">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Debate Rounds ({allRounds.length})</h3>
      {allRounds.map((round,ri)=><div key={ri} className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6"}}>Round {ri+1}</h4><div className="space-y-2">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);return <div key={idx} className="p-3 rounded-xl" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}><div className="flex items-center gap-2 mb-1"><span className="font-bold text-xs" style={{color:agent?.color||"#666"}}>{r.name||agent?.name||"Agent"}</span><span className="text-xs" style={{color:"#CCC"}}>{agent?.role||agent?.category||""}</span></div><p className="text-xs" style={{color:"#555",lineHeight:1.6}}>{r.response}</p></div>})}</div></div>)}
    </div></FadeIn>}
    {debatePanel?.rationale&&<FadeIn delay={340}><div className="mb-8 p-4 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}><h4 className="font-bold text-xs mb-1" style={{color:"#8B5CF6"}}>Panel Selection Rationale</h4><p className="text-xs" style={{color:"#666",lineHeight:1.6}}>{debatePanel.rationale}</p></div></FadeIn>}
    {!isJourney&&onForge&&pillars[0]&&<FadeIn delay={360}><button onClick={()=>onForge({title:pillars[0].title,text:pillars[0].paragraphs?.[0]||"",sourceType:"loom"})} className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Continue in Debate Lab &rarr;</button></FadeIn>}
  </div></div>;
}
