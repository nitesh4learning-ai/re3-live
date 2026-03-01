"use client";
import { useState } from "react";
import { useApp } from '../../providers';
import { PILLARS } from '../../constants';
import { getCycles } from '../../utils/helpers';
import { FadeIn, PillarTag } from '../shared/UIComponents';

export default function SearchPage(){
  const { content, nav: onNavigate } = useApp();

  const cycles=getCycles(content);const[query,setQuery]=useState("");const[results,setResults]=useState([]);
  // Build searchable artifact index
  const artifacts=[];
  cycles.forEach(c=>{
    if(c.artifacts?.questions?.items)c.artifacts.questions.items.forEach(q=>artifacts.push({type:"question",text:q,cycle:c,pillar:"rethink",source:c.rethink?.title}));
    if(c.artifacts?.principle?.statement)artifacts.push({type:"principle",text:c.artifacts.principle.statement,cycle:c,pillar:"rediscover",source:c.rediscover?.title,evidence:c.artifacts.principle.evidence});
    if(c.artifacts?.blueprint?.components)c.artifacts.blueprint.components.forEach(comp=>artifacts.push({type:"component",text:comp,cycle:c,pillar:"reinvent",source:c.reinvent?.title}));
    if(c.throughLineQuestion)artifacts.push({type:"through-line",text:c.throughLineQuestion,cycle:c,pillar:"all",source:`Edition ${c.number}`});
    if(c.rediscover?.patterns)c.rediscover.patterns.forEach(p=>artifacts.push({type:"pattern",text:`${p.domain}: ${p.principle||p.summary}`,cycle:c,pillar:"rediscover",source:c.rediscover.title}));
    if(c.reinvent?.openThread)artifacts.push({type:"open-thread",text:c.reinvent.openThread,cycle:c,pillar:"reinvent",source:c.reinvent.title});
  });
  const doSearch=(q)=>{setQuery(q);if(!q.trim()){setResults([]);return}const lower=q.toLowerCase();setResults(artifacts.filter(a=>a.text.toLowerCase().includes(lower)))};
  const typeColors={"question":"#3B6B9B","principle":"#E8734A","component":"#2D8A6E","through-line":"#8B5CF6","pattern":"#E8734A","open-thread":"#2D8A6E"};
  const typeLabels={"question":"Open Question","principle":"Principle","component":"Blueprint Component","through-line":"Guiding Question","pattern":"Pattern","open-thread":"Open Thread"};
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Artifact Search</h1>
      <p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Search across all edition artifacts — questions, principles, blueprints, patterns. {artifacts.length} artifacts indexed.</p></FadeIn>
    <FadeIn delay={30}><div className="mb-6"><input value={query} onChange={e=>doSearch(e.target.value)} placeholder="Search artifacts... (e.g. 'governance', 'architecture', 'trust')" className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none" style={{borderColor:"#E5E7EB",background:"white",fontSize:14}} autoFocus/></div></FadeIn>
    {/* Show all artifacts when no query */}
    {!query.trim()&&<FadeIn delay={50}><div className="mb-4">
      <h3 className="font-bold mb-3" style={{color:"#111827",fontSize:15}}>All Artifacts by Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">{Object.entries(typeLabels).map(([type,label])=>{const count=artifacts.filter(a=>a.type===type).length;return count>0&&<button key={type} onClick={()=>doSearch(type)} className="p-3 rounded-xl text-center transition-all hover:shadow-sm" style={{background:`${typeColors[type]}08`,border:`1px solid ${typeColors[type]}15`}}>
        <div className="font-bold text-lg" style={{color:typeColors[type]}}>{count}</div>
        <div className="text-xs" style={{color:`${typeColors[type]}90`}}>{label}s</div>
      </button>})}</div>
    </div></FadeIn>}
    {/* Results */}
    {query.trim()&&<div className="mb-2 text-xs" style={{color:"#CCC"}}>{results.length} result{results.length!==1?"s":""}</div>}
    <div className="space-y-2">{(query.trim()?results:artifacts.slice(0,30)).map((a,i)=><FadeIn key={i} delay={i*15}>
      <div className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" style={{background:"white",border:`1px solid ${typeColors[a.type]||"#E5E7EB"}20`}} onClick={()=>{const post=a.cycle[a.pillar==="all"?"rethink":a.pillar];if(post)onNavigate("post",post.id);else onNavigate("loom-cycle",a.cycle.id)}}>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:`${typeColors[a.type]}12`,color:typeColors[a.type]}}>{typeLabels[a.type]||a.type}</span>
          <span className="text-xs" style={{color:"#CCC"}}>Edition {a.cycle.number}</span>
          {a.source&&<span className="text-xs" style={{color:"#BBB"}}>from: {a.source}</span>}
        </div>
        <p className="text-sm" style={{color:"#333",lineHeight:1.5}}>{a.text}</p>
        {a.evidence&&<div className="flex flex-wrap gap-1 mt-1">{a.evidence.map((ev,ei)=><span key={ei} className="text-xs px-1.5 py-0.5 rounded" style={{background:"#F3F4F6",color:"#888"}}>{ev}</span>)}</div>}
      </div>
    </FadeIn>)}</div>
  </div></div>
}
