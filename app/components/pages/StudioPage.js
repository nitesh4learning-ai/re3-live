"use client";
import { useState, lazy, Suspense } from "react";
import { useApp } from '../../providers';
import { isAdmin, MODEL_PROVIDERS } from '../../constants';
import { FadeIn, PillarTag } from '../shared/UIComponents';

const LazyEditor = lazy(() => import("../../Editor"));

export default function StudioPage(){
  const { content, articles, agents, projects, user: currentUser, nav: onNavigate, saveArticle: onSaveArticle, deleteArticle: onDeleteArticle, saveProject: onSaveProject, deleteProject: onDeleteProject } = useApp();

  const[editing,setEditing]=useState(null);
  const[showProjForm,setShowProjForm]=useState(false);const[editProj,setEditProj]=useState(null);
  const[projTitle,setProjTitle]=useState("");const[projSubtitle,setProjSubtitle]=useState("");const[projDesc,setProjDesc]=useState("");const[projStatus,setProjStatus]=useState("Alpha");const[projTags,setProjTags]=useState("");const[projLink,setProjLink]=useState("");
  const[projType,setProjType]=useState("project");const[projIcon,setProjIcon]=useState("\u{1F4E6}");
  const[flippedTile,setFlippedTile]=useState(null);
  const admin = isAdmin(currentUser);
  const publishedArticles = articles.filter(a=>a.status==="published");
  const draftArticles = admin ? articles.filter(a=>a.status==="draft") : [];
  const STATUS_COLORS={Live:"#2D8A6E",Evolving:"#E8734A",Alpha:"#3B6B9B",Experiment:"#8B5CF6",Archived:"#999"};
  const STATUS_BGS={Live:"#EBF5F1",Evolving:"#FDF0EB",Alpha:"#EEF3F8",Experiment:"#F5F0FA",Archived:"#F3F4F6"};

  const handleSave = (article) => { onSaveArticle(article); setEditing(null); };
  const openProjForm=(proj)=>{if(proj){setEditProj(proj.id);setProjTitle(proj.title);setProjSubtitle(proj.subtitle||"");setProjDesc(proj.description||"");setProjStatus(proj.status||"Alpha");setProjTags(proj.tags?.join(", ")||"");setProjLink(proj.link||"");setProjType(proj.type||"project");setProjIcon(proj.icon||"\u{1F4E6}")}else{setEditProj(null);setProjTitle("");setProjSubtitle("");setProjDesc("");setProjStatus("Alpha");setProjTags("");setProjLink("");setProjType("project");setProjIcon("\u{1F4E6}")}setShowProjForm(true);setFlippedTile(null)};
  const saveProjForm=()=>{if(!projTitle.trim())return;const p={id:editProj||"proj_"+Date.now(),title:projTitle.trim(),subtitle:projSubtitle.trim(),status:projStatus,statusColor:STATUS_COLORS[projStatus]||"#999",description:projDesc.trim(),tags:projTags.split(",").map(t=>t.trim()).filter(Boolean),link:projLink.trim()||undefined,ownerId:"u1",type:projType,icon:projIcon};onSaveProject(p);setShowProjForm(false)};

  if(editing){return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="px-4 sm:px-6 py-8">
    <Suspense fallback={<div className="max-w-3xl mx-auto"><p style={{color:"#CCC"}}>Loading editor...</p></div>}>
      <LazyEditor article={editing==="new"?null:editing} onSave={handleSave} onCancel={()=>setEditing(null)}/>
    </Suspense>
  </div></div>}

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,28px)"}}>My Studio</h1><p className="mb-6" style={{fontSize:13,color:"#999"}}>{admin?"Your workspace. Write articles and manage projects.":"Browse published work from the Re\u00b3 community."}</p></FadeIn>

    {admin&&<FadeIn delay={30}><button onClick={()=>setEditing("new")} className="mb-6 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Write Article</button></FadeIn>}

    {admin&&draftArticles.length>0&&<><FadeIn delay={40}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#E8734A",fontSize:16}}>Drafts ({draftArticles.length})</h2></FadeIn>
      <div className="space-y-1.5 mb-6">{draftArticles.map((a,i)=><FadeIn key={a.id} delay={50+i*20}><div className="flex items-center justify-between p-3 rounded-xl border" style={{background:"white",borderColor:"#E5E7EB"}}>
        <div className="flex-1"><div className="flex items-center gap-2 mb-0.5"><PillarTag pillar={a.pillar}/><span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#FFF5F5",color:"#E8734A"}}>DRAFT</span></div><h3 className="font-semibold text-sm" style={{color:"#111827"}}>{a.title}</h3></div>
        <div className="flex gap-1"><button onClick={()=>setEditing(a)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onDeleteArticle(a.id)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#E53E3E",background:"#FFF5F5"}}>Delete</button></div>
      </div></FadeIn>)}</div></>}

    {publishedArticles.length>0&&<><FadeIn delay={60}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Published Articles ({publishedArticles.length})</h2></FadeIn>
      <div className="space-y-1.5 mb-6">{publishedArticles.map((a,i)=><FadeIn key={a.id} delay={70+i*20}><div className="flex items-center justify-between p-3 rounded-xl border" style={{background:"white",borderColor:"#E5E7EB"}}>
        <button onClick={()=>onNavigate("article",a.id)} className="flex-1 text-left"><div className="flex items-center gap-2 mb-0.5"><PillarTag pillar={a.pillar}/><span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#EBF5F1",color:"#2D8A6E"}}>PUBLISHED</span></div><h3 className="font-semibold text-sm" style={{color:"#111827"}}>{a.title}</h3></button>
        {admin&&<div className="flex gap-1"><button onClick={()=>setEditing(a)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onSaveArticle({...a,status:"draft"})} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#E8734A",background:"#FDF0EB"}}>Unpublish</button></div>}
      </div></FadeIn>)}</div></>}

    {/* Projects & Whitepapers — Tile Grid */}
    <FadeIn delay={75}><div className="flex items-center justify-between mb-3">
      <h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Projects & Whitepapers ({projects.length})</h2>
      {admin&&<button onClick={()=>openProjForm(null)} className="px-3 py-1.5 rounded-full font-semibold text-xs transition-all hover:shadow-sm" style={{background:"#9333EA",color:"white"}}>+ Add Tile</button>}
    </div></FadeIn>

    {/* Admin Form */}
    {admin&&showProjForm&&<FadeIn><div className="p-4 rounded-2xl border mb-4" style={{background:"white",borderColor:"#9333EA40",borderStyle:"dashed"}}>
      <h3 className="font-bold mb-2" style={{fontSize:14,color:"#111827"}}>{editProj?"Edit Tile":"Add Tile"}</h3>
      <input value={projTitle} onChange={e=>setProjTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <input value={projSubtitle} onChange={e=>setProjSubtitle(e.target.value)} placeholder="Subtitle (e.g. Governance Interaction Mesh)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <textarea value={projDesc} onChange={e=>setProjDesc(e.target.value)} placeholder="Description..." className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555",minHeight:60,resize:"vertical"}}/>
      <div className="flex flex-wrap gap-2 mb-2">
        <div className="flex items-center gap-1"><span className="text-xs" style={{color:"#BBB"}}>Status:</span>{["Live","Evolving","Alpha","Experiment","Archived"].map(s=><button key={s} onClick={()=>setProjStatus(s)} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:projStatus===s?STATUS_BGS[s]:"white",color:projStatus===s?STATUS_COLORS[s]:"#CCC",border:`1px solid ${projStatus===s?STATUS_COLORS[s]:"#E5E7EB"}`}}>{s}</button>)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{color:"#BBB"}}>Type:</span>
        {["project","whitepaper"].map(t=><button key={t} onClick={()=>setProjType(t)} className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{background:projType===t?"#F5F0FA":"white",color:projType===t?"#9333EA":"#CCC",border:`1px solid ${projType===t?"#9333EA":"#E5E7EB"}`}}>{t}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{color:"#BBB"}}>Icon:</span>
        <span style={{fontSize:24}}>{projIcon}</span>
        <input value={projIcon} onChange={e=>setProjIcon(e.target.value)} className="w-16 px-2 py-1 rounded-xl border focus:outline-none text-center" style={{borderColor:"#E5E7EB",color:"#555",fontSize:18}}/>
        <div className="flex gap-1">{["\u{1F680}","\u{1F4DD}","\u{1F9EA}","\u{1F310}","\u{1F3AF}","\u{2699}\u{FE0F}","\u{1F4CA}","\u{1F916}"].map(e=><button key={e} onClick={()=>setProjIcon(e)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:projIcon===e?"#F5F0FA":"transparent",border:projIcon===e?"1px solid #9333EA":"1px solid transparent",fontSize:16}}>{e}</button>)}</div>
      </div>
      <input value={projTags} onChange={e=>setProjTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <input value={projLink} onChange={e=>setProjLink(e.target.value)} placeholder="Link (optional — e.g. https://medium.com/...)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <div className="flex gap-2"><button onClick={saveProjForm} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>{editProj?"Update":"Add"}</button><button onClick={()=>setShowProjForm(false)} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{color:"#CCC",border:"1px solid #E5E7EB"}}>Cancel</button></div>
    </div></FadeIn>}

    {/* Flip-Card Tile Grid */}
    <div className="re3-project-grid mb-6">{projects.map((proj,i)=>{
      const isFlipped=flippedTile===proj.id;
      const linkLabel=proj.link?(proj.link.includes("medium.com")?"View on Medium":proj.link.includes("vercel")?"View on Vercel":proj.link.includes("github.com")?"View on GitHub":"Visit"):"";
      return <FadeIn key={proj.id} delay={90+i*40}><div className="re3-tile-flip-container" style={{height:200}} onClick={()=>setFlippedTile(prev=>prev===proj.id?null:proj.id)}>
        <div className={`re3-tile-flip-inner ${isFlipped?"flipped":""}`}>
          {/* FRONT */}
          <div className="re3-tile-front" style={{background:"white",border:"1px solid #E5E7EB",padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:40}}>{proj.icon||"\u{1F4E6}"}</span>
            <h3 className="font-bold text-sm text-center" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",lineHeight:1.3}}>{proj.title}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,background:STATUS_BGS[proj.status]||"#F3F4F6",color:proj.statusColor||STATUS_COLORS[proj.status]||"#999"}}>{(proj.status||"").toUpperCase()}</span>
              <span className="px-2 py-0.5 rounded-full font-semibold capitalize" style={{fontSize:9,background:proj.type==="whitepaper"?"#FFF7ED":"#EEF3F8",color:proj.type==="whitepaper"?"#C2410C":"#3B6B9B"}}>{proj.type||"project"}</span>
            </div>
          </div>
          {/* BACK */}
          <div className="re3-tile-back" style={{background:"white",border:"1px solid #E5E7EB",padding:16,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs" style={{color:"#111827"}}>{proj.title}</span>
                <button onClick={e=>{e.stopPropagation();setFlippedTile(null)}} className="text-xs px-1" style={{color:"#CCC",minHeight:"auto",minWidth:"auto"}}>{"\u2715"}</button>
              </div>
              {proj.subtitle&&<p className="text-xs mb-1" style={{color:"#AAA",fontStyle:"italic"}}>{proj.subtitle}</p>}
              <p className="text-xs mb-2 line-clamp-3" style={{color:"#666",lineHeight:1.5}}>{proj.description}</p>
              {proj.tags?.length>0&&<div className="flex flex-wrap gap-1 mb-2">{proj.tags.map(t=><span key={t} className="px-1.5 py-0 rounded-full" style={{fontSize:9,background:"#F3F4F6",color:"#999"}}>{t}</span>)}</div>}
            </div>
            <div className="flex items-center justify-between">
              {proj.link?<a href={proj.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#EEF3F8",color:"#3B6B9B",minHeight:"auto",minWidth:"auto"}}>{linkLabel} &rarr;</a>:<span/>}
              {admin&&<div className="flex gap-1" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>openProjForm(proj)} className="px-2 py-0.5 rounded text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8",minHeight:"auto",minWidth:"auto"}}>Edit</button>
                <button onClick={()=>onDeleteProject(proj.id)} className="px-2 py-0.5 rounded text-xs font-semibold" style={{color:"#E53E3E",background:"#FFF5F5",minHeight:"auto",minWidth:"auto"}}>Remove</button>
              </div>}
            </div>
          </div>
        </div>
      </div></FadeIn>})}</div>
  </div></div>
}
