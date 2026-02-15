"use client";
import { useState, useEffect, useCallback } from "react";

// ==================== DESIGN TOKENS ====================
const GIM = {
  primary:'#9333EA', primaryDark:'#7E22CE', primaryLight:'#FAF5FF',
  primaryBadge:'#F3E8FF', pageBg:'#F9FAFB', cardBg:'#FFFFFF',
  headingText:'#111827', bodyText:'#4B5563', mutedText:'#9CA3AF',
  border:'#E5E7EB', borderLight:'#F3F4F6',
  fontMain:"'Inter',system-ui,sans-serif",
  cardRadius:12, buttonRadius:8,
};
const TIER_COLORS = {
  1:{ accent:'#2D8A6E', bg:'#EBF5F1', label:'Foundations' },
  2:{ accent:'#3B82F6', bg:'#EFF6FF', label:'Protocols & Patterns' },
  3:{ accent:'#9333EA', bg:'#FAF5FF', label:'Advanced Patterns' },
};
const CODE_BG = '#1E293B';
const CODE_TEXT = '#E2E8F0';

// ==================== LOCAL STORAGE ====================
const ADB = {
  get:(key,fb)=>{try{const d=typeof window!=='undefined'&&localStorage.getItem(`re3_academy_${key}`);return d?JSON.parse(d):fb}catch{return fb}},
  set:(key,v)=>{try{typeof window!=='undefined'&&localStorage.setItem(`re3_academy_${key}`,JSON.stringify(v))}catch{}},
};

// ==================== COURSE CATALOG ====================
const COURSES = [
  // Tier 1
  {id:'llm-basics',tier:1,icon:'\uD83E\uDDE0',title:'How LLMs Work',description:'Tokens, context windows, temperature, inference. The mechanics behind every AI interaction.',difficulty:'Beginner',timeMinutes:45,exerciseCount:8,tabCount:5,status:'available'},
  {id:'prompt-engineering',tier:1,icon:'\uD83D\uDCAC',title:'Prompt Engineering',description:'System prompts, few-shot, chain-of-thought, structured outputs. The art of communicating with AI.',difficulty:'Beginner',timeMinutes:40,exerciseCount:10,tabCount:4,status:'coming_soon'},
  {id:'embeddings',tier:1,icon:'\uD83D\uDD0E',title:'Embeddings & Vector Search',description:'How AI understands similarity. Vectors, cosine distance, approximate nearest neighbors.',difficulty:'Beginner',timeMinutes:35,exerciseCount:6,tabCount:4,status:'coming_soon'},
  {id:'rag-fundamentals',tier:1,icon:'\uD83D\uDD0D',title:'RAG Fundamentals',description:'Retrieval-Augmented Generation. Grounding AI in real data to reduce hallucination.',difficulty:'Beginner',timeMinutes:50,exerciseCount:9,tabCount:5,status:'coming_soon'},
  // Tier 2
  {id:'mcp-protocol',tier:2,icon:'\uD83D\uDD0C',title:'Model Context Protocol (MCP)',description:'The universal adapter for AI. Host/Client/Server architecture, Tools/Resources/Prompts.',difficulty:'Intermediate',timeMinutes:60,exerciseCount:12,tabCount:6,status:'coming_soon'},
  {id:'a2a-protocol',tier:2,icon:'\uD83E\uDD1D',title:'Agent-to-Agent (A2A)',description:'How AI agents discover, communicate, and collaborate across platforms.',difficulty:'Intermediate',timeMinutes:45,exerciseCount:8,tabCount:4,status:'coming_soon'},
  {id:'function-calling',tier:2,icon:'\u2699\uFE0F',title:'Function Calling & Tool Use',description:'How LLMs invoke tools across providers. JSON Schema, tool definitions, response handling.',difficulty:'Intermediate',timeMinutes:35,exerciseCount:7,tabCount:4,status:'coming_soon'},
  {id:'ai-governance',tier:2,icon:'\uD83C\uDFDB\uFE0F',title:'AI Governance Essentials',description:'Frameworks for responsible AI. Mapping use cases to governance across organizational pillars.',difficulty:'Intermediate',timeMinutes:40,exerciseCount:6,tabCount:4,status:'coming_soon'},
  // Tier 3
  {id:'multi-agent',tier:3,icon:'\uD83E\uDD16',title:'Multi-Agent Orchestration',description:'Agent roles, debate flows, consensus mechanisms. How systems like Re\u00b3 actually work.',difficulty:'Advanced',timeMinutes:55,exerciseCount:10,tabCount:5,status:'coming_soon'},
  {id:'graph-rag',tier:3,icon:'\uD83C\uDF10',title:'Graph RAG & Knowledge Graphs',description:'Combining structured and unstructured retrieval. Entity relationships, hybrid search.',difficulty:'Advanced',timeMinutes:50,exerciseCount:8,tabCount:5,status:'coming_soon'},
  {id:'ai-observability',tier:3,icon:'\uD83D\uDCCA',title:'AI Observability & Evaluation',description:'Measuring AI quality. Tracing, drift detection, evaluation frameworks, quality scorecards.',difficulty:'Advanced',timeMinutes:45,exerciseCount:7,tabCount:4,status:'coming_soon'},
  {id:'llm-gateway',tier:3,icon:'\uD83D\uDE80',title:'LLM Gateway Patterns',description:'Multi-provider routing, fallbacks, cost optimization, rate limiting. Enterprise AI at scale.',difficulty:'Advanced',timeMinutes:40,exerciseCount:6,tabCount:4,status:'coming_soon'},
];

// ==================== SHARED COMPONENTS ====================
function FadeIn({children,delay=0,className=""}){const[v,setV]=useState(false);useEffect(()=>{const t=setTimeout(()=>setV(true),delay);return()=>clearTimeout(t)},[delay]);return <div className={className} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(12px)",transition:`all 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms`}}>{children}</div>}

function ProgressBar({percent,size='md'}){const h=size==='sm'?4:size==='lg'?8:6;return <div className="w-full rounded-full overflow-hidden" style={{height:h,background:GIM.borderLight}}><div className="rounded-full transition-all" style={{width:`${Math.min(100,Math.max(0,percent))}%`,height:'100%',background:GIM.primary,transition:'width 0.5s ease'}}/></div>}

function ExpandableSection({title,children,defaultOpen=false,icon=null}){
  const[open,setOpen]=useState(defaultOpen);
  return <div className="rounded-xl border overflow-hidden mb-3" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left transition-colors" style={{fontFamily:GIM.fontMain}} onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <div className="flex items-center gap-2">{icon&&<span style={{fontSize:16}}>{icon}</span>}<span className="font-semibold" style={{fontSize:14,color:GIM.headingText}}>{title}</span></div>
      <span style={{fontSize:12,color:GIM.mutedText,transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0deg)'}}>{'\u25BC'}</span>
    </button>
    <div style={{maxHeight:open?5000:0,overflow:'hidden',transition:'max-height 0.4s ease-in-out'}}>
      <div className="px-4 pb-4" style={{color:GIM.bodyText,fontSize:14,lineHeight:1.8,fontFamily:GIM.fontMain}}>{children}</div>
    </div>
  </div>;
}

function CodeBlock({code,language='text',label=null}){
  const[copied,setCopied]=useState(false);
  const doCopy=()=>{navigator.clipboard.writeText(code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}).catch(()=>{})};
  return <div className="rounded-xl overflow-hidden mb-4" style={{background:CODE_BG}}>
    <div className="flex items-center justify-between px-4 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
      <span style={{fontSize:11,color:'#64748B',fontFamily:'monospace',fontWeight:600,letterSpacing:'0.05em'}}>{(label||language).toUpperCase()}</span>
      <button onClick={doCopy} className="px-2 py-0.5 rounded text-xs font-medium transition-colors" style={{color:copied?'#86EFAC':'#64748B',background:'rgba(255,255,255,0.05)'}}>{copied?'Copied!':'Copy'}</button>
    </div>
    <pre className="p-4 overflow-x-auto" style={{margin:0,fontSize:13,lineHeight:1.6,color:CODE_TEXT,fontFamily:"'Consolas','Fira Code',monospace"}}><code>{code}</code></pre>
  </div>;
}

function Quiz({question,options,correctIndex,explanation,onAnswer}){
  const[selected,setSelected]=useState(null);
  const answered=selected!==null;const correct=selected===correctIndex;
  const handleSelect=(i)=>{if(!answered){setSelected(i);if(onAnswer)onAnswer(i===correctIndex)}};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:answered?(correct?'#2D8A6E':'#EF4444'):GIM.border,background:GIM.cardBg}}>
    <p className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain,lineHeight:1.5}}><span style={{color:GIM.primary,marginRight:6}}>Q.</span>{question}</p>
    <div className="space-y-2">{options.map((opt,i)=>{const isC=i===correctIndex;const isS=i===selected;
      return <button key={i} onClick={()=>handleSelect(i)} className="w-full text-left p-3 rounded-lg border transition-all" style={{borderColor:answered?(isC?'#2D8A6E':isS?'#EF4444':GIM.borderLight):isS?GIM.primary:GIM.border,background:answered?(isC?'#EBF5F1':isS?'#FEF2F2':'white'):'white',color:GIM.bodyText,fontSize:13,fontFamily:GIM.fontMain,cursor:answered?'default':'pointer'}}>
        <span className="font-medium" style={{color:answered?(isC?'#2D8A6E':isS?'#EF4444':GIM.bodyText):GIM.bodyText}}>{String.fromCharCode(65+i)}.</span> {opt}
        {answered&&isC&&<span style={{marginLeft:8,color:'#2D8A6E'}}>{'\u2713'}</span>}
        {answered&&isS&&!isC&&<span style={{marginLeft:8,color:'#EF4444'}}>{'\u2717'}</span>}
      </button>})}</div>
    {answered&&<div className="mt-3 p-3 rounded-lg" style={{background:correct?'#EBF5F1':'#FEF2F2',color:correct?'#166534':'#991B1B',fontSize:13,lineHeight:1.6,fontFamily:GIM.fontMain}}>{correct?'\u2705 Correct! ':'\u274C Not quite. '}{explanation}</div>}
  </div>;
}

function MessageSimulator({messages,title="See how it works"}){
  const[step,setStep]=useState(0);const visible=messages.slice(0,step+1);
  return <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${GIM.border}`}}>
      <span className="font-semibold" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain}}>{title}</span>
      <span style={{fontSize:11,color:GIM.mutedText}}>Step {step+1} of {messages.length}</span>
    </div>
    <div className="p-4 space-y-3">{visible.map((msg,i)=><div key={i} className="flex items-start gap-3" style={{opacity:i===step?1:0.6,transition:'opacity 0.3s'}}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:msg.role==='user'?GIM.primaryBadge:'#EBF5F1',color:msg.role==='user'?GIM.primary:'#2D8A6E',fontSize:10}}>{msg.role==='user'?'U':msg.role==='system'?'S':'AI'}</div>
      <div><span className="text-xs font-semibold" style={{color:msg.role==='user'?GIM.primary:'#2D8A6E'}}>{msg.label||msg.role}</span><p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6,marginTop:2,fontFamily:GIM.fontMain}}>{msg.text}</p></div>
    </div>)}</div>
    <div className="px-4 pb-3 flex gap-2">
      <button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} className="px-3 py-1.5 rounded-lg font-medium text-xs" style={{background:GIM.borderLight,color:step===0?GIM.mutedText:GIM.bodyText}}>Back</button>
      <button onClick={()=>setStep(Math.min(messages.length-1,step+1))} disabled={step===messages.length-1} className="px-3 py-1.5 rounded-lg font-medium text-xs" style={{background:step===messages.length-1?GIM.borderLight:GIM.primary,color:step===messages.length-1?GIM.mutedText:'white'}}>Next Step</button>
      {step>0&&<button onClick={()=>setStep(0)} className="px-3 py-1.5 rounded-lg font-medium text-xs" style={{background:'transparent',color:GIM.mutedText}}>Reset</button>}
    </div>
  </div>;
}

function AnalogyBox({emoji,title,children}){return <div className="rounded-xl border p-4 mb-4 flex items-start gap-3" style={{background:'#FFFBEB',borderColor:'#FDE68A'}}><span style={{fontSize:24,flexShrink:0}}>{emoji}</span><div><span className="font-semibold" style={{fontSize:13,color:'#92400E',fontFamily:GIM.fontMain}}>{title}</span><p style={{fontSize:13,color:'#78350F',lineHeight:1.6,marginTop:4,fontFamily:GIM.fontMain}}>{children}</p></div></div>}

function SeeItInRe3({text,targetPage,onNavigate}){return <button onClick={()=>onNavigate&&onNavigate(targetPage)} className="w-full rounded-xl p-3 mb-4 flex items-center gap-3 transition-all hover:shadow-sm text-left" style={{background:GIM.primaryLight,border:`1px solid rgba(147,51,234,0.15)`}}>
  <span style={{fontSize:18}}>{'\uD83D\uDD17'}</span>
  <div className="flex-1"><span className="font-semibold" style={{fontSize:12,color:GIM.primary,fontFamily:GIM.fontMain}}>See It In Re\u00b3</span><p style={{fontSize:12,color:GIM.bodyText,marginTop:2,fontFamily:GIM.fontMain}}>{text}</p></div>
  <span style={{fontSize:14,color:GIM.primary}}>{'\u2192'}</span>
</button>}

// ==================== INTERACTIVE: TOKEN COUNTER ====================
function TokenCounter(){
  const[text,setText]=useState('');
  const estimate=(t)=>{
    if(!t.trim())return{tokens:[],count:0,chars:0};
    // Rough GPT-style: ~4 chars per token for English, split on word boundaries
    const parts=t.match(/[\w']+|[^\s\w]+|\s+/g)||[];
    const tokens=[];
    parts.forEach(w=>{
      if(/^\s+$/.test(w))return; // skip pure whitespace as separate display token
      if(w.length<=4)tokens.push(w);
      else{for(let i=0;i<w.length;i+=Math.max(2,Math.min(4,w.length-i)))tokens.push(w.slice(i,i+Math.max(2,Math.min(4,w.length-i))))}
    });
    return{tokens,count:tokens.length,chars:t.length};
  };
  const{tokens,count,chars}=estimate(text);
  const colors=['rgba(147,51,234,0.12)','rgba(59,130,246,0.12)','rgba(45,138,110,0.12)','rgba(232,115,74,0.12)','rgba(239,68,68,0.12)','rgba(245,158,11,0.12)'];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\u270D\uFE0F'} Try It: Token Counter</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Type or paste text to see how it gets broken into tokens.</p>
    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type something like: The quick brown fox jumps over the lazy dog" className="w-full p-3 rounded-lg border focus:outline-none mb-3" style={{borderColor:GIM.border,fontSize:13,color:GIM.bodyText,minHeight:70,resize:'vertical',fontFamily:GIM.fontMain}}/>
    <div className="flex items-center gap-4 mb-3">
      <div><span className="font-bold" style={{fontSize:28,color:GIM.primary}}>{count}</span><span className="ml-1" style={{fontSize:12,color:GIM.mutedText}}>tokens</span></div>
      <div style={{width:1,height:24,background:GIM.border}}/>
      <div><span className="font-bold" style={{fontSize:16,color:GIM.headingText}}>{chars}</span><span className="ml-1" style={{fontSize:12,color:GIM.mutedText}}>characters</span></div>
      {count>0&&<><div style={{width:1,height:24,background:GIM.border}}/><div><span className="font-bold" style={{fontSize:16,color:GIM.headingText}}>~${(count*0.00003).toFixed(5)}</span><span className="ml-1" style={{fontSize:12,color:GIM.mutedText}}>est. cost (GPT-4o)</span></div></>}
    </div>
    {tokens.length>0&&<div className="flex flex-wrap gap-1">{tokens.map((t,i)=><span key={i} className="px-1.5 py-0.5 rounded font-mono" style={{fontSize:12,background:colors[i%colors.length],border:`1px solid ${colors[i%colors.length].replace('0.12','0.25')}`}}>{t}</span>)}</div>}
  </div>;
}

// ==================== INTERACTIVE: CONTEXT VISUALIZER ====================
function ContextVisualizer(){
  const[windowSize,setWindowSize]=useState(8192);
  const[systemPrompt,setSystemPrompt]=useState(500);
  const[conversation,setConversation]=useState(3000);
  const response=Math.max(0,windowSize-systemPrompt-conversation);
  const pct=(v)=>Math.round(v/windowSize*100);
  const models=[{name:'GPT-3.5',tokens:4096},{name:'GPT-4',tokens:8192},{name:'Claude 3',tokens:200000},{name:'Gemini 1.5',tokens:1000000}];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCCB'} Try It: Context Window Planner</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Adjust the sliders to see how content fills the context window.</p>
    <div className="flex items-center gap-3 mb-4 flex-wrap">{models.map(m=><button key={m.name} onClick={()=>{setWindowSize(m.tokens);setSystemPrompt(Math.min(systemPrompt,Math.round(m.tokens*0.1)));setConversation(Math.min(conversation,Math.round(m.tokens*0.5)))}} className="px-3 py-1 rounded-full text-xs font-semibold transition-all" style={{background:windowSize===m.tokens?GIM.primary:'white',color:windowSize===m.tokens?'white':GIM.bodyText,border:`1px solid ${windowSize===m.tokens?GIM.primary:GIM.border}`}}>{m.name} ({m.tokens>=1000000?(m.tokens/1000000)+'M':m.tokens>=1000?(m.tokens/1000)+'K':m.tokens})</button>)}</div>
    {/* Visual bar */}
    <div className="flex rounded-lg overflow-hidden mb-4" style={{height:32}}>
      <div style={{width:`${pct(systemPrompt)}%`,background:'#9333EA',minWidth:pct(systemPrompt)>0?2:0}} className="flex items-center justify-center"><span className="text-white font-bold" style={{fontSize:9}}>{pct(systemPrompt)>8?`System ${pct(systemPrompt)}%`:''}</span></div>
      <div style={{width:`${pct(conversation)}%`,background:'#3B82F6',minWidth:pct(conversation)>0?2:0}} className="flex items-center justify-center"><span className="text-white font-bold" style={{fontSize:9}}>{pct(conversation)>8?`Conversation ${pct(conversation)}%`:''}</span></div>
      <div style={{width:`${pct(response)}%`,background:'#2D8A6E',minWidth:pct(response)>0?2:0}} className="flex items-center justify-center"><span className="text-white font-bold" style={{fontSize:9}}>{pct(response)>8?`Response ${pct(response)}%`:''}</span></div>
    </div>
    <div className="space-y-3">
      <div><label className="flex items-center justify-between mb-1"><span style={{fontSize:12,color:'#9333EA',fontWeight:600}}>System Prompt</span><span style={{fontSize:12,color:GIM.mutedText}}>{systemPrompt.toLocaleString()} tokens</span></label><input type="range" min="0" max={Math.round(windowSize*0.3)} value={systemPrompt} onChange={e=>setSystemPrompt(Number(e.target.value))} className="w-full" style={{accentColor:'#9333EA'}}/></div>
      <div><label className="flex items-center justify-between mb-1"><span style={{fontSize:12,color:'#3B82F6',fontWeight:600}}>Conversation History</span><span style={{fontSize:12,color:GIM.mutedText}}>{conversation.toLocaleString()} tokens</span></label><input type="range" min="0" max={Math.round(windowSize*0.8)} value={conversation} onChange={e=>setConversation(Number(e.target.value))} className="w-full" style={{accentColor:'#3B82F6'}}/></div>
      <div className="flex items-center justify-between p-2 rounded-lg" style={{background:'#EBF5F1'}}><span style={{fontSize:12,color:'#2D8A6E',fontWeight:600}}>Available for Response</span><span className="font-bold" style={{fontSize:14,color:response>0?'#2D8A6E':'#EF4444'}}>{response.toLocaleString()} tokens</span></div>
    </div>
  </div>;
}

// ==================== INTERACTIVE: TEMPERATURE PLAYGROUND ====================
function TemperaturePlayground(){
  const[temp,setTemp]=useState(0.7);
  const examples={
    0.0:{label:'Deterministic',desc:'Always picks the most likely next word. Same input = same output every time.',samples:['The capital of France is Paris. It is located in the north-central part of the country along the Seine River.','The capital of France is Paris. It is located in the north-central part of the country along the Seine River.']},
    0.3:{label:'Focused',desc:'Slight variation but stays very close to the most likely completion.',samples:['The capital of France is Paris, a historic city known for its art, culture, and architecture.','The capital of France is Paris, situated along the Seine River in northern France.']},
    0.7:{label:'Balanced',desc:'Good mix of reliability and creativity. Most common setting for general use.',samples:['The capital of France is Paris \u2014 a city that has shaped art, philosophy, and gastronomy for centuries.','Paris serves as the capital of France, blending centuries of history with modern innovation along the Seine.']},
    1.0:{label:'Creative',desc:'More varied and surprising outputs. Good for brainstorming and creative writing.',samples:['France\u2019s beating heart is Paris, where cobblestone streets whisper stories of revolution and romance.','The capital of France? Paris, naturally \u2014 though Lyon might argue it deserves a mention too.']},
    1.5:{label:'Wild',desc:'Highly unpredictable. May produce unusual or surprising combinations.',samples:['Paris crowns France like a beret on a philosopher \u2014 tilted, stylish, and occasionally incomprehensible.','The capital rotates between Paris and wherever the best croissant is being baked that morning.']},
    2.0:{label:'Chaotic',desc:'Near-random sampling. Often produces incoherent or nonsensical text.',samples:['France capital the being of Paris, umbrella Wednesday through kaleidoscope governance!','Parisian capital umbrella of France, dancing electrons prefer ceramic boulevards.']},
  };
  const getClosest=(v)=>{const keys=[0,0.3,0.7,1.0,1.5,2.0];return keys.reduce((p,c)=>Math.abs(c-v)<Math.abs(p-v)?c:p)};
  const ex=examples[getClosest(temp)];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDF21\uFE0F'} Try It: Temperature Playground</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Adjust temperature and see how it changes the AI's output for the same prompt.</p>
    <div className="p-3 rounded-lg mb-4" style={{background:GIM.borderLight}}>
      <span style={{fontSize:11,color:GIM.mutedText,fontWeight:600}}>PROMPT</span>
      <p style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain,marginTop:4}}>"What is the capital of France?"</p>
    </div>
    <div className="flex items-center gap-4 mb-4">
      <input type="range" min="0" max="2" step="0.1" value={temp} onChange={e=>setTemp(Number(e.target.value))} className="flex-1" style={{accentColor:GIM.primary}}/>
      <div className="text-center" style={{minWidth:80}}>
        <div className="font-bold" style={{fontSize:24,color:GIM.primary}}>{temp.toFixed(1)}</div>
        <div className="font-semibold px-2 py-0.5 rounded-full" style={{fontSize:10,background:GIM.primaryBadge,color:GIM.primary}}>{ex.label}</div>
      </div>
    </div>
    <p className="mb-3" style={{fontSize:12,color:GIM.bodyText,lineHeight:1.5}}>{ex.desc}</p>
    <div className="space-y-2">{ex.samples.map((s,i)=><div key={i} className="p-3 rounded-lg" style={{background:i===0?'#F0FDF4':'#EFF6FF',border:`1px solid ${i===0?'#BBF7D0':'#BFDBFE'}`}}>
      <span style={{fontSize:10,color:GIM.mutedText,fontWeight:600}}>Response {i+1}</span>
      <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.5,marginTop:4,fontFamily:GIM.fontMain}}>{s}</p>
    </div>)}</div>
  </div>;
}

// ==================== INTERACTIVE: TOKEN ESTIMATION GAME ====================
function TokenEstimationGame(){
  const challenges=[
    {text:'Hello',actual:1},{text:'artificial intelligence',actual:2},{text:'Tokenization is fascinating',actual:4},
    {text:'The quick brown fox jumps over the lazy dog',actual:10},{text:'antidisestablishmentarianism',actual:6},
  ];
  const[current,setCurrent]=useState(0);const[guess,setGuess]=useState('');const[revealed,setRevealed]=useState(false);const[score,setScore]=useState(0);
  const c=challenges[current];const diff=revealed?Math.abs(Number(guess)-c.actual):0;
  const reveal=()=>{if(!guess.trim())return;setRevealed(true);if(diff<=1)setScore(s=>s+1)};
  const next=()=>{if(current<challenges.length-1){setCurrent(i=>i+1);setGuess('');setRevealed(false)}};
  return <div>
    <div className="flex items-center justify-between mb-3"><span style={{fontSize:12,color:GIM.mutedText}}>Challenge {current+1} of {challenges.length}</span><span className="font-semibold" style={{fontSize:12,color:GIM.primary}}>Score: {score}/{challenges.length}</span></div>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><span style={{fontSize:11,color:GIM.mutedText}}>How many tokens?</span><p className="font-mono font-semibold mt-1" style={{fontSize:16,color:GIM.headingText}}>"{c.text}"</p></div>
    <div className="flex items-center gap-2 mb-3">
      <input type="number" value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Your guess" className="px-3 py-2 rounded-lg border text-center font-bold" style={{width:100,borderColor:GIM.border,fontSize:16,color:GIM.headingText}} disabled={revealed}/>
      {!revealed?<button onClick={reveal} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:GIM.primary,color:'white'}}>Check</button>
      :current<challenges.length-1?<button onClick={next} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:GIM.primary,color:'white'}}>Next</button>
      :<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{challenges.length}</span>}
    </div>
    {revealed&&<div className="p-3 rounded-lg" style={{background:diff<=1?'#EBF5F1':'#FEF2F2'}}>
      <span className="font-bold" style={{color:diff<=1?'#2D8A6E':'#EF4444'}}>{diff===0?'Exact!':diff<=1?'Close enough!':'Not quite.'}</span>
      <span style={{marginLeft:8,fontSize:13,color:GIM.bodyText}}>Actual: <b>{c.actual}</b> token{c.actual!==1?'s':''}</span>
    </div>}
  </div>;
}

// ==================== INTERACTIVE: CONTEXT BUDGET GAME ====================
function ContextBudgetGame(){
  const budget=4096;
  const[sys,setSys]=useState(500);const[examples,setExamples]=useState(1000);const[user,setUser]=useState(500);
  const used=sys+examples+user;const remaining=budget-used;const overBudget=remaining<0;
  return <div>
    <p className="mb-3" style={{fontSize:13,color:GIM.bodyText}}>You have <b>4,096 tokens</b>. Allocate them wisely across system prompt, few-shot examples, and your user message. Leave enough room for the model to respond!</p>
    <div className="space-y-3 mb-4">
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:'#9333EA'}}>System Prompt</span><span style={{fontSize:12,color:GIM.mutedText}}>{sys} tokens</span></label><input type="range" min="0" max="2000" value={sys} onChange={e=>setSys(Number(e.target.value))} className="w-full" style={{accentColor:'#9333EA'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:'#3B82F6'}}>Few-shot Examples</span><span style={{fontSize:12,color:GIM.mutedText}}>{examples} tokens</span></label><input type="range" min="0" max="2500" value={examples} onChange={e=>setExamples(Number(e.target.value))} className="w-full" style={{accentColor:'#3B82F6'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:'#E8734A'}}>User Message</span><span style={{fontSize:12,color:GIM.mutedText}}>{user} tokens</span></label><input type="range" min="0" max="2000" value={user} onChange={e=>setUser(Number(e.target.value))} className="w-full" style={{accentColor:'#E8734A'}}/></div>
    </div>
    <div className="flex rounded-lg overflow-hidden mb-3" style={{height:24}}>
      <div style={{width:`${sys/budget*100}%`,background:'#9333EA'}} className="flex items-center justify-center"><span className="text-white" style={{fontSize:8}}>{sys>300?'Sys':''}</span></div>
      <div style={{width:`${examples/budget*100}%`,background:'#3B82F6'}} className="flex items-center justify-center"><span className="text-white" style={{fontSize:8}}>{examples>300?'Ex':''}</span></div>
      <div style={{width:`${user/budget*100}%`,background:'#E8734A'}} className="flex items-center justify-center"><span className="text-white" style={{fontSize:8}}>{user>300?'User':''}</span></div>
      {remaining>0&&<div style={{width:`${remaining/budget*100}%`,background:'#2D8A6E20'}} className="flex items-center justify-center"><span style={{fontSize:8,color:'#2D8A6E'}}>{remaining>300?'Response':''}</span></div>}
    </div>
    <div className="p-2 rounded-lg" style={{background:overBudget?'#FEF2F2':remaining<500?'#FFFBEB':'#EBF5F1'}}>
      <span className="font-semibold" style={{fontSize:13,color:overBudget?'#EF4444':remaining<500?'#D97706':'#2D8A6E'}}>{overBudget?`Over budget by ${Math.abs(remaining)} tokens!`:remaining<500?`Only ${remaining} tokens left for response \u2014 might be too short!`:`${remaining} tokens available for response \u2014 looks good!`}</span>
    </div>
  </div>;
}

// ==================== INTERACTIVE: TEMPERATURE MATCHING GAME ====================
function TemperatureMatchingGame(){
  const rounds=[
    {output:"The mitochondria is the powerhouse of the cell. It generates ATP through cellular respiration.",answer:0,options:['Temperature 0.0','Temperature 0.7','Temperature 1.5'],explanation:'This is a textbook-accurate, deterministic response \u2014 classic temperature 0.'},
    {output:"Think of mitochondria as tiny power plants \u2014 they transform nutrients into cellular energy, much like converting coal into electricity.",answer:1,options:['Temperature 0.0','Temperature 0.7','Temperature 1.5'],explanation:'Creative analogy but still accurate. Temperature 0.7 balances creativity with coherence.'},
    {output:"Mitochondria are the jazz musicians of the cell \u2014 improvising energy symphonies while the nucleus conducts the DNA orchestra into protein harmonies!",answer:2,options:['Temperature 0.0','Temperature 0.7','Temperature 1.5'],explanation:'Highly creative and metaphorical, pushing into unusual territory. This is high-temperature output.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const answered=selected!==null;
  const r=rounds[current];const correct=selected===r.answer;
  return <div>
    <div className="flex items-center justify-between mb-3"><span style={{fontSize:12,color:GIM.mutedText}}>Round {current+1} of {rounds.length}</span></div>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}>
      <span style={{fontSize:11,color:GIM.mutedText}}>PROMPT: "Explain what mitochondria do"</span>
      <p className="mt-2" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6,fontStyle:'italic'}}>"{r.output}"</p>
    </div>
    <p className="mb-2 font-semibold" style={{fontSize:13,color:GIM.headingText}}>What temperature produced this?</p>
    <div className="space-y-2 mb-3">{r.options.map((opt,i)=><button key={i} onClick={()=>!answered&&setSelected(i)} className="w-full text-left p-2.5 rounded-lg border transition-all" style={{borderColor:answered?(i===r.answer?'#2D8A6E':i===selected?'#EF4444':GIM.border):GIM.border,background:answered?(i===r.answer?'#EBF5F1':i===selected&&!correct?'#FEF2F2':'white'):'white',cursor:answered?'default':'pointer',fontSize:13,color:GIM.bodyText}}>{opt}{answered&&i===r.answer&&' \u2713'}</button>)}</div>
    {answered&&<><div className="p-2 rounded-lg mb-3" style={{background:correct?'#EBF5F1':'#FEF2F2',fontSize:12,color:correct?'#166534':'#991B1B'}}>{r.explanation}</div>
      {current<rounds.length-1&&<button onClick={()=>{setCurrent(c=>c+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-sm font-semibold" style={{background:GIM.primary,color:'white'}}>Next Round</button>}</>}
  </div>;
}

// ==================== COURSE: HOW LLMs WORK ====================
function CourseLLMBasics({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'tokens',label:'From Text to Tokens',icon:'\uD83D\uDD24'},{id:'context',label:'The Context Window',icon:'\uD83D\uDCCB'},{id:'temperature',label:'Temperature & Sampling',icon:'\uD83C\uDF21\uFE0F'},{id:'training',label:'How Models Are Trained',icon:'\u2699\uFE0F'},{id:'playground',label:'Playground',icon:'\uD83C\uDFAE'}];

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button>
      <span style={{fontSize:24}}>{'\uD83E\uDDE0'}</span>
      <h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>How LLMs Work</h1>
    </div>
    <ProgressBar percent={progress} size="md"/>
    <p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 45 min {'\u00b7'} 8 exercises</p></FadeIn>

    {/* Tab navigation */}
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>
      {tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}
    </div></FadeIn>

    {/* Tab content */}
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabTokens onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabContext onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabTemperature onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabTraining onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===4&&<TabPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>

    {/* Tab navigation arrows */}
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}>
      <button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button>
      <button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button>
    </div>
  </div>;
}

// ---- Tab 1: From Text to Tokens ----
function TabTokens({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>From Text to Tokens</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Large Language Models don't read words the way you do. Before processing any text, they break it into smaller pieces called <b>tokens</b>. A token might be a whole word, part of a word, or even a single character.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Understanding tokens is fundamental because they affect everything: how much text a model can process, how much API calls cost, and even how the model "thinks" about language.</p>

  <AnalogyBox emoji={'\uD83E\uDDE9'} title="Think of it like LEGO bricks">
    Just as LEGO structures are built from a fixed set of standard bricks, all text is built from a fixed vocabulary of token pieces. The model learned which combinations make meaningful structures during training.
  </AnalogyBox>

  <CodeBlock language="tokenization" label="How text becomes tokens" code={`Input:  "Tokenization is fascinating"
Tokens: ["Token", "ization", " is", " fascin", "ating"]
Count:  5 tokens

Input:  "AI"
Tokens: ["AI"]
Count:  1 token

Input:  "ChatGPT"
Tokens: ["Chat", "G", "PT"]
Count:  3 tokens`}/>

  <ExpandableSection title="What is Byte-Pair Encoding (BPE)?" icon={'\uD83D\uDD0D'}>
    <p className="mb-3">Most modern LLMs use an algorithm called <b>Byte-Pair Encoding</b> to build their token vocabulary. Here's how it works:</p>
    <p className="mb-2"><b>Step 1:</b> Start with individual characters as the initial vocabulary.</p>
    <p className="mb-2"><b>Step 2:</b> Find the most frequently occurring pair of adjacent tokens in the training data.</p>
    <p className="mb-2"><b>Step 3:</b> Merge that pair into a new token and add it to the vocabulary.</p>
    <p className="mb-2"><b>Step 4:</b> Repeat until the vocabulary reaches the desired size (typically 30,000-100,000 tokens).</p>
    <p className="mt-3">This is why common words like "the" are a single token, but rare words like "cryptocurrency" might be split into ["crypt", "ocurrency"]. The algorithm optimizes for the most efficient encoding of typical text.</p>
  </ExpandableSection>

  <ExpandableSection title="Why tokens matter for cost and limits" icon={'\uD83D\uDCB0'}>
    <p className="mb-2">API pricing is per-token, not per-word. This means:</p>
    <p className="mb-2">{'\u2022'} A 1,000-word email might be ~1,300 tokens</p>
    <p className="mb-2">{'\u2022'} Code is often more token-dense than English prose</p>
    <p className="mb-2">{'\u2022'} Non-English languages typically use more tokens per word</p>
    <p className="mt-3"><b>Rule of thumb:</b> 1 token {'\u2248'} 4 characters in English, or roughly 0.75 words.</p>
  </ExpandableSection>

  <TokenCounter/>

  <Quiz question="Why do LLMs use tokens instead of whole words?" options={["It makes the model faster to train","It allows handling any text, including words the model has never seen","Words are too complicated for computers","It reduces the model's memory usage"]} correctIndex={1} explanation="Tokenization via BPE allows the model to handle any text input, including words it has never seen before, by breaking them into known sub-word pieces. Even made-up words can be tokenized!" onAnswer={()=>onComplete&&onComplete('tokens','quiz1')}/>

  <SeeItInRe3 text="In The Forge, each agent's debate response is measured in tokens. This is why there are length limits on arguments." targetPage="forge" onNavigate={onNavigate}/>
</div>}

// ---- Tab 2: The Context Window ----
function TabContext({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The Context Window</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The context window is the model's <b>working memory</b> -- everything it can "see" at once when generating a response. It includes the system prompt, your conversation history, any tool results, and the response itself.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Different models have different context window sizes, ranging from 4,096 tokens to over 1 million. But bigger isn't always better -- managing what goes into the context window is a critical skill.</p>

  <AnalogyBox emoji={'\uD83D\uDCCB'} title="Think of it like a whiteboard">
    The context window is a whiteboard of fixed size. Everything the model needs to reference must fit on this board. When you run out of space, the oldest content gets erased to make room for new content.
  </AnalogyBox>

  {/* Comparison table */}
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Model</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Context Window</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>That's roughly...</th></tr></thead>
      <tbody>
        {[['GPT-4o','128K tokens','~200 pages of text'],['Claude 3.5','200K tokens','~300 pages of text'],['Gemini 1.5','1M tokens','~1,500 pages of text'],['GPT-3.5','4K tokens','~6 pages of text']].map(([m,t,d],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{m}</td><td className="p-3" style={{color:GIM.primary,fontWeight:600}}>{t}</td><td className="p-3" style={{color:GIM.mutedText}}>{d}</td></tr>)}
      </tbody>
    </table>
  </div>

  <ExpandableSection title="What happens when the context fills up?" icon={'\u26A0\uFE0F'}>
    <p className="mb-3">When your conversation exceeds the context window, most implementations handle it by <b>dropping the oldest messages</b>. The model literally cannot see those messages anymore.</p>
    <p className="mb-2">This is why long conversations can feel like the AI "forgot" earlier context -- it literally did. The messages fell off the whiteboard.</p>
    <p className="mt-3"><b>Strategies to manage context:</b></p>
    <p>{'\u2022'} Summarize earlier conversation into a compact form</p>
    <p>{'\u2022'} Use RAG to retrieve relevant information on-demand</p>
    <p>{'\u2022'} Keep system prompts concise</p>
  </ExpandableSection>

  <ContextVisualizer/>

  <Quiz question="What happens when your conversation exceeds the context window?" options={["The model remembers everything but responds slower","The oldest messages get dropped and the model loses that context","The model compresses the conversation automatically","An error is returned and the conversation stops"]} correctIndex={1} explanation="Most LLM implementations drop the oldest messages when the context window fills up. The model literally cannot see those messages anymore, which is why long conversations can feel like the AI forgot earlier points." onAnswer={()=>onComplete&&onComplete('context','quiz1')}/>

  <SeeItInRe3 text="Re\u00b3's debate system carefully manages context. Each agent receives the full debate history within its context window, ensuring no arguments are lost." targetPage="forge" onNavigate={onNavigate}/>
</div>}

// ---- Tab 3: Temperature & Sampling ----
function TabTemperature({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Temperature & Sampling</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Temperature controls how "creative" versus "focused" an LLM's responses are. It affects the probability distribution the model uses when choosing the next token.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>At <b>temperature 0</b>, the model always picks the most probable next token (deterministic). At <b>temperature 1</b>, it samples more broadly. Above 1, outputs become increasingly random and potentially incoherent.</p>

  <AnalogyBox emoji={'\uD83D\uDDFA\uFE0F'} title="Think of it like navigation">
    Temperature 0 = following GPS turn-by-turn. Temperature 0.7 = exploring some side streets. Temperature 1 = taking a scenic detour. Temperature 2 = random road trip with no map.
  </AnalogyBox>

  <TemperaturePlayground/>

  <ExpandableSection title="What are Top-p and Top-k?" icon={'\u2699\uFE0F'}>
    <p className="mb-3">Temperature isn't the only way to control output randomness. Two other parameters are commonly used:</p>
    <p className="mb-3"><b>Top-p (nucleus sampling):</b> Instead of considering all possible next tokens, only consider the smallest set of tokens whose cumulative probability reaches p. For example, top-p=0.9 means: consider tokens until you've covered 90% of the probability mass.</p>
    <p className="mb-3"><b>Top-k:</b> Only consider the k most likely next tokens. top-k=50 means: only the top 50 candidates are eligible.</p>
    <p><b>In practice,</b> most applications use temperature alone or temperature + top-p. The default settings work well for most use cases.</p>
  </ExpandableSection>

  <Quiz question="You're building a legal compliance checker. What temperature should you use?" options={["Temperature 1.5 for creative legal interpretations","Temperature 0.7 for balanced responses","Temperature 0 or near 0 for consistent, deterministic outputs","Temperature 2.0 to explore all possibilities"]} correctIndex={2} explanation="For legal, medical, and compliance use cases, you want deterministic, reproducible outputs. Temperature 0 ensures the same input always produces the same output, which is critical for audit trails and consistency." onAnswer={()=>onComplete&&onComplete('temperature','quiz1')}/>

  <SeeItInRe3 text="Re\u00b3's AI agents use different temperature settings based on their personality. Sage (the synthesizer) uses lower temperature for accuracy, while creative agents use higher values." targetPage="agent-community" onNavigate={onNavigate}/>
</div>}

// ---- Tab 4: How Models Are Trained ----
function TabTraining({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>How Models Are Trained</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Training an LLM is a multi-stage process. Each stage builds on the previous one, transforming a randomly initialized neural network into a helpful, harmless assistant.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Understanding these stages explains why models can write poetry AND code, why they sometimes hallucinate, and why different models behave differently.</p>

  <MessageSimulator title="The Training Pipeline" messages={[
    {role:'system',label:'Stage 1: Pre-training',text:'The model reads billions of tokens from the internet -- books, articles, code, forums. It learns to predict the next token in a sequence. This is like learning a language by reading everything ever written. Takes weeks on thousands of GPUs.'},
    {role:'system',label:'Stage 2: Supervised Fine-tuning',text:'The model is trained on carefully curated question-answer pairs. Human experts write ideal responses. This teaches the model to follow instructions and be helpful, rather than just predicting text.'},
    {role:'system',label:'Stage 3: RLHF (Reinforcement Learning from Human Feedback)',text:'Human raters compare pairs of model outputs and choose which is better. A reward model is trained on these preferences. The LLM is then optimized to produce outputs the reward model scores highly.'},
    {role:'user',label:'The Result',text:'A model that can follow instructions, generate helpful responses, refuse harmful requests, and adapt its style to different contexts. Pre-training gives breadth of knowledge. Fine-tuning gives helpfulness. RLHF gives alignment with human values.'},
  ]}/>

  <ExpandableSection title="Why can models do so many things?" icon={'\uD83C\uDF1F'}>
    <p className="mb-3">The key is pre-training. By predicting the next token across billions of documents, the model implicitly learns:</p>
    <p className="mb-2">{'\u2022'} <b>Language structure:</b> Grammar, syntax, semantics</p>
    <p className="mb-2">{'\u2022'} <b>World knowledge:</b> Facts, relationships, concepts</p>
    <p className="mb-2">{'\u2022'} <b>Reasoning patterns:</b> Logic, cause-and-effect, analogy</p>
    <p className="mb-2">{'\u2022'} <b>Code:</b> Programming languages, algorithms, data structures</p>
    <p className="mt-3">It's not that the model was explicitly taught poetry and code separately. It learned the patterns underlying both through predicting text that included both.</p>
  </ExpandableSection>

  <ExpandableSection title="What causes hallucination?" icon={'\u26A0\uFE0F'}>
    <p className="mb-3">Hallucination happens because the model is fundamentally a next-token predictor, not a knowledge database. When it doesn't have reliable information, it generates plausible-sounding text based on patterns -- which may be factually wrong.</p>
    <p className="mb-2">Common causes:</p>
    <p className="mb-2">{'\u2022'} Topic is rare or absent in training data</p>
    <p className="mb-2">{'\u2022'} Question requires precise facts (dates, numbers, names)</p>
    <p className="mb-2">{'\u2022'} Model is asked to make up information ("write a biography of...")</p>
    <p className="mt-3"><b>Solutions:</b> RAG (Retrieval-Augmented Generation), fact-checking, lower temperature, and explicit instructions to say "I don't know."</p>
  </ExpandableSection>

  <Quiz question="Why can a model write both poetry and Python code?" options={["It was trained separately on poetry and code datasets","It learned the underlying patterns of both during pre-training on diverse text","Poetry and code use the same programming language","The fine-tuning stage taught it both skills"]} correctIndex={1} explanation="During pre-training, the model reads and learns to predict tokens across all types of text -- including both literary works and source code. It learns the underlying patterns of each, not through explicit instruction but through massive exposure." onAnswer={()=>onComplete&&onComplete('training','quiz1')}/>
</div>}

// ---- Tab 5: Playground ----
function TabPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Put your knowledge to the test! These exercises cover everything from the previous tabs.</p>

  <ExpandableSection title="Exercise 1: Token Estimation Challenge" icon={'\uD83E\uDDE9'} defaultOpen={true}>
    <p className="mb-3" style={{fontSize:13}}>Guess how many tokens each phrase uses, then check your answer. Score within 1 to earn a point!</p>
    <TokenEstimationGame/>
  </ExpandableSection>

  <ExpandableSection title="Exercise 2: Context Budget Planner" icon={'\uD83D\uDCCB'}>
    <p className="mb-3" style={{fontSize:13}}>You have a 4,096-token context window. Allocate tokens across system prompt, few-shot examples, and user message. Leave enough room for the model to respond!</p>
    <ContextBudgetGame/>
  </ExpandableSection>

  <ExpandableSection title="Exercise 3: Temperature Detective" icon={'\uD83C\uDF21\uFE0F'}>
    <p className="mb-3" style={{fontSize:13}}>Read each AI output and guess what temperature setting produced it.</p>
    <TemperatureMatchingGame/>
  </ExpandableSection>

  <ExpandableSection title="Exercise 4: Final Review" icon={'\uD83C\uDF93'}>
    <Quiz question="Roughly how many tokens does the average English word use?" options={["Exactly 1 token per word","About 0.75 tokens per word","About 1.3 tokens per word","About 5 tokens per word"]} correctIndex={2} explanation="On average, English text uses about 1.3 tokens per word (or ~0.75 words per token). This means 1,000 words is approximately 1,300 tokens." onAnswer={()=>onComplete&&onComplete('playground','quiz1')}/>
    <Quiz question="If your context window is 100K tokens and your system prompt uses 5K, how much is left?" options={["100K tokens","95K tokens","105K tokens","It depends on the model"]} correctIndex={1} explanation="Context window is a fixed budget. System prompt (5K) + conversation + response must all fit within the 100K limit. So 100K - 5K = 95K remaining for everything else." onAnswer={()=>onComplete&&onComplete('playground','quiz2')}/>
    <Quiz question="Which training stage teaches a model to refuse harmful requests?" options={["Pre-training","Supervised fine-tuning","RLHF (Reinforcement Learning from Human Feedback)","Tokenization"]} correctIndex={2} explanation="RLHF uses human preferences to align the model with human values, including learning to refuse harmful, unethical, or dangerous requests. Human raters rank outputs, and the model learns from these rankings." onAnswer={()=>onComplete&&onComplete('playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== PROGRESS TRACKING ====================
function useAcademyProgress(){
  const[progress,setProgress]=useState(()=>ADB.get('progress',{}));
  const update=useCallback((courseId,tabId,sectionId)=>{
    setProgress(prev=>{
      const course=prev[courseId]||{sections:{},percent:0};
      const key=`${tabId}_${sectionId}`;
      if(course.sections[key])return prev; // already completed
      const sections={...course.sections,[key]:true};
      const total=COURSES.find(c=>c.id===courseId)?.exerciseCount||8;
      const percent=Math.min(100,Math.round(Object.keys(sections).length/total*100));
      const next={...prev,[courseId]:{sections,percent}};
      ADB.set('progress',next);
      return next;
    });
  },[]);
  return[progress,update];
}

// ==================== ACADEMY HUB ====================
function AcademyHub({onStartCourse,progress}){
  const totalCourses=COURSES.length;
  const totalExercises=COURSES.reduce((s,c)=>s+c.exerciseCount,0);
  const totalTime=Math.round(COURSES.reduce((s,c)=>s+c.timeMinutes,0)/60);
  const availableCourses=COURSES.filter(c=>c.status==='available');
  const overallPercent=availableCourses.length>0?Math.round(availableCourses.reduce((s,c)=>s+(progress[c.id]?.percent||0),0)/availableCourses.length):0;

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    {/* Hero */}
    <FadeIn><div className="mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{background:GIM.primaryBadge,border:'1px solid rgba(147,51,234,0.2)'}}>
        <span style={{fontSize:14}}>{'\uD83C\uDF93'}</span>
        <span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:'0.12em',color:GIM.primary}}>RE{'\u00b3'} ACADEMY</span>
      </div>
      <h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(28px,5vw,42px)',lineHeight:1.1,letterSpacing:'-0.02em',color:GIM.headingText,marginBottom:8}}>Learn AI by <span style={{color:GIM.primary}}>Doing</span></h1>
      <p style={{fontFamily:GIM.fontMain,fontSize:'clamp(14px,1.6vw,16px)',maxWidth:540,color:GIM.bodyText,lineHeight:1.7,marginBottom:16}}>Interactive courses that teach you how AI systems work -- from tokens to multi-agent orchestration. Every concept includes hands-on exercises you can try right here.</p>
      <div className="flex items-center gap-4"><div className="flex-1"><ProgressBar percent={overallPercent} size="lg"/></div><span style={{fontSize:12,color:GIM.mutedText,whiteSpace:'nowrap'}}>{overallPercent}% complete</span></div>
    </div></FadeIn>

    {/* Quick Stats */}
    <FadeIn delay={50}><div className="flex flex-wrap gap-3 mb-8">
      {[['\uD83D\uDCDA',`${totalCourses}`,'Courses'],['\u270D\uFE0F',`${totalExercises}`,'Exercises'],['\u23F1\uFE0F',`${totalTime}h+`,'Total Content']].map(([icon,num,label])=>
        <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{background:GIM.cardBg,borderColor:GIM.border}}>
          <span style={{fontSize:18}}>{icon}</span>
          <div><div className="font-bold" style={{fontSize:18,color:GIM.headingText,fontFamily:GIM.fontMain}}>{num}</div><div style={{fontSize:11,color:GIM.mutedText}}>{label}</div></div>
        </div>
      )}
    </div></FadeIn>

    {/* Tier Sections */}
    {[1,2,3].map(tier=>{const tc=TIER_COLORS[tier];const tierCourses=COURSES.filter(c=>c.tier===tier);
      return <FadeIn key={tier} delay={80+tier*40}><div className="mb-8">
        <div className="flex items-center gap-2 mb-4"><div className="w-1 rounded-full" style={{height:20,background:tc.accent}}/><h2 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:18,color:tc.accent}}>Tier {tier}: {tc.label}</h2><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:tc.bg,color:tc.accent}}>{tierCourses.length} courses</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{tierCourses.map(course=>{
          const cp=progress[course.id]||{percent:0};const isComing=course.status==='coming_soon';const isComplete=cp.percent>=100;const isStarted=cp.percent>0&&!isComplete;
          return <div key={course.id} className="rounded-xl border p-4 transition-all" style={{background:isComing?GIM.borderLight:GIM.cardBg,borderColor:GIM.border,opacity:isComing?0.65:1}} onMouseEnter={e=>{if(!isComing)e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}>
            <div className="flex items-start justify-between mb-2"><span style={{fontSize:28}}>{course.icon}</span><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:tc.bg,color:tc.accent}}>{course.difficulty}</span></div>
            <h3 className="font-bold mb-1" style={{fontSize:15,color:GIM.headingText,fontFamily:GIM.fontMain}}>{course.title}</h3>
            <p className="mb-3" style={{fontSize:12,color:GIM.bodyText,lineHeight:1.5}}>{course.description}</p>
            <div className="flex items-center gap-2 mb-3" style={{fontSize:11,color:GIM.mutedText}}><span>{course.timeMinutes} min</span><span>{'\u00b7'}</span><span>{course.exerciseCount} exercises</span><span>{'\u00b7'}</span><span>{course.tabCount} lessons</span></div>
            {!isComing&&<div className="mb-3"><ProgressBar percent={cp.percent} size="sm"/></div>}
            {isComing?<span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.borderLight,color:GIM.mutedText}}>Coming Soon</span>
            :<button onClick={()=>onStartCourse(course.id)} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:isComplete?'#EBF5F1':isStarted?GIM.primary:GIM.primaryBadge,color:isComplete?'#2D8A6E':isStarted?'white':GIM.primary}}>{isComplete?'\u2713 Review':isStarted?'Continue':'Start Course'}</button>}
          </div>})}</div>
      </div></FadeIn>})}
  </div>;
}

// ==================== MAIN EXPORT ====================
export default function Academy({onNavigate}){
  const[activeCourse,setActiveCourse]=useState(null);
  const[progress,updateProgress]=useAcademyProgress();

  if(activeCourse==='llm-basics'){
    const courseProgress=progress['llm-basics']?.percent||0;
    return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
      <CourseLLMBasics onBack={()=>setActiveCourse(null)} onNavigate={onNavigate} progress={courseProgress} onComplete={(tabId,sectionId)=>updateProgress('llm-basics',tabId,sectionId)}/>
    </div>;
  }

  return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
    <AcademyHub onStartCourse={(id)=>setActiveCourse(id)} progress={progress}/>
  </div>;
}
