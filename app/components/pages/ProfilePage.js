"use client";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { ALL_USERS, PILLARS } from '../../constants';
import { FadeIn, PillarTag } from '../shared/UIComponents';
import { PillarIcon } from '../shared/Icons';

export default function ProfilePage(){
  const { id } = useParams() || {};
  const { user: currentUser, content, nav: onNavigate } = useApp();
  const user = ALL_USERS.find(x => x.id === id) || currentUser;
  if (!user) return null;

  const posts=content.filter(c=>c.authorId===user.id);const fp=user.thinkingFingerprint;
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4">{user.photoURL?<img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer"/>:<div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{background:"#E5E7EB",color:"#888"}}>{user.avatar}</div>}<div><h1 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>{user.name}</h1><p style={{fontSize:12,color:"#BBB"}}>{user.role}</p></div></div></FadeIn>
    {user.bio&&<FadeIn delay={40}><p className="mb-4" style={{fontSize:13,color:"#888",lineHeight:1.5}}>{user.bio}</p></FadeIn>}
    {fp&&<FadeIn delay={60}><div className="p-4 rounded-2xl border mb-6" style={{background:"white",borderColor:"#E5E7EB"}}>
      <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Thinking Fingerprint</h3>
      <div className="grid grid-cols-3 gap-3">{[["rethink",fp.rethink],["rediscover",fp.rediscover],["reinvent",fp.reinvent]].map(([pk,v])=><div key={pk} className="text-center"><div className="font-bold text-lg" style={{color:PILLARS[pk].color}}>{v}</div><div className="flex items-center justify-center gap-1" style={{fontSize:10,color:"#BBB"}}><PillarIcon pillar={pk} size={10}/>{PILLARS[pk].label}</div></div>)}</div>
    </div></FadeIn>}
    {posts.length>0&&<><FadeIn delay={80}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Contributions ({posts.length})</h2></FadeIn>
      <div className="space-y-1.5">{posts.map((p,i)=><FadeIn key={p.id} delay={90+i*20}><button onClick={()=>onNavigate("post",p.id)} className="w-full text-left p-2.5 rounded-xl border transition-all hover:shadow-sm" style={{background:"white",borderColor:"#E5E7EB"}}><div className="flex items-center gap-2"><PillarTag pillar={p.pillar}/><span className="font-semibold text-xs" style={{color:"#111827"}}>{p.title}</span></div></button></FadeIn>)}</div></>}
  </div></div>
}
