"use client";
import { useState } from "react";
import { useApp } from '../../providers';
import { PILLARS } from '../../constants';
import { FadeIn } from '../shared/UIComponents';
import { PillarIcon } from '../shared/Icons';

export default function WritePage(){
  const { user: currentUser, nav: onNavigate, addPost: onSubmit, setShowLogin } = useApp();
  const[title,setTitle]=useState("");const[pillar,setPillar]=useState("rethink");const[body,setBody]=useState("");

  // Redirect unauthenticated users
  if (!currentUser) { if (setShowLogin) setShowLogin(true); onNavigate("home"); return null; }
  const submit=()=>{if(!title.trim()||!body.trim())return;onSubmit({id:"p_"+Date.now(),authorId:currentUser.id,pillar,type:"post",title:title.trim(),paragraphs:body.split("\n\n").filter(p=>p.trim()),reactions:{},highlights:{},marginNotes:[],tags:[],createdAt:new Date().toISOString().split("T")[0],sundayCycle:null,featured:false,endorsements:0,comments:[],challenges:[]});onNavigate("home")};
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>Write</h1></FadeIn>
    <div className="flex gap-2 mb-3">{Object.values(PILLARS).map(p=><button key={p.key} onClick={()=>setPillar(p.key)} className="flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all text-xs" style={{background:pillar===p.key?p.lightBg:"white",color:pillar===p.key?p.color:"#CCC",border:`1.5px solid ${pillar===p.key?p.color:"#E5E7EB"}`}}><PillarIcon pillar={p.key} size={11}/>{p.label}</button>)}</div>
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title..." className="w-full text-lg font-bold mb-3 p-3 rounded-xl border focus:outline-none" style={{fontFamily:"'Inter',system-ui,sans-serif",borderColor:"#E5E7EB",color:"#111827"}}/>
    <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your thinking... (blank lines separate paragraphs)" className="w-full p-3 rounded-xl border focus:outline-none text-sm" style={{minHeight:240,borderColor:"#E5E7EB",color:"#555",lineHeight:1.8,resize:"vertical"}}/>
    <div className="flex gap-2 mt-3"><button onClick={submit} className="px-5 py-2 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Publish</button><button onClick={()=>onNavigate("home")} className="px-5 py-2 rounded-full font-semibold text-sm" style={{border:"1.5px solid #E5E7EB",color:"#CCC"}}>Cancel</button></div>
  </div></div>
}
