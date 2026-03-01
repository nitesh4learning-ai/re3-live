"use client";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { isAdmin } from '../../constants';
import { FadeIn, PillarTag, ShareButton } from '../shared/UIComponents';
import { AgentWorkshop } from '../shared/DebateComponents';

export default function ArticlePage(){
  const { id } = useParams() || {};
  const { content, agents, registry, registryIndex, nav: onNavigate, saveArticle: onUpdateArticle, user: currentUser } = useApp();
  const article = content.find(c => c.id === id && c.type === "article");

  if(!article)return null;
  const handleDebateComplete=(debate)=>{if(onUpdateArticle)onUpdateArticle({...article,debate})};
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="mx-auto py-8" style={{maxWidth:720,background:"#FFFFFF",borderRadius:16,padding:"32px 40px",margin:"32px auto",boxShadow:"0 2px 16px rgba(0,0,0,0.06)"}}>
    <FadeIn><button onClick={()=>onNavigate("studio")} style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#CCC",marginBottom:24,display:"block"}}>&larr; Back</button></FadeIn>
    <FadeIn delay={40}><div className="flex items-center gap-2 mb-3"><PillarTag pillar={article.pillar} size="md"/><span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,background:article.status==="published"?"#EBF5F1":"#FFF5F5",color:article.status==="published"?"#2D8A6E":"#E8734A"}}>{article.status?.toUpperCase()}</span></div></FadeIn>
    <FadeIn delay={60}><h1 className="font-bold leading-tight mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(20px,3.5vw,30px)"}}>{article.title}</h1></FadeIn>
    <FadeIn delay={70}><div className="flex items-center gap-2 pb-4 mb-6" style={{borderBottom:"1px solid #E5E7EB"}}><span style={{fontSize:12,color:"#999"}}>by Nitesh Srivastava</span><span style={{fontSize:12,color:"#CCC"}}>&middot; {article.updatedAt||article.createdAt}</span></div></FadeIn>
    <FadeIn delay={80}><div className="prose prose-sm max-w-none" style={{color:"#555",fontSize:14,lineHeight:1.9}} dangerouslySetInnerHTML={{__html:article.htmlContent||""}}></div></FadeIn>
    {article.tags?.length>0&&<div className="flex flex-wrap items-center gap-1.5 mt-6 pt-4" style={{borderTop:"1px solid #E5E7EB"}}>{article.tags.map(t=><span key={t} className="px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F3F4F6",color:"#999"}}>{t}</span>)}<div className="flex-1"/><ShareButton title={article.title} text={article.title}/></div>}
    <div className="mt-8 pt-6" style={{borderTop:"2px solid #E5E7EB"}}>
      <h2 className="font-bold mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Agent Workshop</h2>
      <AgentWorkshop key={article?.id} article={article} agents={agents} registry={registry} registryIndex={registryIndex} onDebateComplete={handleDebateComplete} currentUser={currentUser}/>
    </div>
  </div></div>
}
