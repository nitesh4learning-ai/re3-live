"use client";
import { useState, useEffect } from "react";
import { GIM, CODE_BG, CODE_TEXT } from "./Academy";

function TokenCounter(){
  const[text,setText]=useState('');
  const estimate=(t)=>{
    if(!t.trim())return{tokens:[],count:0,chars:0};
    const parts=t.match(/[\w']+|[^\s\w]+|\s+/g)||[];
    const tokens=[];
    parts.forEach(w=>{
      if(/^\s+$/.test(w))return;
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
  const reveal=()=>{if(!guess.trim())return;const d=Math.abs(Number(guess)-c.actual);setRevealed(true);if(d<=1)setScore(s=>s+1)};
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

// ==================== INTERACTIVE: PROMPT BUILDER ====================
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

// ==================== INTERACTIVE: SIMILARITY CALCULATOR ====================
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

// ==================== INTERACTIVE: HALLUCINATION DETECTOR ====================
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

// ==================== INTERACTIVE: PIPELINE ORDER GAME ====================
function PipelineOrderGame(){
  const stages=['Ingest Documents','Chunk Text','Generate Embeddings','Store in Vector DB','Receive Query','Retrieve Similar Chunks','Generate Response'];
  const[order,setOrder]=useState([]);const[available,setAvailable]=useState([...stages]);const[checked,setChecked]=useState(false);
  useEffect(()=>{setAvailable(prev=>[...prev].sort(()=>Math.random()-0.5))},[]);
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

function ContextBudgetAllocator(){
  const[system,setSystem]=useState(800);const[retrieval,setRetrieval]=useState(1500);const[conversation,setConversation]=useState(1000);
  const total=4096;const used=system+retrieval+conversation;const userQuery=Math.max(0,total-used);
  const getWarnings=()=>{const w=[];if(system<200)w.push('Too little system prompt \u2014 model behavior will be inconsistent');if(retrieval<500)w.push('Low retrieval budget \u2014 higher hallucination risk');if(conversation<300)w.push('Minimal conversation memory \u2014 model will forget context');if(userQuery<200)w.push('Very little room for user query');return w;};
  const quality=Math.min(100,Math.round((system>400?25:system/16)+(retrieval>800?25:retrieval/32)+(conversation>500?25:conversation/20)+(userQuery>300?25:userQuery/12)));
  const warnings=getWarnings();
  const Bar=({label,value,max,color,onChange})=><div className="mb-2"><div className="flex justify-between mb-1"><span style={{fontSize:11,color:GIM.bodyText}}>{label}</span><span style={{fontSize:11,color:GIM.mutedText}}>{value} tokens</span></div><input type="range" min="0" max={max} value={value} onChange={e=>onChange(Number(e.target.value))} className="w-full" style={{accentColor:color}}/></div>;
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83C\uDFAF'} Context Budget Allocator</h4>
    <p className="mb-3" style={{fontSize:12,color:GIM.mutedText}}>Allocate a 4,096-token budget across context layers. Watch how allocation affects quality.</p>
    <Bar label="System Prompt" value={system} max={2000} color="#9333EA" onChange={setSystem}/>
    <Bar label="Retrieved Documents" value={retrieval} max={3000} color="#3B82F6" onChange={setRetrieval}/>
    <Bar label="Conversation History" value={conversation} max={2000} color="#2D8A6E" onChange={setConversation}/>
    <div className="flex justify-between mb-2"><span style={{fontSize:11,color:GIM.bodyText}}>User Query (remaining)</span><span style={{fontSize:11,color:userQuery<200?'#EF4444':GIM.mutedText,fontWeight:userQuery<200?700:400}}>{userQuery} tokens</span></div>
    <div className="w-full h-6 rounded-full overflow-hidden flex mb-3" style={{background:GIM.borderLight}}>
      <div style={{width:`${(system/total)*100}%`,background:'#9333EA',height:'100%'}}/>
      <div style={{width:`${(retrieval/total)*100}%`,background:'#3B82F6',height:'100%'}}/>
      <div style={{width:`${(conversation/total)*100}%`,background:'#2D8A6E',height:'100%'}}/>
      <div style={{width:`${(userQuery/total)*100}%`,background:'#F59E0B',height:'100%'}}/>
    </div>
    <div className="flex items-center gap-2 mb-2"><span style={{fontSize:12,color:GIM.bodyText}}>Quality Estimate:</span><span className="font-bold" style={{fontSize:18,color:quality>70?'#2D8A6E':quality>40?'#F59E0B':'#EF4444'}}>{quality}%</span></div>
    {warnings.length>0&&<div className="p-2 rounded-lg" style={{background:'#FEF2F2'}}>{warnings.map((w,i)=><p key={i} style={{fontSize:11,color:'#991B1B',marginBottom:2}}>{'\u26A0\uFE0F'} {w}</p>)}</div>}
  </div>;
}

function BiasDetectorGame(){
  const scenarios=[
    {text:'Our ideal candidate is a dynamic young professional who thrives in a fast-paced "bro culture" environment. Must be able to keep up with weekend team-building events.',bias:'Age and gender bias',type:'age',explanation:'Phrases like "young professional" and "bro culture" discriminate against older candidates and women.'},
    {text:'The AI loan approval system was trained on 10 years of historical lending data. It consistently approves applicants from zip codes 90210 and 10021 at 3x the rate of other areas.',bias:'Socioeconomic/geographic bias',type:'socioeconomic',explanation:'Historical lending data often encodes redlining and socioeconomic discrimination. The model learned to use zip code as a proxy for wealth/race.'},
    {text:'Patient presents with chest pain. Recommendation: Refer to cardiologist immediately. Note: Based on training data, chest pain in female patients is 40% less likely to receive urgent referral.',bias:'Gender bias in medical AI',type:'gender',explanation:'Medical AI trained on historical data inherits the well-documented bias of underdiagnosing heart conditions in women.'},
  ];
  const[current,setCurrent]=useState(0);const[selected,setSelected]=useState(null);const[score,setScore]=useState(0);
  const s=scenarios[current];const options=['Gender bias','Age bias','Socioeconomic bias','Racial bias','No bias present'];
  const correctMap={age:1,socioeconomic:2,gender:0};const correctIdx=correctMap[s.type];
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDD0D'} Spot the Bias ({current+1}/{scenarios.length})</h4>
    <div className="p-3 rounded-lg mb-3" style={{background:GIM.borderLight,border:`1px solid ${GIM.border}`}}>
      <p style={{fontSize:13,color:GIM.bodyText,lineHeight:1.6,fontStyle:'italic'}}>"{s.text}"</p>
    </div>
    <p className="mb-2" style={{fontSize:12,color:GIM.mutedText}}>What type of bias is present?</p>
    <div className="space-y-2 mb-3">{options.map((opt,i)=><button key={i} onClick={()=>{if(selected===null){setSelected(i);if(i===correctIdx)setScore(sc=>sc+1);}}} className="w-full text-left p-2.5 rounded-lg border transition-all" style={{borderColor:selected!==null?(i===correctIdx?'#2D8A6E':i===selected?'#EF4444':GIM.border):GIM.border,background:selected!==null?(i===correctIdx?'#EBF5F1':i===selected&&i!==correctIdx?'#FEF2F2':'white'):'white',cursor:selected!==null?'default':'pointer',fontSize:13,color:GIM.bodyText}}>{opt}{selected!==null&&i===correctIdx&&' \u2713'}</button>)}</div>
    {selected!==null&&<div className="p-3 rounded-lg mb-3" style={{background:'#F0F9FF'}}><p style={{fontSize:12,color:GIM.bodyText}}><b>{s.bias}:</b> {s.explanation}</p></div>}
    {selected!==null&&current<scenarios.length-1&&<button onClick={()=>{setCurrent(c=>c+1);setSelected(null);}} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Next Scenario</button>}
    {selected!==null&&current===scenarios.length-1&&<p className="font-semibold" style={{color:'#2D8A6E',fontSize:13}}>Done! {score}/{scenarios.length} correct</p>}
  </div>;
}

function ModelCostCalculator(){
  const models=[
    {name:'GPT-4o',inputPrice:2.50,outputPrice:10.00,color:'#10A37F'},
    {name:'Claude 3.5 Sonnet',inputPrice:3.00,outputPrice:15.00,color:'#D97706'},
    {name:'Gemini 1.5 Pro',inputPrice:1.25,outputPrice:5.00,color:'#4285F4'},
    {name:'Llama 3.1 70B (Groq)',inputPrice:0.59,outputPrice:0.79,color:'#F97316'},
  ];
  const[queries,setQueries]=useState(1000);const[inputTokens,setInputTokens]=useState(500);const[outputTokens,setOutputTokens]=useState(200);const[selectedModel,setSelectedModel]=useState(0);
  const calcCost=(m)=>{const daily=queries*((inputTokens*m.inputPrice/1e6)+(outputTokens*m.outputPrice/1e6));return{daily,monthly:daily*30}};
  const sel=models[selectedModel];const cost=calcCost(sel);
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-3" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCB0'} Model Cost Calculator</h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Queries/day</label><input type="number" value={queries} onChange={e=>setQueries(Math.max(0,Number(e.target.value)))} className="w-full p-2 rounded-lg border mt-1" style={{borderColor:GIM.border,fontSize:13}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Avg input tokens</label><input type="number" value={inputTokens} onChange={e=>setInputTokens(Math.max(0,Number(e.target.value)))} className="w-full p-2 rounded-lg border mt-1" style={{borderColor:GIM.border,fontSize:13}}/></div>
      <div><label style={{fontSize:11,color:GIM.mutedText}}>Avg output tokens</label><input type="number" value={outputTokens} onChange={e=>setOutputTokens(Math.max(0,Number(e.target.value)))} className="w-full p-2 rounded-lg border mt-1" style={{borderColor:GIM.border,fontSize:13}}/></div>
    </div>
    <div className="flex gap-2 mb-3 flex-wrap">{models.map((m,i)=><button key={i} onClick={()=>setSelectedModel(i)} className="px-3 py-1 rounded-full text-xs font-semibold" style={{background:selectedModel===i?m.color:'white',color:selectedModel===i?'white':GIM.bodyText,border:`1px solid ${selectedModel===i?m.color:GIM.border}`}}>{m.name}</button>)}</div>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="p-3 rounded-lg text-center" style={{background:GIM.borderLight}}><div className="font-bold" style={{fontSize:20,color:sel.color}}>${cost.daily.toFixed(2)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per day</div></div>
      <div className="p-3 rounded-lg text-center" style={{background:GIM.borderLight}}><div className="font-bold" style={{fontSize:20,color:sel.color}}>${cost.monthly.toFixed(2)}</div><div style={{fontSize:11,color:GIM.mutedText}}>per month</div></div>
    </div>
    <div className="space-y-1">{models.map((m,i)=>{const c=calcCost(m);return <div key={i} className="flex items-center gap-2"><span style={{fontSize:11,color:GIM.bodyText,width:130}}>{m.name}</span><div className="flex-1 h-4 rounded-full overflow-hidden" style={{background:GIM.borderLight}}><div className="h-full rounded-full" style={{width:`${Math.min(100,(c.monthly/Math.max(...models.map(x=>calcCost(x).monthly)))*100)}%`,background:m.color}}/></div><span style={{fontSize:11,color:GIM.mutedText,width:70,textAlign:'right'}}>${c.monthly.toFixed(0)}/mo</span></div>})}</div>
  </div>;
}

function SchemaDesigner(){
  const[fields,setFields]=useState([{name:'sentiment',type:'enum',required:true,values:'positive,negative,neutral'},{name:'confidence',type:'number',required:true,values:''},{name:'reasoning',type:'string',required:false,values:''}]);
  const[newName,setNewName]=useState('');const[newType,setNewType]=useState('string');
  const addField=()=>{if(newName.trim()){setFields([...fields,{name:newName.trim(),type:newType,required:true,values:''}]);setNewName('');}};
  const removeField=(i)=>setFields(fields.filter((_,idx)=>idx!==i));
  const presets={sentiment:[{name:'sentiment',type:'enum',required:true,values:'positive,negative,neutral'},{name:'confidence',type:'number',required:true,values:''},{name:'reasoning',type:'string',required:false,values:''}],extraction:[{name:'entities',type:'array',required:true,values:''},{name:'relationships',type:'array',required:false,values:''},{name:'summary',type:'string',required:true,values:''}],classification:[{name:'category',type:'enum',required:true,values:'bug,feature,question,other'},{name:'priority',type:'enum',required:true,values:'low,medium,high,critical'},{name:'confidence',type:'number',required:true,values:''}]};
  const genSchema=()=>{const props={};const req=[];fields.forEach(f=>{if(f.type==='enum')props[f.name]={type:'string',enum:f.values.split(',').map(v=>v.trim())};else if(f.type==='array')props[f.name]={type:'array',items:{type:'string'}};else props[f.name]={type:f.type};if(f.required)req.push(f.name);});return JSON.stringify({type:'object',properties:props,required:req},null,2);};
  return <div className="rounded-xl border p-4 mb-4" style={{borderColor:GIM.border,background:GIM.cardBg}}>
    <h4 className="font-semibold mb-2" style={{fontSize:14,color:GIM.headingText,fontFamily:GIM.fontMain}}>{'\uD83D\uDCC4'} Schema Designer</h4>
    <div className="flex gap-2 mb-3 flex-wrap">{Object.keys(presets).map(p=><button key={p} onClick={()=>setFields(presets[p])} className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{background:GIM.primaryBadge,color:GIM.primary,border:`1px solid ${GIM.primary}22`}}>{p}</button>)}</div>
    <div className="space-y-1 mb-3">{fields.map((f,i)=><div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{background:GIM.borderLight}}>
      <span className="font-mono font-semibold" style={{fontSize:12,color:GIM.primary,flex:1}}>{f.name}</span>
      <span className="px-2 py-0.5 rounded text-xs" style={{background:'white',color:GIM.bodyText,border:`1px solid ${GIM.border}`}}>{f.type}{f.values?`: [${f.values}]`:''}</span>
      {f.required&&<span className="text-xs" style={{color:'#EF4444'}}>*</span>}
      <button onClick={()=>removeField(i)} style={{fontSize:12,color:GIM.mutedText}}>{'\u2715'}</button>
    </div>)}</div>
    <div className="flex gap-2 mb-3"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="field name" className="flex-1 p-1.5 rounded-lg border text-xs" style={{borderColor:GIM.border}}/><select value={newType} onChange={e=>setNewType(e.target.value)} className="p-1.5 rounded-lg border text-xs" style={{borderColor:GIM.border}}><option>string</option><option>number</option><option>boolean</option><option>array</option><option>enum</option></select><button onClick={addField} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:GIM.primary,color:'white'}}>Add</button></div>
    <div className="rounded-lg p-3" style={{background:CODE_BG}}><pre style={{fontSize:11,color:CODE_TEXT,fontFamily:'monospace',whiteSpace:'pre-wrap'}}>{genSchema()}</pre></div>
  </div>;
}

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

export { TokenCounter, ContextVisualizer, TemperaturePlayground, TokenEstimationGame, ContextBudgetGame, TemperatureMatchingGame, PromptBuilder, SimilarityCalculator, HallucinationDetector, PipelineOrderGame, ContextBudgetAllocator, BiasDetectorGame, ModelCostCalculator, SchemaDesigner, ToolDefinitionBuilder, RiskClassifier };
