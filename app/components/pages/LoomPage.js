"use client";
import { useState } from "react";
import { useApp } from '../../providers';
import { isAdmin } from '../../constants';
import { getCycles } from '../../utils/helpers';
import { FadeIn } from '../shared/UIComponents';
import { TriptychCard, TriptychExpanded } from '../shared/LoomComponents';

export default function LoomPage(){
  const app = useApp();
  const { content, nav: onNavigate, user: currentUser, archiveCycle: onArchiveCycle, navToForge: onForge } = app;

  const cycles=getCycles(content);
  const[expandedId,setExpandedId]=useState(null);
  const admin=isAdmin(currentUser);

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="text-center mb-8"><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(24px,4vw,36px)"}}>The Loom</h1><p style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Each edition weaves three interconnected perspectives into a tapestry of insight.</p></div></FadeIn>
    {/* Stats */}
    <FadeIn delay={30}><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[["Editions",cycles.length,"#9333EA"],["Articles",content.filter(c=>c.type!=="article").length,"#3B6B9B"],["Endorsements",content.reduce((s,c)=>s+(c.endorsements||0),0),"#E8734A"],["Discussions",content.reduce((s,c)=>s+(c.comments?.length||0),0),"#2D8A6E"]].map(([label,val,color],i)=>
        <div key={i} className="p-3 rounded-xl text-center" style={{background:`${color}08`,border:`1px solid ${color}15`}}><div className="font-bold text-xl" style={{color}}>{val}</div><div className="text-xs" style={{color:`${color}80`}}>{label}</div></div>
      )}
    </div></FadeIn>
    {/* Triptych list */}
    <div className="space-y-4">{cycles.map((cycle,i)=><FadeIn key={cycle.id} delay={60+i*40}>
      {expandedId===cycle.id
        ?<TriptychExpanded cycle={cycle} onNavigate={onNavigate} onCollapse={()=>setExpandedId(null)} onForge={onForge} onArchiveCycle={admin?onArchiveCycle:null} currentUser={currentUser}/>
        :<TriptychCard cycle={cycle} onExpand={setExpandedId} onArchiveCycle={admin?onArchiveCycle:null} currentUser={currentUser}/>}
    </FadeIn>)}</div>
    {cycles.length===0&&<FadeIn><div className="p-8 rounded-xl text-center" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}><p className="text-sm" style={{color:"#9CA3AF"}}>No editions yet. Check back soon!</p></div></FadeIn>}
  </div></div>
}
