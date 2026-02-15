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
  {id:'prompt-engineering',tier:1,icon:'\uD83D\uDCAC',title:'Prompt Engineering',description:'System prompts, few-shot, chain-of-thought, structured outputs. The art of communicating with AI.',difficulty:'Beginner',timeMinutes:40,exerciseCount:10,tabCount:4,status:'available'},
  {id:'embeddings',tier:1,icon:'\uD83D\uDD0E',title:'Embeddings & Vector Search',description:'How AI understands similarity. Vectors, cosine distance, approximate nearest neighbors.',difficulty:'Beginner',timeMinutes:35,exerciseCount:6,tabCount:4,status:'available'},
  {id:'rag-fundamentals',tier:1,icon:'\uD83D\uDD0D',title:'RAG Fundamentals',description:'Retrieval-Augmented Generation. Grounding AI in real data to reduce hallucination.',difficulty:'Beginner',timeMinutes:50,exerciseCount:9,tabCount:5,status:'available'},
  // Tier 2
  {id:'mcp-protocol',tier:2,icon:'\uD83D\uDD0C',title:'Model Context Protocol (MCP)',description:'The universal adapter for AI. Host/Client/Server architecture, Tools/Resources/Prompts.',difficulty:'Intermediate',timeMinutes:60,exerciseCount:12,tabCount:6,status:'available'},
  {id:'a2a-protocol',tier:2,icon:'\uD83E\uDD1D',title:'Agent-to-Agent (A2A)',description:'How AI agents discover, communicate, and collaborate across platforms.',difficulty:'Intermediate',timeMinutes:45,exerciseCount:8,tabCount:4,status:'available'},
  {id:'function-calling',tier:2,icon:'\u2699\uFE0F',title:'Function Calling & Tool Use',description:'How LLMs invoke tools across providers. JSON Schema, tool definitions, response handling.',difficulty:'Intermediate',timeMinutes:35,exerciseCount:7,tabCount:4,status:'available'},
  {id:'ai-governance',tier:2,icon:'\uD83C\uDFDB\uFE0F',title:'AI Governance Essentials',description:'Frameworks for responsible AI. Mapping use cases to governance across organizational pillars.',difficulty:'Intermediate',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
  // Tier 3
  {id:'multi-agent',tier:3,icon:'\uD83E\uDD16',title:'Multi-Agent Orchestration',description:'Agent roles, debate flows, consensus mechanisms. How systems like Re\u00b3 actually work.',difficulty:'Advanced',timeMinutes:55,exerciseCount:10,tabCount:5,status:'available'},
  {id:'graph-rag',tier:3,icon:'\uD83C\uDF10',title:'Graph RAG & Knowledge Graphs',description:'Combining structured and unstructured retrieval. Entity relationships, hybrid search.',difficulty:'Advanced',timeMinutes:50,exerciseCount:8,tabCount:5,status:'available'},
  {id:'ai-observability',tier:3,icon:'\uD83D\uDCCA',title:'AI Observability & Evaluation',description:'Measuring AI quality. Tracing, drift detection, evaluation frameworks, quality scorecards.',difficulty:'Advanced',timeMinutes:45,exerciseCount:7,tabCount:4,status:'available'},
  {id:'llm-gateway',tier:3,icon:'\uD83D\uDE80',title:'LLM Gateway Patterns',description:'Multi-provider routing, fallbacks, cost optimization, rate limiting. Enterprise AI at scale.',difficulty:'Advanced',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
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

// ==================== COURSE 2: PROMPT ENGINEERING ====================
function PromptBuilder(){
  const[role,setRole]=useState('analyst');const[system,setSystem]=useState('');const[user,setUser]=useState('');
  const presets={analyst:'You are a senior data analyst. Provide clear, data-driven insights with specific metrics. Always cite your reasoning.',teacher:'You are a patient and encouraging teacher. Explain concepts step-by-step using simple analogies. Check understanding frequently.',coder:'You are an expert software engineer. Write clean, well-commented code. Explain your design decisions and suggest best practices.'};
  useEffect(()=>{setSystem(presets[role])},[role]);
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\u270D\uFE0F'} Try It: Prompt Builder</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Select a role, customize the system prompt, add a user message, and see the full API message structure.</p>
    <div className="flex gap-2 mb-3 flex-wrap">{Object.keys(presets).map(r=><button key={r} onClick={()=>setRole(r)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:role===r?GIM.primary:'white',color:role===r?'white':GIM.bodyText,border:`1px solid ${role===r?GIM.primary:GIM.border}`}}>{r}</button>)}</div>
    <textarea value={system} onChange={e=>setSystem(e.target.value)} className="w-full p-2 rounded-lg border mb-2 text-xs" style={{borderColor:GIM.border,minHeight:50,resize:'vertical',fontFamily:'monospace',color:GIM.bodyText}} placeholder="System prompt..."/>
    <textarea value={user} onChange={e=>setUser(e.target.value)} className="w-full p-2 rounded-lg border mb-3 text-xs" style={{borderColor:GIM.border,minHeight:40,resize:'vertical',fontFamily:GIM.fontMain,color:GIM.bodyText}} placeholder="Type a user message..."/>
    <div className="rounded-lg p-3" style={{background:CODE_BG}}>
      <span style={{fontSize:10,color:'#64748B',fontFamily:'monospace'}}>API MESSAGE STRUCTURE</span>
      <pre style={{fontSize:11,color:CODE_TEXT,fontFamily:'monospace',marginTop:8,whiteSpace:'pre-wrap'}}>{JSON.stringify([{role:'system',content:system||'(empty)'},{role:'user',content:user||'(empty)'}],null,2)}</pre>
    </div>
  </div>;
}

function CoursePromptEng({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'system-prompts',label:'System Prompts',icon:'\uD83D\uDCDD'},{id:'few-shot',label:'Few-Shot Learning',icon:'\uD83D\uDCDA'},{id:'cot',label:'Chain-of-Thought',icon:'\uD83D\uDD17'},{id:'pe-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDCAC'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Prompt Engineering</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 40 min {'\u00b7'} 10 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabSystemPrompts onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabFewShot onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabChainOfThought onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabPEPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabSystemPrompts({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>System Prompts</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A system prompt is a hidden instruction given to the AI before any user input. It defines the AI's <b>role</b>, <b>personality</b>, <b>constraints</b>, and <b>output format</b>. Think of it as the "job description" the AI reads before starting work.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Well-crafted system prompts are the single most impactful way to control AI behavior consistently across all interactions.</p>
  <AnalogyBox emoji={'\uD83C\uDFAC'} title="Think of it like a director's brief">A director gives actors their role, motivation, and boundaries before filming begins. The system prompt does the same for the AI -- setting expectations before any user interaction.</AnalogyBox>
  <CodeBlock language="text" label="Anatomy of a System Prompt" code={`Role:        "You are a senior financial analyst..."
Constraints: "Never provide specific investment advice."
Format:      "Respond in bullet points with citations."
Tone:        "Be professional but approachable."
Examples:    "When asked about trends, structure as..."

Full example:
"You are a senior financial analyst specializing in market trends.
Provide data-driven insights in bullet-point format.
Always cite your reasoning. Never give specific buy/sell advice.
If uncertain, say 'I don't have enough data to assess this.'"`}/>
  <PromptBuilder/>
  <Quiz question="What is the most reliable way to ensure consistent AI behavior across different users?" options={["Ask each user to state their preferences","Use a well-crafted system prompt","Set temperature to 0","Use the newest model available"]} correctIndex={1} explanation="System prompts are applied to every interaction automatically. They define role, constraints, and format before any user input, making them the most reliable consistency mechanism." onAnswer={()=>onComplete&&onComplete('system-prompts','quiz1')}/>
  <Quiz question="Which element should NOT typically be in a system prompt?" options={["Role definition","Output format requirements","The user's private data","Behavioral constraints"]} correctIndex={2} explanation="System prompts should define role, format, and constraints -- never include private user data, which could leak in outputs or logs." onAnswer={()=>onComplete&&onComplete('system-prompts','quiz2')}/>
  <SeeItInRe3 text="In The Forge, each debater agent receives a detailed system prompt defining their persona, expertise area, and debate style. This is why each agent argues differently." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabFewShot({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Few-Shot Learning</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Few-shot prompting means giving the AI <b>examples</b> of the desired input-output pattern before asking your actual question. The model learns the pattern from the examples and applies it.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}><b>Zero-shot</b> = no examples (just the instruction). <b>One-shot</b> = one example. <b>Few-shot</b> = 2-5 examples. More examples generally improve consistency but cost more tokens.</p>
  <AnalogyBox emoji={'\uD83C\uDFA8'} title="Think of it like teaching by example">Instead of explaining the rules of a card game in words, you play a few rounds while narrating. The learner picks up the pattern faster from seeing examples than from reading rules.</AnalogyBox>
  <CodeBlock language="text" label="Zero-shot vs Few-shot" code={`ZERO-SHOT:
"Classify this review as positive or negative: 'The food was amazing!'"

FEW-SHOT (2 examples):
"Classify reviews as positive or negative.

Review: 'Loved the atmosphere!' -> positive
Review: 'Terrible service, waited 2 hours' -> negative
Review: 'The food was amazing!' -> "`}/>
  <ExpandableSection title="When to use few-shot vs zero-shot" icon={'\uD83E\uDD14'}>
    <p className="mb-2"><b>Use zero-shot when:</b> The task is straightforward and well-understood (translation, summarization, simple Q&A).</p>
    <p className="mb-2"><b>Use few-shot when:</b> You need a specific output format, the task is nuanced, or the model struggles with zero-shot instructions.</p>
    <p className="mb-2"><b>Use many-shot (5+) when:</b> The task requires very specific patterns like code generation in a particular style or domain-specific classification.</p>
    <p className="mt-3"><b>Trade-off:</b> Each example costs tokens. 5 examples at ~100 tokens each = 500 tokens of your context window used before the user even asks a question.</p>
  </ExpandableSection>
  <Quiz question="You need the AI to consistently output JSON in a very specific schema. What's the best approach?" options={["Zero-shot with detailed instructions","One-shot with a single example","Few-shot with 2-3 examples showing the exact schema","Just set temperature to 0"]} correctIndex={2} explanation="For specific output formats like JSON schemas, few-shot examples are the most reliable approach. The model can see the exact structure you want and replicate it consistently." onAnswer={()=>onComplete&&onComplete('few-shot','quiz1')}/>
  <Quiz question="What is the main trade-off of using many-shot prompting (5+ examples)?" options={["It makes the model slower","It uses more tokens from the context window","It confuses the model","It only works with GPT-4"]} correctIndex={1} explanation="Each example consumes tokens from your context window. 5+ examples can easily use 500-1000 tokens, leaving less room for the actual conversation and response." onAnswer={()=>onComplete&&onComplete('few-shot','quiz2')}/>
</div>}

function TabChainOfThought({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Chain-of-Thought Reasoning</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Chain-of-Thought (CoT) prompting asks the model to <b>show its reasoning step-by-step</b> before giving a final answer. This dramatically improves accuracy on complex tasks like math, logic, and multi-step analysis.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The magic phrase? Simply adding <b>"Let's think step by step"</b> to your prompt can improve accuracy by 20-40% on reasoning tasks.</p>
  <AnalogyBox emoji={'\uD83E\uDDE9'} title="Think of it like showing your work">In math class, showing your work helps catch errors. CoT does the same for AI -- by reasoning step-by-step, the model is less likely to jump to an incorrect conclusion.</AnalogyBox>
  <MessageSimulator title="Direct vs Chain-of-Thought" messages={[
    {role:'user',label:'Direct Prompt',text:'"A store has 15 apples. 3 customers each buy 2 apples, then a delivery adds 10 more. How many apples are left?"'},
    {role:'ai',label:'Direct Answer (often wrong)',text:'"There are 19 apples." (Just guessed without reasoning)'},
    {role:'user',label:'CoT Prompt',text:'"A store has 15 apples. 3 customers each buy 2 apples, then a delivery adds 10 more. How many apples are left? Let\'s think step by step."'},
    {role:'ai',label:'CoT Answer (correct)',text:'"Step 1: Start with 15 apples.\nStep 2: 3 customers \u00d7 2 apples = 6 apples sold.\nStep 3: 15 - 6 = 9 apples remaining.\nStep 4: Delivery adds 10: 9 + 10 = 19 apples.\n\nAnswer: 19 apples."'},
  ]}/>
  <ExpandableSection title="Structured Output Prompting" icon={'\uD83D\uDCCB'}>
    <p className="mb-3">Beyond CoT, you can control the exact output format:</p>
    <p className="mb-2"><b>JSON mode:</b> "Respond with valid JSON matching this schema: {'{'}name, score, reasoning{'}'}"</p>
    <p className="mb-2"><b>Markdown:</b> "Format your response as a markdown table with columns: Feature, Pro, Con"</p>
    <p className="mb-2"><b>XML tags:</b> "Wrap your analysis in {'<analysis>'} tags and your answer in {'<answer>'} tags"</p>
    <p className="mt-3">Structured outputs are especially useful when the AI's response will be parsed by code downstream.</p>
  </ExpandableSection>
  <Quiz question="When does Chain-of-Thought prompting provide the biggest improvement?" options={["Simple factual questions","Complex multi-step reasoning tasks","Creative writing","Translation between languages"]} correctIndex={1} explanation="CoT provides the biggest gains on tasks requiring multi-step reasoning -- math, logic, analysis, and planning. For simple recall or creative tasks, it adds little value." onAnswer={()=>onComplete&&onComplete('cot','quiz1')}/>
  <Quiz question="What is the simplest way to activate chain-of-thought reasoning?" options={["Use a larger model","Set temperature to 1.0","Add 'Let\\'s think step by step' to your prompt","Use few-shot examples"]} correctIndex={2} explanation="Research shows that simply adding 'Let\\'s think step by step' to the end of a prompt can trigger chain-of-thought reasoning, improving accuracy on complex tasks by 20-40%." onAnswer={()=>onComplete&&onComplete('cot','quiz2')}/>
  <SeeItInRe3 text="Re\u00b3's Sage agent uses chain-of-thought reasoning when synthesizing debate arguments into The Loom -- breaking down complex multi-perspective analysis into structured steps." targetPage="loom" onNavigate={onNavigate}/>
</div>}

function TabPEPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your prompt engineering knowledge with these exercises.</p>
  <ExpandableSection title="Exercise 1: Prompt Improvement" icon={'\u270D\uFE0F'} defaultOpen={true}>
    <Quiz question="A user says 'Write me something about dogs.' How should you improve this prompt?" options={["'Write a 200-word blog post about the health benefits of daily dog walking for senior citizens, in a warm conversational tone'","'Write about dogs please, make it good'","'Dogs. Go.'","'Tell me everything about every dog breed'"]} correctIndex={0} explanation="Effective prompts are specific about: topic (health benefits of dog walking), audience (seniors), format (blog post), length (200 words), and tone (warm, conversational). Vague prompts get vague results." onAnswer={()=>onComplete&&onComplete('pe-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: System Prompt Design" icon={'\uD83C\uDFAC'}>
    <Quiz question="You're building a customer support bot. Which system prompt element is MOST critical?" options={["A friendly greeting message","Clear escalation rules for when the bot can't help","The company's full history","A joke to tell at the start"]} correctIndex={1} explanation="For support bots, knowing when to escalate to a human is critical. Without clear escalation rules, the bot might give wrong answers or frustrate users on complex issues." onAnswer={()=>onComplete&&onComplete('pe-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Technique Selection" icon={'\uD83E\uDDE0'}>
    <Quiz question="You need the AI to classify 1000 support tickets into 5 categories. Best approach?" options={["Zero-shot with category descriptions","Few-shot with 2-3 examples per category","Chain-of-thought for each ticket","Ask the AI to create its own categories"]} correctIndex={1} explanation="For classification tasks with specific categories, few-shot with examples per category gives the most consistent results. CoT adds unnecessary cost at scale, and zero-shot may misinterpret categories." onAnswer={()=>onComplete&&onComplete('pe-playground','quiz3')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 4: Final Review" icon={'\uD83C\uDF93'}>
    <Quiz question="What is the correct order of messages in an API call?" options={["User \u2192 System \u2192 Assistant","System \u2192 User \u2192 Assistant","Assistant \u2192 System \u2192 User","User \u2192 Assistant \u2192 System"]} correctIndex={1} explanation="The standard order is: System prompt (sets behavior), then User message (the question), then Assistant response. The system prompt always comes first to establish context." onAnswer={()=>onComplete&&onComplete('pe-playground','quiz4')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 3: EMBEDDINGS & VECTOR SEARCH ====================
function SimilarityCalculator(){
  const pairs=[
    {a:'The cat sat on the mat',b:'A kitten rested on the rug',score:0.92,label:'Very Similar'},
    {a:'The stock market crashed today',b:'Financial markets saw major decline',score:0.89,label:'Very Similar'},
    {a:'I love playing basketball',b:'The recipe calls for two eggs',score:0.11,label:'Unrelated'},
    {a:'Machine learning is a subset of AI',b:'Deep learning uses neural networks',score:0.78,label:'Related'},
    {a:'The weather is sunny today',b:'She wore sunglasses outside',score:0.52,label:'Somewhat Related'},
  ];
  const[current,setCurrent]=useState(0);const[guess,setGuess]=useState(50);const[revealed,setRevealed]=useState(false);const[score,setScore]=useState(0);
  const p=pairs[current];
  const reveal=()=>{setRevealed(true);if(Math.abs(guess/100-p.score)<=0.15)setScore(s=>s+1)};
  const next=()=>{if(current<pairs.length-1){setCurrent(i=>i+1);setGuess(50);setRevealed(false)}};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD0E'} Try It: Similarity Calculator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Guess the cosine similarity between two sentences (0 = unrelated, 1 = identical meaning). Pair {current+1}/{pairs.length}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
      <div className="p-3 rounded-lg" style={{background:'#EFF6FF',border:'1px solid #BFDBFE'}}><span style={{fontSize:10,color:GIM.mutedText}}>SENTENCE A</span><p style={{fontSize:13,color:GIM.headingText,marginTop:4}}>"{p.a}"</p></div>
      <div className="p-3 rounded-lg" style={{background:'#F0FDF4',border:'1px solid #BBF7D0'}}><span style={{fontSize:10,color:GIM.mutedText}}>SENTENCE B</span><p style={{fontSize:13,color:GIM.headingText,marginTop:4}}>"{p.b}"</p></div>
    </div>
    <div className="flex items-center gap-3 mb-3"><span style={{fontSize:11,color:GIM.mutedText}}>0</span><input type="range" min="0" max="100" value={guess} onChange={e=>setGuess(Number(e.target.value))} className="flex-1" style={{accentColor:GIM.primary}} disabled={revealed}/><span style={{fontSize:11,color:GIM.mutedText}}>1.0</span><span className="font-bold" style={{fontSize:18,color:GIM.primary,minWidth:50,textAlign:'right'}}>{(guess/100).toFixed(2)}</span></div>
    {!revealed?<button onClick={reveal} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Check</button>
    :current<pairs.length-1?<button onClick={next} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Pair</button>
    :<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{pairs.length} correct</span>}
    {revealed&&<div className="mt-3 p-3 rounded-lg" style={{background:Math.abs(guess/100-p.score)<=0.15?'#EBF5F1':'#FEF2F2'}}>
      <span className="font-bold" style={{color:Math.abs(guess/100-p.score)<=0.15?'#2D8A6E':'#EF4444'}}>{Math.abs(guess/100-p.score)<=0.15?'Close!':'Not quite.'}</span>
      <span style={{marginLeft:8,fontSize:13,color:GIM.bodyText}}>Actual similarity: <b>{p.score}</b> ({p.label})</span>
    </div>}
  </div>;
}

function CourseEmbeddings({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'what-embeddings',label:'What Are Embeddings',icon:'\uD83E\uDDE0'},{id:'similarity',label:'Similarity & Distance',icon:'\uD83D\uDCCF'},{id:'vector-dbs',label:'Vector Databases',icon:'\uD83D\uDDC4\uFE0F'},{id:'emb-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDD0E'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Embeddings & Vector Search</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 35 min {'\u00b7'} 6 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhatEmbeddings onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabSimilarity onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabVectorDBs onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabEmbPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhatEmbeddings({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What Are Embeddings?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An embedding is a way to represent text (or images, or audio) as a <b>list of numbers</b> -- a vector. These numbers capture the <b>meaning</b> of the text, not just the words. Sentences with similar meanings end up with similar number patterns.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Modern embedding models produce vectors with 768 to 3,072 dimensions. Each dimension captures some aspect of meaning, though no single dimension has an obvious interpretation.</p>
  <AnalogyBox emoji={'\uD83D\uDCCD'} title="Think of it like GPS coordinates for meaning">GPS coordinates map physical locations to numbers. Embeddings map meaning to numbers. Just as nearby coordinates mean nearby locations, nearby vectors mean similar meanings.</AnalogyBox>
  <CodeBlock language="python" label="Text to Vector" code={`from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input="The cat sat on the mat",
    model="text-embedding-3-small"
)

vector = response.data[0].embedding
# Result: [0.023, -0.041, 0.089, ..., 0.012]
# Length: 1,536 numbers (dimensions)
print(f"Vector has {len(vector)} dimensions")`}/>
  <Quiz question="What does an embedding capture about text?" options={["The exact words used","The font and formatting","The semantic meaning of the text","The number of characters"]} correctIndex={2} explanation="Embeddings capture semantic meaning -- the concept behind the words. This is why 'happy' and 'joyful' have similar embeddings even though they share no letters." onAnswer={()=>onComplete&&onComplete('what-embeddings','quiz1')}/>
</div>}

function TabSimilarity({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Similarity & Distance</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Once text is converted to vectors, we can measure how <b>similar</b> two pieces of text are by comparing their vectors. The most common method is <b>cosine similarity</b>, which measures the angle between two vectors.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Cosine similarity ranges from -1 (opposite meanings) to 1 (identical meanings). In practice, most text pairs fall between 0 and 1.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Metric</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Range</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Cosine Similarity','-1 to 1','Most NLP tasks, semantic search'],['Euclidean Distance','0 to \u221E','Clustering, when magnitude matters'],['Dot Product','-\u221E to \u221E','Normalized vectors, fast computation']].map(([m,r,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{m}</td><td className="p-3" style={{color:GIM.primary,fontWeight:600}}>{r}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <SimilarityCalculator/>
  <Quiz question="Two sentences have cosine similarity of 0.95. What does this tell you?" options={["They use the exact same words","They have very similar meanings","They are about different topics","One is a translation of the other"]} correctIndex={1} explanation="A cosine similarity of 0.95 (close to 1.0) indicates the sentences have very similar semantic meaning, even if they use completely different words." onAnswer={()=>onComplete&&onComplete('similarity','quiz1')}/>
</div>}

function TabVectorDBs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Vector Databases</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Once you have embeddings, you need somewhere to store and search them efficiently. <b>Vector databases</b> are specialized databases optimized for storing high-dimensional vectors and performing fast similarity searches.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The key challenge: searching millions of vectors by similarity needs to be fast. Exact comparison against every vector is too slow, so vector DBs use <b>Approximate Nearest Neighbor (ANN)</b> algorithms.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Database</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Type</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Pinecone','Managed cloud','Simplest setup, serverless scaling'],['Weaviate','Self-hosted or cloud','Hybrid search (vector + keyword)'],['pgvector','PostgreSQL extension','Already using PostgreSQL'],['Chroma','Lightweight/embedded','Prototyping, small datasets'],['Qdrant','Self-hosted or cloud','High performance, filtering']].map(([n,t,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{n}</td><td className="p-3" style={{color:GIM.primary,fontWeight:600}}>{t}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <ExpandableSection title="How ANN Search Works (HNSW)" icon={'\u26A1'}>
    <p className="mb-3">The most popular ANN algorithm is <b>HNSW (Hierarchical Navigable Small World)</b>. Think of it like a skip list for vectors:</p>
    <p className="mb-2">{'\u2022'} Build a multi-layer graph of vectors, with fewer nodes at higher layers</p>
    <p className="mb-2">{'\u2022'} Search starts at the top layer (few nodes, big jumps) and drills down</p>
    <p className="mb-2">{'\u2022'} At each layer, greedily move toward the nearest neighbor</p>
    <p className="mt-3">HNSW trades ~5% accuracy for 100x speed improvement. For most applications, the small accuracy loss is negligible.</p>
  </ExpandableSection>
  <Quiz question="Why do vector databases use Approximate Nearest Neighbor instead of exact search?" options={["ANN gives better results","Exact search is too slow for millions of vectors","ANN uses less storage","Exact search doesn't work with high dimensions"]} correctIndex={1} explanation="Exact search requires comparing your query against every vector in the database -- this is O(n) and too slow for millions of vectors. ANN algorithms like HNSW provide near-perfect results in milliseconds." onAnswer={()=>onComplete&&onComplete('vector-dbs','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3 uses vector search to find relevant articles when the Forge selects content for debates. Your query becomes a vector, and similar article vectors are found instantly." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabEmbPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your embeddings knowledge!</p>
  <ExpandableSection title="Exercise 1: Embedding Intuition" icon={'\uD83E\uDDE0'} defaultOpen={true}>
    <Quiz question="Which pair of sentences would have the HIGHEST cosine similarity?" options={["'The dog is sleeping' and 'The cat is sleeping'","'The dog is sleeping' and 'Markets closed higher today'","'Buy stocks now' and 'The weather is nice'","'Hello world' and 'Goodbye universe'"]} correctIndex={0} explanation="'The dog is sleeping' and 'The cat is sleeping' share nearly identical structure and meaning (animal + resting). The other pairs have minimal semantic overlap." onAnswer={()=>onComplete&&onComplete('emb-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Vector DB Selection" icon={'\uD83D\uDDC4\uFE0F'}>
    <Quiz question="Your team already uses PostgreSQL and needs to add semantic search to an existing app. Which vector DB is best?" options={["Pinecone -- it's the most popular","pgvector -- extends your existing PostgreSQL","Chroma -- it's the simplest","Build a custom solution from scratch"]} correctIndex={1} explanation="pgvector is a PostgreSQL extension that adds vector operations to your existing database. No new infrastructure needed -- just install the extension and add a vector column." onAnswer={()=>onComplete&&onComplete('emb-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 4: RAG FUNDAMENTALS ====================
function HallucinationDetector(){
  const challenges=[
    {question:'What year was the Eiffel Tower completed?',responses:[
      {text:'The Eiffel Tower was completed in 1889 for the World\'s Fair in Paris, France.',hallucinated:false},
      {text:'The Eiffel Tower was completed in 1892 and was designed by Gustav Eiffel as a permanent radio tower.',hallucinated:true},
    ],explanation:'The Eiffel Tower was completed in 1889, not 1892. It was built for the 1889 World\'s Fair and was originally intended to be temporary, not as a radio tower.'},
    {question:'What is the speed of light?',responses:[
      {text:'The speed of light in a vacuum is approximately 299,792,458 meters per second, often rounded to 300,000 km/s.',hallucinated:false},
      {text:'The speed of light is 312,000,000 meters per second, first measured by Albert Einstein in 1905.',hallucinated:true},
    ],explanation:'The speed of light is ~299,792,458 m/s, not 312,000,000. And it wasn\'t first measured by Einstein -- Ole R\u00f8mer estimated it in 1676.'},
    {question:'Who wrote the Python programming language?',responses:[
      {text:'Python was created by Guido van Rossum and first released in 1991. It was named after Monty Python.',hallucinated:false},
      {text:'Python was developed by James Gosling at Sun Microsystems in 1995 as a simpler alternative to Java.',hallucinated:true},
    ],explanation:'James Gosling created Java, not Python. Python was created by Guido van Rossum in 1991. This is a classic hallucination -- mixing up facts from related domains.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const c=challenges[current];const answered=selected!==null;const correct=answered&&c.responses[selected].hallucinated;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD0D'} Try It: Spot the Hallucination</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>One response is accurate, one is hallucinated. Click the hallucinated one! ({current+1}/{challenges.length})</p>
    <div className="p-2 rounded-lg mb-3" style={{background:GIM.borderLight}}><span style={{fontSize:11,color:GIM.mutedText}}>Question: </span><span style={{fontSize:13,color:GIM.headingText,fontWeight:600}}>{c.question}</span></div>
    <div className="space-y-2 mb-3">{c.responses.map((r,i)=><button key={i} onClick={()=>!answered&&(()=>{setSelected(i);if(r.hallucinated)setScore(s=>s+1);})()} className="w-full text-left p-3 rounded-lg border transition-all" style={{borderColor:answered?(r.hallucinated?'#EF4444':'#2D8A6E'):GIM.border,background:answered?(r.hallucinated?'#FEF2F2':'#EBF5F1'):'white',cursor:answered?'default':'pointer'}}>
      <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.5}}>{r.text}</p>
      {answered&&<span className="text-xs font-semibold mt-1 inline-block" style={{color:r.hallucinated?'#EF4444':'#2D8A6E'}}>{r.hallucinated?'\u274C Hallucinated':'\u2705 Accurate'}</span>}
    </button>)}</div>
    {answered&&<div className="p-3 rounded-lg mb-3" style={{background:'#FFFBEB',border:'1px solid #FDE68A'}}><p style={{fontSize:12,color:'#92400E'}}>{c.explanation}</p></div>}
    {answered&&current<challenges.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Challenge</button>}
    {answered&&current===challenges.length-1&&<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{challenges.length} correct</span>}
  </div>;
}

function PipelineOrderGame(){
  const stages=['Ingest Documents','Chunk Text','Generate Embeddings','Store in Vector DB','Receive Query','Retrieve Similar Chunks','Generate Response'];
  const[order,setOrder]=useState([]);const[available,setAvailable]=useState([...stages].sort(()=>Math.random()-0.5));const[checked,setChecked]=useState(false);
  const addStage=(stage)=>{setOrder(o=>[...o,stage]);setAvailable(a=>a.filter(s=>s!==stage))};
  const removeStage=(stage)=>{setOrder(o=>o.filter(s=>s!==stage));setAvailable(a=>[...a,stage])};
  const isCorrect=checked&&order.every((s,i)=>s===stages[i])&&order.length===stages.length;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD27'} Try It: Build the RAG Pipeline</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Click the stages in the correct order to build a RAG pipeline.</p>
    <div className="mb-3"><span style={{fontSize:11,color:GIM.mutedText,fontWeight:600}}>YOUR PIPELINE:</span>
      <div className="flex flex-wrap gap-1 mt-2 min-h-[36px] p-2 rounded-lg" style={{background:GIM.borderLight,border:`1px dashed ${GIM.border}`}}>
        {order.length===0&&<span style={{fontSize:12,color:GIM.mutedText}}>Click stages below to add them...</span>}
        {order.map((s,i)=><button key={s} onClick={()=>!checked&&removeStage(s)} className="px-2 py-1 rounded text-xs font-semibold" style={{background:checked?(s===stages[i]?'#EBF5F1':'#FEF2F2'):'white',color:checked?(s===stages[i]?'#2D8A6E':'#EF4444'):GIM.headingText,border:`1px solid ${checked?(s===stages[i]?'#2D8A6E':'#EF4444'):GIM.border}`}}>{i+1}. {s}</button>)}
      </div>
    </div>
    <div className="flex flex-wrap gap-1 mb-3">{available.map(s=><button key={s} onClick={()=>addStage(s)} className="px-2 py-1 rounded text-xs font-semibold transition-all hover:shadow-sm" style={{background:'white',color:GIM.primary,border:`1px solid ${GIM.primary}`}}>{s}</button>)}</div>
    {order.length===7&&!checked&&<button onClick={()=>setChecked(true)} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Check Order</button>}
    {checked&&<div className="p-3 rounded-lg" style={{background:isCorrect?'#EBF5F1':'#FEF2F2'}}>
      <span className="font-bold" style={{color:isCorrect?'#2D8A6E':'#EF4444'}}>{isCorrect?'\u2705 Perfect! You got the RAG pipeline right!':'\u274C Not quite. The correct order is: Ingest \u2192 Chunk \u2192 Embed \u2192 Store \u2192 Query \u2192 Retrieve \u2192 Generate'}</span>
      {!isCorrect&&<button onClick={()=>{setOrder([]);setAvailable([...stages].sort(()=>Math.random()-0.5));setChecked(false)}} className="ml-3 px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Try Again</button>}
    </div>}
  </div>;
}

function CourseRAG({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'rag-problem',label:'The Problem RAG Solves',icon:'\u26A0\uFE0F'},{id:'rag-embeddings',label:'Embeddings in RAG',icon:'\uD83D\uDD22'},{id:'rag-pipeline',label:'The RAG Pipeline',icon:'\uD83D\uDD27'},{id:'beyond-rag',label:'Beyond Basic RAG',icon:'\uD83D\uDE80'},{id:'rag-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDD0D'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>RAG Fundamentals</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 50 min {'\u00b7'} 9 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabRAGProblem onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabRAGEmbeddings onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabRAGPipeline onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabBeyondRAG onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===4&&<TabRAGPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabRAGProblem({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The Problem RAG Solves</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>LLMs have a fundamental limitation: they can only use knowledge from their training data. They don't know about events after their training cutoff, your company's internal documents, or real-time data. When they lack knowledge, they <b>hallucinate</b> -- generating plausible-sounding but incorrect information.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}><b>Retrieval-Augmented Generation (RAG)</b> solves this by fetching relevant information from external sources and injecting it into the prompt before the LLM generates a response.</p>
  <AnalogyBox emoji={'\uD83D\uDCDA'} title="Think of it like an open-book exam">An LLM without RAG is a student taking an exam from memory -- they might mix up facts. An LLM with RAG is a student with the textbook open -- they can look up the right answers.</AnalogyBox>
  <HallucinationDetector/>
  <Quiz question="What is the primary problem that RAG addresses?" options={["LLMs are too slow","LLMs hallucinate when they lack knowledge","LLMs can't process images","LLMs use too many tokens"]} correctIndex={1} explanation="RAG directly addresses hallucination by providing the LLM with relevant, factual information retrieved from trusted sources before it generates a response." onAnswer={()=>onComplete&&onComplete('rag-problem','quiz1')}/>
</div>}

function TabRAGEmbeddings({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Embeddings in RAG</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>RAG uses embeddings to find relevant documents. Both the user's query and all stored documents are converted into vectors. The system then finds documents whose vectors are closest to the query vector.</p>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>This is called <b>semantic search</b> -- finding documents by meaning, not just keywords. "How do I fix a flat tire?" will match a document about "tire puncture repair" even though the words are different.</p>
  <CodeBlock language="text" label="Semantic vs Keyword Search" code={`QUERY: "How to fix a flat tire?"

KEYWORD SEARCH finds: Documents containing "fix", "flat", "tire"
  ✗ Misses: "Puncture repair guide" (no matching keywords!)

SEMANTIC SEARCH finds: Documents with similar MEANING
  ✓ "Puncture repair guide" (similar concept)
  ✓ "Changing a tire step-by-step" (related topic)
  ✓ "Roadside emergency tire fix" (synonymous intent)`}/>
  <Quiz question="Why is semantic search better than keyword search for RAG?" options={["It's faster","It finds documents by meaning, not just matching words","It uses less storage","It doesn't need embeddings"]} correctIndex={1} explanation="Semantic search understands meaning, so 'fix a flat tire' matches 'puncture repair guide' even without shared keywords. This dramatically improves retrieval quality." onAnswer={()=>onComplete&&onComplete('rag-embeddings','quiz1')}/>
  <SeeItInRe3 text="When you submit an article to Re\u00b3's Forge, the system uses semantic search to find related articles and themes -- exactly this embedding-based retrieval process." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabRAGPipeline({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The RAG Pipeline</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A RAG system has 7 stages, divided into two phases: <b>Indexing</b> (offline, done once) and <b>Querying</b> (real-time, per request).</p>
  <MessageSimulator title="The 7-Stage RAG Pipeline" messages={[
    {role:'system',label:'1. Ingest Documents',text:'Load documents from files, databases, APIs, or web pages. Documents can be PDFs, HTML, markdown, or plain text.'},
    {role:'system',label:'2. Chunk Text',text:'Split documents into smaller pieces (chunks) of 200-1000 tokens each. Overlapping chunks (e.g., 50-token overlap) prevent losing context at boundaries.'},
    {role:'system',label:'3. Generate Embeddings',text:'Convert each chunk into a vector using an embedding model. Each chunk becomes a list of 768-3072 numbers representing its meaning.'},
    {role:'system',label:'4. Store in Vector DB',text:'Save the vectors (and original text) in a vector database like Pinecone, pgvector, or Chroma for fast similarity search.'},
    {role:'user',label:'5. Receive Query',text:'User asks a question. The query is also converted into a vector using the same embedding model.'},
    {role:'ai',label:'6. Retrieve Similar Chunks',text:'The vector DB finds the top-k chunks most similar to the query vector (typically k=3 to k=10). These are the most relevant pieces of information.'},
    {role:'ai',label:'7. Generate Response',text:'The retrieved chunks are injected into the LLM prompt as context. The LLM generates an answer grounded in the retrieved information, dramatically reducing hallucination.'},
  ]}/>
  <PipelineOrderGame/>
  <Quiz question="If your chunk size is too large (e.g., entire documents), what problem occurs?" options={["The embeddings are more accurate","Retrieval becomes less precise -- you get more irrelevant content mixed in","It uses less storage","The LLM responds faster"]} correctIndex={1} explanation="Large chunks mean each retrieved result contains both relevant and irrelevant content, diluting the useful information. Smaller chunks allow more precise retrieval of just the relevant passages." onAnswer={()=>onComplete&&onComplete('rag-pipeline','quiz1')}/>
</div>}

function TabBeyondRAG({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Beyond Basic RAG</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Basic vector search RAG is a good start, but real-world systems often need more sophisticated retrieval strategies. Here are the most important advanced patterns.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Strategy</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>How It Works</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>When to Use</th></tr></thead>
      <tbody>
        {[['Hybrid Search','Combines vector similarity + keyword (BM25) matching','When exact terms matter (names, IDs, codes)'],['Reranking','A second model re-scores retrieved results for relevance','High-accuracy applications (legal, medical)'],['Graph RAG','Uses knowledge graph relationships to enhance retrieval','When entity connections matter'],['Query Expansion','Generates multiple variations of the query','Ambiguous or short queries']].map(([s,h,w],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{s}</td><td className="p-3" style={{color:GIM.bodyText}}>{h}</td><td className="p-3" style={{color:GIM.mutedText}}>{w}</td></tr>)}
      </tbody>
    </table>
  </div>
  <ExpandableSection title="Evaluating RAG Quality: RAGAS Framework" icon={'\uD83D\uDCCA'}>
    <p className="mb-3">How do you measure if your RAG system is working well? The <b>RAGAS</b> framework defines key metrics:</p>
    <p className="mb-2"><b>Faithfulness:</b> Is the answer supported by the retrieved context? (no hallucination beyond what was retrieved)</p>
    <p className="mb-2"><b>Answer Relevancy:</b> Does the answer actually address the question?</p>
    <p className="mb-2"><b>Context Precision:</b> Are the retrieved documents actually relevant?</p>
    <p className="mb-2"><b>Context Recall:</b> Did the retrieval find ALL the relevant information?</p>
  </ExpandableSection>
  <Quiz question="When should you use Hybrid Search instead of pure vector search?" options={["Always -- it's strictly better","When exact terms matter (product IDs, names, legal codes)","Only for small datasets","When you don't have an embedding model"]} correctIndex={1} explanation="Hybrid search shines when queries contain specific terms that must match exactly -- like product SKUs, legal statute numbers, or proper names. Pure vector search might miss these exact matches." onAnswer={()=>onComplete&&onComplete('beyond-rag','quiz1')}/>
</div>}

function TabRAGPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your RAG knowledge!</p>
  <ExpandableSection title="Exercise 1: Pipeline Design" icon={'\uD83D\uDD27'} defaultOpen={true}>
    <Quiz question="You're building a RAG system for a legal firm. Documents are 50-page contracts. What chunk size should you use?" options={["Entire documents (no chunking)","5,000 tokens per chunk","300-500 tokens per chunk with 50-token overlap","10 tokens per chunk for maximum precision"]} correctIndex={2} explanation="300-500 token chunks with overlap is ideal for legal documents. Too large and you get irrelevant content. Too small and you lose context. Overlap ensures no information is lost at chunk boundaries." onAnswer={()=>onComplete&&onComplete('rag-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Retrieval Strategy" icon={'\uD83D\uDD0D'}>
    <Quiz question="A user searches for 'Policy ABC-123 coverage limits.' Which retrieval strategy is most appropriate?" options={["Pure vector search","Pure keyword search","Hybrid search (vector + keyword)","Random sampling"]} correctIndex={2} explanation="The query contains both semantic intent ('coverage limits') and an exact identifier ('ABC-123'). Hybrid search handles both: vector search finds semantically relevant passages, and keyword matching ensures the specific policy ID is matched." onAnswer={()=>onComplete&&onComplete('rag-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Final Review" icon={'\uD83C\uDF93'}>
    <Quiz question="What is the most important metric to track if users complain that answers contain made-up information?" options={["Context Recall","Answer Relevancy","Faithfulness","Latency"]} correctIndex={2} explanation="Faithfulness measures whether the answer is supported by the retrieved context. Low faithfulness means the LLM is generating information not present in the retrieved documents -- hallucinating." onAnswer={()=>onComplete&&onComplete('rag-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 5: MODEL CONTEXT PROTOCOL ====================
function ToolDefinitionBuilder(){
  const[name,setName]=useState('get_weather');const[desc,setDesc]=useState('Get current weather for a city');const[p1Name,setP1Name]=useState('city');const[p1Type,setP1Type]=useState('string');const[p2Name,setP2Name]=useState('units');const[p2Type,setP2Type]=useState('string');
  const schema={name,description:desc,inputSchema:{type:'object',properties:{[p1Name]:{type:p1Type,description:`The ${p1Name} parameter`},[p2Name]:{type:p2Type,description:`The ${p2Name} parameter`}},required:[p1Name]}};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD27'} Try It: Tool Definition Builder</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Design an MCP tool and see the JSON Schema generated in real-time.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Tool Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border,fontFamily:'monospace'}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Description</label><input value={desc} onChange={e=>setDesc(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Param 1 Name</label><input value={p1Name} onChange={e=>setP1Name(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border,fontFamily:'monospace'}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Param 1 Type</label><select value={p1Type} onChange={e=>setP1Type(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border}}><option>string</option><option>number</option><option>boolean</option></select></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Param 2 Name</label><input value={p2Name} onChange={e=>setP2Name(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border,fontFamily:'monospace'}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Param 2 Type</label><select value={p2Type} onChange={e=>setP2Type(e.target.value)} className="w-full px-2 py-1.5 rounded border text-xs mt-1" style={{borderColor:GIM.border}}><option>string</option><option>number</option><option>boolean</option></select></div>
    </div>
    <div className="rounded-lg p-3" style={{background:CODE_BG}}><span style={{fontSize:10,color:'#64748B',fontFamily:'monospace'}}>GENERATED MCP TOOL SCHEMA</span><pre style={{fontSize:11,color:CODE_TEXT,fontFamily:'monospace',marginTop:8,whiteSpace:'pre-wrap'}}>{JSON.stringify(schema,null,2)}</pre></div>
  </div>;
}

function CourseMCP({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'what-mcp',label:'What is MCP',icon:'\uD83D\uDD0C'},{id:'mcp-arch',label:'Architecture',icon:'\uD83C\uDFD7\uFE0F'},{id:'mcp-tools',label:'Tools Primitive',icon:'\uD83D\uDD27'},{id:'mcp-resources',label:'Resources & Prompts',icon:'\uD83D\uDCC1'},{id:'mcp-build',label:'Building a Server',icon:'\uD83D\uDCBB'},{id:'mcp-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDD0C'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Model Context Protocol (MCP)</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 60 min {'\u00b7'} 12 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhatMCP onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabMCPArch onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabMCPTools onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabMCPResources onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===4&&<TabMCPBuild onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===5&&<TabMCPPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhatMCP({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is MCP?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The <b>Model Context Protocol (MCP)</b> is an open standard that provides a universal way for AI models to connect to external tools, data sources, and services. Instead of building custom integrations for every tool, MCP provides one protocol that works everywhere.</p>
  <AnalogyBox emoji={'\uD83D\uDD0C'} title="Think of it like USB-C">Before USB-C, every device had its own charger. MCP is the USB-C of AI -- one standard connector that lets any AI model talk to any tool or data source.</AnalogyBox>
  <CodeBlock language="text" label="Before vs After MCP" code={`BEFORE MCP: N models × M tools = N×M custom integrations
  GPT-4  ──custom──> Slack, GitHub, Database, Calendar
  Claude ──custom──> Slack, GitHub, Database, Calendar
  Result: 8 custom integrations (and growing!)

AFTER MCP: N models + M tools = N+M implementations
  GPT-4  ──MCP──┐
  Claude ──MCP──┤──> MCP Server: Slack, GitHub, DB, Calendar
  Result: 2 clients + 4 servers = 6 implementations total`}/>
  <Quiz question="What problem does MCP solve?" options={["Making AI models faster","Eliminating the need for N\u00d7M custom integrations","Replacing APIs entirely","Training better models"]} correctIndex={1} explanation="MCP standardizes how AI models connect to tools. Instead of every model needing a custom integration for every tool (N\u00d7M), each model implements MCP once and can access any MCP-compatible tool." onAnswer={()=>onComplete&&onComplete('what-mcp','quiz1')}/>
  <Quiz question="Which best describes MCP's role?" options={["A new programming language","A universal protocol connecting AI to tools","A database technology","A model training framework"]} correctIndex={1} explanation="MCP is a protocol -- a standardized way for AI models (clients) to communicate with tools and data sources (servers). It defines the message format, not the implementation." onAnswer={()=>onComplete&&onComplete('what-mcp','quiz2')}/>
</div>}

function TabMCPArch({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>MCP Architecture</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP uses a three-layer architecture: <b>Host</b>, <b>Client</b>, and <b>Server</b>. Understanding these roles is key to building and using MCP systems.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Role</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>What It Does</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Example</th></tr></thead>
      <tbody>
        {[['Host','The application the user interacts with','Claude Desktop, VS Code, IDE'],['Client','Manages the connection to MCP servers','Built into the host app'],['Server','Exposes tools, resources, and prompts','GitHub server, Slack server, DB server']].map(([r,w,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{r}</td><td className="p-3" style={{color:GIM.bodyText}}>{w}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <MessageSimulator title="MCP Session Lifecycle" messages={[
    {role:'user',label:'1. Initialize',text:'Client sends initialize request with its capabilities and protocol version to the server.'},
    {role:'ai',label:'2. Server Responds',text:'Server returns its capabilities: available tools, resources, and prompts it offers.'},
    {role:'user',label:'3. Discovery',text:'Client calls tools/list to get detailed tool definitions including input schemas.'},
    {role:'ai',label:'4. Tool Call',text:'When the AI needs a tool, client sends tools/call with the tool name and arguments.'},
    {role:'ai',label:'5. Result',text:'Server executes the tool and returns the result. The AI uses this to generate its response.'},
  ]}/>
  <Quiz question="In MCP, which component exposes tools to the AI?" options={["The Host","The Client","The Server","The LLM itself"]} correctIndex={2} explanation="The Server exposes tools, resources, and prompts. The Client connects to servers and manages communication. The Host is the user-facing application." onAnswer={()=>onComplete&&onComplete('mcp-arch','quiz1')}/>
</div>}

function TabMCPTools({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The Tools Primitive</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Tools are the most commonly used MCP primitive. A tool is a <b>function the AI can call</b> -- like searching a database, sending an email, or creating a file. Tools have a name, description, and an input schema that defines what parameters they accept.</p>
  <CodeBlock language="json" label="MCP Tool Definition" code={`{
  "name": "search_documents",
  "description": "Search internal documents by query",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query text"
      },
      "limit": {
        "type": "number",
        "description": "Max results to return"
      }
    },
    "required": ["query"]
  }
}`}/>
  <ToolDefinitionBuilder/>
  <Quiz question="Why does a tool need an inputSchema?" options={["For documentation only","So the AI knows what parameters to provide and their types","To make the JSON look professional","It's optional and rarely used"]} correctIndex={1} explanation="The inputSchema tells the AI exactly what parameters the tool accepts, their types, and which are required. Without it, the AI wouldn't know how to correctly call the tool." onAnswer={()=>onComplete&&onComplete('mcp-tools','quiz1')}/>
  <Quiz question={"A tool definition has 'required: [\"query\"]'. What does this mean?"} options={["The query parameter has a default value","The AI must always provide the query parameter when calling this tool","The tool only works with queries","The query is optional"]} correctIndex={1} explanation="The 'required' array lists parameters that must be provided every time the tool is called. Optional parameters can be omitted and the tool will use defaults." onAnswer={()=>onComplete&&onComplete('mcp-tools','quiz2')}/>
</div>}

function TabMCPResources({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Resources & Prompts</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP has three primitives. Beyond Tools, there are <b>Resources</b> (read-only data) and <b>Prompts</b> (reusable templates).</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Primitive</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Direction</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Purpose</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Example</th></tr></thead>
      <tbody>
        {[['Tools','AI \u2192 Server','Execute actions','Search DB, send email, create file'],['Resources','Server \u2192 AI','Provide read-only data','Config files, documentation, schemas'],['Prompts','Server \u2192 User','Reusable templates','Code review template, analysis prompt']].map(([p,d,pu,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{p}</td><td className="p-3" style={{color:GIM.headingText}}>{d}</td><td className="p-3" style={{color:GIM.bodyText}}>{pu}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="A server exposes a company's API documentation. Which MCP primitive is most appropriate?" options={["Tool -- because you can search it","Resource -- it's read-only reference data","Prompt -- it's a template","All three equally"]} correctIndex={1} explanation="API documentation is read-only reference data that the AI consumes for context. Resources are designed for exactly this -- providing data to the AI without any action being taken." onAnswer={()=>onComplete&&onComplete('mcp-resources','quiz1')}/>
  <Quiz question="Which MCP primitive would you use for a 'Summarize this PR' workflow?" options={["Tool","Resource","Prompt","None of these"]} correctIndex={2} explanation="Prompts are reusable templates that define workflows. A 'Summarize this PR' prompt would include the template with placeholders for the PR content, guiding the AI through a structured analysis." onAnswer={()=>onComplete&&onComplete('mcp-resources','quiz2')}/>
</div>}

function TabMCPBuild({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building an MCP Server</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building an MCP server is surprisingly simple. Here's a minimal Python server that exposes a single tool.</p>
  <CodeBlock language="python" label="Minimal MCP Server (Python)" code={`from mcp.server import Server
from mcp.types import Tool, TextContent

app = Server("my-server")

@app.tool()
async def get_greeting(name: str) -> str:
    """Generate a personalized greeting."""
    return f"Hello, {name}! Welcome to MCP."

# That's it! The decorator handles:
# - Tool registration and schema generation
# - Input validation
# - JSON-RPC message handling
# - Error responses`}/>
  <ExpandableSection title="How tool definitions are auto-generated" icon={'\u2699\uFE0F'}>
    <p className="mb-3">The MCP SDK inspects your Python function to automatically generate the tool definition:</p>
    <p className="mb-2">{'\u2022'} <b>Function name</b> becomes the tool name</p>
    <p className="mb-2">{'\u2022'} <b>Docstring</b> becomes the description</p>
    <p className="mb-2">{'\u2022'} <b>Type hints</b> become the input schema</p>
    <p className="mb-2">{'\u2022'} <b>Required params</b> are those without defaults</p>
    <p className="mt-3">This convention-over-configuration approach means writing an MCP server is almost as simple as writing a regular Python function.</p>
  </ExpandableSection>
  <Quiz question="What does the MCP SDK auto-generate from a Python function?" options={["The server's hosting infrastructure","The tool's name, description, and input schema","The client-side UI","Test cases for the tool"]} correctIndex={1} explanation="The SDK inspects the function name (tool name), docstring (description), and type hints (input schema) to automatically generate the complete MCP tool definition." onAnswer={()=>onComplete&&onComplete('mcp-build','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's Forge could be exposed as an MCP server -- offering tools like 'search_articles', 'start_debate', and 'get_loom_synthesis' to any MCP-compatible AI client." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabMCPPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your MCP knowledge!</p>
  <ExpandableSection title="Exercise 1: Primitive Classification" icon={'\uD83D\uDCCB'} defaultOpen={true}>
    <Quiz question="An MCP server gives the AI access to a company's product catalog for browsing (no modifications). Which primitive?" options={["Tool","Resource","Prompt","All three"]} correctIndex={1} explanation="Read-only data access = Resource. Tools are for actions. If the AI could modify the catalog, it would be a Tool." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Architecture Design" icon={'\uD83C\uDFD7\uFE0F'}>
    <Quiz question="A company wants Claude Desktop to access their CRM and their ticketing system. How many MCP servers do they need?" options={["1 server handling both","2 servers -- one per system","It depends on the company size","MCP can't handle multiple systems"]} correctIndex={1} explanation="Best practice is one MCP server per external system. This keeps servers focused, independently deployable, and easier to maintain. The MCP client can connect to multiple servers simultaneously." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Schema Design" icon={'\uD83D\uDD27'}>
    <Quiz question="Your tool accepts an optional 'format' parameter (defaults to 'json'). How should you define it?" options={["Include 'format' in the 'required' array","Omit 'format' from 'required' and add a default in the description","Don't include 'format' in the schema at all","Make a separate tool for each format"]} correctIndex={1} explanation="Optional parameters are defined in the schema's properties but NOT listed in the 'required' array. Adding the default value in the description helps the AI know what to expect." onAnswer={()=>onComplete&&onComplete('mcp-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 6: AGENT-TO-AGENT (A2A) ====================
function CourseA2A({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'why-a2a',label:'Why A2A',icon:'\uD83E\uDD1D'},{id:'agent-cards',label:'Agent Cards',icon:'\uD83D\uDCCB'},{id:'task-lifecycle',label:'Task Lifecycle',icon:'\uD83D\uDD04'},{id:'a2a-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83E\uDD1D'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Agent-to-Agent (A2A)</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 45 min {'\u00b7'} 8 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhyA2A onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabAgentCards onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabTaskLifecycle onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabA2APlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhyA2A({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why A2A?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>MCP connects AI to <b>tools</b>. But what about connecting AI to <b>other AI agents</b>? The <b>Agent-to-Agent (A2A)</b> protocol enables AI agents to discover each other, negotiate capabilities, and collaborate on tasks.</p>
  <AnalogyBox emoji={'\uD83D\uDCDE'} title="MCP vs A2A: Phone analogy">MCP is like calling a service (pizza delivery, bank). A2A is like calling a colleague to collaborate on a project. Different relationship, different protocol.</AnalogyBox>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Aspect</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>MCP</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>A2A</th></tr></thead>
      <tbody>
        {[['Connects','AI \u2194 Tools/Data','AI \u2194 AI Agents'],['Pattern','Client-Server','Peer-to-Peer'],['Communication','Tool calls','Task delegation'],['Discovery','Server exposes tools','Agent Cards advertise capabilities']].map(([a,m,g],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{a}</td><td className="p-3" style={{color:'#3B82F6'}}>{m}</td><td className="p-3" style={{color:'#2D8A6E'}}>{g}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="MCP connects AI to tools. A2A connects AI to..." options={["Databases","Other AI agents","Users","The internet"]} correctIndex={1} explanation="A2A is specifically designed for agent-to-agent communication. It enables AI agents built by different teams or companies to discover and collaborate with each other." onAnswer={()=>onComplete&&onComplete('why-a2a','quiz1')}/>
  <Quiz question="Which protocol would you use for an AI agent to search a database?" options={["A2A -- agents handle everything","MCP -- it connects AI to tools and data","Both equally","Neither"]} correctIndex={1} explanation="Database search is a tool/data access pattern -- exactly what MCP is designed for. A2A is for agent-to-agent collaboration, not tool access." onAnswer={()=>onComplete&&onComplete('why-a2a','quiz2')}/>
</div>}

function TabAgentCards({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Cards</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An <b>Agent Card</b> is a JSON document that describes what an AI agent can do. It's like a LinkedIn profile for AI agents -- advertising capabilities so other agents know who to collaborate with.</p>
  <AnalogyBox emoji={'\uD83D\uDCBC'} title="Think of it like a business card + resume">An Agent Card tells other agents: "Here's my name, what I specialize in, how to reach me, and what I can help with." It enables discovery and capability negotiation.</AnalogyBox>
  <CodeBlock language="json" label="Example Agent Card (Re\u00b3 Forge)" code={`{
  "name": "Re\u00b3 Forge Agent",
  "description": "Orchestrates multi-agent debates on any topic",
  "url": "https://re3.live/api/a2a",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "debate",
      "name": "Multi-Agent Debate",
      "description": "Run a structured debate with 5 specialized agents"
    },
    {
      "id": "synthesize",
      "name": "Debate Synthesis",
      "description": "Synthesize debate results into emergent insights"
    }
  ]
}`}/>
  <Quiz question="What is the primary purpose of an Agent Card?" options={["To authenticate the agent","To describe capabilities for discovery by other agents","To store the agent's conversation history","To define the agent's pricing"]} correctIndex={1} explanation="Agent Cards enable discovery -- other agents can find and understand what capabilities are available, then decide whether to collaborate." onAnswer={()=>onComplete&&onComplete('agent-cards','quiz1')}/>
  <SeeItInRe3 text="Each Re\u00b3 agent (Forge, Atlas, Sage) could publish an Agent Card describing their debate capabilities, allowing external AI systems to discover and collaborate with them." targetPage="agent-community" onNavigate={onNavigate}/>
</div>}

function TabTaskLifecycle({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Task Lifecycle</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>When one agent delegates work to another, the task goes through a defined lifecycle. This ensures both agents understand the current state and can handle failures gracefully.</p>
  <MessageSimulator title="A2A Task Flow" messages={[
    {role:'user',label:'1. Submitted',text:'Agent A sends a task to Agent B: "Research recent AI governance frameworks and summarize the top 3."'},
    {role:'ai',label:'2. Working',text:'Agent B acknowledges the task and begins working. It can send progress updates: "Found 7 frameworks, analyzing..."'},
    {role:'ai',label:'3. Artifact Created',text:'Agent B produces an artifact (partial result): a draft summary of the first framework for early feedback.'},
    {role:'ai',label:'4. Completed',text:'Agent B finishes the task and returns the final result: a structured summary of the top 3 AI governance frameworks.'},
  ]}/>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>State</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Meaning</th></tr></thead>
      <tbody>
        {[['submitted','Task sent, waiting for agent to pick it up'],['working','Agent is actively processing'],['input-needed','Agent needs more info from the requester'],['completed','Task finished successfully'],['failed','Task could not be completed'],['canceled','Task was canceled by the requester']].map(([s,m],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-mono font-medium" style={{color:GIM.primary}}>{s}</td><td className="p-3" style={{color:GIM.bodyText}}>{m}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="An agent needs more information to complete a task. What state should it transition to?" options={["failed","working","input-needed","canceled"]} correctIndex={2} explanation="The 'input-needed' state signals that the agent requires additional information from the requester before it can continue. This enables interactive collaboration." onAnswer={()=>onComplete&&onComplete('task-lifecycle','quiz1')}/>
</div>}

function TabA2APlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your A2A knowledge!</p>
  <ExpandableSection title="Exercise 1: MCP vs A2A" icon={'\uD83E\uDD14'} defaultOpen={true}>
    <Quiz question="An AI assistant needs to delegate a complex research task to a specialized research agent. Which protocol?" options={["MCP -- all AI communication uses MCP","A2A -- it's agent-to-agent delegation","HTTP REST API","WebSocket"]} correctIndex={1} explanation="Delegating a task to another agent is exactly what A2A is designed for. MCP would be used if the agent needed to call a specific tool, not delegate to another intelligent agent." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Agent Card Design" icon={'\uD83D\uDCCB'}>
    <Quiz question="An Agent Card should NOT include:" options={["The agent's capabilities","How to contact the agent","The agent's internal implementation details","A description of what the agent does"]} correctIndex={2} explanation="Agent Cards describe WHAT an agent can do and HOW to reach it, but never expose internal implementation details. That's an abstraction boundary -- other agents only need to know the interface." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Architecture Design" icon={'\uD83C\uDFD7\uFE0F'}>
    <Quiz question="A system has 3 agents that need tools AND need to collaborate with each other. What protocols are needed?" options={["MCP only","A2A only","Both MCP (for tools) and A2A (for agent collaboration)","A custom proprietary protocol"]} correctIndex={2} explanation="MCP and A2A are complementary. MCP connects agents to tools and data sources. A2A connects agents to each other. A full system typically needs both." onAnswer={()=>onComplete&&onComplete('a2a-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 7: FUNCTION CALLING ====================
function CourseFunctionCalling({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'what-fc',label:'What is Function Calling',icon:'\u2699\uFE0F'},{id:'tool-defs',label:'Tool Definitions',icon:'\uD83D\uDCDD'},{id:'multi-provider',label:'Multi-Provider Patterns',icon:'\uD83D\uDD00'},{id:'fc-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\u2699\uFE0F'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Function Calling & Tool Use</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 35 min {'\u00b7'} 7 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhatFC onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabToolDefs onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabMultiProvider onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabFCPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhatFC({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is Function Calling?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Function calling lets an LLM <b>decide when to use external tools</b> and generate the structured arguments needed to call them. The LLM doesn't execute the function directly -- it outputs a JSON request that your code then executes.</p>
  <AnalogyBox emoji={'\uD83C\uDF7D\uFE0F'} title="Think of it like a restaurant waiter">The waiter (LLM) takes your order and decides which kitchen station (function) should prepare it. The waiter doesn't cook -- they route the request to the right place with the right instructions.</AnalogyBox>
  <MessageSimulator title="Function Calling Flow" messages={[
    {role:'user',label:'1. User Message',text:'"What\'s the weather in San Francisco?"'},
    {role:'ai',label:'2. LLM Decides to Call',text:'LLM recognizes it needs weather data and generates: tool_call: get_weather(city="San Francisco")'},
    {role:'system',label:'3. Your Code Executes',text:'Your application calls the actual weather API and gets: {"temp": 62, "condition": "foggy"}'},
    {role:'ai',label:'4. LLM Final Response',text:'"It\'s currently 62\u00b0F and foggy in San Francisco. Typical for the city!"'},
  ]}/>
  <Quiz question="In function calling, who actually executes the function?" options={["The LLM executes it directly","Your application code executes it","The cloud provider executes it","The user executes it"]} correctIndex={1} explanation="The LLM only generates the function call request (name + arguments). Your application code receives this, executes the actual function, and sends the result back to the LLM." onAnswer={()=>onComplete&&onComplete('what-fc','quiz1')}/>
</div>}

function TabToolDefs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tool Definitions (JSON Schema)</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>To use function calling, you define your tools using <b>JSON Schema</b>. The schema tells the LLM what functions are available, what parameters they accept, and what each parameter means.</p>
  <CodeBlock language="json" label="OpenAI Tool Definition Format" code={`{
  "type": "function",
  "function": {
    "name": "search_products",
    "description": "Search the product catalog by query",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query text"
        },
        "category": {
          "type": "string",
          "enum": ["electronics", "clothing", "food"],
          "description": "Product category filter"
        },
        "max_price": {
          "type": "number",
          "description": "Maximum price in USD"
        }
      },
      "required": ["query"]
    }
  }
}`}/>
  <Quiz question="What does the 'enum' field in a parameter definition do?" options={["Makes the parameter required","Limits the parameter to specific allowed values","Sets a default value","Marks the parameter as optional"]} correctIndex={1} explanation="'enum' constrains the parameter to a fixed list of allowed values. The LLM will only generate values from this list, preventing invalid inputs." onAnswer={()=>onComplete&&onComplete('tool-defs','quiz1')}/>
  <Quiz question="A good tool description should:" options={["Be as short as possible","Describe exactly when to use the tool and what it returns","Include the implementation code","List all possible errors"]} correctIndex={1} explanation="The description is the primary way the LLM decides WHEN to call the tool. A clear description of the tool's purpose and return value helps the LLM make better routing decisions." onAnswer={()=>onComplete&&onComplete('tool-defs','quiz2')}/>
</div>}

function TabMultiProvider({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Multi-Provider Patterns</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Different LLM providers implement function calling slightly differently. Re\u00b3 handles this with a unified <b>LLM Router</b> that translates between formats.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Provider</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Format Name</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Key Difference</th></tr></thead>
      <tbody>
        {[['OpenAI','tools / tool_choice','Supports parallel tool calls'],['Anthropic','tool_use (content block)','Tools are content blocks in response'],['Google Gemini','functionDeclarations','Uses Google-specific schema format'],['Groq (LLaMA)','OpenAI-compatible','Same format as OpenAI']].map(([p,f,d],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{p}</td><td className="p-3 font-mono" style={{color:GIM.primary,fontSize:12}}>{f}</td><td className="p-3" style={{color:GIM.mutedText}}>{d}</td></tr>)}
      </tbody>
    </table>
  </div>
  <ExpandableSection title="How Re\u00b3's LLM Router handles this" icon={'\uD83D\uDD00'}>
    <p className="mb-3">Re\u00b3's <code>llm-router.js</code> provides a uniform <code>callLLM()</code> interface that abstracts away provider differences:</p>
    <p className="mb-2">{'\u2022'} Accepts a standard tool definition format</p>
    <p className="mb-2">{'\u2022'} Translates to each provider's native format</p>
    <p className="mb-2">{'\u2022'} Normalizes responses back to a common format</p>
    <p className="mb-2">{'\u2022'} Falls back to Anthropic if a provider fails</p>
    <p className="mt-3">This means debate agents can use any LLM provider without changing their tool definitions.</p>
  </ExpandableSection>
  <Quiz question="Why would you build a multi-provider LLM router?" options={["To use the cheapest model available","For redundancy, cost optimization, and provider-specific strengths","Because one provider isn't enough","To confuse the AI"]} correctIndex={1} explanation="A multi-provider router gives you: failover if one provider is down, cost optimization by routing simple tasks to cheaper models, and the ability to use each provider's strengths." onAnswer={()=>onComplete&&onComplete('multi-provider','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's LLM Router in lib/llm-router.js implements exactly this pattern -- routing debates across Anthropic, OpenAI, Gemini, and Groq with automatic fallback." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabFCPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your function calling knowledge!</p>
  <ExpandableSection title="Exercise 1: Tool Design" icon={'\uD83D\uDD27'} defaultOpen={true}>
    <Quiz question="You're designing a 'send_email' tool. Which parameter should be required?" options={["subject","cc_list","to_address","signature"]} correctIndex={2} explanation="'to_address' is the only parameter that MUST be provided -- you can't send an email without a recipient. Subject, CC, and signature can have defaults or be optional." onAnswer={()=>onComplete&&onComplete('fc-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Flow Understanding" icon={'\uD83D\uDD04'}>
    <Quiz question="The LLM generates a tool call but the function returns an error. What should happen next?" options={["Crash the application","Send the error back to the LLM so it can handle it gracefully","Ignore the error and continue","Retry the same call 10 times"]} correctIndex={1} explanation="Send the error back to the LLM as a tool result. The LLM can then decide how to handle it -- retry with different parameters, try a different approach, or explain the issue to the user." onAnswer={()=>onComplete&&onComplete('fc-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 8: AI GOVERNANCE ====================
function RiskClassifier(){
  const cases=[
    {scenario:'Social media content recommendation algorithm',correct:1,explanation:'Content recommendation can influence opinions and behavior at scale. EU AI Act classifies this as limited risk requiring transparency.'},
    {scenario:'AI-powered medical diagnosis system',correct:2,explanation:'Medical diagnosis is high-risk under the EU AI Act. Errors can directly impact patient health and safety.'},
    {scenario:'Email spam filter',correct:0,explanation:'Spam filtering is minimal risk -- it has low impact on individuals and well-understood error boundaries.'},
    {scenario:'AI system for hiring and recruitment screening',correct:2,explanation:'Hiring decisions directly affect livelihoods. EU AI Act classifies employment-related AI as high-risk requiring strict compliance.'},
    {scenario:'AI chatbot for customer FAQ',correct:0,explanation:'A FAQ chatbot has minimal risk -- it provides general information and users can easily verify answers or reach a human.'},
    {scenario:'Real-time biometric identification in public spaces',correct:3,explanation:'Mass surveillance through biometric identification in public spaces is generally classified as unacceptable risk under the EU AI Act.'},
  ];
  const labels=['Minimal','Limited','High','Unacceptable'];const colors=['#2D8A6E','#3B82F6','#F59E0B','#EF4444'];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const c=cases[current];const answered=selected!==null;const correct=selected===c.correct;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDFDB\uFE0F'} Try It: Risk Level Classifier</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Classify each AI use case by its risk level under the EU AI Act. ({current+1}/{cases.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:14,color:GIM.headingText,fontWeight:600}}>{c.scenario}</p></div>
    <div className="flex flex-wrap gap-2 mb-3">{labels.map((l,i)=><button key={l} onClick={()=>!answered&&(()=>{setSelected(i);if(i===c.correct)setScore(s=>s+1)})()}  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:answered?(i===c.correct?colors[i]+'20':i===selected?'#FEF2F2':'white'):'white',color:answered?(i===c.correct?colors[i]:i===selected?'#EF4444':GIM.mutedText):colors[i],border:`1px solid ${answered?(i===c.correct?colors[i]:GIM.border):colors[i]}`,cursor:answered?'default':'pointer'}}>{l}{answered&&i===c.correct&&' \u2713'}</button>)}</div>
    {answered&&<div className="p-3 rounded-lg mb-3" style={{background:correct?'#EBF5F1':'#FEF2F2'}}><p style={{fontSize:12,color:correct?'#166534':'#991B1B'}}>{c.explanation}</p></div>}
    {answered&&current<cases.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Case</button>}
    {answered&&current===cases.length-1&&<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{cases.length} correct</span>}
  </div>;
}

function CourseGovernance({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'why-gov',label:'Why Governance',icon:'\u26A0\uFE0F'},{id:'five-pillars',label:'The 5 Pillars',icon:'\uD83C\uDFDB\uFE0F'},{id:'risk-assess',label:'Risk Assessment',icon:'\uD83D\uDCCA'},{id:'gov-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83C\uDFDB\uFE0F'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>AI Governance Essentials</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 40 min {'\u00b7'} 6 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhyGov onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabFivePillars onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabRiskAssess onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabGovPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhyGov({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why AI Governance?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>AI systems make decisions that affect people's lives -- hiring, lending, healthcare, criminal justice. Without governance, these systems can perpetuate bias, lack transparency, and cause real harm.</p>
  <AnalogyBox emoji={'\uD83D\uDEA6'} title="Think of it like traffic laws">Roads without traffic laws would be dangerous chaos. AI without governance is similar -- powerful technology that needs guardrails to ensure it benefits everyone safely.</AnalogyBox>
  <Quiz question="Why is AI governance necessary even for well-intentioned AI systems?" options={["Legal compliance only","Even good-faith AI can have biased training data and unintended consequences","Governance is just bureaucracy","It's only needed for military AI"]} correctIndex={1} explanation="Even well-designed AI systems can produce biased or harmful outcomes due to biased training data, edge cases, or unintended interactions. Governance provides systematic checks." onAnswer={()=>onComplete&&onComplete('why-gov','quiz1')}/>
</div>}

function TabFivePillars({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>The 5 Pillars of AI Governance</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Most AI governance frameworks organize around five core pillars:</p>
  <ExpandableSection title="1. Fairness & Non-Discrimination" icon={'\u2696\uFE0F'} defaultOpen={true}>
    <p>AI systems should treat all people equitably. This means testing for bias across demographics, ensuring training data is representative, and monitoring outcomes for discriminatory patterns. Example: A lending model should not approve loans at different rates based on race or gender when all other factors are equal.</p>
  </ExpandableSection>
  <ExpandableSection title="2. Transparency & Explainability" icon={'\uD83D\uDD0D'}>
    <p>People affected by AI decisions should understand how those decisions were made. This includes clear documentation of what data was used, how the model works, and why specific decisions were made. Example: If an AI denies a loan, the applicant should receive a clear explanation.</p>
  </ExpandableSection>
  <ExpandableSection title="3. Accountability" icon={'\uD83D\uDCCB'}>
    <p>There must be clear ownership of AI systems and their outcomes. Someone must be responsible when things go wrong. This includes audit trails, incident response procedures, and clear lines of responsibility.</p>
  </ExpandableSection>
  <ExpandableSection title="4. Privacy & Data Protection" icon={'\uD83D\uDD12'}>
    <p>AI systems must handle personal data responsibly. This includes data minimization (only collecting what's needed), purpose limitation, consent management, and compliance with regulations like GDPR.</p>
  </ExpandableSection>
  <ExpandableSection title="5. Safety & Reliability" icon={'\uD83D\uDEE1\uFE0F'}>
    <p>AI systems must operate reliably and fail safely. This includes testing, monitoring, fallback mechanisms, and human oversight for high-stakes decisions.</p>
  </ExpandableSection>
  <Quiz question="Which pillar requires that AI decisions can be understood by affected people?" options={["Fairness","Transparency & Explainability","Privacy","Safety"]} correctIndex={1} explanation="Transparency & Explainability ensures that people can understand how and why AI decisions are made, enabling them to challenge unfair outcomes." onAnswer={()=>onComplete&&onComplete('five-pillars','quiz1')}/>
</div>}

function TabRiskAssess({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Risk Assessment</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The EU AI Act establishes a <b>risk-based framework</b> that classifies AI systems into four tiers based on potential harm.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Risk Level</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Requirements</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Examples</th></tr></thead>
      <tbody>
        {[['Unacceptable','Banned','Social scoring, mass surveillance'],['High','Strict compliance required','Medical devices, hiring, credit scoring'],['Limited','Transparency obligations','Chatbots, content recommendation'],['Minimal','No requirements','Spam filters, video games']].map(([l,r,e],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:['#EF4444','#F59E0B','#3B82F6','#2D8A6E'][i],fontWeight:600}}>{l}</td><td className="p-3" style={{color:GIM.bodyText}}>{r}</td><td className="p-3" style={{color:GIM.mutedText}}>{e}</td></tr>)}
      </tbody>
    </table>
  </div>
  <RiskClassifier/>
  <Quiz question="Under the EU AI Act, what happens to unacceptable-risk AI systems?" options={["They need extra documentation","They require human oversight","They are banned","They get a warning"]} correctIndex={2} explanation="Unacceptable-risk AI systems are prohibited under the EU AI Act. This includes social credit scoring systems and real-time biometric surveillance in public spaces." onAnswer={()=>onComplete&&onComplete('risk-assess','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3 demonstrates governance through transparency -- every agent's reasoning is visible, debate arguments are attributed, and the synthesis process is traceable." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabGovPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your governance knowledge!</p>
  <ExpandableSection title="Exercise 1: Pillar Identification" icon={'\uD83C\uDFDB\uFE0F'} defaultOpen={true}>
    <Quiz question="A company's AI model approves loans at different rates for different ethnicities. Which governance pillar is violated?" options={["Transparency","Fairness & Non-Discrimination","Privacy","Safety"]} correctIndex={1} explanation="Differential treatment based on ethnicity is a violation of Fairness & Non-Discrimination, regardless of whether it was intentional or a result of biased training data." onAnswer={()=>onComplete&&onComplete('gov-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Compliance" icon={'\uD83D\uDCCB'}>
    <Quiz question="You're deploying an AI chatbot for customer service. Under the EU AI Act, what's the minimum requirement?" options={["No requirements -- chatbots are minimal risk","Disclose to users they're talking to an AI","Full bias audit and compliance report","Get government approval first"]} correctIndex={1} explanation="Chatbots are classified as limited risk under the EU AI Act. The key requirement is transparency -- users must be informed that they're interacting with an AI, not a human." onAnswer={()=>onComplete&&onComplete('gov-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 9: MULTI-AGENT ORCHESTRATION ====================
function PatternMatcher(){
  const problems=[
    {desc:'A customer complaint needs research, drafting a response, and manager approval.',correct:2,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'This is a sequential process: research \u2192 draft \u2192 approve. Pipeline pattern passes output from one stage to the next.'},
    {desc:'Should the company adopt remote-first or hybrid work? Need multiple perspectives.',correct:1,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'Multiple perspectives on a debatable question = Debate pattern. Different agents argue positions, and a synthesizer draws conclusions.'},
    {desc:'A complex data analysis project needs tasks assigned to specialist agents dynamically.',correct:0,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'An orchestrator agent analyzes the project, breaks it into tasks, and assigns them to specialists based on capabilities.'},
    {desc:'Three AI models analyze a medical image. The final diagnosis requires all to agree.',correct:3,options:['Orchestrator','Debate','Pipeline','Consensus'],explanation:'When multiple agents must agree on a high-stakes decision, consensus is the right pattern. It ensures reliability through agreement.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const p=problems[current];const answered=selected!==null;const correct=selected===p.correct;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDDE9'} Try It: Pattern Matcher</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Match each scenario to the best orchestration pattern. ({current+1}/{problems.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:13,color:GIM.headingText,lineHeight:1.5}}>{p.desc}</p></div>
    <div className="flex flex-wrap gap-2 mb-3">{p.options.map((o,i)=><button key={o} onClick={()=>!answered&&(()=>{setSelected(i);if(i===p.correct)setScore(s=>s+1)})()}  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:answered?(i===p.correct?'#EBF5F1':i===selected?'#FEF2F2':'white'):'white',color:answered?(i===p.correct?'#2D8A6E':i===selected?'#EF4444':GIM.mutedText):GIM.primary,border:`1px solid ${answered?(i===p.correct?'#2D8A6E':GIM.border):GIM.primary}`,cursor:answered?'default':'pointer'}}>{o}{answered&&i===p.correct&&' \u2713'}</button>)}</div>
    {answered&&<div className="p-3 rounded-lg mb-3" style={{background:correct?'#EBF5F1':'#FEF2F2'}}><p style={{fontSize:12,color:correct?'#166534':'#991B1B'}}>{p.explanation}</p></div>}
    {answered&&current<problems.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Problem</button>}
    {answered&&current===problems.length-1&&<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{problems.length} correct</span>}
  </div>;
}

function CourseMultiAgent({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'why-multi',label:'Why Multi-Agent',icon:'\uD83E\uDD16'},{id:'roles-patterns',label:'Roles & Patterns',icon:'\uD83C\uDFAD'},{id:'state-memory',label:'State & Memory',icon:'\uD83E\uDDE0'},{id:'frameworks',label:'Frameworks',icon:'\uD83D\uDD27'},{id:'ma-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83E\uDD16'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Multi-Agent Orchestration</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 55 min {'\u00b7'} 10 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhyMulti onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabRolesPatterns onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabStateMemory onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabFrameworks onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===4&&<TabMAPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhyMulti({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why Multi-Agent?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A single AI agent can handle simple tasks. But for complex problems requiring diverse expertise, multiple perspectives, or sequential workflows, <b>multi-agent systems</b> dramatically outperform single agents.</p>
  <AnalogyBox emoji={'\uD83D\uDC65'} title="Think of it like a specialized team">One person doing research, writing, editing, and fact-checking will produce lower quality than a team with a researcher, writer, editor, and fact-checker -- each focused on what they do best.</AnalogyBox>
  <Quiz question="When is a multi-agent system better than a single agent?" options={["Always -- more agents is always better","Never -- single agents are simpler","When the task benefits from diverse expertise or structured workflows","Only for customer service"]} correctIndex={2} explanation="Multi-agent systems excel when tasks need diverse expertise, multiple perspectives, or structured workflows. For simple tasks, a single agent is more efficient." onAnswer={()=>onComplete&&onComplete('why-multi','quiz1')}/>
  <Quiz question="What is 'emergence' in multi-agent systems?" options={["When an agent crashes","When simple agent interactions produce complex, intelligent behavior","When a new agent is added","When the system runs out of memory"]} correctIndex={1} explanation="Emergence is when simple individual agents, following simple rules, produce collectively intelligent behavior that no single agent could achieve alone. Re\u00b3's debates demonstrate this." onAnswer={()=>onComplete&&onComplete('why-multi','quiz2')}/>
</div>}

function TabRolesPatterns({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Agent Roles & Patterns</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Multi-agent systems follow established orchestration patterns. Each pattern suits different types of problems.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Pattern</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>How It Works</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Orchestrator','Central agent assigns tasks to specialists','Complex projects, dynamic task allocation'],['Debate','Agents argue positions, synthesizer combines','Multi-perspective analysis, decision support'],['Pipeline','Output of one stage feeds the next','Sequential workflows, content production'],['Consensus','Multiple agents vote or agree on answers','High-stakes decisions, quality assurance']].map(([p,h,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{p}</td><td className="p-3" style={{color:GIM.bodyText}}>{h}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <PatternMatcher/>
  <SeeItInRe3 text="Re\u00b3 uses the Debate Pattern: Forge curates the panel, Atlas moderates quality, specialized debater agents argue positions, and Sage synthesizes insights into The Loom." targetPage="forge" onNavigate={onNavigate}/>
  <Quiz question="Re\u00b3 uses which orchestration pattern?" options={["Orchestrator","Debate","Pipeline","Consensus"]} correctIndex={1} explanation="Re\u00b3 uses the Debate Pattern -- agents present arguments, engage in multiple rounds, and a synthesizer (Sage) draws emergent insights from the collective discussion." onAnswer={()=>onComplete&&onComplete('roles-patterns','quiz1')}/>
</div>}

function TabStateMemory({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>State Management & Memory</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>In multi-agent systems, agents need to share information. <b>State management</b> defines how data flows between agents, and <b>memory</b> determines what each agent can recall.</p>
  <CodeBlock language="json" label="Shared State Object (Re\u00b3 Debate)" code={`{
  "debate_id": "d_1707234567",
  "topic": "Impact of AI on healthcare",
  "round": 2,
  "agents": ["agent_strategist", "agent_ethicist", "agent_builder"],
  "arguments": {
    "round_1": [
      {"agent": "agent_strategist", "position": "..."},
      {"agent": "agent_ethicist", "position": "..."}
    ],
    "round_2": [
      {"agent": "agent_strategist", "response": "..."}
    ]
  },
  "moderator_notes": "Quality score: 8.5/10"
}`}/>
  <ExpandableSection title="Memory Strategies" icon={'\uD83E\uDDE0'}>
    <p className="mb-2"><b>Full history:</b> Every agent sees all previous messages. Simple but uses lots of tokens.</p>
    <p className="mb-2"><b>Summary memory:</b> Older conversations are summarized. Saves tokens but loses detail.</p>
    <p className="mb-2"><b>Scoped memory:</b> Each agent only sees relevant context. Efficient but requires careful design.</p>
    <p className="mb-2"><b>External memory:</b> State stored in a database. Agents query what they need on demand.</p>
  </ExpandableSection>
  <Quiz question="What's the main risk of giving every agent the full conversation history?" options={["It's too simple","It uses too many tokens, potentially exceeding context windows","It makes agents smarter","It's the default behavior"]} correctIndex={1} explanation="Full history for every agent means duplicating the entire conversation N times. With 5 agents and a long debate, this can easily exceed context windows and be very expensive." onAnswer={()=>onComplete&&onComplete('state-memory','quiz1')}/>
</div>}

function TabFrameworks({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Orchestration Frameworks</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Several frameworks simplify building multi-agent systems. Each has different strengths.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Framework</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>By</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Strength</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Pattern</th></tr></thead>
      <tbody>
        {[['LangGraph','LangChain','Graph-based workflows with cycles','Stateful orchestration'],['CrewAI','Open source','Role-based agent teams','Team collaboration'],['AutoGen','Microsoft','Conversational agents','Chat-based multi-agent'],['Claude Agent SDK','Anthropic','Agentic loops with tool use','Single-agent + tools']].map(([n,b,s,p],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{n}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td><td className="p-3" style={{color:GIM.bodyText}}>{s}</td><td className="p-3 font-mono" style={{color:GIM.primary,fontSize:11}}>{p}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Which framework is best for building a graph-based workflow with loops and conditional branching?" options={["CrewAI","LangGraph","AutoGen","Flask"]} correctIndex={1} explanation="LangGraph is specifically designed for graph-based workflows. Its nodes-and-edges model naturally supports cycles, branches, and conditional routing between agent steps." onAnswer={()=>onComplete&&onComplete('frameworks','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3 built its own orchestration framework for debates, using a round-based flow: Forge (select) \u2192 Rounds (debate) \u2192 Atlas (moderate) \u2192 Sage (synthesize)." targetPage="agent-community" onNavigate={onNavigate}/>
</div>}

function TabMAPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your multi-agent knowledge!</p>
  <ExpandableSection title="Exercise 1: System Design" icon={'\uD83C\uDFD7\uFE0F'} defaultOpen={true}>
    <Quiz question="You're building a content pipeline: research \u2192 write \u2192 edit \u2192 SEO optimize. Which pattern?" options={["Debate -- agents discuss the content","Pipeline -- each stage feeds the next","Consensus -- all agents must agree","Orchestrator -- one agent manages all"]} correctIndex={1} explanation="A sequential workflow where each stage's output becomes the next stage's input is the textbook Pipeline pattern." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Re\u00b3 Architecture" icon={'\uD83E\uDD16'}>
    <Quiz question="In Re\u00b3, what role does Atlas play?" options={["Selects which agents participate","Moderates debate quality and scores arguments","Synthesizes the final Loom output","Generates the initial article"]} correctIndex={1} explanation="Atlas is the moderator -- it evaluates argument quality, assigns scores, and ensures the debate stays on-topic and productive." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz2')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 3: Trade-offs" icon={'\u2696\uFE0F'}>
    <Quiz question="What is the biggest challenge of multi-agent systems?" options={["They're always slower than single agents","Coordinating state and managing complexity","They require more GPU memory","They can only use one LLM provider"]} correctIndex={1} explanation="The biggest challenge is coordination complexity -- managing shared state, ensuring agents communicate effectively, handling failures, and debugging interactions across multiple agents." onAnswer={()=>onComplete&&onComplete('ma-playground','quiz3')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 10: GRAPH RAG ====================
function TripleBuilder(){
  const sentences=[
    {text:'Albert Einstein developed the theory of relativity.',triples:[['Albert Einstein','developed','Theory of Relativity']]},
    {text:'Python was created by Guido van Rossum in 1991.',triples:[['Python','created by','Guido van Rossum'],['Python','released in','1991']]},
    {text:'The Eiffel Tower is located in Paris, France.',triples:[['Eiffel Tower','located in','Paris'],['Paris','is in','France']]},
  ];
  const[current,setCurrent]=useState(0);const[sub,setSub]=useState('');const[pred,setPred]=useState('');const[obj,setObj]=useState('');const[userTriples,setUserTriples]=useState([]);const[showAnswer,setShowAnswer]=useState(false);
  const s=sentences[current];
  const addTriple=()=>{if(sub&&pred&&obj){setUserTriples(t=>[...t,{s:sub,p:pred,o:obj}]);setSub('');setPred('');setObj('')}};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD17'} Try It: Extract Knowledge Triples</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Extract (Subject, Predicate, Object) triples from the sentence. ({current+1}/{sentences.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:14,color:GIM.headingText,fontWeight:600}}>"{s.text}"</p></div>
    <div className="grid grid-cols-3 gap-2 mb-2">
      <input value={sub} onChange={e=>setSub(e.target.value)} placeholder="Subject" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
      <input value={pred} onChange={e=>setPred(e.target.value)} placeholder="Predicate" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
      <input value={obj} onChange={e=>setObj(e.target.value)} placeholder="Object" className="px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
    </div>
    <div className="flex gap-2 mb-3">
      <button onClick={addTriple} className="px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Add Triple</button>
      <button onClick={()=>setShowAnswer(!showAnswer)} className="px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.borderLight,color:GIM.bodyText}}>Show Answer</button>
      {current<sentences.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setUserTriples([]);setShowAnswer(false)}} className="px-3 py-1 rounded text-xs font-semibold" style={{background:'white',color:GIM.primary,border:`1px solid ${GIM.primary}`}}>Next Sentence</button>}
    </div>
    {userTriples.length>0&&<div className="mb-3">{userTriples.map((t,i)=><div key={i} className="flex items-center gap-2 text-xs mb-1"><span className="px-2 py-0.5 rounded" style={{background:'#EFF6FF'}}>{t.s}</span><span style={{color:GIM.primary}}>{'\u2192'}</span><span className="px-2 py-0.5 rounded" style={{background:'#FFFBEB'}}>{t.p}</span><span style={{color:GIM.primary}}>{'\u2192'}</span><span className="px-2 py-0.5 rounded" style={{background:'#EBF5F1'}}>{t.o}</span></div>)}</div>}
    {showAnswer&&<div className="p-3 rounded-lg" style={{background:'#EBF5F1'}}><span className="text-xs font-semibold" style={{color:'#2D8A6E'}}>Expected triples:</span>{s.triples.map((t,i)=><div key={i} className="text-xs mt-1">({t[0]}, {t[1]}, {t[2]})</div>)}</div>}
  </div>;
}

function CourseGraphRAG({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'knowledge-graphs',label:'Knowledge Graphs',icon:'\uD83C\uDF10'},{id:'building-graphs',label:'Building Graphs',icon:'\uD83D\uDD28'},{id:'graph-retrieval',label:'Graph Retrieval',icon:'\uD83D\uDD0D'},{id:'hybrid-strat',label:'Hybrid Strategies',icon:'\uD83D\uDD00'},{id:'gr-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83C\uDF10'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>Graph RAG & Knowledge Graphs</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 50 min {'\u00b7'} 8 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabKnowledgeGraphs onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabBuildingGraphs onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabGraphRetrieval onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabHybridStrat onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===4&&<TabGRPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabKnowledgeGraphs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What Are Knowledge Graphs?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>A knowledge graph represents information as a network of <b>entities</b> (nodes) connected by <b>relationships</b> (edges). Each fact is stored as a triple: <b>(Subject, Predicate, Object)</b>.</p>
  <AnalogyBox emoji={'\uD83D\uDDFA\uFE0F'} title="Think of it like a map of knowledge">A road map shows cities (entities) connected by roads (relationships). A knowledge graph shows concepts connected by their relationships: "Einstein" {'\u2192'} developed {'\u2192'} "Theory of Relativity".</AnalogyBox>
  <CodeBlock language="text" label="Knowledge Graph Triples" code={`(Einstein,       developed,    Theory of Relativity)
(Einstein,       born in,      Ulm, Germany)
(Einstein,       won,          Nobel Prize in Physics)
(Nobel Prize,    awarded by,   Royal Swedish Academy)
(Relativity,     foundational to,  Modern Physics)

Following connections: Einstein → Nobel Prize → Royal Swedish Academy
  Reveals: The institution that recognized Einstein's work`}/>
  <Quiz question="What is the basic unit of information in a knowledge graph?" options={["A single word","A triple (Subject, Predicate, Object)","A paragraph","A JSON document"]} correctIndex={1} explanation="Knowledge graphs store facts as triples: (Subject, Predicate, Object). For example: (Python, created_by, Guido van Rossum). Each triple represents one relationship between two entities." onAnswer={()=>onComplete&&onComplete('knowledge-graphs','quiz1')}/>
</div>}

function TabBuildingGraphs({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Building Graphs from Text</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Building a knowledge graph from unstructured text requires two steps: <b>Named Entity Recognition (NER)</b> to find entities, and <b>Relation Extraction</b> to find how they connect.</p>
  <CodeBlock language="text" label="NER + Relation Extraction" code={`Input: "Apple CEO Tim Cook announced the new iPhone at WWDC 2024."

NER Results:
  [Apple]       → Organization
  [Tim Cook]    → Person
  [iPhone]      → Product
  [WWDC 2024]   → Event

Extracted Relations:
  (Tim Cook,    CEO of,       Apple)
  (Tim Cook,    announced,    iPhone)
  (iPhone,      announced at, WWDC 2024)
  (Apple,       hosts,        WWDC 2024)`}/>
  <TripleBuilder/>
  <Quiz question="What is the first step in building a knowledge graph from text?" options={["Drawing the graph visualization","Named Entity Recognition (NER)","Writing SQL queries","Calculating embeddings"]} correctIndex={1} explanation="NER identifies the entities (people, places, organizations, concepts) in the text. Only after finding entities can you extract the relationships between them." onAnswer={()=>onComplete&&onComplete('building-graphs','quiz1')}/>
</div>}

function TabGraphRetrieval({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Graph-Enhanced Retrieval</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Standard RAG finds documents similar to your query. <b>Graph RAG</b> enhances this by following relationships in the knowledge graph to find connected information that pure vector search would miss.</p>
  <AnalogyBox emoji={'\uD83D\uDD0D'} title="Vector search vs Graph search">Vector search: "Find documents about Einstein" \u2192 finds articles mentioning Einstein. Graph search: Start at Einstein node, follow relationships \u2192 discovers connected concepts like Relativity, Nobel Prize, Quantum Mechanics.</AnalogyBox>
  <Quiz question="What can Graph RAG find that vector search alone cannot?" options={["Faster results","Multi-hop connections between entities","More documents","Cheaper processing"]} correctIndex={1} explanation="Graph RAG can traverse relationships across multiple hops -- finding connections like 'Einstein \u2192 won Nobel Prize \u2192 awarded by Royal Swedish Academy' that wouldn't appear in a single document search." onAnswer={()=>onComplete&&onComplete('graph-retrieval','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's Loom creates thematic connections between debate insights -- these connections form a knowledge graph of ideas, linking arguments across different debates." targetPage="loom" onNavigate={onNavigate}/>
</div>}

function TabHybridStrat({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Hybrid Search Strategies</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>The most powerful retrieval systems combine multiple strategies: <b>vector search</b> for semantic similarity, <b>keyword search</b> for exact matches, and <b>graph traversal</b> for relationship discovery.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Method</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Finds</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Misses</th></tr></thead>
      <tbody>
        {[['Vector Search','Semantically similar content','Exact terms, connected entities'],['Keyword Search','Exact term matches','Synonyms, related concepts'],['Graph Traversal','Entity relationships, multi-hop paths','Unstructured content'],['Hybrid (all three)','Comprehensive results','(Most complete coverage)']].map(([m,f,mi],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.headingText}}>{m}</td><td className="p-3" style={{color:'#2D8A6E'}}>{f}</td><td className="p-3" style={{color:'#EF4444'}}>{mi}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Why combine vector search with graph traversal instead of using just one?" options={["It's a trend","They find different types of information, covering each other's blind spots","Graph search is always better","Vector search doesn't work"]} correctIndex={1} explanation="Vector search finds semantically similar content but misses entity connections. Graph traversal finds connected entities but misses unstructured content. Together, they provide comprehensive coverage." onAnswer={()=>onComplete&&onComplete('hybrid-strat','quiz1')}/>
</div>}

function TabGRPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your Graph RAG knowledge!</p>
  <ExpandableSection title="Exercise 1: Triple Extraction" icon={'\uD83D\uDD17'} defaultOpen={true}>
    <Quiz question="From 'Tesla, founded by Elon Musk, is headquartered in Austin.' How many triples can be extracted?" options={["1 triple","2 triples","3 triples","4 triples"]} correctIndex={1} explanation="Two triples: (Tesla, founded by, Elon Musk) and (Tesla, headquartered in, Austin). Each relationship becomes a separate triple." onAnswer={()=>onComplete&&onComplete('gr-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Strategy Selection" icon={'\uD83D\uDD0D'}>
    <Quiz question="A user asks 'What companies did Einstein's colleagues found?' This requires:" options={["Simple vector search","Multi-hop graph traversal","Keyword search for 'Einstein'","A larger LLM"]} correctIndex={1} explanation="This requires graph traversal: Einstein \u2192 (colleagues) \u2192 People \u2192 (founded) \u2192 Companies. Pure search would never connect these dots across multiple relationship hops." onAnswer={()=>onComplete&&onComplete('gr-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 11: AI OBSERVABILITY ====================
function CourseObservability({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'why-observe',label:'Why Observe AI',icon:'\uD83D\uDCCA'},{id:'tracing',label:'Tracing & Logging',icon:'\uD83D\uDD0D'},{id:'eval-frameworks',label:'Evaluation Frameworks',icon:'\u2705'},{id:'obs-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDCCA'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>AI Observability & Evaluation</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 45 min {'\u00b7'} 7 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhyObserve onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabTracing onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabEvalFrameworks onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabObsPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhyObserve({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Why Observe AI?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Unlike traditional software with deterministic outputs, AI systems are <b>non-deterministic</b>. The same input can produce different outputs. This makes monitoring, debugging, and quality assurance fundamentally different.</p>
  <AnalogyBox emoji={'\uD83D\uDE97'} title="Think of it like a car dashboard">You wouldn't drive without a speedometer, fuel gauge, and warning lights. AI observability gives you the same visibility into your AI system -- speed (latency), fuel (tokens/cost), and warning lights (quality issues).</AnalogyBox>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Metric</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>What It Measures</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Why It Matters</th></tr></thead>
      <tbody>
        {[['Latency','Response time (ms)','User experience, SLA compliance'],['Token Usage','Input + output tokens per request','Cost management, budget planning'],['Error Rate','% of failed or low-quality responses','System reliability'],['Quality Score','Faithfulness, relevance, coherence','Output accuracy and usefulness']].map(([m,w,y],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{m}</td><td className="p-3" style={{color:GIM.bodyText}}>{w}</td><td className="p-3" style={{color:GIM.mutedText}}>{y}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Why is AI observability harder than traditional software monitoring?" options={["AI is always faster","AI outputs are non-deterministic -- same input can produce different outputs","AI doesn't generate errors","Monitoring tools don't work with AI"]} correctIndex={1} explanation="Traditional software has deterministic outputs (same input = same output). AI is non-deterministic, so you can't just check if the output matches an expected value -- you need quality metrics." onAnswer={()=>onComplete&&onComplete('why-observe','quiz1')}/>
</div>}

function TabTracing({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Tracing & Logging</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An AI trace captures the complete journey of a request: from user input through retrieval, LLM calls, tool use, and final response. Each step is a <b>span</b> with timing, token counts, and metadata.</p>
  <CodeBlock language="json" label="Example Trace Span" code={`{
  "trace_id": "tr_abc123",
  "span_name": "llm_completion",
  "duration_ms": 2340,
  "model": "claude-3-sonnet",
  "input_tokens": 1250,
  "output_tokens": 380,
  "temperature": 0.7,
  "cost_usd": 0.0087,
  "status": "success",
  "parent_span": "rag_pipeline"
}`}/>
  <ExpandableSection title="Common tracing tools" icon={'\uD83D\uDD27'}>
    <p className="mb-2"><b>LangSmith:</b> By LangChain. Traces chains, agents, and retrievers with a visual UI.</p>
    <p className="mb-2"><b>Langfuse:</b> Open-source. Supports traces, scores, and prompt management.</p>
    <p className="mb-2"><b>Arize Phoenix:</b> Focus on embeddings analysis and retrieval evaluation.</p>
    <p className="mb-2"><b>Weights & Biases:</b> Broad ML ops platform with LLM tracing support.</p>
  </ExpandableSection>
  <Quiz question="What information does a trace span capture?" options={["Only the final output","Timing, tokens, model, cost, and status for each processing step","Just the error messages","The user's personal data"]} correctIndex={1} explanation="A span captures everything about one processing step: duration, model used, tokens consumed, cost, status, and parent-child relationships to other spans." onAnswer={()=>onComplete&&onComplete('tracing','quiz1')}/>
</div>}

function TabEvalFrameworks({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Evaluation Frameworks</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>How do you measure if your AI system is "good"? Evaluation frameworks provide standardized metrics to assess AI output quality across multiple dimensions.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Metric</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Question It Answers</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Score Range</th></tr></thead>
      <tbody>
        {[['Faithfulness','Is the answer supported by the retrieved context?','0-1 (higher = more faithful)'],['Answer Relevancy','Does the answer actually address the question?','0-1 (higher = more relevant)'],['Context Precision','Are the retrieved documents relevant?','0-1 (higher = more precise)'],['Context Recall','Did retrieval find all relevant information?','0-1 (higher = better recall)'],['Coherence','Is the answer well-structured and logical?','1-5 (higher = more coherent)']].map(([m,q,s],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{m}</td><td className="p-3" style={{color:GIM.bodyText}}>{q}</td><td className="p-3 font-mono" style={{color:GIM.mutedText,fontSize:11}}>{s}</td></tr>)}
      </tbody>
    </table>
  </div>
  <Quiz question="Users report that your AI sometimes includes information not found in the source documents. Which metric is low?" options={["Answer Relevancy","Context Precision","Faithfulness","Coherence"]} correctIndex={2} explanation="Faithfulness measures whether the answer is grounded in the retrieved context. Low faithfulness means the LLM is generating information beyond what was retrieved -- hallucinating." onAnswer={()=>onComplete&&onComplete('eval-frameworks','quiz1')}/>
  <Quiz question="Your RAG system retrieves mostly irrelevant documents. Which metric would flag this?" options={["Faithfulness","Context Precision","Answer Relevancy","Coherence"]} correctIndex={1} explanation="Context Precision measures whether the retrieved documents are actually relevant to the query. Low precision means the retrieval step is returning too much irrelevant content." onAnswer={()=>onComplete&&onComplete('eval-frameworks','quiz2')}/>
  <SeeItInRe3 text="Re\u00b3's Atlas agent acts as a quality evaluator -- scoring debate arguments for relevance, depth, and accuracy. This is AI evaluation applied to a debate system." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabObsPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your observability knowledge!</p>
  <ExpandableSection title="Exercise 1: Metric Selection" icon={'\uD83D\uDCCA'} defaultOpen={true}>
    <Quiz question="Your AI system's costs doubled last month. Which metric should you investigate first?" options={["Faithfulness","Token usage per request","Coherence","Answer relevancy"]} correctIndex={1} explanation="Cost is directly proportional to token usage. If costs doubled, check if requests are using more tokens (longer prompts, more retrieval, longer outputs) or if request volume increased." onAnswer={()=>onComplete&&onComplete('obs-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Quality Diagnosis" icon={'\uD83D\uDD0D'}>
    <Quiz question="Users say answers are correct but hard to understand. Which metric is the issue?" options={["Faithfulness","Context Recall","Coherence","Context Precision"]} correctIndex={2} explanation="If answers are factually correct (high faithfulness) but hard to understand, the issue is coherence -- the logical structure, readability, and organization of the response." onAnswer={()=>onComplete&&onComplete('obs-playground','quiz2')}/>
  </ExpandableSection>
</div>}

// ==================== COURSE 12: LLM GATEWAY PATTERNS ====================
function GatewaySimulator(){
  const[strategy,setStrategy]=useState('cheapest');
  const[providers,setProviders]=useState([{name:'Anthropic',status:'healthy',cost:3.0,latency:1200},{name:'OpenAI',status:'healthy',cost:2.5,latency:800},{name:'Gemini',status:'healthy',cost:1.0,latency:1500},{name:'Groq',status:'healthy',cost:0.3,latency:200}]);
  const toggleStatus=(i)=>{const p=[...providers];p[i].status=p[i].status==='healthy'?'down':'healthy';setProviders(p)};
  const healthy=providers.filter(p=>p.status==='healthy');
  const routed=healthy.length===0?null:strategy==='cheapest'?healthy.reduce((a,b)=>a.cost<b.cost?a:b):strategy==='fastest'?healthy.reduce((a,b)=>a.latency<b.latency?a:b):healthy[Math.floor(Math.random()*healthy.length)];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDE80'} Try It: Gateway Router Simulator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Choose a routing strategy, toggle provider health, and see where requests get routed.</p>
    <div className="flex gap-2 mb-3">{['cheapest','fastest','round-robin'].map(s=><button key={s} onClick={()=>setStrategy(s)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:strategy===s?GIM.primary:'white',color:strategy===s?'white':GIM.bodyText,border:`1px solid ${strategy===s?GIM.primary:GIM.border}`}}>{s}</button>)}</div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">{providers.map((p,i)=><div key={p.name} className="rounded-lg p-3 text-center cursor-pointer transition-all" onClick={()=>toggleStatus(i)} style={{background:p.status==='healthy'?(routed&&routed.name===p.name?'#EBF5F1':'white'):'#FEF2F2',border:`2px solid ${p.status==='healthy'?(routed&&routed.name===p.name?'#2D8A6E':GIM.border):'#EF4444'}`}}>
      <div className="font-semibold text-xs" style={{color:GIM.headingText}}>{p.name}</div>
      <div className="text-xs mt-1" style={{color:p.status==='healthy'?'#2D8A6E':'#EF4444'}}>{p.status==='healthy'?'\u2705 Healthy':'\u274C Down'}</div>
      <div className="text-xs mt-1" style={{color:GIM.mutedText}}>${p.cost}/1K tok</div>
      <div className="text-xs" style={{color:GIM.mutedText}}>{p.latency}ms</div>
      {routed&&routed.name===p.name&&<div className="text-xs font-bold mt-1" style={{color:'#2D8A6E'}}>{'\u2190'} ROUTED</div>}
    </div>)}</div>
    {!routed&&<div className="p-2 rounded-lg" style={{background:'#FEF2F2'}}><span className="text-xs font-semibold" style={{color:'#EF4444'}}>All providers are down! No routing possible.</span></div>}
    <p className="text-xs mt-2" style={{color:GIM.mutedText}}>Click any provider to toggle its health status.</p>
  </div>;
}

function CostCalculator(){
  const[requests,setRequests]=useState(1000);const[avgTokens,setAvgTokens]=useState(500);const[provider,setProvider]=useState('anthropic');
  const costs={anthropic:0.003,openai:0.0025,gemini:0.001,groq:0.0003};
  const daily=requests*(avgTokens/1000)*costs[provider];const monthly=daily*30;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCB0'} Try It: LLM Cost Calculator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Estimate your LLM costs based on usage and provider.</p>
    <div className="space-y-3 mb-4">
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Requests per day</span><span style={{fontSize:12,color:GIM.mutedText}}>{requests.toLocaleString()}</span></label><input type="range" min="100" max="100000" step="100" value={requests} onChange={e=>setRequests(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Avg tokens per request</span><span style={{fontSize:12,color:GIM.mutedText}}>{avgTokens}</span></label><input type="range" min="50" max="4000" step="50" value={avgTokens} onChange={e=>setAvgTokens(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/></div>
      <div className="flex gap-2">{Object.keys(costs).map(p=><button key={p} onClick={()=>setProvider(p)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:provider===p?GIM.primary:'white',color:provider===p?'white':GIM.bodyText,border:`1px solid ${provider===p?GIM.primary:GIM.border}`}}>{p}</button>)}</div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg text-center" style={{background:GIM.borderLight}}><div className="font-bold" style={{fontSize:20,color:GIM.primary}}>${daily.toFixed(2)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per day</div></div>
      <div className="p-3 rounded-lg text-center" style={{background:GIM.primaryBadge}}><div className="font-bold" style={{fontSize:20,color:GIM.primaryDark}}>${monthly.toFixed(0)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per month</div></div>
    </div>
  </div>;
}

function CourseLLMGateway({onBack,onNavigate,progress,onComplete}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[{id:'what-gateway',label:'What is a Gateway',icon:'\uD83D\uDE80'},{id:'routing',label:'Routing Strategies',icon:'\uD83D\uDD00'},{id:'cost-rate',label:'Cost & Rate Limiting',icon:'\uD83D\uDCB0'},{id:'gw-playground',label:'Playground',icon:'\uD83C\uDFAE'}];
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button><span style={{fontSize:24}}>{'\uD83D\uDE80'}</span><h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>LLM Gateway Patterns</h1></div>
    <ProgressBar percent={progress} size="md"/><p className="mt-1 mb-6" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} 40 min {'\u00b7'} 6 exercises</p></FadeIn>
    <FadeIn delay={30}><div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>{tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}><span>{tab.icon}</span>{tab.label}</button>)}</div></FadeIn>
    <FadeIn key={activeTab} delay={0}>
      {activeTab===0&&<TabWhatGateway onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===1&&<TabRouting onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===2&&<TabCostRate onNavigate={onNavigate} onComplete={onComplete}/>}
      {activeTab===3&&<TabGWPlayground onNavigate={onNavigate} onComplete={onComplete}/>}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}><button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button><button onClick={()=>setActiveTab(Math.min(tabs.length-1,activeTab+1))} disabled={activeTab===tabs.length-1} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===tabs.length-1?GIM.borderLight:GIM.primary,color:activeTab===tabs.length-1?GIM.mutedText:'white'}}>Next {'\u2192'}</button></div>
  </div>;
}

function TabWhatGateway({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>What is an LLM Gateway?</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>An LLM Gateway is a <b>middleware layer</b> between your application and LLM providers. It handles routing, failover, rate limiting, cost management, and logging -- so your application code stays simple.</p>
  <AnalogyBox emoji={'\u2708\uFE0F'} title="Think of it like air traffic control">Air traffic control routes planes to the right runway, manages congestion, handles emergencies, and tracks all flights. An LLM gateway does the same for AI requests -- routing them to the right provider efficiently.</AnalogyBox>
  <CodeBlock language="text" label="Gateway Architecture" code={`Your App ──request──> [LLM Gateway]
                         │
                    ┌────┼────┐────────┐
                    ▼    ▼    ▼        ▼
               Anthropic OpenAI Gemini Groq

Gateway handles:
  ✓ Routing (cheapest, fastest, round-robin)
  ✓ Failover (if Anthropic is down → try OpenAI)
  ✓ Rate limiting (max 100 req/min per user)
  ✓ Cost tracking (budget alerts, usage caps)
  ✓ Logging (trace every request for debugging)`}/>
  <Quiz question="What is the main benefit of using an LLM gateway instead of calling providers directly?" options={["It makes responses faster","It centralizes routing, failover, and cost management","It improves AI quality","It's required by law"]} correctIndex={1} explanation="A gateway centralizes cross-cutting concerns (routing, failover, rate limiting, cost tracking, logging) so your application code only needs to make one call and the gateway handles the rest." onAnswer={()=>onComplete&&onComplete('what-gateway','quiz1')}/>
</div>}

function TabRouting({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Routing Strategies</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Different routing strategies optimize for different goals. The best strategy depends on your priorities.</p>
  <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Strategy</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>How It Works</th><th className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>Best For</th></tr></thead>
      <tbody>
        {[['Cost-Optimized','Route to cheapest available provider','Budget-constrained applications'],['Latency-Optimized','Route to fastest available provider','Real-time applications, chatbots'],['Quality-Optimized','Route to best model for the task type','High-stakes applications'],['Round-Robin','Distribute evenly across providers','Load balancing, rate limit spreading'],['Fallback Chain','Try primary, fall back to secondary','Maximum reliability']].map(([s,h,b],i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}><td className="p-3 font-medium" style={{color:GIM.primary,fontWeight:600}}>{s}</td><td className="p-3" style={{color:GIM.bodyText}}>{h}</td><td className="p-3" style={{color:GIM.mutedText}}>{b}</td></tr>)}
      </tbody>
    </table>
  </div>
  <GatewaySimulator/>
  <Quiz question="Your app needs maximum reliability. Which routing strategy?" options={["Cost-optimized","Round-robin","Fallback chain","Random"]} correctIndex={2} explanation="Fallback chain provides maximum reliability: try the primary provider first, and if it fails, automatically try the next one. This ensures your app stays up even during provider outages." onAnswer={()=>onComplete&&onComplete('routing','quiz1')}/>
</div>}

function TabCostRate({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Cost & Rate Limiting</h2>
  <p className="mb-3" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>LLM costs can spiral quickly in production. A gateway provides <b>token budgeting</b>, <b>rate limiting</b>, and <b>caching</b> to keep costs under control.</p>
  <ExpandableSection title="Token Budgeting" icon={'\uD83D\uDCB0'} defaultOpen={true}>
    <p className="mb-2">Set maximum tokens per request, per user, per day, or per month. If a user exhausts their budget, the gateway returns a friendly error instead of an expensive API call.</p>
  </ExpandableSection>
  <ExpandableSection title="Semantic Caching" icon={'\u26A1'}>
    <p className="mb-2">Cache responses for similar queries. If a user asks "What's the capital of France?" and someone asked the same thing 5 minutes ago, return the cached response instead of making a new API call. This can reduce costs by 30-50% for repetitive workloads.</p>
  </ExpandableSection>
  <ExpandableSection title="Rate Limiting" icon={'\uD83D\uDEA6'}>
    <p className="mb-2">Limit requests per minute/hour per user or API key. Prevents runaway loops, abusive users, and unexpected cost spikes. Typically: 60 req/min for free tier, 300 req/min for paid.</p>
  </ExpandableSection>
  <CostCalculator/>
  <Quiz question="Which technique can reduce LLM costs by 30-50% for repetitive queries?" options={["Using smaller models","Semantic caching","Increasing temperature","Adding more providers"]} correctIndex={1} explanation="Semantic caching stores responses for similar queries. Instead of calling the LLM again for the same (or semantically similar) question, it returns the cached response instantly." onAnswer={()=>onComplete&&onComplete('cost-rate','quiz1')}/>
  <SeeItInRe3 text="Re\u00b3's lib/llm-router.js IS a gateway pattern -- it routes requests across Anthropic, OpenAI, Gemini, and Groq with automatic fallback, 30-second timeouts, and provider-specific handling." targetPage="forge" onNavigate={onNavigate}/>
</div>}

function TabGWPlayground({onNavigate,onComplete}){return <div>
  <h2 className="font-bold mb-4" style={{fontFamily:GIM.fontMain,fontSize:22,color:GIM.headingText}}>Playground</h2>
  <p className="mb-4" style={{fontSize:14,color:GIM.bodyText,lineHeight:1.8}}>Test your gateway knowledge!</p>
  <ExpandableSection title="Exercise 1: Strategy Selection" icon={'\uD83D\uDD00'} defaultOpen={true}>
    <Quiz question="A startup has a tight budget and mostly handles simple FAQ queries. Which routing strategy?" options={["Quality-optimized (use the best model)","Cost-optimized (use the cheapest model)","Latency-optimized (use the fastest)","Fallback chain"]} correctIndex={1} explanation="For a budget-constrained startup with simple queries, cost-optimized routing sends requests to the cheapest provider that can handle the task. Simple FAQs don't need the most expensive models." onAnswer={()=>onComplete&&onComplete('gw-playground','quiz1')}/>
  </ExpandableSection>
  <ExpandableSection title="Exercise 2: Cost Optimization" icon={'\uD83D\uDCB0'}>
    <Quiz question="Your LLM costs spiked 10x overnight. What's the most likely cause?" options={["The model got smarter","A bug causing infinite loops of LLM calls","The provider raised prices 10x","Users suddenly became 10x smarter"]} correctIndex={1} explanation="A 10x cost spike is almost always a runaway loop -- code that recursively calls the LLM without proper termination. Rate limiting and token budgets in your gateway would have prevented this." onAnswer={()=>onComplete&&onComplete('gw-playground','quiz2')}/>
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

  const courseShell=(id,Component)=>{
    if(activeCourse!==id)return null;
    const cp=progress[id]?.percent||0;
    return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
      <Component onBack={()=>setActiveCourse(null)} onNavigate={onNavigate} progress={cp} onComplete={(tabId,sectionId)=>updateProgress(id,tabId,sectionId)}/>
    </div>;
  };

  const routes=[
    ['llm-basics',CourseLLMBasics],['prompt-engineering',CoursePromptEng],['embeddings',CourseEmbeddings],
    ['rag-fundamentals',CourseRAG],['mcp-protocol',CourseMCP],['a2a-protocol',CourseA2A],
    ['function-calling',CourseFunctionCalling],['ai-governance',CourseGovernance],['multi-agent',CourseMultiAgent],
    ['graph-rag',CourseGraphRAG],['ai-observability',CourseObservability],['llm-gateway',CourseLLMGateway],
  ];
  for(const[id,Comp]of routes){const r=courseShell(id,Comp);if(r)return r;}

  return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
    <AcademyHub onStartCourse={(id)=>setActiveCourse(id)} progress={progress}/>
  </div>;
}
