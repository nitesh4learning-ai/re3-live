"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { PILLARS } from '../../constants';
import { getAuthor, fmt, fmtS } from '../../utils/helpers';
import { FadeIn, AuthorBadge, PillarTag, HeatBar, ShareButton, CrossRefLink, renderParagraph, ParagraphReactions } from '../shared/UIComponents';
import { AgentWorkshop } from '../shared/DebateComponents';

export default function PostPage(){
  const { id } = useParams() || {};
  const app = useApp();
  const { content, agents, registry, registryIndex } = app;
  const { user: currentUser, nav: onNavigate, endorse: onEndorse, cmnt: onComment, addCh: onAddChallenge, react: onReact, addMN: onAddMarginNote, updatePost: onUpdatePost } = app;
  const post = content.find(c => c.id === id);
  const allContent = content;

  const[comment,setComment]=useState("");const[endorsed,setEndorsed]=useState(false);const[newCh,setNewCh]=useState("");const[showNote,setShowNote]=useState(null);const[noteText,setNoteText]=useState("");

  if(!post)return null;

  const author=getAuthor(post.authorId);const pillar=PILLARS[post.pillar];
  const bFrom=post.bridgeFrom?allContent.find(c=>c.id===post.bridgeFrom):null;
  const bTo=post.bridgeTo?allContent.find(c=>c.id===post.bridgeTo):null;
  // Find sibling posts in same cycle
  const siblings=post.sundayCycle?allContent.filter(c=>c.sundayCycle===post.sundayCycle&&c.id!==post.id):[];
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><article className="mx-auto py-8" style={{maxWidth:720,background:"#FFFFFF",borderRadius:16,padding:"32px 40px",margin:"32px auto",boxShadow:"0 2px 16px rgba(0,0,0,0.06)"}}>
    <FadeIn><button onClick={()=>onNavigate("home")} style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#CCC",marginBottom:24,display:"block"}}>&larr; Back</button></FadeIn>
    <FadeIn delay={40}><div className="flex flex-wrap items-center gap-2 mb-3"><PillarTag pillar={post.pillar} size="md"/>{post.type==="bridge"&&<span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F5F0FA",color:"#8B5CF6"}}>BRIDGE</span>}{post.sundayCycle&&<span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,color:"#CCC",background:"#F3F4F6"}}>CYCLE</span>}</div></FadeIn>
    <FadeIn delay={60}><h1 className="font-bold leading-tight mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(20px,3.5vw,30px)",letterSpacing:"-0.02em"}}>{post.title}</h1></FadeIn>
    {post.type==="bridge"&&(bFrom||bTo)&&<FadeIn delay={70}><div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl" style={{background:"#F5F0FA",border:"1px dashed #D4C4F0"}}><span style={{fontSize:11,color:"#8B5CF6"}}>Bridging:</span>{bFrom&&<button onClick={()=>onNavigate("post",bFrom.id)} className="font-semibold underline text-xs" style={{color:PILLARS[bFrom.pillar]?.color}}>{bFrom.title.slice(0,30)}...</button>}<span style={{color:"#D4C4F0"}}>&harr;</span>{bTo&&<button onClick={()=>onNavigate("post",bTo.id)} className="font-semibold underline text-xs" style={{color:PILLARS[bTo.pillar]?.color}}>{bTo.title.slice(0,30)}...</button>}</div></FadeIn>}
    <FadeIn delay={80}><div className="flex items-center justify-between pb-4 mb-6" style={{borderBottom:"1px solid #E5E7EB"}}><AuthorBadge author={author} size="md"/><span style={{fontSize:12,color:"#CCC"}}>{fmt(post.createdAt)}</span></div></FadeIn>

    {post.tldr&&<FadeIn delay={90}><div className="mb-5 px-4 py-3 rounded-xl" style={{background:pillar?.lightBg||"#F3F4F6",border:`1px solid ${pillar?.color||"#CCC"}20`,fontSize:13,color:pillar?.color||"#666",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",opacity:0.3}}>|</span>{post.tldr}</div></FadeIn>}

    <div className="mb-6">{post.paragraphs.map((para,i)=>{
      const hc=post.highlights?.[i]||0;const rx=post.reactions?.[i]||{};const notes=(post.marginNotes||[]).filter(n=>n.paragraphIndex===i);
      if(para.startsWith("```")){const lines=para.split("\n");const lang=lines[0].replace("```","");const code=lines.slice(1).join("\n");
        return <div key={i} className="my-4 rounded-xl overflow-hidden border" style={{borderColor:"#E5E7EB"}}>{lang&&<div className="px-4 py-1.5 flex items-center gap-2" style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB",fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:"#CCC"}}><span className="rounded-full" style={{width:5,height:5,background:"#E8734A"}}/><span className="rounded-full" style={{width:5,height:5,background:"#3B6B9B"}}/><span className="rounded-full" style={{width:5,height:5,background:"#2D8A6E"}}/><span className="ml-1">{lang.toUpperCase()}</span></div>}<pre className="p-4 overflow-x-auto text-xs" style={{background:"#F9FAFB",color:"#555",fontFamily:"monospace",lineHeight:1.7}}>{code}</pre></div>}
      return <FadeIn key={i} delay={100+i*20}><div className="group relative flex gap-2 mb-0.5">
        <div className="flex-shrink-0 flex flex-col justify-center py-1" style={{width:3}}>{hc>0&&<HeatBar count={hc}/>}</div>
        <div className="flex-1 py-1.5 px-1 rounded-lg transition-all" onMouseEnter={e=>e.currentTarget.style.background="rgba(232,115,74,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{fontSize:"clamp(13.5px,1.7vw,15px)",lineHeight:1.9,color:"#555"}}>{renderParagraph(para)}</div>
          <div className="flex items-center justify-between mt-0.5"><ParagraphReactions reactions={rx} onReact={onReact} paragraphIndex={i}/>{currentUser&&<button onClick={()=>{setShowNote(showNote===i?null:i);setNoteText("")}} className="opacity-0 group-hover:opacity-100 px-1.5 py-0 rounded transition-all" style={{fontSize:9,color:"#CCC"}}>+ note</button>}</div>
          {notes.length>0&&<div className="mt-1.5 space-y-1">{notes.map(n=>{const na=getAuthor(n.authorId);return <div key={n.id} className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg" style={{fontSize:11,background:"#FDF8F5",border:"1px solid #F8E8DD"}}><span className="font-semibold flex-shrink-0" style={{color:"#E8734A"}}>{na?.name}:</span><span style={{color:"#888"}}>{n.text}</span></div>})}</div>}
          {showNote===i&&<div className="mt-1.5 flex gap-1.5"><input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Quick thought..." className="flex-1 px-2.5 py-1 rounded-lg border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(noteText.trim()){onAddMarginNote(post.id,i,noteText.trim());setShowNote(null);setNoteText("")}}} className="px-2.5 py-1 rounded-lg font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Add</button></div>}
        </div></div></FadeIn>})}</div>

    <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      {post.tags.map(t=><span key={t} className="px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F3F4F6",color:"#999"}}>{t}</span>)}<div className="flex-1"/>
      <button onClick={()=>{if(!endorsed){onEndorse(post.id);setEndorsed(true)}}} className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all" style={{fontSize:11,background:endorsed?`${pillar?.color}08`:"white",border:`1.5px solid ${endorsed?pillar?.color:"#E0E0E0"}`,color:endorsed?pillar?.color:"#BBB"}}>{endorsed?"\u2665":"\u2661"} {post.endorsements+(endorsed?1:0)}</button>
      <ShareButton title={post.title} text={post.paragraphs?.[0]?.slice(0,140)}/>
    </div>

    {(post.challenges||[]).length>0&&<div className="mb-5"><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Challenges</h3>
      <div className="space-y-1.5">{post.challenges.map(ch=>{const ca=getAuthor(ch.authorId);return <div key={ch.id} className="flex items-start gap-2 p-2.5 rounded-xl border" style={{background:"#FFFBF8",borderColor:"#F8E8DD"}}><div className="flex-1"><p className="text-sm" style={{color:"#555",lineHeight:1.5}}>{ch.text}</p><span style={{fontSize:10,color:"#CCC"}}>{ca?.name}</span></div><span className="font-bold text-xs" style={{color:"#E8734A"}}>{ch.votes}</span></div>})}</div>
      {currentUser&&<div className="flex gap-1.5 mt-2"><input value={newCh} onChange={e=>setNewCh(e.target.value)} placeholder="Pose a challenge..." className="flex-1 px-3 py-1.5 rounded-xl border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(newCh.trim()){onAddChallenge(post.id,newCh.trim());setNewCh("")}}} className="px-3 py-1.5 rounded-xl font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Challenge</button></div>}
    </div>}

    <div className="mb-6"><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Discussion ({post.comments.length})</h3>
      <div className="space-y-2">{post.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2.5 rounded-xl" style={{background:"#F9FAFB"}}><p className="text-sm" style={{color:"#555",lineHeight:1.5}}>{c.text}</p><span style={{fontSize:10,color:"#CCC"}}>{fmtS(c.date)}</span></div></div>})}</div>
      {currentUser&&<div className="flex gap-1.5 mt-2"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add to the discussion..." className="flex-1 px-3 py-1.5 rounded-xl border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(comment.trim()){onComment(post.id,comment.trim());setComment("")}}} className="px-3 py-1.5 rounded-xl font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Reply</button></div>}
    </div>

    {siblings.length>0&&<div className="pt-4" style={{borderTop:"1px solid #E5E7EB"}}><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Also in this cycle</h3>
      <div className="space-y-1.5">{siblings.map(s=><div key={s.id} className="p-2.5 rounded-xl border transition-all hover:shadow-sm" style={{background:"white",borderColor:"#E5E7EB"}}><div className="flex items-center gap-2"><PillarTag pillar={s.pillar}/><CrossRefLink post={s} allContent={allContent} onNavigate={onNavigate}/></div></div>)}</div>
    </div>}

    {agents&&<div className="mt-8 pt-6" style={{borderTop:"2px solid #E5E7EB"}}>
      <h2 className="font-bold mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Agent Workshop</h2>
      <AgentWorkshop key={post?.id} article={post} agents={agents} registry={registry} registryIndex={registryIndex} onDebateComplete={(debate)=>{if(onUpdatePost)onUpdatePost({...post,debate})}} currentUser={currentUser}/>
    </div>}
  </article></div>
}
