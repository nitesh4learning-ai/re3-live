"use client";
import { useState } from "react";
import { useApp } from '../../providers';
import { ORCHESTRATORS, MODEL_PROVIDERS, isAdmin } from '../../constants';
import { FadeIn } from '../shared/UIComponents';

export default function AgentsPage(){
  const { agents, registry, registryIndex, user: currentUser, saveAgent: onSaveAgent, deleteAgent: onDeleteAgent, navToForge: onForge } = useApp();

  const admin=isAdmin(currentUser);
  const[view,setView]=useState("domains");const[selectedDomain,setSelectedDomain]=useState(null);const[selectedSpec,setSelectedSpec]=useState(null);
  const[searchQuery,setSearchQuery]=useState("");const[styleFilter,setStyleFilter]=useState("");const[atlasFilter,setAtlasFilter]=useState("all");
  const[editing,setEditing]=useState(null);const[showForm,setShowForm]=useState(false);
  const[name,setName]=useState("");const[persona,setPersona]=useState("");const[model,setModel]=useState("anthropic");const[color,setColor]=useState("#3B6B9B");const[category,setCategory]=useState("Wild Cards");

  const startEdit=(a)=>{setName(a.name);setPersona(a.persona);setModel(a.model);setColor(a.color);setCategory(a.category||"Wild Cards");setEditing(a.id);setShowForm(true)};
  const startNew=()=>{setName("");setPersona("");setModel("anthropic");setCategory("Wild Cards");setColor(["#3B6B9B","#E8734A","#2D8A6E","#8B5CF6","#D4A574","#E53E3E","#38B2AC","#DD6B20"][Math.floor(Math.random()*8)]);setEditing(null);setShowForm(true)};
  const save=()=>{if(!name.trim()||!persona.trim())return;const agent={id:editing||"agent_"+name.trim().toLowerCase().replace(/\s+/g,"_"),name:name.trim(),persona:persona.trim(),model,color,avatar:name.trim().slice(0,2),status:"active",category};onSaveAgent(agent);setShowForm(false)};
  const changeModel=(agentId,newModel)=>{const a=agents.find(x=>x.id===agentId);if(a)onSaveAgent({...a,model:newModel})};

  const active=agents.filter(a=>a.status==="active");const inactive=agents.filter(a=>a.status==="inactive");
  const totalAgents=(registry?.totalAgents||0)+active.length;
  const domains=registry?.domains||[];

  // Search across all agents
  const searchResults=searchQuery.trim().length>2?[
    ...active.filter(a=>(a.name+' '+a.persona+' '+(a.category||'')).toLowerCase().includes(searchQuery.toLowerCase())),
    ...Object.values(registryIndex.byId).filter(a=>(a.name+' '+a.persona+' '+a.domain+' '+a.specialization).toLowerCase().includes(searchQuery.toLowerCase())).slice(0,60)
  ]:[];

  const currentDomain=selectedDomain?domains.find(d=>d.id===selectedDomain):null;
  const currentSpec=selectedSpec?registryIndex.bySpec[selectedSpec]:null;
  const specAgents=currentSpec?.agents||[];
  const filteredAgents=styleFilter?specAgents.filter(a=>a.cognitiveStyle?.type===styleFilter||a.cognitiveStyle?.disposition===styleFilter):specAgents;

  // Capability bar mini component
  const CapBar=({caps})=>{if(!caps)return null;const keys=["debate","ideate","critique","architect","implement","research","synthesize"];const labels=["Deb","Ide","Cri","Arc","Imp","Res","Syn"];const colors=["#E8734A","#3B6B9B","#C53030","#2D8A6E","#DD6B20","#6B46C1","#8B5CF6"];
    return <div className="flex gap-0.5 mt-1">{keys.map((k,i)=><div key={k} title={labels[i]+": "+caps[k]} className="flex flex-col items-center"><div className="rounded-sm" style={{width:12,height:3,background:`${colors[i]}${Math.round((caps[k]||1)/5*99).toString(16).padStart(2,'0')}`}}/><span style={{fontSize:6,color:"#CCC"}}>{labels[i]}</span></div>)}</div>};

  // Agent card renderer (reusable for registry + custom agents)
  const AgentCard=({a,isCustom})=>{const mp=MODEL_PROVIDERS.find(m=>m.id===a.model);
    return <div className="p-3 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow=`0 0 20px ${a.color}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none"}}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${a.color}20`,color:a.color,border:`1.5px solid ${a.color}40`,fontSize:9}}>{a.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5"><h4 className="font-bold text-sm" style={{color:"#111827"}}>{a.name}</h4>
            {isCustom&&admin?<select value={a.model} onChange={e=>changeModel(a.id,e.target.value)} className="px-1.5 py-0.5 rounded text-xs font-semibold appearance-none cursor-pointer" style={{background:`${mp?.color||"#999"}10`,color:mp?.color||"#999",border:`1px solid ${mp?.color||"#999"}30`,fontSize:9}}>{MODEL_PROVIDERS.map(m=><option key={m.id} value={m.id}>{m.label.split(" ")[0]}</option>)}</select>:<span className="px-1.5 py-0.5 rounded font-bold" style={{fontSize:8,background:`${mp?.color||"#999"}10`,color:mp?.color||"#999"}}>{mp?.label?.split(" ")[0]||a.model}</span>}
          </div>
          {a.cognitiveStyle&&<div className="flex gap-1 mb-1">{[a.cognitiveStyle.type,a.cognitiveStyle.disposition].filter(Boolean).map(s=><span key={s} className="px-1.5 py-0 rounded-full" style={{fontSize:7,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",textTransform:"capitalize"}}>{s}</span>)}</div>}
          <p className="text-xs" style={{fontFamily:"'Inter',sans-serif",color:"rgba(0,0,0,0.4)",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.persona}</p>
          <CapBar caps={a.capabilities}/>
          {isCustom&&admin&&<div className="flex gap-1 mt-1.5"><button onClick={()=>startEdit(a)} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onSaveAgent({...a,status:"inactive"})} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#E8734A",background:"#FDF0EB"}}>Deactivate</button></div>}
        </div>
      </div>
    </div>};

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-start justify-between"><div><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Agent Team</h1><p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(0,0,0,0.45)"}}>Meet the {totalAgents}+ AI specialists that power Re{'\u00b3'} debates &mdash; from CTOs to ethicists to economists.</p></div>
    {onForge&&<button onClick={()=>onForge({title:"",text:"",sourceType:"custom"})} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:shadow-md flex-shrink-0" style={{background:"#9333EA",color:"white"}}>🔨 Collaborate in Debate Lab</button>}</div></FadeIn>

    {/* Breadcrumb */}
    <FadeIn><div className="flex items-center gap-1.5 mb-4 flex-wrap">
      <button onClick={()=>{setView("domains");setSelectedDomain(null);setSelectedSpec(null)}} className="text-xs font-semibold" style={{color:view==="domains"?"#111827":"#3B6B9B"}}>All Domains</button>
      {currentDomain&&<><span style={{color:"#DDD",fontSize:10}}>/</span><button onClick={()=>{setView("specializations");setSelectedSpec(null)}} className="text-xs font-semibold" style={{color:view==="specializations"?"#111827":"#3B6B9B"}}>{currentDomain.name}</button></>}
      {currentSpec&&<><span style={{color:"#DDD",fontSize:10}}>/</span><span className="text-xs font-semibold" style={{color:"#111827"}}>{currentSpec.name}</span></>}
    </div></FadeIn>

    {/* Search bar */}
    <div className="flex gap-2 mb-4"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search agents by name, domain, or expertise..." className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm" style={{borderColor:"#D1D5DB",borderRadius:8,color:"#555"}}/>
      {view==="agents"&&<select value={styleFilter} onChange={e=>setStyleFilter(e.target.value)} className="px-2 py-2 rounded-lg border text-xs" style={{borderColor:"#D1D5DB",borderRadius:8,color:"#999"}}><option value="">All styles</option><option value="convergent">Convergent</option><option value="divergent">Divergent</option><option value="optimist">Optimist</option><option value="skeptic">Skeptic</option><option value="pragmatist">Pragmatist</option></select>}
    </div>

    {/* Category filter chips */}
    {view==="domains"&&<div className="flex flex-wrap items-center gap-2 mb-5">
      {[['all','All Domains',domains.length],...domains.map(d=>[d.id,d.name,d.specializations.reduce((s,sp)=>s+sp.agents.length,0)])].map(([key,label,count])=>
        <button key={key} onClick={()=>setAtlasFilter(key)} className="px-3 py-1.5 rounded-full font-medium text-sm transition-all" style={{background:atlasFilter===key?'#9333EA':'#FFFFFF',color:atlasFilter===key?'white':'#4B5563',border:atlasFilter===key?'1px solid #9333EA':'1px solid #E5E7EB'}}>{label} ({count})</button>
      )}
      <span className="ml-auto text-sm" style={{color:'#6B7280'}}>Showing <b>{atlasFilter==='all'?domains.length:1}</b> of {domains.length} domains</span>
    </div>}

    {/* Search results */}
    {searchQuery.trim().length>2?<div className="mb-6"><h3 className="font-bold mb-2 text-xs" style={{color:"rgba(0,0,0,0.4)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Search Results ({searchResults.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{searchResults.slice(0,20).map(a=><FadeIn key={a.id}><AgentCard a={a} isCustom={!a.domain}/></FadeIn>)}</div>
      {searchResults.length>20&&<p className="mt-2 text-xs text-center" style={{color:"rgba(0,0,0,0.3)"}}>Showing 20 of {searchResults.length} — narrow your search</p>}
    </div>:<>

    {/* Orchestration Layer */}
    <FadeIn delay={20}><div className="p-4 rounded-2xl mb-6" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#111827",letterSpacing:"0.05em",textTransform:"uppercase"}}>Orchestration Layer</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{Object.values(ORCHESTRATORS).map(o=><div key={o.id} className="p-3 rounded-xl" style={{background:`${o.color}06`,border:`1px solid ${o.color}20`}}>
        <div className="flex items-center gap-2 mb-1"><div className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{background:`${o.color}15`,color:o.color,fontSize:10,border:`1.5px dashed ${o.color}40`}}>{o.avatar}</div><div><span className="font-bold text-xs" style={{color:o.color}}>{o.name}</span><span className="block" style={{fontSize:9,color:"#BBB"}}>{o.role}</span></div></div>
        <p className="text-xs" style={{color:"#999",lineHeight:1.4}}>{o.persona.slice(0,100)}...</p>
      </div>)}</div>
    </div></FadeIn>

    {/* VIEW 1: Domain Map */}
    {view==="domains"&&<div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{(atlasFilter==='all'?domains:domains.filter(d=>d.id===atlasFilter)).map((d,i)=>{const agentCount=d.specializations.reduce((s,sp)=>s+sp.agents.length,0);const previewAgents=d.specializations.flatMap(s=>s.agents).slice(0,4);
        return <FadeIn key={d.id} delay={i*20}><button onClick={()=>{setSelectedDomain(d.id);setView("specializations")}} className="w-full text-left p-4 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderLeft:`4px solid ${d.color}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 20px ${d.color}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span style={{fontSize:16}}>{d.icon}</span><h3 className="font-bold text-sm" style={{color:"#111827"}}>{d.name}</h3></div><span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:`${d.color}12`,color:d.color}}>{agentCount}</span></div>
          <p className="text-xs mb-3" style={{color:"rgba(0,0,0,0.4)",lineHeight:1.4}}>{d.description}</p>
          <div className="flex items-center gap-1"><div className="flex -space-x-1">{previewAgents.map(a=><div key={a.id} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:6,border:"1px solid white"}}>{a.avatar}</div>)}</div><span className="text-xs ml-1" style={{color:"rgba(0,0,0,0.3)"}}>{d.specializations.length} specializations</span></div>
        </button></FadeIn>})}
      </div>

      {/* Custom agents section */}
      {active.length>0&&<div className="mt-6"><FadeIn><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:"1px solid #E5E7EB",paddingBottom:8}}>Custom Agents ({active.length})</h3></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{active.map((a,i)=><FadeIn key={a.id} delay={i*15}><AgentCard a={a} isCustom={true}/></FadeIn>)}</div>
      </div>}
    </div>}

    {/* VIEW 2: Specializations */}
    {view==="specializations"&&currentDomain&&<div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{currentDomain.specializations.map((s,i)=>{const topCap=s.agents.length>0?Object.entries(s.agents[0].capabilities||{}).sort((a,b)=>b[1]-a[1])[0]:null;
        return <FadeIn key={s.id} delay={i*25}><button onClick={()=>{setSelectedSpec(currentDomain.id+'/'+s.id);setView("agents")}} className="w-full text-left p-4 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderLeft:`3px solid ${currentDomain.color}`}} onMouseEnter={e=>{e.currentTarget.style.background="#FAFCFF";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"}} onMouseLeave={e=>{e.currentTarget.style.background="#FFFFFF";e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center justify-between mb-1"><h3 className="font-bold text-sm" style={{color:"#111827"}}>{s.name}</h3><span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:`${currentDomain.color}12`,color:currentDomain.color}}>{s.agents.length}</span></div>
          {topCap&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",textTransform:"capitalize"}}>Top: {topCap[0]}</span>}
          <div className="flex -space-x-1 mt-2">{s.agents.slice(0,6).map(a=><div key={a.id} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:6,border:"1px solid white"}}>{a.avatar}</div>)}{s.agents.length>6&&<div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.03)",color:"rgba(0,0,0,0.4)",fontSize:7}}>+{s.agents.length-6}</div>}</div>
        </button></FadeIn>})}
      </div>
    </div>}

    {/* VIEW 3: Agent Grid */}
    {view==="agents"&&currentSpec&&<div className="mb-6">
      <p className="text-xs mb-3" style={{color:"rgba(0,0,0,0.4)"}}>{filteredAgents.length} agents in {currentSpec.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{filteredAgents.map((a,i)=><FadeIn key={a.id} delay={i*15}><AgentCard a={a} isCustom={false}/></FadeIn>)}</div>
    </div>}

    </>}

    {/* Admin: Create agent */}
    {admin&&!showForm&&<FadeIn delay={30}><button onClick={startNew} className="mb-5 px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>+ Create Custom Agent</button></FadeIn>}

    {showForm&&<FadeIn><div className="p-4 rounded-2xl border mb-5" style={{background:"white",borderColor:"#E8734A40",borderStyle:"dashed"}}>
      <h3 className="font-bold mb-3" style={{fontSize:14,color:"#111827"}}>{editing?"Edit Agent":"Create Agent"}</h3>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Agent name" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <textarea value={persona} onChange={e=>setPersona(e.target.value)} placeholder="Persona prompt..." className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555",minHeight:80,resize:"vertical"}}/>
      <div className="flex flex-wrap gap-1.5 mb-2"><span className="text-xs self-center mr-1" style={{color:"#BBB"}}>Model:</span>{MODEL_PROVIDERS.map(m=><button key={m.id} onClick={()=>setModel(m.id)} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:model===m.id?`${m.color}15`:"white",color:model===m.id?m.color:"#CCC",border:`1px solid ${model===m.id?m.color:"#E5E7EB"}`}}>{m.label.split(" ")[0]}</button>)}</div>
      <div className="flex gap-2 mt-2"><button onClick={save} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>{editing?"Update":"Create"}</button><button onClick={()=>setShowForm(false)} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{color:"#CCC",border:"1px solid #E5E7EB"}}>Cancel</button></div>
    </div></FadeIn>}

    {inactive.length>0&&<div className="mt-4"><h3 className="font-bold mb-2" style={{fontSize:13,color:"#CCC"}}>Inactive ({inactive.length})</h3>
      <div className="space-y-1">{inactive.map(a=><div key={a.id} className="flex items-center justify-between p-2 rounded-lg" style={{background:"#F9FAFB"}}>
        <span className="text-xs" style={{color:"#CCC"}}>{a.name}</span>
        {admin&&<div className="flex gap-1"><button onClick={()=>onSaveAgent({...a,status:"active"})} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#2D8A6E",background:"#EBF5F1"}}>Activate</button><button onClick={()=>onDeleteAgent(a.id)} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#E53E3E",background:"#FFF5F5"}}>Delete</button></div>}
      </div>)}</div>
    </div>}
  </div></div>
}
