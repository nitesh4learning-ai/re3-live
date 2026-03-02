"use client";
// Tier 3 course-specific interactive widgets.
// Ported from AcademyTier3.js — full interactive implementations.

import { useState } from "react";

const GIM = {
  primary: '#9333EA', primaryDark: '#7E22CE', primaryLight: '#FAF5FF',
  primaryBadge: '#F3E8FF', cardBg: '#FFFFFF',
  border: '#E5E7EB', borderLight: '#F3F4F6',
  headingText: '#111827', bodyText: '#4B5563', mutedText: '#9CA3AF',
  fontMain: "'Inter',system-ui,sans-serif",
};

const CODE_BG = '#1E293B';
const CODE_TEXT = '#E2E8F0';


export function PatternMatcher(){
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

export function TripleBuilder(){
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

export function GatewaySimulator(){
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

export function CostCalculator(){
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

export function ReActSimulator(){
  const steps=[
    {type:'thought',label:'Thought',text:'The user wants the current weather in Tokyo. I need to call the weather API tool with location="Tokyo".'},
    {type:'action',label:'Action',text:'call_tool("get_weather", {"location": "Tokyo, Japan"})'},
    {type:'observation',label:'Observation',text:'{"temp_c": 22, "condition": "Partly cloudy", "humidity": 65, "wind_kph": 12}'},
    {type:'thought',label:'Thought',text:'I have the weather data. Temperature is 22C, partly cloudy. I can now formulate a natural language response for the user.'},
    {type:'action',label:'Action',text:'respond_to_user("It\'s currently 22\u00b0C and partly cloudy in Tokyo, with 65% humidity and light winds at 12 km/h.")'},
    {type:'observation',label:'Observation',text:'[Response delivered to user]'},
  ];
  const[visibleSteps,setVisibleSteps]=useState(0);const[running,setRunning]=useState(false);
  const colors={thought:'#EFF6FF',action:'#FEF3C7',observation:'#EBF5F1'};
  const borders={thought:'#3B82F6',action:'#F59E0B',observation:'#2D8A6E'};
  const run=()=>{if(running)return;setRunning(true);setVisibleSteps(0);let i=0;const tick=()=>{i++;setVisibleSteps(i);if(i<steps.length)setTimeout(tick,900);else setRunning(false)};setTimeout(tick,500)};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD04'} ReAct Loop Simulator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Watch the Thought-Action-Observation cycle execute step by step.</p>
    <button onClick={run} disabled={running} className="px-4 py-1.5 rounded-lg text-xs font-semibold mb-3" style={{background:running?GIM.borderLight:GIM.primary,color:running?GIM.mutedText:'white',cursor:running?'default':'pointer'}}>{running?'Running...':'Run ReAct Loop'}</button>
    <div className="space-y-2">{steps.slice(0,visibleSteps).map((s,i)=><div key={i} className="p-2.5 rounded-lg border-l-4" style={{background:colors[s.type],borderColor:borders[s.type]}}><span className="text-xs font-bold" style={{color:borders[s.type]}}>{s.label}:</span><p className="text-xs mt-1 font-mono" style={{color:GIM.headingText,lineHeight:1.5}}>{s.text}</p></div>)}</div>
    {visibleSteps===steps.length&&<div className="mt-3 p-2 rounded-lg" style={{background:'#EBF5F1'}}><p className="text-xs font-semibold" style={{color:'#2D8A6E'}}>Loop complete. The agent used 2 think-act-observe cycles to fulfill the request.</p></div>}
  </div>;
}

export function AgentToolSchemaBuilder(){
  const[name,setName]=useState('');const[desc,setDesc]=useState('');const[params,setParams]=useState([]);const[pName,setPName]=useState('');const[pType,setPType]=useState('string');const[pDesc,setPDesc]=useState('');const[pReq,setPReq]=useState(true);const[generated,setGenerated]=useState(null);
  const addParam=()=>{if(pName&&pDesc){setParams(p=>[...p,{name:pName,type:pType,description:pDesc,required:pReq}]);setPName('');setPDesc('');setPReq(true)}};
  const generate=()=>{if(!name||!desc)return;const schema={type:'function',function:{name,description:desc,parameters:{type:'object',properties:{},required:[]}}};params.forEach(p=>{schema.function.parameters.properties[p.name]={type:p.type,description:p.description};if(p.required)schema.function.parameters.required.push(p.name)});setGenerated(schema)};
  const inputStyle={borderColor:GIM.border,fontSize:12,fontFamily:GIM.fontMain};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD27'} Tool Schema Builder</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Design a tool schema that an agent can call. Define the name, description, and parameters.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tool name (e.g. search_web)" className="px-2 py-1.5 rounded border text-xs" style={inputStyle}/>
      <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description (e.g. Search the web for information)" className="px-2 py-1.5 rounded border text-xs" style={inputStyle}/>
    </div>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}>
      <span className="text-xs font-semibold" style={{color:GIM.headingText}}>Add Parameter:</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Param name" className="px-2 py-1 rounded border text-xs" style={inputStyle}/>
        <select value={pType} onChange={e=>setPType(e.target.value)} className="px-2 py-1 rounded border text-xs" style={inputStyle}><option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option><option value="array">array</option><option value="object">object</option></select>
        <input value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Description" className="px-2 py-1 rounded border text-xs" style={inputStyle}/>
        <div className="flex items-center gap-2"><label className="text-xs" style={{color:GIM.bodyText}}><input type="checkbox" checked={pReq} onChange={e=>setPReq(e.target.checked)} className="mr-1"/>Required</label><button onClick={addParam} className="px-2 py-1 rounded text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>+</button></div>
      </div>
    </div>
    {params.length>0&&<div className="mb-3 flex flex-wrap gap-1">{params.map((p,i)=><span key={i} className="px-2 py-1 rounded text-xs" style={{background:'#EFF6FF',color:'#1E40AF'}}>{p.name}: {p.type}{p.required?' *':''}</span>)}</div>}
    <button onClick={generate} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:name&&desc?GIM.primary:GIM.borderLight,color:name&&desc?'white':GIM.mutedText,cursor:name&&desc?'pointer':'default'}}>Generate Schema</button>
    {generated&&<div className="mt-3 p-3 rounded-lg overflow-x-auto" style={{background:CODE_BG}}><pre className="text-xs" style={{color:CODE_TEXT,lineHeight:1.5}}>{JSON.stringify(generated,null,2)}</pre></div>}
  </div>;
}

export function AgentBuilder(){
  const toolOptions=[
    {id:'web_search',name:'Web Search',desc:'Search the internet for current information',icon:'\uD83D\uDD0D'},
    {id:'code_exec',name:'Code Executor',desc:'Run Python code in a sandboxed environment',icon:'\uD83D\uDCBB'},
    {id:'file_read',name:'File Reader',desc:'Read and parse files (PDF, CSV, JSON)',icon:'\uD83D\uDCC4'},
    {id:'database',name:'Database Query',desc:'Execute SQL queries against a database',icon:'\uD83D\uDDC3\uFE0F'},
    {id:'api_call',name:'API Caller',desc:'Make HTTP requests to external APIs',icon:'\uD83C\uDF10'},
    {id:'calculator',name:'Calculator',desc:'Perform mathematical computations',icon:'\uD83E\uDDEE'},
  ];
  const planOptions=[
    {id:'react',name:'ReAct',desc:'Think-Act-Observe loop, one step at a time'},
    {id:'plan_execute',name:'Plan & Execute',desc:'Create full plan upfront, then execute steps'},
    {id:'tree_of_thought',name:'Tree of Thought',desc:'Explore multiple reasoning paths, pick the best'},
  ];
  const[selectedTools,setSelectedTools]=useState([]);const[plan,setPlan]=useState('react');const[task,setTask]=useState('');const[simulating,setSimulating]=useState(false);const[simLog,setSimLog]=useState([]);
  const toggleTool=id=>setSelectedTools(t=>t.includes(id)?t.filter(x=>x!==id):[...t,id]);
  const simulate=()=>{if(!task||selectedTools.length===0||simulating)return;setSimulating(true);setSimLog([]);
    const toolNames=selectedTools.map(id=>toolOptions.find(t=>t.id===id)?.name||id);
    const planName=planOptions.find(p=>p.id===plan)?.name||plan;
    const logs=[];
    if(plan==='react'){
      logs.push({type:'system',text:`Agent initialized with ${planName} strategy and ${toolNames.length} tools: ${toolNames.join(', ')}`});
      logs.push({type:'thought',text:`I need to: "${task}". Let me break this down. First, I should gather information.`});
      if(selectedTools.includes('web_search')){logs.push({type:'action',text:`call_tool("web_search", {"query": "${task}"})`});logs.push({type:'observation',text:'Found 3 relevant results with current data.'});}
      if(selectedTools.includes('database')){logs.push({type:'action',text:`call_tool("database_query", {"sql": "SELECT * FROM relevant_data LIMIT 10"})`});logs.push({type:'observation',text:'Retrieved 10 rows of structured data.'});}
      if(selectedTools.includes('code_exec')){logs.push({type:'thought',text:'I have the data. Let me analyze it with code.'});logs.push({type:'action',text:'call_tool("code_executor", {"code": "import pandas as pd\\n# analyze the data..."})'});logs.push({type:'observation',text:'Analysis complete. Key insights generated.'});}
      logs.push({type:'thought',text:'I have gathered and analyzed the information. Composing final response.'});
      logs.push({type:'result',text:`Task "${task}" completed successfully using ${planName} with ${logs.filter(l=>l.type==='action').length} tool calls.`});
    } else if(plan==='plan_execute'){
      logs.push({type:'system',text:`Agent initialized with ${planName} strategy and ${toolNames.length} tools: ${toolNames.join(', ')}`});
      logs.push({type:'plan',text:`Plan created for: "${task}"\n  Step 1: Gather information using available tools\n  Step 2: Process and analyze data\n  Step 3: Synthesize findings into response`});
      logs.push({type:'action',text:'Executing Step 1...'});logs.push({type:'observation',text:'Step 1 complete. Information gathered.'});
      logs.push({type:'action',text:'Executing Step 2...'});logs.push({type:'observation',text:'Step 2 complete. Data analyzed.'});
      logs.push({type:'action',text:'Executing Step 3...'});
      logs.push({type:'result',text:`Plan executed successfully. All 3 steps completed for: "${task}".`});
    } else {
      logs.push({type:'system',text:`Agent initialized with ${planName} strategy and ${toolNames.length} tools: ${toolNames.join(', ')}`});
      logs.push({type:'thought',text:`Exploring 3 reasoning paths for: "${task}"`});
      logs.push({type:'branch',text:'Path A: Direct tool approach -- use web search then summarize'});
      logs.push({type:'branch',text:'Path B: Analytical approach -- gather data, run code analysis, then synthesize'});
      logs.push({type:'branch',text:'Path C: Multi-source approach -- search, query DB, cross-reference'});
      logs.push({type:'thought',text:`Evaluating paths... Path ${selectedTools.length>2?'C':'B'} is most promising given available tools.`});
      logs.push({type:'result',text:`Best path selected and executed for: "${task}". Tree of Thought explored ${3} branches.`});
    }
    let i=0;const tick=()=>{i++;setSimLog(logs.slice(0,i));if(i<logs.length)setTimeout(tick,600);else setSimulating(false)};setTimeout(tick,400);
  };
  const logColors={system:'#F3F4F6',thought:'#EFF6FF',action:'#FEF3C7',observation:'#EBF5F1',plan:'#F5F3FF',result:'#ECFDF5',branch:'#FFF7ED'};
  const logBorders={system:'#9CA3AF',thought:'#3B82F6',action:'#F59E0B',observation:'#2D8A6E',plan:'#7C3AED',result:'#059669',branch:'#EA580C'};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDD16'} Agent Builder & Simulator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Design an agent: pick tools, choose a planning strategy, define a task, and simulate execution.</p>
    <div className="mb-3"><span className="text-xs font-semibold" style={{color:GIM.headingText}}>1. Select Tools:</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{toolOptions.map(t=><button key={t.id} onClick={()=>toggleTool(t.id)} className="p-2 rounded-lg border text-left transition-all" style={{borderColor:selectedTools.includes(t.id)?GIM.primary:GIM.border,background:selectedTools.includes(t.id)?'#EFF6FF':'white'}}><div className="flex items-center gap-1"><span style={{fontSize:14}}>{t.icon}</span><span className="text-xs font-semibold" style={{color:selectedTools.includes(t.id)?GIM.primary:GIM.headingText}}>{t.name}</span></div><p style={{fontSize:10,color:GIM.mutedText,marginTop:2}}>{t.desc}</p></button>)}</div>
    </div>
    <div className="mb-3"><span className="text-xs font-semibold" style={{color:GIM.headingText}}>2. Planning Strategy:</span>
      <div className="flex flex-wrap gap-2 mt-2">{planOptions.map(p=><button key={p.id} onClick={()=>setPlan(p.id)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all" style={{borderColor:plan===p.id?GIM.primary:GIM.border,background:plan===p.id?'#EFF6FF':'white',color:plan===p.id?GIM.primary:GIM.bodyText}}>{p.name}<span className="block font-normal" style={{fontSize:10,color:GIM.mutedText}}>{p.desc}</span></button>)}</div>
    </div>
    <div className="mb-3"><span className="text-xs font-semibold" style={{color:GIM.headingText}}>3. Define Task:</span>
      <input value={task} onChange={e=>setTask(e.target.value)} placeholder="e.g. Research the latest trends in renewable energy and summarize the findings" className="w-full mt-2 px-3 py-2 rounded-lg border text-xs" style={{borderColor:GIM.border,fontFamily:GIM.fontMain}}/>
    </div>
    <button onClick={simulate} disabled={simulating||!task||selectedTools.length===0} className="px-4 py-2 rounded-lg text-xs font-semibold mb-3" style={{background:task&&selectedTools.length>0&&!simulating?GIM.primary:GIM.borderLight,color:task&&selectedTools.length>0&&!simulating?'white':GIM.mutedText,cursor:task&&selectedTools.length>0&&!simulating?'pointer':'default'}}>{simulating?'Simulating...':'Simulate Agent Execution'}</button>
    {simLog.length>0&&<div className="space-y-2 mt-2">{simLog.map((l,i)=><div key={i} className="p-2.5 rounded-lg border-l-4" style={{background:logColors[l.type]||'#F9FAFB',borderColor:logBorders[l.type]||'#9CA3AF'}}><span className="text-xs font-bold" style={{color:logBorders[l.type]||'#6B7280'}}>{l.type.toUpperCase()}:</span><pre className="text-xs mt-1 whitespace-pre-wrap" style={{color:GIM.headingText,lineHeight:1.4,fontFamily:l.type==='action'?'monospace':GIM.fontMain}}>{l.text}</pre></div>)}</div>}
  </div>;
}

export function AgentCostCalculator(){
  const[calls,setCalls]=useState(100);const[avgTokens,setAvgTokens]=useState(500);const[toolCalls,setToolCalls]=useState(2);
  const inputCost=(calls*avgTokens*toolCalls*0.003)/1000;
  const outputCost=(calls*avgTokens*0.015)/1000;
  const total=inputCost+outputCost;
  const parallel=Math.ceil(calls/10);
  const sequential=calls;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCB0'} Agent Cost Calculator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Estimate per-run costs and compare parallel vs. sequential execution time.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
      <div><label className="text-xs font-semibold" style={{color:GIM.headingText}}>Agent runs / day</label><input type="range" min="10" max="10000" step="10" value={calls} onChange={e=>setCalls(Number(e.target.value))} className="w-full mt-1"/><span className="text-xs" style={{color:GIM.primary}}>{calls.toLocaleString()}</span></div>
      <div><label className="text-xs font-semibold" style={{color:GIM.headingText}}>Avg tokens / step</label><input type="range" min="100" max="4000" step="100" value={avgTokens} onChange={e=>setAvgTokens(Number(e.target.value))} className="w-full mt-1"/><span className="text-xs" style={{color:GIM.primary}}>{avgTokens}</span></div>
      <div><label className="text-xs font-semibold" style={{color:GIM.headingText}}>Tool calls / run</label><input type="range" min="1" max="10" step="1" value={toolCalls} onChange={e=>setToolCalls(Number(e.target.value))} className="w-full mt-1"/><span className="text-xs" style={{color:GIM.primary}}>{toolCalls}</span></div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div className="p-2 rounded-lg text-center" style={{background:'#EFF6FF'}}><p className="text-xs" style={{color:GIM.mutedText}}>Input cost</p><p className="font-bold text-sm" style={{color:'#1E40AF'}}>${inputCost.toFixed(2)}</p></div>
      <div className="p-2 rounded-lg text-center" style={{background:'#FEF3C7'}}><p className="text-xs" style={{color:GIM.mutedText}}>Output cost</p><p className="font-bold text-sm" style={{color:'#92400E'}}>${outputCost.toFixed(2)}</p></div>
      <div className="p-2 rounded-lg text-center" style={{background:'#EBF5F1'}}><p className="text-xs" style={{color:GIM.mutedText}}>Total / day</p><p className="font-bold text-sm" style={{color:'#2D8A6E'}}>${total.toFixed(2)}</p></div>
      <div className="p-2 rounded-lg text-center" style={{background:'#F5F3FF'}}><p className="text-xs" style={{color:GIM.mutedText}}>Monthly est.</p><p className="font-bold text-sm" style={{color:'#7C3AED'}}>${(total*30).toFixed(2)}</p></div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p className="text-xs font-semibold" style={{color:GIM.headingText}}>Sequential time</p><p className="text-xs" style={{color:GIM.bodyText}}>{sequential} API calls x ~2s = <b>{(sequential*2/60).toFixed(0)} min</b></p></div>
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p className="text-xs font-semibold" style={{color:GIM.headingText}}>Parallel (10 workers)</p><p className="text-xs" style={{color:GIM.bodyText}}>{parallel} batches x ~2s = <b>{(parallel*2/60).toFixed(0)} min</b></p></div>
    </div>
  </div>;
}

export function ArchitectureDesigner({onComplete}) {
  const [servers, setServers] = useState([
    { id: 's1', name: 'FileSystem', transport: 'stdio', tools: ['read_file','write_file','list_dir'], color: '#3B6B9B' },
    { id: 's2', name: 'DatabaseMCP', transport: 'http', tools: ['query','insert','update'], color: '#2D8A6E' },
    { id: 's3', name: 'SearchMCP', transport: 'http', tools: ['search','index','rank'], color: '#E8734A' },
  ]);
  const [connections, setConnections] = useState(['s1-s2', 's2-s3']);
  const [selected, setSelected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const allPairs = servers.flatMap((a,i) => servers.slice(i+1).map(b => `${a.id}-${b.id}`));
  const toggleConnection = (pair) => {
    setConnections(c => c.includes(pair) ? c.filter(x => x !== pair) : [...c, pair]);
  };
  const connectedCount = connections.length;
  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border, background:GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize:14, color:GIM.headingText, fontFamily:GIM.fontMain}}>Architecture Designer — Wire MCP Servers</h4>
      <p className="mb-3" style={{fontSize:12, color:GIM.mutedText}}>Click server cards to inspect, then toggle connections between servers.</p>
      <div className="flex flex-wrap gap-3 mb-4">
        {servers.map(s => (
          <div key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
            className="rounded-lg border-2 p-3 cursor-pointer transition-all"
            style={{borderColor: selected === s.id ? s.color : GIM.border, background: selected === s.id ? s.color + '18' : 'white', minWidth: 130}}>
            <div className="font-semibold" style={{fontSize:13, color:GIM.headingText}}>{s.name}</div>
            <div className="mt-1 px-2 py-0.5 rounded text-xs inline-block" style={{background: s.transport === 'stdio' ? '#EFF6FF' : '#F0FDF4', color: s.transport === 'stdio' ? '#1D4ED8' : '#166534'}}>{s.transport.toUpperCase()}</div>
            {selected === s.id && (
              <ul className="mt-2">{s.tools.map(t => <li key={t} className="text-xs" style={{color:GIM.mutedText}}>• {t}</li>)}</ul>
            )}
          </div>
        ))}
      </div>
      <div className="mb-3">
        <div className="font-semibold mb-2" style={{fontSize:12, color:GIM.headingText}}>Toggle Connections</div>
        <div className="flex flex-wrap gap-2">
          {allPairs.map(pair => {
            const [a, b] = pair.split('-');
            const sa = servers.find(s => s.id === a);
            const sb = servers.find(s => s.id === b);
            const on = connections.includes(pair);
            return (
              <button key={pair} onClick={() => toggleConnection(pair)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={{borderColor: on ? '#2D8A6E' : GIM.border, background: on ? '#EBF5F1' : 'white', color: on ? '#166534' : GIM.bodyText}}>
                {sa.name} ↔ {sb.name} {on ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-3 rounded-lg" style={{background: GIM.borderLight}}>
        <span style={{fontSize:12, color:GIM.mutedText}}>Composition: <b style={{color:GIM.headingText}}>{servers.length} servers</b>, <b style={{color:GIM.headingText}}>{connectedCount} connections</b>, <b style={{color:GIM.headingText}}>{servers.reduce((a,s)=>a+s.tools.length,0)} total tools</b> exposed to the LLM host.</span>
      </div>
    </div>
  );
}

export function ToolSchemaBuilder({onComplete}) {
  const [toolName, setToolName] = useState('search_articles');
  const [description, setDescription] = useState('Search articles by keyword and filter by date range');
  const [params, setParams] = useState([
    { name: 'query', type: 'string', required: true, desc: 'Search query string' },
    { name: 'limit', type: 'integer', required: false, desc: 'Max results to return (1-100)' },
    { name: 'from_date', type: 'string', required: false, desc: 'ISO 8601 start date filter' },
  ]);
  const [newParam, setNewParam] = useState({ name: '', type: 'string', required: false, desc: '' });
  const [validated, setValidated] = useState(false);

  const addParam = () => {
    if (newParam.name && newParam.desc) {
      setParams(p => [...p, { ...newParam }]);
      setNewParam({ name: '', type: 'string', required: false, desc: '' });
      setValidated(false);
    }
  };

  const removeParam = (idx) => {
    setParams(p => p.filter((_, i) => i !== idx));
    setValidated(false);
  };

  const schema = {
    name: toolName,
    description: description,
    inputSchema: {
      type: 'object',
      properties: Object.fromEntries(params.map(p => [p.name, { type: p.type, description: p.desc }])),
      required: params.filter(p => p.required).map(p => p.name),
    }
  };

  const validate = () => {
    const ok = toolName.length > 0 && description.length > 10 && params.length > 0 && params.every(p => p.name && p.desc);
    setValidated(ok);
    if (ok && onComplete) onComplete('custom-tool-design', 'tool-builder');
  };

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border, background:GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize:14, color:GIM.headingText, fontFamily:GIM.fontMain}}>Tool Schema Builder</h4>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{color:GIM.mutedText}}>Tool Name</label>
          <input value={toolName} onChange={e=>{setToolName(e.target.value);setValidated(false)}} className="w-full px-2 py-1.5 rounded border text-xs font-mono" style={{borderColor:GIM.border}}/>
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{color:GIM.mutedText}}>Description</label>
          <input value={description} onChange={e=>{setDescription(e.target.value);setValidated(false)}} className="w-full px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-xs font-semibold mb-2" style={{color:GIM.mutedText}}>Parameters</div>
        {params.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5 p-2 rounded" style={{background:'white', border:`1px solid ${GIM.border}`}}>
            <span className="font-mono text-xs" style={{color:GIM.primary, minWidth:100}}>{p.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'#EFF6FF', color:'#1D4ED8'}}>{p.type}</span>
            {p.required && <span className="text-xs px-1.5 py-0.5 rounded" style={{background:'#FEF3C7', color:'#92400E'}}>required</span>}
            <span className="text-xs flex-1" style={{color:GIM.mutedText}}>{p.desc}</span>
            <button onClick={()=>removeParam(i)} style={{color:'#EF4444', fontSize:11}}>✕</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2 flex-wrap">
          <input placeholder="param_name" value={newParam.name} onChange={e=>setNewParam(p=>({...p,name:e.target.value}))} className="px-2 py-1 rounded border text-xs font-mono" style={{borderColor:GIM.border, width:110}}/>
          <select value={newParam.type} onChange={e=>setNewParam(p=>({...p,type:e.target.value}))} className="px-2 py-1 rounded border text-xs" style={{borderColor:GIM.border}}>
            <option>string</option><option>integer</option><option>number</option><option>boolean</option><option>array</option><option>object</option>
          </select>
          <input placeholder="Description" value={newParam.desc} onChange={e=>setNewParam(p=>({...p,desc:e.target.value}))} className="px-2 py-1 rounded border text-xs flex-1" style={{borderColor:GIM.border, minWidth:120}}/>
          <label className="flex items-center gap-1 text-xs cursor-pointer" style={{color:GIM.mutedText}}>
            <input type="checkbox" checked={newParam.required} onChange={e=>setNewParam(p=>({...p,required:e.target.checked}))}/> Required
          </label>
          <button onClick={addParam} className="px-3 py-1 rounded text-xs font-semibold" style={{background:GIM.primary, color:'white'}}>Add</button>
        </div>
      </div>
      <div className="mb-3 p-3 rounded-lg font-mono text-xs overflow-auto" style={{background:CODE_BG, color:CODE_TEXT, maxHeight:200}}>
        {JSON.stringify(schema, null, 2)}
      </div>
      <button onClick={validate} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary, color:'white'}}>Validate Schema</button>
      {validated && <span className="ml-3 text-xs font-semibold" style={{color:'#2D8A6E'}}>Schema valid!</span>}
    </div>
  );
}

export function ResourceExplorer({onComplete}) {
  const [activeServer, setActiveServer] = useState('re3-articles');
  const [expandedResource, setExpandedResource] = useState(null);
  const [subscribed, setSubscribed] = useState([]);

  const servers = {
    're3-articles': {
      label: 'Re3 Articles',
      resources: [
        { uri: 're3://articles/recent', name: 'Recent Articles', mimeType: 'application/json', description: 'Latest 20 published articles', dynamic: true },
        { uri: 're3://articles/trending', name: 'Trending Articles', mimeType: 'application/json', description: 'Most engaged articles this week', dynamic: true },
        { uri: 're3://articles/rethink', name: 'Rethink Pillar', mimeType: 'application/json', description: 'Articles in the Rethink category', dynamic: false },
      ]
    },
    're3-agents': {
      label: 'Re3 Agents',
      resources: [
        { uri: 're3://agents/list', name: 'Agent Registry', mimeType: 'application/json', description: 'All 25 debater agents with metadata', dynamic: false },
        { uri: 're3://agents/online', name: 'Available Agents', mimeType: 'application/json', description: 'Agents available for new debates', dynamic: true },
      ]
    },
    're3-debates': {
      label: 'Re3 Debates',
      resources: [
        { uri: 're3://debates/{id}/loom', name: 'Debate Loom', mimeType: 'text/markdown', description: 'Synthesized insights from a debate (parameterized)', dynamic: true },
        { uri: 're3://debates/active', name: 'Active Debates', mimeType: 'application/json', description: 'Currently running debates', dynamic: true },
      ]
    }
  };

  const currentResources = servers[activeServer].resources;

  const toggleSubscribe = (uri) => {
    setSubscribed(s => s.includes(uri) ? s.filter(x => x !== uri) : [...s, uri]);
    if (!subscribed.includes(uri) && onComplete) onComplete('resource-sampling','resource-sub');
  };

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border, background:GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize:14, color:GIM.headingText, fontFamily:GIM.fontMain}}>Resource Explorer — Re3 MCP Servers</h4>
      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(servers).map(([id, s]) => (
          <button key={id} onClick={()=>{setActiveServer(id);setExpandedResource(null)}}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={{borderColor: activeServer===id ? GIM.primary : GIM.border, background: activeServer===id ? GIM.primary+'18' : 'white', color: activeServer===id ? GIM.primary : GIM.bodyText}}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {currentResources.map(r => (
          <div key={r.uri} className="rounded-lg border overflow-hidden" style={{borderColor:GIM.border}}>
            <div className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-50"
              onClick={()=>setExpandedResource(expandedResource===r.uri ? null : r.uri)}
              style={{background:'white'}}>
              <span style={{fontSize:11, color:GIM.mutedText, fontFamily:'monospace', flex:1}}>{r.uri}</span>
              <span className="px-1.5 py-0.5 rounded text-xs" style={{background:'#F0FDF4', color:'#166534'}}>{r.mimeType}</span>
              {r.dynamic && <span className="px-1.5 py-0.5 rounded text-xs" style={{background:'#EFF6FF', color:'#1D4ED8'}}>dynamic</span>}
              <button onClick={e=>{e.stopPropagation();toggleSubscribe(r.uri)}}
                className="px-2 py-0.5 rounded text-xs font-semibold border"
                style={{borderColor: subscribed.includes(r.uri) ? '#2D8A6E' : GIM.border, background: subscribed.includes(r.uri) ? '#EBF5F1' : 'white', color: subscribed.includes(r.uri) ? '#166534' : GIM.bodyText}}>
                {subscribed.includes(r.uri) ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </div>
            {expandedResource === r.uri && (
              <div className="px-3 py-2 border-t" style={{borderColor:GIM.border, background:GIM.borderLight, fontSize:12, color:GIM.bodyText}}>
                <b>Description:</b> {r.description}
                {r.uri.includes('{id}') && <div className="mt-1"><b>Template parameter:</b> <code style={{color:GIM.primary}}>{'{id}'}</code> — replaced with the debate ID at read time</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      {subscribed.length > 0 && (
        <div className="mt-3 p-2 rounded-lg" style={{background:'#EBF5F1'}}>
          <span style={{fontSize:12, color:'#166534'}}>{subscribed.length} resource subscription(s) active — server will push notifications on change.</span>
        </div>
      )}
    </div>
  );
}

export function SecurityConfigBuilder({onComplete}) {
  const [config, setConfig] = useState({
    authMethod: 'oauth21',
    tlsEnabled: true,
    rateLimitRpm: 60,
    auditLogging: true,
    readScope: true,
    writeScope: false,
    adminScope: false,
    ipAllowlist: '',
  });
  const [score, setScore] = useState(null);

  const computeScore = () => {
    let s = 0;
    if (config.authMethod === 'oauth21') s += 30;
    else if (config.authMethod === 'apikey') s += 15;
    if (config.tlsEnabled) s += 25;
    if (config.auditLogging) s += 20;
    if (config.rateLimitRpm <= 100) s += 10;
    if (!config.adminScope) s += 10;
    if (config.ipAllowlist.trim().length > 0) s += 5;
    setScore(s);
    if (s >= 70 && onComplete) onComplete('security-auth','security-config');
  };

  const scoreColor = score === null ? GIM.mutedText : score >= 80 ? '#166534' : score >= 60 ? '#92400E' : '#991B1B';
  const scoreBg = score === null ? GIM.borderLight : score >= 80 ? '#EBF5F1' : score >= 60 ? '#FEF9C3' : '#FEF2F2';

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border, background:GIM.cardBg}}>
      <h4 className="font-semibold mb-3" style={{fontSize:14, color:GIM.headingText, fontFamily:GIM.fontMain}}>Security Config Builder</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold block mb-1" style={{color:GIM.mutedText}}>Authentication Method</label>
          <select value={config.authMethod} onChange={e=>setConfig(c=>({...c,authMethod:e.target.value}))} className="w-full px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}>
            <option value="oauth21">OAuth 2.1 (recommended)</option>
            <option value="apikey">API Key</option>
            <option value="none">None (internal only)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{color:GIM.mutedText}}>Rate Limit (req/min)</label>
          <input type="number" value={config.rateLimitRpm} onChange={e=>setConfig(c=>({...c,rateLimitRpm:parseInt(e.target.value)||60}))} className="w-full px-2 py-1.5 rounded border text-xs" style={{borderColor:GIM.border}}/>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{color:GIM.mutedText}}>IP Allowlist (comma-separated CIDRs)</label>
          <input value={config.ipAllowlist} onChange={e=>setConfig(c=>({...c,ipAllowlist:e.target.value}))} placeholder="e.g. 10.0.0.0/8, 192.168.1.0/24" className="w-full px-2 py-1.5 rounded border text-xs font-mono" style={{borderColor:GIM.border}}/>
        </div>
        <div className="flex flex-col gap-2">
          {[['tlsEnabled','TLS/HTTPS Required'],['auditLogging','Audit Logging'],['readScope','Read Scope'],['writeScope','Write Scope'],['adminScope','Admin Scope']].map(([key,label])=>(
            <label key={key} className="flex items-center gap-2 text-xs cursor-pointer" style={{color:GIM.bodyText}}>
              <input type="checkbox" checked={config[key]} onChange={e=>setConfig(c=>({...c,[key]:e.target.checked}))}/>
              {label}
            </label>
          ))}
        </div>
      </div>
      <button onClick={computeScore} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary, color:'white'}}>Compute Security Score</button>
      {score !== null && (
        <div className="mt-3 p-3 rounded-lg" style={{background:scoreBg}}>
          <span className="font-semibold" style={{color:scoreColor}}>Security Score: {score}/100</span>
          {score < 70 && <p className="mt-1 text-xs" style={{color:scoreColor}}>Enable TLS, OAuth 2.1, audit logging, and remove admin scope to reach production-ready threshold.</p>}
          {score >= 80 && <p className="mt-1 text-xs" style={{color:scoreColor}}>Production-ready configuration.</p>}
        </div>
      )}
    </div>
  );
}

export function EvalMaturityQuiz(){
  const scenarios=[
    {desc:'Your team ships a new prompt and checks if the output "looks right" by reading a few examples.',level:0,levels:['Vibes-based','Basic Assertions','Systematic Evals','Continuous Eval'],explanation:'Reading a few outputs manually is "vibes-based" evaluation -- the lowest maturity level. It catches obvious failures but misses subtle regressions.'},
    {desc:'Every prompt change triggers an automated test suite of 200 examples with pass/fail assertions checked in CI.',level:2,levels:['Vibes-based','Basic Assertions','Systematic Evals','Continuous Eval'],explanation:'An automated suite of 200 examples with CI integration is systematic evaluation. You have coverage, automation, and regression protection.'},
    {desc:'After deploying, you manually spot-check 5 responses in production to make sure nothing broke.',level:1,levels:['Vibes-based','Basic Assertions','Systematic Evals','Continuous Eval'],explanation:'Spot-checking a few production responses is a basic assertion approach -- better than nothing, but not systematic or automated.'},
    {desc:'Production responses are continuously scored by LLM judges, drift is detected automatically, and alerts fire when quality drops below thresholds.',level:3,levels:['Vibes-based','Basic Assertions','Systematic Evals','Continuous Eval'],explanation:'Continuous automated scoring with drift detection and alerting is the highest maturity level -- your system watches itself.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const s=scenarios[current];const answered=selected!==null;const correct=selected===s.level;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDFAF'} Try It: Eval Maturity Assessment</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Classify each scenario into the correct evaluation maturity level. ({current+1}/{scenarios.length})</p>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}><p style={{fontSize:13,color:GIM.headingText,lineHeight:1.5}}>{s.desc}</p></div>
    <div className="flex flex-wrap gap-2 mb-3">{s.levels.map((l,i)=><button key={l} onClick={()=>!answered&&(()=>{setSelected(i);if(i===s.level)setScore(v=>v+1)})()}  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:answered?(i===s.level?'#EBF5F1':i===selected?'#FEF2F2':'white'):'white',color:answered?(i===s.level?'#2D8A6E':i===selected?'#EF4444':GIM.mutedText):GIM.primary,border:`1px solid ${answered?(i===s.level?'#2D8A6E':GIM.border):GIM.primary}`,cursor:answered?'default':'pointer'}}>{l}{answered&&i===s.level&&' \u2713'}</button>)}</div>
    {answered&&<div className="p-3 rounded-lg mb-3" style={{background:correct?'#EBF5F1':'#FEF2F2'}}><p style={{fontSize:12,color:correct?'#166534':'#991B1B'}}>{s.explanation}</p></div>}
    {answered&&current<scenarios.length-1&&<button onClick={()=>{setCurrent(i=>i+1);setSelected(null)}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Scenario</button>}
    {answered&&current===scenarios.length-1&&<span className="text-sm font-semibold" style={{color:'#2D8A6E'}}>Done! {score}/{scenarios.length} correct</span>}
  </div>;
}

export function JudgePatternSimulator(){
  const[pattern,setPattern]=useState('single');
  const[showResult,setShowResult]=useState(false);
  const patterns={
    single:{name:'Single Judge',desc:'One LLM scores the output',pros:'Fast, cheap, simple',cons:'Biased toward own style, inconsistent',agreement:'N/A (single rater)',cost:'1 LLM call',icon:'\uD83E\uDDD1\u200D\u2696\uFE0F'},
    panel:{name:'Panel of Judges',desc:'3+ LLMs score independently, take average',pros:'Reduces individual bias, more robust',cons:'3x cost, may still share systematic biases',agreement:'Cohen\'s kappa across judges',cost:'3+ LLM calls',icon:'\uD83E\uDDD1\u200D\u2696\uFE0F\uD83E\uDDD1\u200D\u2696\uFE0F\uD83E\uDDD1\u200D\u2696\uFE0F'},
    pairwise:{name:'Pairwise Comparison',desc:'Judge picks better of two outputs (A vs B)',pros:'Easier judgment than absolute scoring, reduces position bias',cons:'Quadratic comparisons for N outputs',agreement:'Win rate + confidence interval',cost:'N*(N-1)/2 calls',icon:'\u2696\uFE0F'},
    reference:{name:'Reference-Based',desc:'Judge scores against a gold-standard answer',pros:'Most objective, consistent baseline',cons:'Requires human-written references',agreement:'Correlation with human scores',cost:'1 call + reference creation',icon:'\uD83C\uDFC6'},
  };
  const p=patterns[pattern];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDDD1\u200D\u2696\uFE0F'} Explore: LLM-as-Judge Patterns</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Select a judging pattern to see how it works, its trade-offs, and when to use it.</p>
    <div className="flex flex-wrap gap-2 mb-3">{Object.keys(patterns).map(k=><button key={k} onClick={()=>{setPattern(k);setShowResult(true)}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:pattern===k?GIM.primary:'white',color:pattern===k?'white':GIM.bodyText,border:`1px solid ${pattern===k?GIM.primary:GIM.border}`}}>{patterns[k].name}</button>)}</div>
    {showResult&&<div className="space-y-2">
      <div className="p-3 rounded-lg" style={{background:GIM.borderLight}}>
        <div className="text-center mb-2" style={{fontSize:24}}>{p.icon}</div>
        <div className="font-semibold text-center mb-1" style={{fontSize:14,color:GIM.headingText}}>{p.name}</div>
        <p className="text-center mb-2" style={{fontSize:12,color:GIM.bodyText}}>{p.desc}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg" style={{background:'#EBF5F1'}}><span className="text-xs font-semibold" style={{color:'#2D8A6E'}}>Pros: </span><span className="text-xs" style={{color:'#166534'}}>{p.pros}</span></div>
        <div className="p-2 rounded-lg" style={{background:'#FEF2F2'}}><span className="text-xs font-semibold" style={{color:'#EF4444'}}>Cons: </span><span className="text-xs" style={{color:'#991B1B'}}>{p.cons}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg" style={{background:'#EFF6FF'}}><span className="text-xs font-semibold" style={{color:'#1D4ED8'}}>Agreement: </span><span className="text-xs" style={{color:'#1E40AF'}}>{p.agreement}</span></div>
        <div className="p-2 rounded-lg" style={{background:'#FFFBEB'}}><span className="text-xs font-semibold" style={{color:'#B45309'}}>Cost: </span><span className="text-xs" style={{color:'#92400E'}}>{p.cost}</span></div>
      </div>
    </div>}
  </div>;
}

export function MetricCalculator(){
  const[faithfulness,setFaithfulness]=useState(0.85);const[relevance,setRelevance]=useState(0.80);const[coherence,setCoherence]=useState(0.90);const[toxicity,setToxicity]=useState(0.02);const[latencyMs,setLatencyMs]=useState(1500);const[costPer1k,setCostPer1k]=useState(2.5);
  const safetyScore=1-toxicity;
  const qualityScore=(faithfulness*0.35+relevance*0.30+coherence*0.20+safetyScore*0.15).toFixed(3);
  const slaPass=latencyMs<=3000&&Number(qualityScore)>=0.75&&toxicity<=0.05;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCCA'} Try It: Composite Score Builder</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Adjust individual metrics and see how they combine into a composite quality score. Weights: Faithfulness 35%, Relevance 30%, Coherence 20%, Safety 15%.</p>
    <div className="space-y-2 mb-4">
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Faithfulness</span><span style={{fontSize:12,color:GIM.mutedText}}>{faithfulness.toFixed(2)}</span></label><input type="range" min="0" max="1" step="0.01" value={faithfulness} onChange={e=>setFaithfulness(Number(e.target.value))} className="w-full" style={{accentColor:'#2D8A6E'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Relevance</span><span style={{fontSize:12,color:GIM.mutedText}}>{relevance.toFixed(2)}</span></label><input type="range" min="0" max="1" step="0.01" value={relevance} onChange={e=>setRelevance(Number(e.target.value))} className="w-full" style={{accentColor:'#3B6B9B'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Coherence</span><span style={{fontSize:12,color:GIM.mutedText}}>{coherence.toFixed(2)}</span></label><input type="range" min="0" max="1" step="0.01" value={coherence} onChange={e=>setCoherence(Number(e.target.value))} className="w-full" style={{accentColor:'#E8734A'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Toxicity Rate</span><span style={{fontSize:12,color:toxicity>0.05?'#EF4444':GIM.mutedText}}>{(toxicity*100).toFixed(1)}%</span></label><input type="range" min="0" max="0.2" step="0.005" value={toxicity} onChange={e=>setToxicity(Number(e.target.value))} className="w-full" style={{accentColor:'#EF4444'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Latency (p95)</span><span style={{fontSize:12,color:latencyMs>3000?'#EF4444':GIM.mutedText}}>{latencyMs}ms</span></label><input type="range" min="200" max="10000" step="100" value={latencyMs} onChange={e=>setLatencyMs(Number(e.target.value))} className="w-full" style={{accentColor:'#6366F1'}}/></div>
      <div><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Cost per 1K queries</span><span style={{fontSize:12,color:GIM.mutedText}}>${costPer1k.toFixed(2)}</span></label><input type="range" min="0.1" max="15" step="0.1" value={costPer1k} onChange={e=>setCostPer1k(Number(e.target.value))} className="w-full" style={{accentColor:'#F59E0B'}}/></div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="p-3 rounded-lg text-center" style={{background:Number(qualityScore)>=0.75?'#EBF5F1':'#FEF2F2'}}><div className="font-bold" style={{fontSize:20,color:Number(qualityScore)>=0.75?'#2D8A6E':'#EF4444'}}>{qualityScore}</div><div style={{fontSize:11,color:GIM.mutedText}}>Composite Score</div></div>
      <div className="p-3 rounded-lg text-center" style={{background:GIM.borderLight}}><div className="font-bold" style={{fontSize:20,color:GIM.primary}}>${(costPer1k*30).toFixed(0)}</div><div style={{fontSize:11,color:GIM.mutedText}}>Monthly (30K queries)</div></div>
      <div className="p-3 rounded-lg text-center" style={{background:slaPass?'#EBF5F1':'#FEF2F2'}}><div className="font-bold" style={{fontSize:20,color:slaPass?'#2D8A6E':'#EF4444'}}>{slaPass?'PASS':'FAIL'}</div><div style={{fontSize:11,color:GIM.mutedText}}>SLA Gate</div></div>
    </div>
    <p className="text-xs mt-2" style={{color:GIM.mutedText}}>SLA thresholds: Quality {'\u2265'} 0.75, Latency p95 {'\u2264'} 3000ms, Toxicity {'\u2264'} 5%</p>
  </div>;
}

export function ABTestSimulator(){
  const[sampleSize,setSampleSize]=useState(100);const[running,setRunning]=useState(false);const[results,setResults]=useState(null);
  const runTest=()=>{
    setRunning(true);
    setTimeout(()=>{
      const aWins=Math.floor(sampleSize*(0.42+Math.random()*0.08));
      const bWins=Math.floor(sampleSize*(0.45+Math.random()*0.08));
      const ties=sampleSize-aWins-bWins>0?sampleSize-aWins-bWins:0;
      const aRate=aWins/sampleSize;const bRate=bWins/sampleSize;
      const pooled=(aWins+bWins)/(2*sampleSize);
      const se=Math.sqrt(2*pooled*(1-pooled)/sampleSize);
      const z=se>0?Math.abs(aRate-bRate)/se:0;
      const significant=z>1.96;
      setResults({aWins,bWins,ties,aRate:(aRate*100).toFixed(1),bRate:(bRate*100).toFixed(1),z:z.toFixed(2),significant,winner:aWins>bWins?'A (Current Prompt)':'B (New Prompt)'});
      setRunning(false);
    },1200);
  };
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDDEA'} Try It: A/B Test Simulator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Simulate an A/B test between two prompt variants. LLM-as-judge performs pairwise comparisons.</p>
    <div className="mb-3"><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Sample Size</span><span style={{fontSize:12,color:GIM.mutedText}}>{sampleSize} comparisons</span></label><input type="range" min="50" max="1000" step="50" value={sampleSize} onChange={e=>setSampleSize(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/></div>
    <button onClick={runTest} disabled={running} className="px-4 py-1.5 rounded-lg text-xs font-semibold mb-3" style={{background:running?GIM.border:GIM.primary,color:'white',cursor:running?'wait':'pointer'}}>{running?'Running comparisons...':'Run A/B Test'}</button>
    {results&&<div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="p-2 rounded-lg text-center" style={{background:'#EFF6FF'}}><div className="font-bold" style={{fontSize:16,color:'#1D4ED8'}}>{results.aWins}</div><div style={{fontSize:11,color:GIM.mutedText}}>A wins ({results.aRate}%)</div></div>
        <div className="p-2 rounded-lg text-center" style={{background:'#FFFBEB'}}><div className="font-bold" style={{fontSize:16,color:'#B45309'}}>{results.ties}</div><div style={{fontSize:11,color:GIM.mutedText}}>Ties</div></div>
        <div className="p-2 rounded-lg text-center" style={{background:'#F0FDF4'}}><div className="font-bold" style={{fontSize:16,color:'#15803D'}}>{results.bWins}</div><div style={{fontSize:11,color:GIM.mutedText}}>B wins ({results.bRate}%)</div></div>
      </div>
      <div className="p-3 rounded-lg" style={{background:results.significant?'#EBF5F1':'#FFFBEB'}}>
        <p style={{fontSize:12,color:results.significant?'#166534':'#92400E',fontWeight:600}}>{results.significant?`Statistically significant (z=${results.z}, p<0.05). Winner: ${results.winner}`:`Not significant (z=${results.z}, p>0.05). Need more samples or the difference is too small.`}</p>
      </div>
    </div>}
  </div>;
}

export function DriftDetector(){
  const[baseline]=useState([0.88,0.85,0.87,0.86,0.89,0.84,0.87]);
  const[production,setProduction]=useState([0.87,0.86,0.84,0.83,0.80,0.78,0.75]);
  const[alertThreshold,setAlertThreshold]=useState(0.10);
  const[showAnalysis,setShowAnalysis]=useState(false);
  const baselineMean=baseline.reduce((a,b)=>a+b,0)/baseline.length;
  const prodMean=production.reduce((a,b)=>a+b,0)/production.length;
  const drift=baselineMean-prodMean;
  const drifting=drift>alertThreshold;
  const driftScenarios=[
    {name:'Gradual Degradation',data:[0.87,0.86,0.84,0.83,0.80,0.78,0.75]},
    {name:'Sudden Drop',data:[0.88,0.87,0.86,0.55,0.54,0.56,0.53]},
    {name:'Stable (No Drift)',data:[0.87,0.86,0.88,0.85,0.87,0.86,0.88]},
    {name:'Oscillating',data:[0.88,0.72,0.87,0.71,0.86,0.73,0.85]},
  ];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCC9'} Try It: Drift Detector</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Select a production quality scenario and adjust the alert threshold to see when drift is detected.</p>
    <div className="flex flex-wrap gap-2 mb-3">{driftScenarios.map(s=><button key={s.name} onClick={()=>{setProduction(s.data);setShowAnalysis(false)}} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:JSON.stringify(production)===JSON.stringify(s.data)?GIM.primary:'white',color:JSON.stringify(production)===JSON.stringify(s.data)?'white':GIM.bodyText,border:`1px solid ${JSON.stringify(production)===JSON.stringify(s.data)?GIM.primary:GIM.border}`}}>{s.name}</button>)}</div>
    <div className="mb-3"><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Alert Threshold</span><span style={{fontSize:12,color:GIM.mutedText}}>{(alertThreshold*100).toFixed(0)}% drop from baseline</span></label><input type="range" min="0.02" max="0.25" step="0.01" value={alertThreshold} onChange={e=>setAlertThreshold(Number(e.target.value))} className="w-full" style={{accentColor:'#EF4444'}}/></div>
    <div className="flex gap-1 items-end mb-3" style={{height:80}}>
      {production.map((v,i)=><div key={i} className="flex-1 rounded-t" style={{height:`${v*100}%`,background:v<baselineMean-alertThreshold?'#EF4444':v<baselineMean-alertThreshold/2?'#F59E0B':'#2D8A6E',transition:'all 0.3s'}}/>)}
    </div>
    <div className="flex justify-between text-xs mb-3" style={{color:GIM.mutedText}}><span>Day 1</span><span>Day 7</span></div>
    <button onClick={()=>setShowAnalysis(true)} className="px-4 py-1.5 rounded-lg text-xs font-semibold mb-2" style={{background:GIM.primary,color:'white'}}>Analyze Drift</button>
    {showAnalysis&&<div className="p-3 rounded-lg" style={{background:drifting?'#FEF2F2':'#EBF5F1'}}>
      <p style={{fontSize:12,fontWeight:600,color:drifting?'#991B1B':'#166534'}}>{drifting?'\u26A0\uFE0F ALERT: Quality drift detected!':'\u2705 No significant drift detected.'}</p>
      <p style={{fontSize:11,color:GIM.mutedText,marginTop:4}}>Baseline mean: {baselineMean.toFixed(3)} | Production mean: {prodMean.toFixed(3)} | Drift: {(drift*100).toFixed(1)}% | Threshold: {(alertThreshold*100).toFixed(0)}%</p>
    </div>}
  </div>;
}

export function EvalPipelineBuilder(){
  const metricOptions=[
    {id:'faithfulness',name:'Faithfulness',desc:'Is output grounded in source?',cost:1,quality:'high'},
    {id:'relevance',name:'Relevance',desc:'Does it address the query?',cost:1,quality:'high'},
    {id:'coherence',name:'Coherence',desc:'Well-structured and logical?',cost:1,quality:'medium'},
    {id:'toxicity',name:'Toxicity Check',desc:'Harmful/biased content?',cost:0.5,quality:'high'},
    {id:'hallucination',name:'Hallucination Detection',desc:'Unsupported claims?',cost:2,quality:'very high'},
    {id:'latency',name:'Latency',desc:'Response time measurement',cost:0,quality:'N/A'},
    {id:'cost',name:'Cost Tracking',desc:'Token usage and spend',cost:0,quality:'N/A'},
  ];
  const judgeOptions=[
    {id:'claude',name:'Claude Sonnet',reliability:'High',costPer100:'$0.45'},
    {id:'gpt4o',name:'GPT-4o',reliability:'High',costPer100:'$0.38'},
    {id:'llama',name:'LLaMA 3 70B',reliability:'Medium',costPer100:'$0.05'},
    {id:'human',name:'Human Reviewer',reliability:'Very High',costPer100:'$15.00'},
  ];
  const[selectedMetrics,setSelectedMetrics]=useState(['faithfulness','relevance']);
  const[selectedJudge,setSelectedJudge]=useState('claude');
  const[testCases,setTestCases]=useState(100);
  const[running,setRunning]=useState(false);
  const[results,setResults]=useState(null);

  const toggleMetric=(id)=>{setSelectedMetrics(m=>m.includes(id)?m.filter(x=>x!==id):[...m,id]);setResults(null)};
  const judge=judgeOptions.find(j=>j.id===selectedJudge);
  const totalCost=selectedMetrics.reduce((a,m)=>{const met=metricOptions.find(x=>x.id===m);return a+(met?met.cost:0)},0)*testCases*parseFloat(judge?judge.costPer100:'0')/100;

  const runEval=()=>{
    if(selectedMetrics.length===0)return;
    setRunning(true);
    setTimeout(()=>{
      const scores={};
      selectedMetrics.forEach(m=>{
        if(m==='latency')scores[m]={value:Math.floor(800+Math.random()*2000),unit:'ms'};
        else if(m==='cost')scores[m]={value:(0.5+Math.random()*3).toFixed(2),unit:'$/1K queries'};
        else scores[m]={value:(0.65+Math.random()*0.30).toFixed(3),unit:'score'};
      });
      const passed=Object.entries(scores).every(([k,v])=>{
        if(k==='latency')return v.value<3000;
        if(k==='cost')return true;
        if(k==='toxicity')return Number(v.value)<0.05;
        return Number(v.value)>0.70;
      });
      setResults({scores,passed,casesRun:testCases,judge:judge.name,totalCost:totalCost.toFixed(2)});
      setRunning(false);
    },1500);
  };

  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\u2699\uFE0F'} Build Your Eval Pipeline</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Select metrics, choose a judge, set sample size, and run the evaluation.</p>

    <div className="mb-3">
      <p className="text-xs font-semibold mb-2" style={{color:GIM.headingText}}>Step 1: Select Metrics</p>
      <div className="flex flex-wrap gap-2">{metricOptions.map(m=><button key={m.id} onClick={()=>toggleMetric(m.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:selectedMetrics.includes(m.id)?GIM.primary:'white',color:selectedMetrics.includes(m.id)?'white':GIM.bodyText,border:`1px solid ${selectedMetrics.includes(m.id)?GIM.primary:GIM.border}`}}>{m.name}</button>)}</div>
    </div>

    <div className="mb-3">
      <p className="text-xs font-semibold mb-2" style={{color:GIM.headingText}}>Step 2: Choose Judge</p>
      <div className="flex flex-wrap gap-2">{judgeOptions.map(j=><button key={j.id} onClick={()=>{setSelectedJudge(j.id);setResults(null)}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:selectedJudge===j.id?GIM.primary:'white',color:selectedJudge===j.id?'white':GIM.bodyText,border:`1px solid ${selectedJudge===j.id?GIM.primary:GIM.border}`}}>
        <span>{j.name}</span><span className="ml-1 opacity-70">({j.costPer100}/100)</span>
      </button>)}</div>
    </div>

    <div className="mb-3"><label className="flex justify-between mb-1"><span style={{fontSize:12,fontWeight:600,color:GIM.headingText}}>Step 3: Sample Size</span><span style={{fontSize:12,color:GIM.mutedText}}>{testCases} test cases</span></label><input type="range" min="10" max="500" step="10" value={testCases} onChange={e=>{setTestCases(Number(e.target.value));setResults(null)}} className="w-full" style={{accentColor:GIM.primary}}/></div>

    <div className="flex items-center gap-3 mb-3">
      <button onClick={runEval} disabled={running||selectedMetrics.length===0} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:running||selectedMetrics.length===0?GIM.border:GIM.primary,color:'white',cursor:running?'wait':'pointer'}}>{running?'Evaluating...':'Run Eval Pipeline'}</button>
      <span style={{fontSize:11,color:GIM.mutedText}}>Estimated cost: ${totalCost.toFixed(2)}</span>
    </div>

    {results&&<div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">{Object.entries(results.scores).map(([k,v])=><div key={k} className="p-2 rounded-lg text-center" style={{background:k==='toxicity'?(Number(v.value)<0.05?'#EBF5F1':'#FEF2F2'):k==='latency'?(v.value<3000?'#EBF5F1':'#FEF2F2'):k==='cost'?'#FFFBEB':(Number(v.value)>0.70?'#EBF5F1':'#FEF2F2')}}>
        <div className="font-bold" style={{fontSize:14,color:GIM.headingText}}>{v.value}</div>
        <div style={{fontSize:10,color:GIM.mutedText}}>{k} ({v.unit})</div>
      </div>)}</div>
      <div className="p-3 rounded-lg" style={{background:results.passed?'#EBF5F1':'#FEF2F2'}}>
        <p style={{fontSize:12,fontWeight:600,color:results.passed?'#166534':'#991B1B'}}>{results.passed?'\u2705 Pipeline PASSED -- safe to deploy':'\u274C Pipeline FAILED -- fix issues before deploying'}</p>
        <p style={{fontSize:11,color:GIM.mutedText,marginTop:4}}>Judge: {results.judge} | Cases: {results.casesRun} | Cost: ${results.totalCost}</p>
      </div>
    </div>}
  </div>;
}

export function BasicVsGraphRAGComparison({onNavigate, onComplete}) {
  const [activeQuery, setActiveQuery] = useState(0);
  const [activeMethod, setActiveMethod] = useState(null);

  const queries = [
    {
      q: "What companies did the founders of Python influence?",
      vector: {
        steps: ["Embed query", "Find docs with 'Python' + 'founders'", "Return top-5 chunks"],
        result: "Found: 'Guido van Rossum created Python in 1991' and 'Python is used at Google and Dropbox'. Missing: No connection to companies via founder relationships.",
        quality: 42,
        color: "#EF4444"
      },
      graph: {
        steps: ["Identify entities: Python, founders", "Traverse: Python → created_by → Guido van Rossum", "Traverse: Guido van Rossum → worked_at → Google, Dropbox", "Traverse: Guido van Rossum → influenced → Barry Warsaw → Microsoft"],
        result: "Found: Guido van Rossum (Google, Dropbox), Barry Warsaw (Microsoft), Tim Peters (multiple orgs). Multi-hop graph path reveals complete answer.",
        quality: 91,
        color: "#2D8A6E"
      }
    },
    {
      q: "How are climate change and economic inequality connected?",
      vector: {
        steps: ["Embed query", "Find semantically similar passages", "Return top chunks about both topics"],
        result: "Found documents mentioning both terms, but no structural insight into how they causally or structurally relate.",
        quality: 38,
        color: "#EF4444"
      },
      graph: {
        steps: ["Map entities: climate change, economic inequality", "Traverse shared community cluster", "Find bridging entities: resource scarcity, migration, insurance markets", "Retrieve community summary for the cluster"],
        result: "Graph reveals: climate change → resource scarcity → migration → labor market disruption → economic inequality. 4-hop causal chain surfaced from community detection.",
        quality: 88,
        color: "#2D8A6E"
      }
    }
  ];

  const q = queries[activeQuery];

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-3" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Interactive: Basic RAG vs GraphRAG
      </h4>
      <div className="flex gap-2 mb-4">
        {queries.map((item, i) => (
          <button
            key={i}
            onClick={() => { setActiveQuery(i); setActiveMethod(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeQuery === i ? GIM.primary : GIM.borderLight,
              color: activeQuery === i ? 'white' : GIM.bodyText
            }}
          >
            Query {i + 1}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-lg mb-4" style={{background: GIM.borderLight}}>
        <p style={{fontSize: 13, color: GIM.headingText, fontWeight: 600}}>{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[['vector', 'Basic RAG (Vector Only)', '#EFF6FF', '#3B6B9B'], ['graph', 'GraphRAG', '#EBF5F1', '#2D8A6E']].map(([key, label, bg, color]) => (
          <button
            key={key}
            onClick={() => setActiveMethod(activeMethod === key ? null : key)}
            className="p-3 rounded-lg text-left transition-all"
            style={{
              background: activeMethod === key ? bg : 'white',
              border: `2px solid ${activeMethod === key ? color : GIM.border}`,
              cursor: 'pointer'
            }}
          >
            <div className="font-semibold text-xs mb-1" style={{color}}>{label}</div>
            <div style={{fontSize: 11, color: GIM.mutedText}}>Click to run</div>
          </button>
        ))}
      </div>
      {activeMethod && (
        <div className="p-3 rounded-lg" style={{background: activeMethod === 'graph' ? '#EBF5F1' : '#FEF2F2'}}>
          <div className="mb-2">
            <span className="text-xs font-semibold" style={{color: GIM.mutedText}}>RETRIEVAL STEPS:</span>
            <ol className="mt-1 space-y-0.5">
              {q[activeMethod].steps.map((s, i) => (
                <li key={i} style={{fontSize: 11, color: GIM.bodyText}}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="mb-2">
            <span className="text-xs font-semibold" style={{color: GIM.mutedText}}>RESULT:</span>
            <p style={{fontSize: 12, color: GIM.headingText, marginTop: 4, lineHeight: 1.6}}>{q[activeMethod].result}</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{fontSize: 11, color: GIM.mutedText}}>Answer Quality:</span>
            <div className="flex-1 h-2 rounded-full" style={{background: GIM.borderLight}}>
              <div
                className="h-2 rounded-full transition-all"
                style={{width: `${q[activeMethod].quality}%`, background: q[activeMethod].color}}
              />
            </div>
            <span className="font-bold text-xs" style={{color: q[activeMethod].color}}>
              {q[activeMethod].quality}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MiniGraphBuilder({onNavigate, onComplete}) {
  const [inputText, setInputText] = useState('OpenAI was founded by Sam Altman and Elon Musk in 2015. Sam Altman is CEO of OpenAI. OpenAI created GPT-4 and ChatGPT. ChatGPT uses GPT-4.');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [extracted, setExtracted] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [newRel, setNewRel] = useState('');
  const [newObj, setNewObj] = useState('');

  const entityColors = {
    'Person': '#3B6B9B',
    'Organization': '#2D8A6E',
    'Product': '#E8734A',
    'Year': '#8B5CF6',
    'Role': '#F59E0B'
  };

  const autoExtract = () => {
    const extracted_nodes = [
      {id: 'n1', name: 'OpenAI', type: 'Organization'},
      {id: 'n2', name: 'Sam Altman', type: 'Person'},
      {id: 'n3', name: 'Elon Musk', type: 'Person'},
      {id: 'n4', name: '2015', type: 'Year'},
      {id: 'n5', name: 'GPT-4', type: 'Product'},
      {id: 'n6', name: 'ChatGPT', type: 'Product'},
      {id: 'n7', name: 'CEO', type: 'Role'},
    ];
    const extracted_edges = [
      {s: 'OpenAI', r: 'FOUNDED_BY', t: 'Sam Altman'},
      {s: 'OpenAI', r: 'FOUNDED_BY', t: 'Elon Musk'},
      {s: 'OpenAI', r: 'FOUNDED_IN', t: '2015'},
      {s: 'Sam Altman', r: 'HAS_ROLE', t: 'CEO'},
      {s: 'OpenAI', r: 'CREATED', t: 'GPT-4'},
      {s: 'OpenAI', r: 'CREATED', t: 'ChatGPT'},
      {s: 'ChatGPT', r: 'USES', t: 'GPT-4'},
    ];
    setNodes(extracted_nodes);
    setEdges(extracted_edges);
    setExtracted(true);
  };

  const addEdge = () => {
    if (newSub && newRel && newObj) {
      setEdges(e => [...e, {s: newSub, r: newRel.toUpperCase().replace(/\s+/g, '_'), t: newObj}]);
      const existingNames = nodes.map(n => n.name);
      const newNodesList = [...nodes];
      if (!existingNames.includes(newSub)) newNodesList.push({id: `u${Date.now()}a`, name: newSub, type: 'Concept'});
      if (!existingNames.includes(newObj)) newNodesList.push({id: `u${Date.now()}b`, name: newObj, type: 'Concept'});
      setNodes(newNodesList);
      setNewSub(''); setNewRel(''); setNewObj('');
    }
  };

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Interactive: Mini Knowledge Graph Builder
      </h4>
      <p className="mb-3" style={{fontSize: 12, color: GIM.mutedText}}>
        Paste a paragraph, auto-extract entities and relationships, then add more manually.
      </p>
      <textarea
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        className="w-full p-2 rounded border text-xs mb-2 resize-none"
        rows={3}
        style={{borderColor: GIM.border, fontFamily: 'monospace'}}
      />
      <button
        onClick={autoExtract}
        className="px-4 py-1.5 rounded-lg text-xs font-semibold mb-3"
        style={{background: GIM.primary, color: 'white'}}
      >
        Extract Entities & Relationships
      </button>

      {extracted && (
        <>
          <div className="mb-3">
            <div className="text-xs font-semibold mb-2" style={{color: GIM.mutedText}}>EXTRACTED NODES ({nodes.length})</div>
            <div className="flex flex-wrap gap-2">
              {nodes.map(n => (
                <span
                  key={n.id}
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${entityColors[n.type] || '#6B7280'}22`,
                    color: entityColors[n.type] || '#6B7280',
                    border: `1px solid ${entityColors[n.type] || '#6B7280'}44`
                  }}
                >
                  {n.name} <span style={{opacity: 0.6}}>({n.type})</span>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-xs font-semibold mb-2" style={{color: GIM.mutedText}}>EXTRACTED RELATIONSHIPS ({edges.length})</div>
            <div className="space-y-1">
              {edges.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded" style={{background: '#EFF6FF', color: '#3B6B9B', fontWeight: 600}}>{e.s}</span>
                  <span style={{color: GIM.mutedText}}>→</span>
                  <span className="px-2 py-0.5 rounded font-mono" style={{background: '#FFFBEB', color: '#92400E', fontSize: 10}}>{e.r}</span>
                  <span style={{color: GIM.mutedText}}>→</span>
                  <span className="px-2 py-0.5 rounded" style={{background: '#EBF5F1', color: '#2D8A6E', fontWeight: 600}}>{e.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3" style={{borderColor: GIM.border}}>
            <div className="text-xs font-semibold mb-2" style={{color: GIM.mutedText}}>ADD RELATIONSHIP MANUALLY</div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Subject" className="px-2 py-1 rounded border text-xs" style={{borderColor: GIM.border}} />
              <input value={newRel} onChange={e => setNewRel(e.target.value)} placeholder="Relation" className="px-2 py-1 rounded border text-xs" style={{borderColor: GIM.border}} />
              <input value={newObj} onChange={e => setNewObj(e.target.value)} placeholder="Object" className="px-2 py-1 rounded border text-xs" style={{borderColor: GIM.border}} />
            </div>
            <button onClick={addEdge} className="px-3 py-1 rounded text-xs font-semibold" style={{background: '#2D8A6E', color: 'white'}}>
              Add Triple
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function CommunityExplorer({onNavigate, onComplete}) {
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const communities = [
    {
      id: 0,
      name: 'AI Research Community',
      color: '#3B6B9B',
      bg: '#EFF6FF',
      size: 8,
      entities: ['Geoffrey Hinton', 'Yann LeCun', 'Yoshua Bengio', 'Deep Learning', 'Neural Networks', 'Backprop', 'ImageNet', 'Turing Award'],
      summary: 'Core deep learning research cluster. Dominated by the three Turing Award winners and the foundational concepts they developed. High internal density — every entity connects to multiple others within this community.',
      bridges: ['AI Safety Community', 'Industry AI Community'],
      globalInsight: 'This community represents the theoretical foundation from which all modern AI systems descend.'
    },
    {
      id: 1,
      name: 'Industry AI Community',
      color: '#2D8A6E',
      bg: '#EBF5F1',
      size: 7,
      entities: ['OpenAI', 'Google DeepMind', 'Anthropic', 'GPT-4', 'Gemini', 'Claude', 'RLHF'],
      summary: 'Commercial AI application cluster. Organizations and products that operationalized research from the AI Research Community. Connected to AI Research Community via researchers-turned-founders.',
      bridges: ['AI Research Community', 'AI Safety Community', 'Policy Community'],
      globalInsight: 'The commercialization bridge between academic research and deployed AI systems.'
    },
    {
      id: 2,
      name: 'AI Safety Community',
      color: '#E8734A',
      bg: '#FEF9F5',
      size: 5,
      entities: ['Alignment Research', 'Constitutional AI', 'RLAIF', 'AI Risk', 'Paul Christiano'],
      summary: 'Safety and alignment research cluster. Acts as a bridge community — connected to both academic research and industry organizations. Relatively newer community with rapidly growing internal density.',
      bridges: ['AI Research Community', 'Industry AI Community'],
      globalInsight: 'Critical bridge community whose growth reflects the field\'s increasing focus on deployment safety.'
    },
    {
      id: 3,
      name: 'Policy Community',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      size: 4,
      entities: ['EU AI Act', 'AI Executive Order', 'Congressional Hearings', 'OpenAI Governance'],
      summary: 'Regulatory and governance cluster. Weakly connected to technical communities — primarily receives signals from Industry AI Community but rarely influences technical development directly. Growing rapidly post-2023.',
      bridges: ['Industry AI Community'],
      globalInsight: 'Regulatory response lagging technical development — the weakest cross-community connectivity.'
    },
  ];

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Interactive: Community Explorer
      </h4>
      <p className="mb-3" style={{fontSize: 12, color: GIM.mutedText}}>
        Click a community to see its entities, internal connections, and the global summary GraphRAG generates for it.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {communities.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCommunity(selectedCommunity === c.id ? null : c.id)}
            className="p-3 rounded-lg text-left transition-all"
            style={{
              background: selectedCommunity === c.id ? c.bg : 'white',
              border: `2px solid ${selectedCommunity === c.id ? c.color : GIM.border}`,
            }}
          >
            <div className="font-semibold text-xs mb-1" style={{color: c.color}}>{c.name}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs" style={{color: GIM.mutedText}}>{c.size} entities</div>
              <div className="flex gap-0.5">
                {Array.from({length: c.size}).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{background: c.color, opacity: 0.4 + i * 0.08}} />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedCommunity !== null && (() => {
        const c = communities[selectedCommunity];
        return (
          <div className="p-4 rounded-lg" style={{background: c.bg, border: `1px solid ${c.color}33`}}>
            <div className="font-semibold mb-2" style={{color: c.color, fontSize: 13}}>{c.name}</div>
            <div className="mb-3">
              <div className="text-xs font-semibold mb-1" style={{color: GIM.mutedText}}>ENTITIES IN COMMUNITY:</div>
              <div className="flex flex-wrap gap-1">
                {c.entities.map(e => (
                  <span key={e} className="px-2 py-0.5 rounded text-xs" style={{background: 'white', color: c.color, border: `1px solid ${c.color}44`}}>{e}</span>
                ))}
              </div>
            </div>
            <div className="mb-3 p-3 rounded" style={{background: 'white'}}>
              <div className="text-xs font-semibold mb-1" style={{color: GIM.mutedText}}>COMMUNITY SUMMARY (GraphRAG generates this):</div>
              <p style={{fontSize: 12, color: GIM.bodyText, lineHeight: 1.6}}>{c.summary}</p>
            </div>
            <div className="mb-3">
              <div className="text-xs font-semibold mb-1" style={{color: GIM.mutedText}}>BRIDGES TO:</div>
              <div className="flex gap-1">
                {c.bridges.map(b => (
                  <span key={b} className="px-2 py-0.5 rounded text-xs" style={{background: '#FFFBEB', color: '#92400E'}}>{b}</span>
                ))}
              </div>
            </div>
            <div className="p-2 rounded" style={{background: `${c.color}11`, border: `1px solid ${c.color}33`}}>
              <span className="text-xs font-semibold" style={{color: c.color}}>Global Insight: </span>
              <span style={{fontSize: 12, color: GIM.headingText}}>{c.globalInsight}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export function RetrievalStrategyComparator({onNavigate, onComplete}) {
  const [query, setQuery] = useState('What are the relationships between transformer architecture and attention mechanisms?');
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});

  const strategies = [
    {
      key: 'vector',
      name: 'Vector Search',
      color: '#3B6B9B',
      bg: '#EFF6FF',
      icon: '🔢',
      latency: '45ms',
      steps: ['Embed query → 1536-dim vector', 'ANN search in vector index', 'Return top-k by cosine similarity'],
    },
    {
      key: 'graph',
      name: 'Graph Traversal',
      color: '#2D8A6E',
      bg: '#EBF5F1',
      icon: '🕸️',
      latency: '180ms',
      steps: ['Extract entities from query', 'Find entity nodes in graph', 'BFS/DFS up to N hops', 'Collect connected context'],
    },
    {
      key: 'keyword',
      name: 'Keyword / BM25',
      color: '#E8734A',
      bg: '#FEF9F5',
      icon: '🔍',
      latency: '12ms',
      steps: ['Tokenize query', 'BM25 scoring against inverted index', 'Return top-k by TF-IDF relevance'],
    },
  ];

  const mockResults = {
    vector: {
      chunks: [
        {score: 0.94, text: '"Attention is All You Need" (Vaswani et al. 2017) introduced the transformer architecture, which relies entirely on self-attention mechanisms...'},
        {score: 0.89, text: 'The multi-head attention mechanism allows the model to jointly attend to information from different representation subspaces...'},
        {score: 0.85, text: 'Transformers replaced recurrence with attention, enabling parallel processing and capturing long-range dependencies...'},
      ],
      strength: 'Finds semantically related passages even without exact keyword overlap',
      weakness: 'Misses entity connections: cannot reveal that "BERT" and "GPT" are both transformer-based without that phrase appearing',
    },
    graph: {
      chunks: [
        {score: 0.97, text: 'Entity path: Transformer → IMPLEMENTS → Attention Mechanism → INVENTED_BY → Vaswani et al. → PUBLISHED_IN → NeurIPS 2017'},
        {score: 0.92, text: 'Community: Transformer Models [GPT-4, BERT, T5, LLaMA] all implement Multi-Head Attention — 4 hops from query entities'},
        {score: 0.88, text: 'Cross-community bridge: Attention Mechanism → INSPIRED → Biological Visual Attention → studied by → Neuroscience Community'},
      ],
      strength: 'Surfaces multi-hop connections: shows ALL transformer variants and their inventors, across document boundaries',
      weakness: 'Slow for broad similarity queries; misses content not yet indexed as graph entities',
    },
    keyword: {
      chunks: [
        {score: 0.98, text: '"transformer architecture" AND "attention mechanisms" co-occur in: Section 3.2 of the original paper, 847 citing papers...'},
        {score: 0.91, text: 'Exact match: "attention mechanism" appears 2,847 times in corpus. Top document: "Attention is All You Need" (BM25: 24.3)'},
        {score: 0.76, text: 'Partial match: "transformer" without "attention": 12,445 documents. May include unrelated transformers (electrical).'},
      ],
      strength: 'Highest precision for exact term lookup; extremely fast; no hallucination risk',
      weakness: '"Self-attention" and "attention mechanism" are scored independently; no semantic understanding; misses synonyms',
    },
  };

  const runStrategy = (key) => {
    setRunning(key);
    setTimeout(() => {
      setResults(prev => ({...prev, [key]: mockResults[key]}));
      setRunning(null);
    }, 800);
  };

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Interactive: Retrieval Strategy Comparator
      </h4>
      <p className="mb-3" style={{fontSize: 12, color: GIM.mutedText}}>Run the same query through all three retrieval strategies and compare results.</p>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-3 py-2 rounded border text-xs mb-3"
        style={{borderColor: GIM.border}}
        placeholder="Enter your query..."
      />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {strategies.map(s => (
          <div key={s.key} className="rounded-lg border overflow-hidden" style={{borderColor: GIM.border}}>
            <button
              onClick={() => runStrategy(s.key)}
              disabled={running === s.key}
              className="w-full p-3 text-left transition-all"
              style={{background: results[s.key] ? s.bg : 'white'}}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs" style={{color: s.color}}>{s.icon} {s.name}</span>
                <span style={{fontSize: 10, color: GIM.mutedText}}>{s.latency}</span>
              </div>
              {running === s.key ? (
                <div style={{fontSize: 10, color: GIM.mutedText}}>Running...</div>
              ) : (
                <div style={{fontSize: 10, color: s.color, fontWeight: 600}}>
                  {results[s.key] ? '✓ Done — see results below' : 'Click to run →'}
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {strategies.filter(s => results[s.key]).map(s => (
            <div key={s.key} className="p-3 rounded-lg" style={{background: s.bg, border: `1px solid ${s.color}33`}}>
              <div className="font-semibold text-xs mb-2" style={{color: s.color}}>{s.name} Results</div>
              {results[s.key].chunks.map((chunk, i) => (
                <div key={i} className="flex gap-2 mb-1.5 items-start">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-mono font-bold shrink-0"
                    style={{background: s.color, color: 'white', fontSize: 9}}
                  >
                    {chunk.score}
                  </span>
                  <p style={{fontSize: 11, color: GIM.bodyText, lineHeight: 1.5}}>{chunk.text}</p>
                </div>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="p-2 rounded text-xs" style={{background: '#EBF5F1'}}>
                  <span className="font-semibold" style={{color: '#2D8A6E'}}>+ </span>
                  {results[s.key].strength}
                </div>
                <div className="p-2 rounded text-xs" style={{background: '#FEF2F2'}}>
                  <span className="font-semibold" style={{color: '#EF4444'}}>- </span>
                  {results[s.key].weakness}
                </div>
              </div>
            </div>
          ))}
          {Object.keys(results).length === 3 && (
            <div className="p-3 rounded-lg" style={{background: '#FFFBEB', border: '1px solid #F59E0B44'}}>
              <div className="font-semibold text-xs mb-1" style={{color: '#92400E'}}>Hybrid Fusion Insight:</div>
              <p style={{fontSize: 12, color: GIM.bodyText, lineHeight: 1.6}}>
                Combining all three: keyword search finds the exact original paper, vector search finds semantically related work, and graph traversal reveals the entire family of transformer-based models. RRF (Reciprocal Rank Fusion) merges these ranked lists into one optimal result.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GraphDesignChallenge({onNavigate, onComplete}) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 'q1',
      scenario: 'You are building a knowledge graph for a medical research corpus. A paper can cite other papers and describe drug interactions. Design the entity types.',
      options: ['Paper, Author, Drug, Disease, Organization', 'Text, Vector, Chunk, Index', 'File, Folder, Database', 'Node, Edge, Property'],
      correct: 0,
      explanation: 'Domain-specific entity types (Paper, Author, Drug, Disease) create a rich, queryable ontology. Generic technical types like "Node" lose all semantic meaning.'
    },
    {
      id: 'q2',
      scenario: 'A user asks "Which drugs interact with both aspirin and ibuprofen?" through your medical GraphRAG system. Which retrieval strategy should handle this?',
      options: ['Vector search only', 'BM25 keyword search', 'Graph traversal: aspirin -> INTERACTS_WITH -> [drugs] intersect ibuprofen -> INTERACTS_WITH -> [drugs]', 'LLM with no retrieval'],
      correct: 2,
      explanation: 'This is a graph intersection query: find the overlap of two entity neighborhoods. Graph traversal directly answers set-intersection questions that would require multiple vector searches and manual merging.'
    },
    {
      id: 'q3',
      scenario: '"What are the major research trends across our 10,000 medical papers?" Which GraphRAG search mode answers this?',
      options: ['Local search -- query specific entities', 'Global search -- synthesize community summaries', 'BM25 -- find exact keyword matches', 'Direct LLM call -- no retrieval needed'],
      correct: 1,
      explanation: 'Global questions about the entire corpus require global search, which uses community summaries generated from the knowledge graph. Local search and BM25 only surface individual documents, not corpus-wide patterns.'
    },
  ];

  const setAnswer = (qid, idx) => {
    if (!submitted) setAnswers(a => ({...a, [qid]: idx}));
  };

  const score = submitted ? questions.filter(q => answers[q.id] === q.correct).length : 0;

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Knowledge Graph Design Challenge
      </h4>
      <p className="mb-3" style={{fontSize: 12, color: GIM.mutedText}}>
        Design decisions for a production GraphRAG system. Select the best answer for each scenario.
      </p>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="p-3 rounded-lg" style={{background: GIM.borderLight}}>
            <p className="mb-2" style={{fontSize: 12, color: GIM.headingText, lineHeight: 1.6, fontWeight: 600}}>
              Scenario {qi + 1}: {q.scenario}
            </p>
            <div className="space-y-1">
              {q.options.map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                const isCorrect = oi === q.correct;
                const showFeedback = submitted;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswer(q.id, oi)}
                    className="w-full text-left px-3 py-2 rounded text-xs transition-all"
                    style={{
                      background: showFeedback
                        ? isCorrect ? '#EBF5F1' : isSelected ? '#FEF2F2' : 'white'
                        : isSelected ? '#EFF6FF' : 'white',
                      border: `1px solid ${showFeedback ? (isCorrect ? '#2D8A6E' : isSelected ? '#EF4444' : GIM.border) : isSelected ? '#3B6B9B' : GIM.border}`,
                      color: showFeedback ? (isCorrect ? '#166534' : isSelected ? '#991B1B' : GIM.bodyText) : GIM.bodyText,
                      cursor: submitted ? 'default' : 'pointer',
                    }}
                  >
                    {opt} {showFeedback && isCorrect && '\u2713'}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-2 p-2 rounded text-xs" style={{background: '#EBF5F1', color: '#166534'}}>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      {!submitted && Object.keys(answers).length === questions.length && (
        <button
          onClick={() => setSubmitted(true)}
          className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{background: GIM.primary, color: 'white'}}
        >
          Submit Answers
        </button>
      )}
      {submitted && (
        <div className="mt-3 p-3 rounded-lg text-center" style={{background: score === questions.length ? '#EBF5F1' : '#FFFBEB'}}>
          <div className="font-bold" style={{color: score === questions.length ? '#2D8A6E' : '#92400E', fontSize: 14}}>
            {score}/{questions.length} correct
          </div>
          <div style={{fontSize: 11, color: GIM.mutedText}}>
            {score === questions.length ? 'Perfect design instincts!' : 'Review the explanations above.'}
          </div>
        </div>
      )}
    </div>
  );
}

export function HybridSearchOptimizer() {
  const [vectorWeight, setVectorWeight] = useState(40);
  const [graphWeight, setGraphWeight] = useState(40);
  const [bm25Weight, setBm25Weight] = useState(20);
  const [queryType, setQueryType] = useState('relational');

  const queryTypes = {
    relational: {label: 'Relational ("How are X and Y connected?")', optimal: {v: 20, g: 70, b: 10}},
    semantic: {label: 'Semantic ("Find similar concepts to X")', optimal: {v: 70, g: 20, b: 10}},
    exact: {label: 'Exact ("Find document ID: DOC-2847")', optimal: {v: 10, g: 10, b: 80}},
    thematic: {label: 'Thematic ("Main themes across all docs")', optimal: {v: 30, g: 60, b: 10}},
  };

  const optimal = queryTypes[queryType].optimal;
  const distance = Math.round(
    (Math.abs(vectorWeight - optimal.v) + Math.abs(graphWeight - optimal.g) + Math.abs(bm25Weight - optimal.b)) / 3
  );
  const quality = Math.max(0, 100 - distance);
  const total = vectorWeight + graphWeight + bm25Weight;

  return (
    <div className="rounded-xl border p-4 mb-4" style={{borderColor: GIM.border, background: GIM.cardBg}}>
      <h4 className="font-semibold mb-2" style={{fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain}}>
        Hybrid Search Weight Optimizer
      </h4>
      <p className="mb-3" style={{fontSize: 12, color: GIM.mutedText}}>
        Adjust retrieval weights for different query types and see estimated result quality.
      </p>
      <div className="mb-3">
        <div className="text-xs font-semibold mb-1" style={{color: GIM.mutedText}}>QUERY TYPE:</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(queryTypes).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setQueryType(key)}
              className="px-2 py-1 rounded text-xs font-semibold transition-all"
              style={{
                background: queryType === key ? GIM.primary : GIM.borderLight,
                color: queryType === key ? 'white' : GIM.bodyText,
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs" style={{color: GIM.mutedText}}>{queryTypes[queryType].label}</p>
      </div>
      <div className="space-y-3 mb-3">
        {[
          {label: 'Vector Weight', val: vectorWeight, set: setVectorWeight, color: '#3B6B9B'},
          {label: 'Graph Weight', val: graphWeight, set: setGraphWeight, color: '#2D8A6E'},
          {label: 'BM25 Weight', val: bm25Weight, set: setBm25Weight, color: '#E8734A'},
        ].map(({label, val, set, color}) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{color: GIM.bodyText}}>{label}</span>
              <span style={{color, fontWeight: 600}}>{val}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={val}
              onChange={e => set(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{accentColor: color}}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span style={{fontSize: 11, color: GIM.mutedText}}>Total weight: {total}% {total !== 100 ? '(should sum to 100%)' : ''}</span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{background: quality > 80 ? '#EBF5F1' : quality > 50 ? '#FFFBEB' : '#FEF2F2'}}>
        <div>
          <div style={{fontSize: 11, color: GIM.mutedText}}>Estimated Quality</div>
          <div className="font-bold" style={{fontSize: 18, color: quality > 80 ? '#2D8A6E' : quality > 50 ? '#92400E' : '#EF4444'}}>{quality}%</div>
        </div>
        <div className="flex-1 h-3 rounded-full" style={{background: GIM.borderLight}}>
          <div className="h-3 rounded-full transition-all" style={{
            width: `${quality}%`,
            background: quality > 80 ? '#2D8A6E' : quality > 50 ? '#F59E0B' : '#EF4444'
          }} />
        </div>
      </div>
      {quality < 80 && (
        <div className="mt-2 text-xs p-2 rounded" style={{background: GIM.borderLight, color: GIM.mutedText}}>
          Optimal for {queryType}: Vector {optimal.v}% / Graph {optimal.g}% / BM25 {optimal.b}%
        </div>
      )}
    </div>
  );
}

export function DecisionTreeExplorer(){
  const[answers,setAnswers]=useState({});
  const questions=[
    {id:'q1',text:'Do you need the model to follow a specific output format consistently?',yes:'q2',no:'q3'},
    {id:'q2',text:'Have you tried few-shot prompting with 5+ examples?',yes:'q4',no:'r_prompt'},
    {id:'q3',text:'Do you need domain-specific knowledge not in the base model?',yes:'q5',no:'r_prompt'},
    {id:'q4',text:'Does the model still fail >20% of the time with optimized prompts?',yes:'r_finetune',no:'r_prompt'},
    {id:'q5',text:'Is the knowledge available in documents you can use for RAG?',yes:'r_rag',no:'r_finetune'},
  ];
  const results={
    r_prompt:{text:'Prompt Engineering is likely sufficient. Optimize your prompts with few-shot examples and structured output instructions before investing in fine-tuning.',color:'#2D8A6E'},
    r_finetune:{text:'Fine-tuning is recommended. You have a clear pattern the model needs to learn that prompting alone cannot reliably capture.',color:'#E8734A'},
    r_rag:{text:'RAG (Retrieval-Augmented Generation) is the better path. Your knowledge is in documents, so retrieve relevant context at inference time instead of baking it into weights.',color:'#3B6B9B'},
  };
  const currentQ=answers.q1===undefined?'q1':Object.entries(answers).reduce((curr,_)=>{
    let node='q1';
    while(node&&node.startsWith('q')){const a=answers[node];if(a===undefined)return node;const q=questions.find(x=>x.id===node);node=a?q.yes:q.no;}
    return node;
  },'q1');
  const isResult=currentQ&&currentQ.startsWith('r_');
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDF33'} Decision Tree: Should You Fine-Tune?</h4>
    {!isResult&&questions.filter(q=>q.id===currentQ).map(q=><div key={q.id}>
      <p className="mb-3" style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>{q.text}</p>
      <div className="flex gap-2">
        <button onClick={()=>setAnswers(a=>({...a,[q.id]:true}))} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:'#EBF5F1',color:'#2D8A6E',border:'1px solid #2D8A6E'}}>Yes</button>
        <button onClick={()=>setAnswers(a=>({...a,[q.id]:false}))} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:'#FEF2F2',color:'#EF4444',border:'1px solid #EF4444'}}>No</button>
      </div>
    </div>)}
    {isResult&&<div>
      <div className="p-3 rounded-lg mb-3" style={{background:results[currentQ].color+'15',border:`1px solid ${results[currentQ].color}`}}>
        <p style={{fontSize:13,color:results[currentQ].color,fontWeight:600}}>{results[currentQ].text}</p>
      </div>
      <button onClick={()=>setAnswers({})} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Try Again</button>
    </div>}
    <p className="mt-3" style={{fontSize:11,color:GIM.mutedText}}>Step {Object.keys(answers).length+1} of ~5</p>
  </div>;
}

export function DataQualityChecker(){
  const[samples,setSamples]=useState([
    {input:'Summarize this article about AI safety',output:'AI safety is important.',quality:null},
    {input:'Summarize this article about AI safety',output:'AI safety is important.',quality:null},
    {input:'What is machine learning?',output:'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.',quality:null},
    {input:'',output:'This is a great response about nothing.',quality:null},
    {input:'Translate to French: Hello world',output:'Bonjour le monde',quality:null},
  ]);
  const issues=['duplicate','duplicate','good','empty_input','good'];
  const[checked,setChecked]=useState(false);
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD0D'} Data Quality Checker</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Review these training samples. Can you spot the issues?</p>
    {samples.map((s,i)=><div key={i} className="p-2 rounded-lg mb-2" style={{background:checked?(issues[i]==='good'?'#EBF5F1':'#FEF2F2'):'white',border:`1px solid ${GIM.border}`}}>
      <p style={{fontSize:11,color:GIM.mutedText}}>Input: <span style={{color:GIM.bodyText}}>{s.input||'(empty)'}</span></p>
      <p style={{fontSize:11,color:GIM.mutedText}}>Output: <span style={{color:GIM.bodyText}}>{s.output}</span></p>
      {checked&&<p style={{fontSize:11,fontWeight:600,color:issues[i]==='good'?'#2D8A6E':'#EF4444',marginTop:4}}>{issues[i]==='duplicate'?'\u26A0\uFE0F Duplicate pair':issues[i]==='empty_input'?'\u26A0\uFE0F Empty input field':'\u2713 Good sample'}</p>}
    </div>)}
    <button onClick={()=>setChecked(true)} className="px-4 py-1.5 rounded-lg text-xs font-semibold mt-2" style={{background:GIM.primary,color:'white'}}>{checked?'Issues Revealed':'Check Quality'}</button>
    {checked&&<p className="mt-2" style={{fontSize:12,color:GIM.bodyText}}>Found: 2 duplicates, 1 empty input. Clean datasets remove duplicates, filter empty fields, and ensure output quality before training.</p>}
  </div>;
}

export function LoRAVisualizer(){
  const[technique,setTechnique]=useState('full');
  const techniques={
    full:{name:'Full Fine-Tuning',params:'7B',trainable:'7B (100%)',vram:'~60 GB',cost:'$$$',desc:'Updates all model weights. Most expressive but requires significant compute and risks catastrophic forgetting.'},
    lora:{name:'LoRA',params:'7B',trainable:'~8M (0.1%)',vram:'~16 GB',cost:'$',desc:'Adds small trainable rank-decomposition matrices alongside frozen weights. Same quality as full fine-tuning for most tasks at a fraction of the cost.'},
    qlora:{name:'QLoRA',params:'7B',trainable:'~8M (0.1%)',vram:'~6 GB',cost:'$',desc:'Combines 4-bit quantization with LoRA. Enables fine-tuning 65B models on a single GPU. Slight quality trade-off for massive efficiency gains.'},
  };
  const t=techniques[technique];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83E\uDDE9'} Compare Fine-Tuning Techniques</h4>
    <div className="flex gap-2 mb-3">{Object.entries(techniques).map(([k,v])=><button key={k} onClick={()=>setTechnique(k)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:technique===k?GIM.primary:'white',color:technique===k?'white':GIM.primary,border:`1px solid ${GIM.primary}`}}>{v.name}</button>)}</div>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p style={{fontSize:11,color:GIM.mutedText}}>Total Params</p><p style={{fontSize:14,fontWeight:600,color:GIM.headingText}}>{t.params}</p></div>
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p style={{fontSize:11,color:GIM.mutedText}}>Trainable</p><p style={{fontSize:14,fontWeight:600,color:GIM.primary}}>{t.trainable}</p></div>
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p style={{fontSize:11,color:GIM.mutedText}}>VRAM Needed</p><p style={{fontSize:14,fontWeight:600,color:GIM.headingText}}>{t.vram}</p></div>
      <div className="p-2 rounded-lg" style={{background:GIM.borderLight}}><p style={{fontSize:11,color:GIM.mutedText}}>Relative Cost</p><p style={{fontSize:14,fontWeight:600,color:'#E8734A'}}>{t.cost}</p></div>
    </div>
    <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>{t.desc}</p>
    {technique==='lora'&&<div className="mt-3 p-3 rounded-lg" style={{background:'#EBF5F1',border:'1px solid #2D8A6E'}}>
      <p style={{fontSize:12,color:'#166534'}}>LoRA works by decomposing weight updates into two small matrices: W = W₀ + BA, where B (d×r) and A (r×d) have rank r {'<<'} d. With r=8, a 4096×4096 layer goes from 16M to 65K trainable params.</p>
    </div>}
  </div>;
}

export function DistillationSimulator(){
  const[step,setStep]=useState(0);
  const[temperature,setTemperature]=useState(4);
  const steps=[
    {title:'1. Teacher generates soft labels',desc:'The large teacher model produces probability distributions (soft labels) over all tokens, not just the top prediction. At temperature T=4, the distribution is smoothed to reveal relationships between similar tokens.'},
    {title:'2. Student learns from soft labels',desc:'The small student model trains to match the teacher\'s probability distribution. This transfers "dark knowledge" -- the teacher\'s understanding of which wrong answers are more plausible than others.'},
    {title:'3. Combined loss function',desc:'The student optimizes a weighted combination of: (a) soft label matching with teacher at temperature T, and (b) hard label matching with ground truth. Alpha controls the balance.'},
    {title:'4. Student graduates',desc:'After training, the student model runs at temperature T=1 (normal inference). It\'s now a smaller, faster model that captures much of the teacher\'s behavior at a fraction of the cost.'},
  ];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDF93'} Distillation Process Walkthrough</h4>
    <div className="mb-3 p-3 rounded-lg" style={{background:GIM.borderLight}}>
      <p style={{fontSize:13,fontWeight:600,color:GIM.primary,marginBottom:4}}>{steps[step].title}</p>
      <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6}}>{steps[step].desc}</p>
    </div>
    <div className="flex gap-2 mb-3">{steps.map((_,i)=><div key={i} onClick={()=>setStep(i)} className="h-2 rounded-full cursor-pointer" style={{flex:1,background:i<=step?GIM.primary:GIM.border}}/>)}</div>
    <div className="flex gap-2">
      {step>0&&<button onClick={()=>setStep(s=>s-1)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{border:`1px solid ${GIM.border}`,color:GIM.mutedText}}>Back</button>}
      {step<steps.length-1&&<button onClick={()=>setStep(s=>s+1)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next</button>}
    </div>
    <div className="mt-3">
      <label style={{fontSize:11,color:GIM.mutedText}}>Temperature (T): {temperature}</label>
      <input type="range" min={1} max={20} value={temperature} onChange={e=>setTemperature(Number(e.target.value))} className="w-full" style={{accentColor:GIM.primary}}/>
      <p style={{fontSize:11,color:GIM.mutedText}}>{temperature<3?'Low T: Sharper distributions, less dark knowledge transferred':temperature<8?'Medium T: Good balance of knowledge transfer and signal clarity':'High T: Very soft distributions, maximum dark knowledge but noisier signal'}</p>
    </div>
  </div>;
}

export function PipelineBuilder(){
  const[config,setConfig]=useState({model:'llama-3-8b',technique:'lora',lr:'2e-4',epochs:3,batchSize:4,rank:16,dataSize:1000});
  const[running,setRunning]=useState(false);
  const[step,setStep]=useState(0);
  const[results,setResults]=useState(null);
  const models=[{id:'llama-3-8b',name:'Llama 3 8B',size:8},{id:'llama-3-70b',name:'Llama 3 70B',size:70},{id:'mistral-7b',name:'Mistral 7B',size:7},{id:'gpt-3.5',name:'GPT-3.5 Turbo',size:20}];
  const selectedModel=models.find(m=>m.id===config.model);
  const vramNeeded=config.technique==='full'?selectedModel.size*8:config.technique==='lora'?selectedModel.size*2:selectedModel.size*0.75;
  const trainTime=Math.round((config.dataSize/1000)*config.epochs*(config.technique==='full'?10:config.technique==='lora'?3:2)*(selectedModel.size/7));

  const simulate=()=>{
    setRunning(true);setStep(0);setResults(null);
    const steps=[0,1,2,3,4];
    steps.forEach((s,i)=>setTimeout(()=>{
      setStep(s+1);
      if(s===4){
        setRunning(false);
        const quality=Math.min(95,70+(config.dataSize/200)+(config.technique==='full'?5:config.technique==='lora'?3:1)+(config.epochs>1?5:0));
        setResults({quality:quality.toFixed(1),vram:`${vramNeeded.toFixed(0)} GB`,time:`~${trainTime} min`,cost:`~$${(trainTime*0.02).toFixed(2)}`});
      }
    },(i+1)*600));
  };

  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDE80'} Fine-Tuning Pipeline Builder</h4>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label style={{fontSize:11,color:GIM.mutedText,display:'block',marginBottom:4}}>Base Model</label>
        <select value={config.model} onChange={e=>setConfig(c=>({...c,model:e.target.value}))} className="w-full p-2 rounded-lg text-xs" style={{border:`1px solid ${GIM.border}`,background:'white',color:GIM.bodyText}}>
          {models.map(m=><option key={m.id} value={m.id}>{m.name} ({m.size}B params)</option>)}
        </select>
      </div>
      <div>
        <label style={{fontSize:11,color:GIM.mutedText,display:'block',marginBottom:4}}>Technique</label>
        <select value={config.technique} onChange={e=>setConfig(c=>({...c,technique:e.target.value}))} className="w-full p-2 rounded-lg text-xs" style={{border:`1px solid ${GIM.border}`,background:'white',color:GIM.bodyText}}>
          <option value="full">Full Fine-Tuning</option>
          <option value="lora">LoRA</option>
          <option value="qlora">QLoRA</option>
        </select>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div>
        <label style={{fontSize:11,color:GIM.mutedText,display:'block',marginBottom:4}}>Epochs: {config.epochs}</label>
        <input type="range" min={1} max={10} value={config.epochs} onChange={e=>setConfig(c=>({...c,epochs:Number(e.target.value)}))} className="w-full" style={{accentColor:GIM.primary}}/>
      </div>
      <div>
        <label style={{fontSize:11,color:GIM.mutedText,display:'block',marginBottom:4}}>Batch Size: {config.batchSize}</label>
        <input type="range" min={1} max={32} step={1} value={config.batchSize} onChange={e=>setConfig(c=>({...c,batchSize:Number(e.target.value)}))} className="w-full" style={{accentColor:GIM.primary}}/>
      </div>
      <div>
        <label style={{fontSize:11,color:GIM.mutedText,display:'block',marginBottom:4}}>Dataset: {config.dataSize}</label>
        <input type="range" min={100} max={10000} step={100} value={config.dataSize} onChange={e=>setConfig(c=>({...c,dataSize:Number(e.target.value)}))} className="w-full" style={{accentColor:GIM.primary}}/>
      </div>
    </div>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight}}>
      <p style={{fontSize:12,color:GIM.mutedText}}>Estimated VRAM: <b style={{color:vramNeeded>48?'#EF4444':vramNeeded>24?'#E8734A':'#2D8A6E'}}>{vramNeeded.toFixed(0)} GB</b> | Training time: <b style={{color:GIM.headingText}}>~{trainTime} min</b> | Cost: <b style={{color:GIM.headingText}}>~${(trainTime*0.02).toFixed(2)}</b></p>
    </div>
    {running&&<div className="mb-3">
      <div className="flex gap-1">{[1,2,3,4,5].map(s=><div key={s} className="h-2 rounded-full" style={{flex:1,background:step>=s?GIM.primary:GIM.border,transition:'background 0.3s'}}/>)}</div>
      <p className="mt-1" style={{fontSize:11,color:GIM.mutedText}}>{['','Loading model...','Preparing data...','Training...','Evaluating...','Done!'][step]}</p>
    </div>}
    {!running&&!results&&<button onClick={simulate} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Run Training Pipeline</button>}
    {results&&<div className="p-3 rounded-lg" style={{background:'#EBF5F1',border:'1px solid #2D8A6E'}}>
      <p style={{fontSize:13,fontWeight:600,color:'#166534',marginBottom:4}}>Training Complete!</p>
      <div className="grid grid-cols-4 gap-2">{Object.entries(results).map(([k,v])=><div key={k}><p style={{fontSize:10,color:GIM.mutedText}}>{k}</p><p style={{fontSize:13,fontWeight:600,color:'#2D8A6E'}}>{v}{k==='quality'?'%':''}</p></div>)}</div>
      <button onClick={()=>{setResults(null);setStep(0)}} className="mt-2 px-3 py-1 rounded-lg text-xs" style={{border:`1px solid ${GIM.border}`,color:GIM.mutedText}}>Reset</button>
    </div>}
  </div>;
}
