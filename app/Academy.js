"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { CourseLLMBasics, CoursePromptEng, CourseEmbeddings, CourseRAG, CourseContextEng, CourseAISafety, CourseTokensCosts, CourseJSONMode } from './AcademyTier1';
import { CourseMCP, CourseA2A, CourseFunctionCalling, CourseGovernance, CourseACP, CourseAgenticPatterns, CourseMemorySystems, CourseHITL } from './AcademyTier2';
import { CourseMultiAgent, CourseGraphRAG, CourseObservability, CourseLLMGateway, CourseFineTuning, CourseAICodeGen, CourseMultimodal, CourseVoiceAI, CourseRetrievalEng, CourseAITesting } from './AcademyTier3';
import { CourseAIRegulatory, CourseResponsibleAI, CourseEnterpriseStrategy, CourseAIEconomics, CourseComputerUse, CoursePhysicalAI } from './AcademyTier4';

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
  3:{ accent:'#9333EA', bg:'#FAF5FF', label:'Production AI' },
  4:{ accent:'#DC2626', bg:'#FEF2F2', label:'Strategic & Frontier' },
};
const CODE_BG = '#1E293B';
const CODE_TEXT = '#E2E8F0';

// ==================== LOCAL STORAGE ====================
const ADB = {
  get:(key,fb)=>{try{const d=typeof window!=='undefined'&&localStorage.getItem(`re3_academy_${key}`);return d?JSON.parse(d):fb}catch{return fb}},
  set:(key,v)=>{try{typeof window!=='undefined'&&localStorage.setItem(`re3_academy_${key}`,JSON.stringify(v))}catch{}},
};

// ==================== COURSE CATALOG (32 COURSES) ====================
const COURSES = [
  // Tier 1: Foundations (8 courses)
  {id:'llm-basics',tier:1,icon:'\uD83E\uDDE0',title:'How LLMs Work',description:'Tokens, context windows, temperature, inference. The mechanics behind every AI interaction.',difficulty:'Beginner',timeMinutes:45,exerciseCount:8,tabCount:5,status:'available'},
  {id:'prompt-engineering',tier:1,icon:'\uD83D\uDCAC',title:'Prompt Engineering',description:'System prompts, few-shot, chain-of-thought, structured outputs. The art of communicating with AI.',difficulty:'Beginner',timeMinutes:40,exerciseCount:10,tabCount:4,status:'available'},
  {id:'embeddings',tier:1,icon:'\uD83D\uDD0E',title:'Embeddings & Vector Search',description:'How AI understands similarity. Vectors, cosine distance, approximate nearest neighbors.',difficulty:'Beginner',timeMinutes:35,exerciseCount:6,tabCount:4,status:'available'},
  {id:'rag-fundamentals',tier:1,icon:'\uD83D\uDD0D',title:'RAG Fundamentals',description:'Retrieval-Augmented Generation. Grounding AI in real data to reduce hallucination.',difficulty:'Beginner',timeMinutes:50,exerciseCount:9,tabCount:5,status:'available'},
  {id:'context-engineering',tier:1,icon:'\uD83E\uDDE9',title:'Context Engineering',description:'The meta-skill of AI: prompt + memory + retrieval + tools = context. Design what the model sees.',difficulty:'Beginner',timeMinutes:40,exerciseCount:7,tabCount:4,status:'available'},
  {id:'ai-safety',tier:1,icon:'\uD83D\uDEE1\uFE0F',title:'AI Safety & Alignment Basics',description:'Hallucination causes, bias types, guardrails, red-teaming basics. Building AI that behaves.',difficulty:'Beginner',timeMinutes:35,exerciseCount:6,tabCount:4,status:'available'},
  {id:'tokens-costs',tier:1,icon:'\uD83D\uDCB0',title:'Tokens, Costs & Model Selection',description:'Pricing models, when to use GPT vs Claude vs Gemini vs open-source. Optimizing spend.',difficulty:'Beginner',timeMinutes:30,exerciseCount:5,tabCount:3,status:'available'},
  {id:'json-mode',tier:1,icon:'\uD83D\uDCCB',title:'JSON Mode & Structured Outputs',description:'JSON mode, Instructor, Pydantic, schema enforcement. Getting reliable structured data from AI.',difficulty:'Beginner',timeMinutes:35,exerciseCount:7,tabCount:4,status:'available'},
  // Tier 2: Protocols & Patterns (8 courses)
  {id:'mcp-protocol',tier:2,icon:'\uD83D\uDD0C',title:'Model Context Protocol (MCP)',description:'The universal adapter for AI. Host/Client/Server architecture, Tools/Resources/Prompts.',difficulty:'Intermediate',timeMinutes:60,exerciseCount:12,tabCount:6,status:'available'},
  {id:'a2a-protocol',tier:2,icon:'\uD83E\uDD1D',title:'Agent-to-Agent (A2A)',description:'How AI agents discover, communicate, and collaborate across platforms.',difficulty:'Intermediate',timeMinutes:45,exerciseCount:8,tabCount:4,status:'available'},
  {id:'function-calling',tier:2,icon:'\u2699\uFE0F',title:'Function Calling & Tool Use',description:'How LLMs invoke tools across providers. JSON Schema, tool definitions, response handling.',difficulty:'Intermediate',timeMinutes:35,exerciseCount:7,tabCount:4,status:'available'},
  {id:'ai-governance',tier:2,icon:'\uD83C\uDFDB\uFE0F',title:'AI Governance Essentials',description:'Frameworks for responsible AI. Mapping use cases to governance across organizational pillars.',difficulty:'Intermediate',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
  {id:'acp-protocol',tier:2,icon:'\uD83D\uDCE1',title:'Agent Communication Protocol',description:'IBM\'s ACP: event-driven, async-first messaging for enterprise agent ecosystems.',difficulty:'Intermediate',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
  {id:'agentic-patterns',tier:2,icon:'\uD83D\uDD04',title:'Agentic Design Patterns',description:'ReAct, Plan-and-Execute, Reflection, Tool-use loops. The building blocks of AI agents.',difficulty:'Intermediate',timeMinutes:45,exerciseCount:8,tabCount:4,status:'available'},
  {id:'memory-systems',tier:2,icon:'\uD83E\uDDE0',title:'Memory Systems for AI',description:'Short-term buffers, long-term stores, semantic & episodic memory. Giving AI persistent context.',difficulty:'Intermediate',timeMinutes:40,exerciseCount:7,tabCount:4,status:'available'},
  {id:'human-in-loop',tier:2,icon:'\uD83D\uDC64',title:'Human-in-the-Loop Patterns',description:'Approval gates, escalation, confidence thresholds. Keeping humans in control of AI decisions.',difficulty:'Intermediate',timeMinutes:35,exerciseCount:6,tabCount:4,status:'available'},
  // Tier 3: Production AI (10 courses)
  {id:'multi-agent',tier:3,icon:'\uD83E\uDD16',title:'Multi-Agent Orchestration',description:'Agent roles, debate flows, consensus mechanisms. How systems like Re\u00b3 actually work.',difficulty:'Advanced',timeMinutes:55,exerciseCount:10,tabCount:5,status:'available'},
  {id:'graph-rag',tier:3,icon:'\uD83C\uDF10',title:'Graph RAG & Knowledge Graphs',description:'Combining structured and unstructured retrieval. Entity relationships, hybrid search.',difficulty:'Advanced',timeMinutes:50,exerciseCount:8,tabCount:5,status:'available'},
  {id:'ai-observability',tier:3,icon:'\uD83D\uDCCA',title:'AI Observability & Evaluation',description:'Measuring AI quality. Tracing, drift detection, evaluation frameworks, quality scorecards.',difficulty:'Advanced',timeMinutes:45,exerciseCount:7,tabCount:4,status:'available'},
  {id:'llm-gateway',tier:3,icon:'\uD83D\uDE80',title:'LLM Gateway Patterns',description:'Multi-provider routing, fallbacks, cost optimization, rate limiting. Enterprise AI at scale.',difficulty:'Advanced',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
  {id:'fine-tuning',tier:3,icon:'\uD83D\uDD27',title:'Fine-Tuning & Model Customization',description:'LoRA, QLoRA, synthetic data, domain adaptation. Making models work for your specific use case.',difficulty:'Advanced',timeMinutes:50,exerciseCount:8,tabCount:4,status:'available'},
  {id:'ai-code-gen',tier:3,icon:'\uD83D\uDCBB',title:'AI-Powered Code Generation',description:'Agentic coding, Claude Code, Cursor, vibe coding patterns. AI as your programming partner.',difficulty:'Advanced',timeMinutes:45,exerciseCount:9,tabCount:4,status:'available'},
  {id:'multimodal',tier:3,icon:'\uD83D\uDDBC\uFE0F',title:'Multimodal AI Pipelines',description:'Vision + text + audio. Document processing, image understanding, cross-modal reasoning.',difficulty:'Advanced',timeMinutes:45,exerciseCount:7,tabCount:4,status:'available'},
  {id:'voice-ai',tier:3,icon:'\uD83C\uDF99\uFE0F',title:'Voice AI & Conversational Agents',description:'STT, TTS, real-time conversation, contact center AI. Building voice-first experiences.',difficulty:'Advanced',timeMinutes:40,exerciseCount:6,tabCount:4,status:'available'},
  {id:'retrieval-eng',tier:3,icon:'\uD83D\uDD0E',title:'Retrieval Engineering',description:'Advanced chunking, hybrid search, reranking, RAPTOR. Going beyond basic RAG.',difficulty:'Advanced',timeMinutes:45,exerciseCount:8,tabCount:4,status:'available'},
  {id:'ai-testing',tier:3,icon:'\uD83E\uDDEA',title:'AI Testing & Red-Teaming',description:'Adversarial testing, prompt injection defense, safety benchmarks. Hardening AI systems.',difficulty:'Advanced',timeMinutes:40,exerciseCount:7,tabCount:4,status:'available'},
  // Tier 4: Strategic & Frontier (6 courses)
  {id:'ai-regulatory',tier:4,icon:'\u2696\uFE0F',title:'AI Governance & Regulatory Landscape',description:'NIST AI RMF, EU AI Act, model risk management. Navigating the regulatory maze.',difficulty:'Expert',timeMinutes:50,exerciseCount:7,tabCount:4,status:'available'},
  {id:'responsible-ai',tier:4,icon:'\uD83E\uDD1D',title:'Responsible AI in Practice',description:'Fairness, explainability, Fairlearn, AI Fairness 360. Ethical AI at production scale.',difficulty:'Expert',timeMinutes:45,exerciseCount:6,tabCount:4,status:'available'},
  {id:'enterprise-strategy',tier:4,icon:'\uD83D\uDCCA',title:'Enterprise AI Strategy',description:'Top-down vs bottom-up, value realization, workflow redesign. AI transformation leadership.',difficulty:'Expert',timeMinutes:40,exerciseCount:5,tabCount:4,status:'available'},
  {id:'ai-economics',tier:4,icon:'\uD83D\uDCC8',title:'AI Economics & ROI',description:'Cost modeling, build vs buy, GPU economics, inference optimization. The business of AI.',difficulty:'Expert',timeMinutes:35,exerciseCount:5,tabCount:3,status:'available'},
  {id:'computer-use',tier:4,icon:'\uD83D\uDDA5\uFE0F',title:'Computer Use & Browser Agents',description:'Anthropic computer use, web agents, RPA 2.0. AI that operates your software.',difficulty:'Expert',timeMinutes:45,exerciseCount:7,tabCount:4,status:'available'},
  {id:'physical-ai',tier:4,icon:'\uD83E\uDD16',title:'Physical AI & Robotics Foundations',description:'Embodied AI, simulation-to-real, sensor fusion. When AI meets the physical world.',difficulty:'Expert',timeMinutes:40,exerciseCount:5,tabCount:4,status:'available'},
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
  <div className="flex-1"><span className="font-semibold" style={{fontSize:12,color:GIM.primary,fontFamily:GIM.fontMain}}>See It In Re{'\u00b3'}</span><p style={{fontSize:12,color:GIM.bodyText,marginTop:2,fontFamily:GIM.fontMain}}>{text}</p></div>
  <span style={{fontSize:14,color:GIM.primary}}>{'\u2192'}</span>
</button>}

// ==================== DEPTH SELECTOR ====================
function DepthSelector({depth,onChangeDepth}){
  return <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{background:GIM.borderLight}}>
    <button onClick={()=>onChangeDepth('visionary')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all" style={{background:depth==='visionary'?'white':'transparent',color:depth==='visionary'?GIM.primary:GIM.mutedText,boxShadow:depth==='visionary'?'0 1px 4px rgba(0,0,0,0.06)':'none'}}>
      <span>{'\uD83D\uDD2D'}</span> For Visionaries
    </button>
    <button onClick={()=>onChangeDepth('deep')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all" style={{background:depth==='deep'?'white':'transparent',color:depth==='deep'?GIM.primary:GIM.mutedText,boxShadow:depth==='deep'?'0 1px 4px rgba(0,0,0,0.06)':'none'}}>
      <span>{'\uD83D\uDD2C'}</span> Go Deep
    </button>
  </div>;
}

// ==================== COURSE SHELL ====================
function CourseShell({id,icon,title,timeMinutes,exerciseCount,onBack,onNavigate,progress,onComplete,depth,onChangeDepth,visionaryTabs,deepTabs,renderTab}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=depth==='deep'?deepTabs:visionaryTabs;
  // Reset tab when switching depth if current tab exceeds new tab count
  const safeTab=Math.min(activeTab,tabs.length-1);
  if(safeTab!==activeTab)setActiveTab(safeTab);

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{border:`1px solid ${GIM.border}`,color:GIM.bodyText}}>{'\u2190'} All Courses</button>
        <span style={{fontSize:24}}>{icon}</span>
        <h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(20px,4vw,28px)',color:GIM.headingText}}>{title}</h1>
      </div>
      <ProgressBar percent={progress} size="md"/>
      <p className="mt-1 mb-4" style={{fontSize:12,color:GIM.mutedText}}>{Math.round(progress)}% complete {'\u00b7'} {timeMinutes} min {'\u00b7'} {exerciseCount} exercises</p>
    </FadeIn>
    <FadeIn delay={20}><DepthSelector depth={depth} onChangeDepth={onChangeDepth}/></FadeIn>
    <FadeIn delay={30}>
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{background:GIM.borderLight}}>
        {tabs.map((tab,i)=><button key={tab.id} onClick={()=>setActiveTab(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap" style={{background:activeTab===i?GIM.cardBg:'transparent',color:activeTab===i?GIM.primary:GIM.mutedText,boxShadow:activeTab===i?'0 1px 4px rgba(0,0,0,0.06)':'none'}}>
          <span>{tab.icon}</span>{tab.label}
        </button>)}
      </div>
    </FadeIn>
    <FadeIn key={`${depth}-${activeTab}`} delay={0}>
      {renderTab(tabs[activeTab],activeTab,depth)}
    </FadeIn>
    <div className="flex justify-between mt-8 pt-4" style={{borderTop:`1px solid ${GIM.border}`}}>
      <button onClick={()=>setActiveTab(Math.max(0,activeTab-1))} disabled={activeTab===0} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:activeTab===0?GIM.borderLight:'white',color:activeTab===0?GIM.mutedText:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{'\u2190'} Previous</button>
      {activeTab===tabs.length-1?(
        <button onClick={onBack} className="px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md" style={{background:progress>=100?'#2D8A6E':GIM.primary,color:'white'}}>{progress>=100?'\u2713 Finish Course':'Back to Courses'}</button>
      ):(
        <button onClick={()=>setActiveTab(activeTab+1)} className="px-4 py-2 rounded-lg font-medium text-sm" style={{background:GIM.primary,color:'white'}}>Next {'\u2192'}</button>
      )}
    </div>
  </div>;
}

// ==================== ARCHITECTURE DECISION (Deep Track) ====================
function ArchitectureDecision({scenario,options,correctIndex,explanation,onAnswer}){
  const[selected,setSelected]=useState(null);
  const answered=selected!==null;const correct=selected===correctIndex;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:answered?(correct?'#2D8A6E':'#EF4444'):GIM.border,background:GIM.cardBg}}>
    <div className="flex items-center gap-2 mb-3"><span style={{fontSize:16}}>{'\uD83C\uDFD7\uFE0F'}</span><span className="font-semibold" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>Architecture Decision</span></div>
    <p className="mb-4" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6,fontFamily:GIM.fontMain}}>{scenario}</p>
    <div className="space-y-2">{options.map((opt,i)=>{const isC=i===correctIndex;const isS=i===selected;
      return <button key={i} onClick={()=>!answered&&(()=>{setSelected(i);if(onAnswer)onAnswer(i===correctIndex);})()} className="w-full text-left p-3 rounded-lg border transition-all" style={{borderColor:answered?(isC?'#2D8A6E':isS?'#EF4444':GIM.borderLight):GIM.border,background:answered?(isC?'#EBF5F1':isS?'#FEF2F2':'white'):'white',cursor:answered?'default':'pointer'}}>
        <div className="font-semibold mb-1" style={{fontSize:13,color:answered?(isC?'#2D8A6E':isS?'#EF4444':GIM.headingText):GIM.headingText}}>{opt.label}{answered&&isC&&' \u2713'}</div>
        <p style={{fontSize:12,color:GIM.mutedText}}>{opt.tradeoff}</p>
      </button>})}</div>
    {answered&&<div className="mt-3 p-3 rounded-lg" style={{background:correct?'#EBF5F1':'#FEF2F2',color:correct?'#166534':'#991B1B',fontSize:13,lineHeight:1.6}}>{correct?'\u2705 Correct! ':'\u274C Not quite. '}{explanation}</div>}
  </div>;
}

// ==================== COMPARISON TABLE (Deep Track) ====================
function ComparisonTable({title,columns,headers,rows}){
  const cols=columns||headers||[];
  return <div className="rounded-xl border overflow-hidden mb-4" style={{borderColor:GIM.border}}>
    {title&&<div className="px-4 py-2" style={{background:GIM.borderLight,borderBottom:`1px solid ${GIM.border}`}}><span className="font-semibold" style={{fontSize:13,color:GIM.headingText,fontFamily:GIM.fontMain}}>{title}</span></div>}
    <table className="w-full" style={{fontSize:13,fontFamily:GIM.fontMain}}>
      <thead><tr style={{background:GIM.borderLight}}>{cols.map((c,i)=><th key={i} className="text-left p-3 font-semibold" style={{color:GIM.headingText}}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((row,i)=><tr key={i} style={{borderTop:`1px solid ${GIM.border}`}}>{row.map((cell,j)=><td key={j} className="p-3" style={{color:j===0?GIM.headingText:GIM.bodyText,fontWeight:j===0?600:400}}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

// ==================== DEPTH BADGE ====================
function DepthBadge(){
  return <div className="flex gap-1">
    <span className="px-1.5 py-0.5 rounded text-xs" style={{background:'#FAF5FF',color:'#9333EA',fontSize:10}} title="For Visionaries">{'\uD83D\uDD2D'}</span>
    <span className="px-1.5 py-0.5 rounded text-xs" style={{background:'#FAF5FF',color:'#9333EA',fontSize:10}} title="Go Deep">{'\uD83D\uDD2C'}</span>
  </div>;
}

// ==================== PROGRESS TRACKING ====================
function useAcademyProgress(){
  const[progress,setProgress]=useState(()=>ADB.get('progress',{}));
  const update=useCallback((courseId,tabId,sectionId)=>{
    setProgress(prev=>{
      const course=prev[courseId]||{sections:{},percent:0};
      // Backward compat: if old format, treat as visionary
      const sections=course.sections||{};
      const key=`${tabId}_${sectionId}`;
      if(sections[key])return prev;
      const newSections={...sections,[key]:true};
      const total=COURSES.find(c=>c.id===courseId)?.exerciseCount||8;
      const percent=Math.min(100,Math.round(Object.keys(newSections).length/total*100));
      const next={...prev,[courseId]:{sections:newSections,percent}};
      ADB.set('progress',next);
      return next;
    });
  },[]);
  return[progress,update];
}

// ==================== DEPTH PREFERENCE ====================
function useDepthPreference(){
  const[prefs,setPrefs]=useState(()=>ADB.get('depth_prefs',{_default:'visionary'}));
  const getDepth=useCallback((courseId)=>{
    return prefs[courseId]||prefs._default||'visionary';
  },[prefs]);
  const setDepth=useCallback((courseId,depth)=>{
    setPrefs(prev=>{
      const next={...prev,[courseId]:depth,_default:depth};
      ADB.set('depth_prefs',next);
      return next;
    });
  },[]);
  return[getDepth,setDepth];
}

// ==================== ADMIN CONFIG ====================
const ADMIN_EMAIL='nitesh4learning@gmail.com';
const isAcademyAdmin=(user)=>user?.email===ADMIN_EMAIL;
const DEFAULT_TIER_COLORS=['#2D8A6E','#3B82F6','#9333EA','#DC2626','#D97706','#0891B2','#7C3AED','#E11D48'];

function useAcademyAdmin(){
  const[config,setConfig]=useState(()=>ADB.get('admin_config',null));
  const save=(next)=>{setConfig(next);ADB.set('admin_config',next)};
  const reset=()=>{setConfig(null);if(typeof window!=='undefined')localStorage.removeItem('re3_academy_admin_config')};

  // Merge admin overrides with hardcoded defaults
  const getTiers=useCallback(()=>{
    const base={...TIER_COLORS};
    if(!config?.tiers)return base;
    const merged={};
    // Admin tiers override base tiers
    const allKeys=new Set([...Object.keys(base),...Object.keys(config.tiers)]);
    allKeys.forEach(k=>{
      const bk=base[k]||{accent:'#6B7280',bg:'#F3F4F6',label:`Tier ${k}`};
      const ak=config.tiers[k];
      merged[k]={accent:ak?.accent||bk.accent,bg:ak?.bg||bk.bg,label:ak?.label||bk.label,order:ak?.order??parseInt(k)};
    });
    return merged;
  },[config]);

  const getCourses=useCallback(()=>{
    let list=[...COURSES];
    if(!config?.courses)return list;
    // Apply admin overrides
    list=list.map(c=>{
      const override=config.courses[c.id];
      if(!override)return c;
      return {...c,tier:override.tier??c.tier,status:override.status??c.status,title:override.title||c.title,description:override.description||c.description};
    });
    // Add admin-created courses
    if(config.customCourses){
      config.customCourses.forEach(cc=>{list.push({...cc,status:cc.status||'coming_soon'})});
    }
    // Apply ordering
    if(config.courseOrder){
      const orderMap={};config.courseOrder.forEach((id,i)=>orderMap[id]=i);
      list.sort((a,b)=>{
        const oa=orderMap[a.id]??999;const ob=orderMap[b.id]??999;
        if(oa!==ob)return oa-ob;return 0;
      });
    }
    return list;
  },[config]);

  const updateTier=(tierNum,updates)=>{
    const next={...config||{},tiers:{...(config?.tiers||{})}};
    next.tiers[tierNum]={...(next.tiers[tierNum]||{}), ...updates};
    save(next);
  };
  const addTier=()=>{
    const existing=Object.keys(config?.tiers||TIER_COLORS).map(Number);
    const newNum=Math.max(...existing,0)+1;
    const colorIdx=(newNum-1)%DEFAULT_TIER_COLORS.length;
    updateTier(newNum,{label:`New Tier ${newNum}`,accent:DEFAULT_TIER_COLORS[colorIdx],bg:'#F9FAFB',order:newNum});
  };
  const removeTier=(tierNum)=>{
    const courses=getCourses().filter(c=>c.tier===tierNum);
    if(courses.length>0)return false;
    const next={...config||{},tiers:{...(config?.tiers||{})}};
    delete next.tiers[tierNum];
    save(next);return true;
  };
  const updateCourse=(courseId,updates)=>{
    const next={...config||{},courses:{...(config?.courses||{})}};
    next.courses[courseId]={...(next.courses[courseId]||{}),...updates};
    save(next);
  };
  const moveCourse=(courseId,newTier)=>updateCourse(courseId,{tier:newTier});
  const reorderCourse=(courseId,direction)=>{
    const courses=getCourses();
    const idx=courses.findIndex(c=>c.id===courseId);
    if(idx<0)return;
    const swap=direction==='up'?idx-1:idx+1;
    if(swap<0||swap>=courses.length)return;
    const order=courses.map(c=>c.id);
    [order[idx],order[swap]]=[order[swap],order[idx]];
    save({...config||{},courseOrder:order});
  };
  const addCourse=(courseData)=>{
    const next={...config||{},customCourses:[...(config?.customCourses||[])]};
    next.customCourses.push({id:`custom_${Date.now()}`,icon:'\uD83D\uDCD8',difficulty:'Beginner',timeMinutes:30,exerciseCount:0,tabCount:0,...courseData});
    save(next);
  };

  return{config,getTiers,getCourses,updateTier,addTier,removeTier,updateCourse,moveCourse,reorderCourse,addCourse,reset,save};
}

// ==================== ACADEMY HUB ====================
function AcademyHub({onStartCourse,progress,currentUser}){
  const admin=useAcademyAdmin();
  const isAdmin=isAcademyAdmin(currentUser);
  const[adminMode,setAdminMode]=useState(false);
  const[editingTier,setEditingTier]=useState(null);
  const[editTierLabel,setEditTierLabel]=useState('');
  const[editingCourse,setEditingCourse]=useState(null);
  const[editCourseData,setEditCourseData]=useState({});
  const[showAddCourse,setShowAddCourse]=useState(null);
  const[newCourse,setNewCourse]=useState({title:'',description:'',tier:1,icon:'\uD83D\uDCD8',difficulty:'Beginner',timeMinutes:30,exerciseCount:0,tabCount:0});

  const tiers=admin.getTiers();
  const courses=admin.getCourses();
  const totalCourses=courses.length;
  const totalExercises=courses.reduce((s,c)=>s+c.exerciseCount,0);
  const totalTime=Math.round(courses.reduce((s,c)=>s+c.timeMinutes,0)/60);
  const availableCourses=courses.filter(c=>c.status==='available');
  const overallPercent=availableCourses.length>0?Math.round(availableCourses.reduce((s,c)=>s+(progress[c.id]?.percent||0),0)/availableCourses.length):0;
  const tierKeys=Object.keys(tiers).map(Number).sort((a,b)=>(tiers[a]?.order??a)-(tiers[b]?.order??b));

  // Completion stats
  const completedCourses=availableCourses.filter(c=>(progress[c.id]?.percent||0)>=100);
  const inProgressCourses=availableCourses.filter(c=>{const p=progress[c.id]?.percent||0;return p>0&&p<100});
  const totalExercisesDone=Object.values(progress).reduce((s,c)=>s+Object.keys(c.sections||{}).length,0);
  const remainingTime=availableCourses.filter(c=>(progress[c.id]?.percent||0)<100).reduce((s,c)=>s+c.timeMinutes,0);
  const completedByTier={};
  tierKeys.forEach(tier=>{const tc=availableCourses.filter(c=>c.tier===tier);completedByTier[tier]={done:tc.filter(c=>(progress[c.id]?.percent||0)>=100).length,total:tc.length}});

  const statusCycle={'available':'draft','draft':'coming_soon','coming_soon':'available'};
  const statusColors={'available':'#2D8A6E','draft':'#D97706','coming_soon':'#9CA3AF'};

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    {/* Admin Bar */}
    {adminMode&&<FadeIn><div className="flex items-center justify-between p-3 rounded-xl mb-6" style={{background:'#FEF3C7',border:'1px solid #FDE68A'}}>
      <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'#F59E0B',color:'white'}}>ADMIN MODE</span><span style={{fontSize:12,color:'#92400E'}}>Changes save to this browser automatically</span></div>
      <div className="flex items-center gap-2"><button onClick={()=>{admin.reset();setAdminMode(false)}} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{color:'#DC2626',border:'1px solid #FECACA'}}>Reset to Defaults</button><button onClick={()=>setAdminMode(false)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{color:'#4B5563',border:'1px solid #E5E7EB'}}>Exit Admin</button></div>
    </div></FadeIn>}

    {/* Hero */}
    <FadeIn><div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{background:GIM.primaryBadge,border:'1px solid rgba(147,51,234,0.2)'}}>
          <span style={{fontSize:14}}>{'\uD83C\uDF93'}</span>
          <span className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:10,letterSpacing:'0.12em',color:GIM.primary}}>RE{'\u00b3'} ACADEMY</span>
        </div>
        {isAdmin&&!adminMode&&<button onClick={()=>setAdminMode(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:'#FEF3C7',color:'#92400E',border:'1px solid #FDE68A'}}>{'\u2699\uFE0F'} Manage</button>}
      </div>
      <h1 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:'clamp(28px,5vw,42px)',lineHeight:1.1,letterSpacing:'-0.02em',color:GIM.headingText,marginBottom:8}}>Learn AI by <span style={{color:GIM.primary}}>Doing</span></h1>
      <p style={{fontFamily:GIM.fontMain,fontSize:'clamp(14px,1.6vw,16px)',maxWidth:540,color:GIM.bodyText,lineHeight:1.7,marginBottom:16}}>Interactive courses that teach you how AI systems work -- from tokens to multi-agent orchestration. Every concept includes hands-on exercises you can try right here.</p>
      <div className="flex items-center gap-4"><div className="flex-1"><ProgressBar percent={overallPercent} size="lg"/></div><span style={{fontSize:12,color:GIM.mutedText,whiteSpace:'nowrap'}}>{overallPercent}% complete</span></div>
    </div></FadeIn>

    {/* Quick Stats */}
    <FadeIn delay={50}><div className="flex flex-wrap gap-3 mb-8">
      {[['\uD83D\uDCDA',`${completedCourses.length}/${availableCourses.length}`,'Completed'],['\uD83D\uDD04',`${inProgressCourses.length}`,'In Progress'],['\u23F1\uFE0F',remainingTime>60?`${Math.round(remainingTime/60)}h+`:`${remainingTime}m`,'Remaining'],['\uD83D\uDD25',`${totalExercisesDone}`,'Exercises Done']].map(([icon,num,label])=>
        <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{background:GIM.cardBg,borderColor:GIM.border}}>
          <span style={{fontSize:18}}>{icon}</span>
          <div><div className="font-bold" style={{fontSize:18,color:GIM.headingText,fontFamily:GIM.fontMain}}>{num}</div><div style={{fontSize:11,color:GIM.mutedText}}>{label}</div></div>
        </div>
      )}
    </div></FadeIn>

    {/* Tier Sections */}
    {tierKeys.map(tier=>{const tc=tiers[tier]||TIER_COLORS[tier]||{accent:'#6B7280',bg:'#F3F4F6',label:`Tier ${tier}`};const tierCourses=courses.filter(c=>c.tier===tier);
      return <FadeIn key={tier} delay={80+tier*40}><div className="mb-8">
        {/* Tier Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 rounded-full" style={{height:20,background:tc.accent}}/>
          {editingTier===tier?<div className="flex items-center gap-2 flex-1">
            <input value={editTierLabel} onChange={e=>setEditTierLabel(e.target.value)} className="flex-1 px-3 py-1 rounded-lg border text-sm font-bold focus:outline-none" style={{borderColor:GIM.border,color:tc.accent}} autoFocus onKeyDown={e=>{if(e.key==='Enter'){admin.updateTier(tier,{label:editTierLabel});setEditingTier(null)}}}/>
            <button onClick={()=>{admin.updateTier(tier,{label:editTierLabel});setEditingTier(null)}} className="px-2 py-1 rounded text-xs font-semibold" style={{background:tc.accent,color:'white'}}>Save</button>
            <button onClick={()=>setEditingTier(null)} className="px-2 py-1 rounded text-xs" style={{color:GIM.mutedText}}>Cancel</button>
          </div>:<>
            <h2 className="font-bold" style={{fontFamily:GIM.fontMain,fontSize:18,color:tc.accent}}>Tier {tier}: {tc.label}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:tc.bg,color:tc.accent}}>{completedByTier[tier]?.done||0}/{completedByTier[tier]?.total||tierCourses.length} completed</span>
            {adminMode&&<div className="flex items-center gap-1 ml-auto">
              <button onClick={()=>{setEditingTier(tier);setEditTierLabel(tc.label)}} className="p-1 rounded hover:bg-gray-100" title="Rename" style={{fontSize:12}}>{'\u270F\uFE0F'}</button>
              {tierKeys.indexOf(tier)>0&&<button onClick={()=>{const prev=tierKeys[tierKeys.indexOf(tier)-1];const myOrder=tiers[tier]?.order??tier;const prevOrder=tiers[prev]?.order??prev;admin.updateTier(tier,{order:prevOrder});admin.updateTier(prev,{order:myOrder})}} className="p-1 rounded hover:bg-gray-100" title="Move up" style={{fontSize:12}}>{'\u2B06\uFE0F'}</button>}
              {tierKeys.indexOf(tier)<tierKeys.length-1&&<button onClick={()=>{const next=tierKeys[tierKeys.indexOf(tier)+1];const myOrder=tiers[tier]?.order??tier;const nextOrder=tiers[next]?.order??next;admin.updateTier(tier,{order:nextOrder});admin.updateTier(next,{order:myOrder})}} className="p-1 rounded hover:bg-gray-100" title="Move down" style={{fontSize:12}}>{'\u2B07\uFE0F'}</button>}
              {tierCourses.length===0&&<button onClick={()=>admin.removeTier(tier)} className="p-1 rounded hover:bg-red-50" title="Delete empty tier" style={{fontSize:12}}>{'\uD83D\uDDD1\uFE0F'}</button>}
            </div>}
          </>}
        </div>
        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{tierCourses.map((course,ci)=>{
          const cp=progress[course.id]||{percent:0};const isComing=course.status==='coming_soon';const isDraft=course.status==='draft';const isComplete=cp.percent>=100;const isStarted=cp.percent>0&&!isComplete;
          return <div key={course.id} className="rounded-xl border p-4 transition-all" style={{background:isComing||isDraft?GIM.borderLight:GIM.cardBg,borderColor:adminMode?tc.accent+'40':GIM.border,opacity:isComing?0.65:isDraft?0.75:1}} onMouseEnter={e=>{if(!isComing)e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}>
            {/* Admin controls row */}
            {adminMode&&<div className="flex items-center gap-1 mb-2 pb-2" style={{borderBottom:`1px solid ${GIM.border}`}}>
              <button onClick={()=>admin.updateCourse(course.id,{status:statusCycle[course.status]||'available'})} className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:statusColors[course.status]+'18',color:statusColors[course.status],border:`1px solid ${statusColors[course.status]}30`}}>{course.status}</button>
              <select value={course.tier} onChange={e=>admin.moveCourse(course.id,parseInt(e.target.value))} className="px-1 py-0.5 rounded text-xs border" style={{borderColor:GIM.border,fontSize:10}}>
                {tierKeys.map(t=><option key={t} value={t}>Tier {t}</option>)}
              </select>
              <div className="ml-auto flex items-center gap-0.5">
                {ci>0&&<button onClick={()=>admin.reorderCourse(course.id,'up')} className="p-0.5 rounded hover:bg-gray-100" style={{fontSize:10}}>{'\u25B2'}</button>}
                {ci<tierCourses.length-1&&<button onClick={()=>admin.reorderCourse(course.id,'down')} className="p-0.5 rounded hover:bg-gray-100" style={{fontSize:10}}>{'\u25BC'}</button>}
                <button onClick={()=>{setEditingCourse(course.id);setEditCourseData({title:course.title,description:course.description,icon:course.icon})}} className="p-0.5 rounded hover:bg-gray-100" style={{fontSize:10}}>{'\u270F\uFE0F'}</button>
              </div>
            </div>}
            {/* Course edit form */}
            {editingCourse===course.id?<div className="space-y-2">
              <input value={editCourseData.title||''} onChange={e=>setEditCourseData({...editCourseData,title:e.target.value})} className="w-full px-3 py-1.5 rounded-lg border text-sm font-bold focus:outline-none" style={{borderColor:GIM.border}} placeholder="Course title"/>
              <textarea value={editCourseData.description||''} onChange={e=>setEditCourseData({...editCourseData,description:e.target.value})} className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none" style={{borderColor:GIM.border}} rows={2} placeholder="Description"/>
              <div className="flex gap-2">
                <button onClick={()=>{admin.updateCourse(course.id,editCourseData);setEditingCourse(null)}} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Save</button>
                <button onClick={()=>setEditingCourse(null)} className="px-3 py-1 rounded-lg text-xs" style={{color:GIM.mutedText}}>Cancel</button>
              </div>
            </div>:<>
              <div className="flex items-start justify-between mb-2"><span style={{fontSize:28}}>{course.icon}</span><div className="flex items-center gap-2"><DepthBadge/><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:tc.bg,color:tc.accent}}>{course.difficulty}</span>{isDraft&&<span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:'#FEF3C7',color:'#D97706'}}>Draft</span>}</div></div>
              <h3 className="font-bold mb-1" style={{fontSize:15,color:GIM.headingText,fontFamily:GIM.fontMain}}>{course.title}</h3>
              <p className="mb-3" style={{fontSize:12,color:GIM.bodyText,lineHeight:1.5}}>{course.description}</p>
              <div className="flex items-center gap-2 mb-3" style={{fontSize:11,color:GIM.mutedText}}><span>{course.timeMinutes} min</span><span>{'\u00b7'}</span><span>{course.exerciseCount} exercises</span><span>{'\u00b7'}</span><span>{course.tabCount} lessons</span></div>
              {!isComing&&!isDraft&&<div className="mb-3"><ProgressBar percent={cp.percent} size="sm"/></div>}
              {isComing?<span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.borderLight,color:GIM.mutedText}}>Coming Soon</span>
              :isDraft?<span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:'#FEF3C7',color:'#D97706'}}>Draft — Admin Only</span>
              :<button onClick={()=>onStartCourse(course.id)} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:isComplete?'#EBF5F1':isStarted?GIM.primary:GIM.primaryBadge,color:isComplete?'#2D8A6E':isStarted?'white':GIM.primary}}>{isComplete?'\u2713 Review':isStarted?'Continue':'Start Course'}</button>}
            </>}
          </div>})}</div>
        {/* Add Course button (admin) */}
        {adminMode&&<div className="mt-3">
          {showAddCourse===tier?<div className="rounded-xl border p-4 space-y-2" style={{borderColor:GIM.border,background:GIM.cardBg}}>
            <input value={newCourse.title} onChange={e=>setNewCourse({...newCourse,title:e.target.value})} className="w-full px-3 py-1.5 rounded-lg border text-sm font-bold focus:outline-none" style={{borderColor:GIM.border}} placeholder="Course title"/>
            <textarea value={newCourse.description} onChange={e=>setNewCourse({...newCourse,description:e.target.value})} className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none" style={{borderColor:GIM.border}} rows={2} placeholder="Description"/>
            <div className="flex gap-2">
              <button onClick={()=>{if(newCourse.title.trim()){admin.addCourse({...newCourse,tier});setNewCourse({title:'',description:'',tier:1,icon:'\uD83D\uDCD8',difficulty:'Beginner',timeMinutes:30,exerciseCount:0,tabCount:0});setShowAddCourse(null)}}} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:tc.accent,color:'white'}}>Add Course</button>
              <button onClick={()=>setShowAddCourse(null)} className="px-3 py-1 rounded-lg text-xs" style={{color:GIM.mutedText}}>Cancel</button>
            </div>
          </div>:<button onClick={()=>setShowAddCourse(tier)} className="w-full py-2 rounded-xl border-2 border-dashed text-xs font-semibold transition-all hover:border-solid" style={{borderColor:tc.accent+'40',color:tc.accent}}>+ Add Course to Tier {tier}</button>}
        </div>}
      </div></FadeIn>})}

    {/* Add Tier button (admin) */}
    {adminMode&&<FadeIn><button onClick={admin.addTier} className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid mb-8" style={{borderColor:GIM.primary+'40',color:GIM.primary}}>+ Add New Tier</button></FadeIn>}
  </div>;
}

// ==================== MAIN EXPORT ====================
export default function Academy({onNavigate,currentUser}){
  const searchParams=useSearchParams();
  const[activeCourse,setActiveCourse]=useState(()=>{
    const courseParam=searchParams.get('course');
    if(courseParam&&COURSES.find(c=>c.id===courseParam))return courseParam;
    return null;
  });
  const[progress,updateProgress]=useAcademyProgress();
  const[getDepth,setDepth]=useDepthPreference();

  // Sync URL when course changes
  useEffect(()=>{
    const url=new URL(window.location.href);
    if(activeCourse){url.searchParams.set('course',activeCourse)}else{url.searchParams.delete('course')}
    window.history.replaceState({},'',url.toString());
  },[activeCourse]);

  const courseShell=(id,Component)=>{
    if(activeCourse!==id)return null;
    const cp=progress[id]?.percent||0;
    const depth=getDepth(id);
    return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
      <Component onBack={()=>setActiveCourse(null)} onNavigate={onNavigate} progress={cp} onComplete={(tabId,sectionId)=>updateProgress(id,tabId,sectionId)} depth={depth} onChangeDepth={(d)=>setDepth(id,d)}/>
    </div>;
  };

  const routes=[
    // Tier 1
    ['llm-basics',CourseLLMBasics],['prompt-engineering',CoursePromptEng],['embeddings',CourseEmbeddings],['rag-fundamentals',CourseRAG],
    ['context-engineering',CourseContextEng],['ai-safety',CourseAISafety],['tokens-costs',CourseTokensCosts],['json-mode',CourseJSONMode],
    // Tier 2
    ['mcp-protocol',CourseMCP],['a2a-protocol',CourseA2A],['function-calling',CourseFunctionCalling],['ai-governance',CourseGovernance],
    ['acp-protocol',CourseACP],['agentic-patterns',CourseAgenticPatterns],['memory-systems',CourseMemorySystems],['human-in-loop',CourseHITL],
    // Tier 3
    ['multi-agent',CourseMultiAgent],['graph-rag',CourseGraphRAG],['ai-observability',CourseObservability],['llm-gateway',CourseLLMGateway],
    ['fine-tuning',CourseFineTuning],['ai-code-gen',CourseAICodeGen],['multimodal',CourseMultimodal],['voice-ai',CourseVoiceAI],['retrieval-eng',CourseRetrievalEng],['ai-testing',CourseAITesting],
    // Tier 4
    ['ai-regulatory',CourseAIRegulatory],['responsible-ai',CourseResponsibleAI],['enterprise-strategy',CourseEnterpriseStrategy],
    ['ai-economics',CourseAIEconomics],['computer-use',CourseComputerUse],['physical-ai',CoursePhysicalAI],
  ];
  for(const[id,Comp]of routes){const r=courseShell(id,Comp);if(r)return r;}

  return <div className="min-h-screen" style={{paddingTop:56,background:GIM.pageBg}}>
    <AcademyHub onStartCourse={(id)=>setActiveCourse(id)} progress={progress} currentUser={currentUser}/>
  </div>;
}

// ==================== NAMED EXPORTS (for tier files) ====================
export { GIM, CODE_BG, CODE_TEXT, TIER_COLORS, COURSES, ADB, FadeIn, ProgressBar, ExpandableSection, CodeBlock, Quiz, MessageSimulator, AnalogyBox, SeeItInRe3, CourseShell, DepthSelector, ArchitectureDecision, ComparisonTable };
