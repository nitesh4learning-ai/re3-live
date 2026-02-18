"use client";
// Small reusable UI components: FadeIn, AuthorBadge, PillarTag, HeatBar, ShareButton, etc.
import { useState, useEffect, useRef } from "react";
import { PILLARS, REACTION_MAP } from '../../constants';
import { getAuthor, fmtS } from '../../utils/helpers';
import { PillarIcon } from './Icons';

export function FadeIn({children,delay=0,className=""}){const[v,setV]=useState(false);useEffect(()=>{const t=setTimeout(()=>setV(true),delay);return()=>clearTimeout(t)},[delay]);return <div className={className} style={{opacity:v?1:0,transform:v?"translateY(0) scale(1)":"translateY(12px) scale(0.98)",transition:`all 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms`}}>{children}</div>}

export function AuthorBadge({author,size="sm"}){if(!author)return null;const sz=size==="sm"?"w-6 h-6 text-xs":"w-8 h-8 text-sm";return <div className="flex items-center gap-1.5">{author.photoURL?<img src={author.photoURL} alt="" className={`${sz} rounded-full flex-shrink-0 object-cover`} referrerPolicy="no-referrer"/>:<div className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0`} style={{background:author.isAgent?`${author.color}12`:"#E5E7EB",color:author.isAgent?author.color:"#888",border:author.isAgent?`1.5px dashed ${author.color}40`:"1.5px solid #E8E8E8",fontSize:size==="sm"?9:11}}>{author.avatar}</div>}<span className={`font-semibold ${size==="sm"?"text-xs":"text-sm"}`} style={{color:"#111827"}}>{author.name}</span>{author.isAgent&&<span className="px-1 rounded font-black" style={{background:`${author.color}10`,color:author.color,fontSize:7,letterSpacing:"0.1em"}}>AI</span>}</div>}

export function PillarTag({pillar,size="sm"}){const p=PILLARS[pillar];if(!p)return null;return <span className={`inline-flex items-center gap-1 ${size==="sm"?"px-2 py-0.5 text-xs":"px-2.5 py-1 text-sm"} rounded-full font-semibold`} style={{background:p.lightBg,color:p.color}}><PillarIcon pillar={pillar} size={size==="sm"?11:13}/>{p.label}</span>}

export function HeatBar({count,max=48}){const i=Math.min(count/max,1);return <div className="rounded-full" style={{width:3,height:"100%",minHeight:8,background:`rgba(232,115,74,${0.1+i*0.5})`}}/>}

export function ShareButton({title,text,url}){
  const[copied,setCopied]=useState(false);
  const handleShare=async()=>{
    const shareUrl=url||window.location.href;
    if(navigator.share){try{await navigator.share({title:title||"Re\u00b3",text:text||"",url:shareUrl});return}catch(e){if(e.name==="AbortError")return}}
    try{await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000)}catch(e){/* fallback */}
  };
  return <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:shadow-sm" style={{background:copied?"#EBF5F1":"#F3F4F6",color:copied?"#2D8A6E":"#4B5563",border:`1px solid ${copied?"rgba(45,138,110,0.3)":"#E5E7EB"}`}}>{copied?"\u2713 Copied":"\u{1F4E4} Share"}</button>
}

export function CrossRefLink({post,allContent,onNavigate}){
  const[hover,setHover]=useState(false);const ref=useRef(null);const[pos,setPos]=useState({top:0,left:0});
  const target=allContent.find(c=>c.id===post.id);if(!target)return null;
  const pillar=PILLARS[target.pillar];
  const handleEnter=()=>{if(ref.current){const r=ref.current.getBoundingClientRect();setPos({top:r.bottom+8,left:Math.min(r.left,window.innerWidth-320)})}setHover(true)};
  return <span className="relative inline" ref={ref} onMouseEnter={handleEnter} onMouseLeave={()=>setHover(false)}>
    <button onClick={()=>onNavigate("post",target.id)} className="inline font-semibold underline transition-all" style={{color:pillar?.color||"#9333EA",textDecorationColor:`${pillar?.color||"#9333EA"}40`,cursor:"pointer",background:"none",border:"none",padding:0,fontSize:"inherit"}}>{target.title}</button>
    {hover&&<div className="fixed z-50 w-72 p-3 rounded-xl shadow-lg" style={{top:pos.top,left:pos.left,background:"#FFFFFF",border:`1px solid ${pillar?.color||"#E5E7EB"}30`,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",animation:"fadeInUp 0.15s ease-out"}}>
      <div className="flex items-center gap-2 mb-1.5"><PillarTag pillar={target.pillar}/><span className="text-xs" style={{color:"#CCC"}}>{fmtS(target.createdAt)}</span></div>
      <h4 className="font-bold text-sm mb-1" style={{color:"#111827",lineHeight:1.3}}>{target.title}</h4>
      <p className="text-xs" style={{color:"#888",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{target.paragraphs?.[0]?.slice(0,180)}...</p>
      <div className="mt-2 text-xs font-semibold" style={{color:pillar?.color||"#9333EA"}}>Click to read &rarr;</div>
    </div>}
  </span>
}

export function Disclaimer(){return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3" style={{borderTop:"1px solid #E5E7EB"}}>
  <p style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"#9CA3AF",lineHeight:1.6,maxWidth:640}}>Re{"\u00b3"} is an experimental alpha platform by Nitesh Srivastava. Content is generated through human-AI collaboration for speculative, educational, and research purposes only {"\u2014"} AI-generated content may be inaccurate or incomplete. We use Google Sign-In and store basic profile data (name, email, photo) in your browser. Not for reproduction without attribution.</p>
</div>}

// Lightweight inline markdown renderer for paragraphs (bold + bullets)
export function renderInline(text){if(!text)return text;const parts=text.split(/(\*\*[^*]+\*\*)/g);return parts.map((part,i)=>{if(part.startsWith("**")&&part.endsWith("**"))return <strong key={i} style={{color:"#111827"}}>{part.slice(2,-2)}</strong>;return part})}

export function renderParagraph(text){if(!text||typeof text!=="string")return text;if(text.includes("\n- ")||text.startsWith("- ")){const lines=text.split("\n");const intro=[];const bullets=[];let inBullets=false;for(const line of lines){if(line.startsWith("- ")){inBullets=true;bullets.push(line.slice(2))}else if(!inBullets){intro.push(line)}}return <>{intro.length>0&&intro[0]&&<span>{renderInline(intro.join(" "))}</span>}<ul style={{margin:"8px 0",paddingLeft:20,listStyleType:"disc"}}>{bullets.map((b,i)=><li key={i} style={{marginBottom:4,lineHeight:1.7}}>{renderInline(b)}</li>)}</ul></>}return renderInline(text)}

export function ParagraphReactions({reactions={},onReact,paragraphIndex}){const[my,setMy]=useState({});return <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">{Object.entries(REACTION_MAP).map(([key,{label,pillar}])=>{const c=(reactions[key]||0)+(my[key]?1:0);const pc=PILLARS[pillar];return <button key={key} onClick={()=>{if(!my[key]){setMy(p=>({...p,[key]:true}));onReact(paragraphIndex,key)}}} title={label} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all hover:scale-105" style={{fontSize:10,background:my[key]?`${pc.color}12`:"#F8F8F8",color:my[key]?pc.color:"#CCC",border:my[key]?`1px solid ${pc.color}20`:"1px solid transparent"}}><PillarIcon pillar={pillar} size={10}/>{c>0&&<span className="font-semibold">{c}</span>}</button>})}</div>}
