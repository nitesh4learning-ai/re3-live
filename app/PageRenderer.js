"use client";
// PageRenderer: Renders the correct page component based on the current route.
// All page components are defined here (moved from Re3App.js).
// Route files pass the page name and optional ID, and this component renders it.
import { useState, useEffect, useCallback, useRef, lazy, Suspense, Fragment } from "react";
import { useApp } from './providers';
import { AGENTS, HUMANS, ORCHESTRATORS, INIT_AGENTS, ALL_USERS, MODEL_PROVIDERS, GIM, PILLARS, REACTION_MAP, ADMIN_EMAIL, isAdmin, ORCH_AVATAR_KEY, INIT_CONTENT } from './constants';
import { getAuthor, fmt, fmtS, getCycles } from './utils/helpers';
import { pageToPath, pathToPage } from './utils/routing';
import { DB, getFirestoreModule, syncToFirestore, getFirebase, authFetch } from './utils/firebase-client';
import { PillarIcon, Re3Logo, OrchestratorAvatar } from './components/shared/Icons';
import { FadeIn, AuthorBadge, PillarTag, HeatBar, ShareButton, CrossRefLink, Disclaimer, renderInline, renderParagraph, ParagraphReactions } from './components/shared/UIComponents';

const LazyEditor = lazy(() => import("./Editor"));
const LazyAcademy = lazy(() => import("./Academy"));
const LazyOrchestration = lazy(() => import("./components/orchestration/OrchestrationPage"));

// This component renders the appropriate page based on passed props.
// It pulls all state and actions from the AppContext.
export default function PageRenderer({ page, pageId }) {
  const app = useApp();
  const { user, content, themes, articles, agents, projects, registry, registryIndex,
    forgeSessions, forgePreload, showLogin, setShowLogin,
    nav, endorse, cmnt, addPost, react, addCh, addMN, updatePost,
    archiveCycle, autoComment, voteTheme, addTheme, editTheme,
    deleteTheme, saveArticle, deleteArticle, saveAgent, deleteAgent,
    saveProject, deleteProject, saveForgeSession, deleteForgeSession,
    navToForge } = app;

  const postReact = (pi, key) => { if (!pageId) return; react(pageId, pi, key); };

  switch (page) {
    case "home":
      return <HomePage content={content} themes={themes} articles={articles} onNavigate={nav} onVoteTheme={voteTheme} registry={registry} currentUser={user} onAddTheme={addTheme} onEditTheme={editTheme} onDeleteTheme={deleteTheme} forgeSessions={forgeSessions} agents={agents} onSubmitTopic={(title) => addTheme(title)} />;
    case "loom":
      return <LoomPage content={content} articles={articles} onNavigate={nav} onForge={navToForge} onArchiveCycle={archiveCycle} currentUser={user} />;
    case "loom-cycle":
      return <LoomCyclePage cycleDate={pageId} content={content} articles={articles} onNavigate={nav} onForge={navToForge} currentUser={user} />;
    case "forge":
      return <ForgePage content={content} themes={themes} agents={agents} registry={registry} registryIndex={registryIndex} currentUser={user} onNavigate={nav} forgeSessions={forgeSessions} onSaveForgeSession={saveForgeSession} onDeleteForgeSession={deleteForgeSession} forgePreload={forgePreload} onPostGenerated={addPost} onAutoComment={autoComment} onUpdatePost={updatePost} sessionId={pageId} />;
    case "studio":
      return <MyStudioPage currentUser={user} content={content} articles={articles} agents={agents} projects={projects} onNavigate={nav} onSaveArticle={saveArticle} onDeleteArticle={deleteArticle} onSaveProject={saveProject} onDeleteProject={deleteProject} />;
    case "academy":
      return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Academy...</p></div>}><LazyAcademy onNavigate={nav} currentUser={user} /></Suspense>;
    case "agent-community":
      return <AgentAtlasPage agents={agents} registry={registry} registryIndex={registryIndex} currentUser={user} onSaveAgent={saveAgent} onDeleteAgent={deleteAgent} onForge={navToForge} />;
    case "debates":
      return <DebateGalleryPage content={content} forgeSessions={forgeSessions} onNavigate={nav} onForge={navToForge} />;
    case "search":
      return <ArtifactSearchPage content={content} onNavigate={nav} />;
    case "arena":
      return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Arena...</p></div>}><LazyOrchestration user={user} onNavigate={nav} runId={pageId} /></Suspense>;
    case "article": {
      const art = articles.find(a => a.id === pageId);
      return art ? <ArticlePage article={art} agents={agents} registry={registry} registryIndex={registryIndex} onNavigate={nav} onUpdateArticle={saveArticle} currentUser={user} /> : <HomePage content={content} themes={themes} articles={articles} onNavigate={nav} onVoteTheme={voteTheme} registry={registry} />;
    }
    case "post": {
      const po = content.find(c => c.id === pageId);
      return po ? <PostPage post={po} allContent={content} onNavigate={nav} currentUser={user} onEndorse={endorse} onComment={cmnt} onReact={postReact} onAddChallenge={addCh} onAddMarginNote={addMN} agents={agents} registry={registry} registryIndex={registryIndex} onUpdatePost={updatePost} /> : <HomePage content={content} themes={themes} articles={articles} onNavigate={nav} onVoteTheme={voteTheme} registry={registry} />;
    }
    case "profile": {
      const u = ALL_USERS.find(x => x.id === pageId) || user;
      return u ? <ProfilePage user={u} content={content} onNavigate={nav} /> : <HomePage content={content} themes={themes} articles={articles} onNavigate={nav} onVoteTheme={voteTheme} registry={registry} />;
    }
    case "write":
      if (!user) { setShowLogin(true); nav("home"); return null; }
      return <WritePage currentUser={user} onNavigate={nav} onSubmit={addPost} />;
    default:
      return <HomePage content={content} themes={themes} articles={articles} onNavigate={nav} onVoteTheme={voteTheme} registry={registry} />;
  }
}

// ==================== ALL PAGE COMPONENTS BELOW ====================
// These are the original page components from Re3App.js, preserved exactly.
// ==================== CYCLE CARD — The core visual unit (journey-aware) ====================
function CycleCard({cycle,onNavigate,variant="default"}){
  const isHero = variant==="hero";
  return <div className="rounded-xl overflow-hidden transition-all hover:shadow-md" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onMouseEnter={e=>{if(!isHero)e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{if(!isHero)e.currentTarget.style.transform="translateY(0)"}}>
    {/* Through-line question for journey cycles */}
    {cycle.isJourney&&cycle.throughLineQuestion&&isHero&&<div className="px-5 pt-4 pb-2">
      <p className="text-sm font-semibold text-center" style={{color:"#8B5CF6",fontStyle:"italic",lineHeight:1.5}}>"{cycle.throughLineQuestion}"</p>
    </div>}
    <div className={isHero?"p-5 sm:p-6":"p-4"}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontFamily:"'Inter',sans-serif",fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Cycle {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>{cycle.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E",fontWeight:700}}>Journey</span>}<span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
        <div className="flex items-center gap-3" style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#9CA3AF"}}><span>{cycle.endorsements} endorsements</span><span>{cycle.comments} replies</span></div>
      </div>
      {/* Journey progress dots */}
      {isHero&&<div className="flex items-center justify-center gap-1.5 mb-4">
        {[["rethink","Rethink","#3B6B9B"],["rediscover","Rediscover","#E8734A"],["reinvent","Reinvent","#2D8A6E"]].map(([key,label,color],i)=>{const post=cycle[key];return <Fragment key={key}>{i>0&&<div style={{width:24,height:2,background:`linear-gradient(90deg,${[["#3B6B9B"],["#E8734A"],["#2D8A6E"]][i-1]},${color})`,borderRadius:4}}/>}<button onClick={()=>post&&onNavigate(cycle.isJourney?"loom-cycle":"post",cycle.isJourney?cycle.id:post.id)} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{background:post?color:"#E5E7EB"}}/><span className="text-xs font-semibold hidden sm:inline" style={{color:post?color:"#CCC"}}>{post?.title?.slice(0,25)||(label+"...")}{post?.title?.length>25?"...":""}</span></button></Fragment>})}
      </div>}
      <div className={`grid grid-cols-1 ${isHero?"md:grid-cols-3":""} gap-3`}>
        {[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean).map(post=>{const author=getAuthor(post.authorId);const pillar=PILLARS[post.pillar];return <button key={post.id} onClick={()=>onNavigate(cycle.isJourney?"loom-cycle":"post",cycle.isJourney?cycle.id:post.id)} className="text-left p-4 rounded-xl transition-all group" style={{background:"#FFFFFF",borderLeft:`4px solid ${pillar.color}`,border:"1px solid #E5E7EB",borderLeftWidth:4,borderLeftColor:pillar.color}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center gap-1.5 mb-2"><PillarTag pillar={post.pillar}/></div>
          <h3 className="font-bold leading-snug mb-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:isHero?16:14}}>{post.title}</h3>
          <p className="mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6B7280",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.paragraphs[0]?.slice(0,isHero?140:100)}...</p>
          <AuthorBadge author={author}/>
          <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all mt-1 inline-block" style={{color:"#9333EA"}}>{cycle.isJourney?"View journey":"Read"} &rarr;</span>
        </button>})}
      </div>
      {/* Journey artifact summary */}
      {isHero&&cycle.isJourney&&<div className="flex items-center justify-center gap-2 mt-3">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts[type];return a?<span key={type} className="px-2 py-0.5 rounded-full text-xs" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E",fontSize:10}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Qs":type==="principle"?"💡 Principle":"🔧 Blueprint"}</span>:null})}</div>}
      {cycle.extra?.length>0&&<div className="mt-2 text-xs" style={{color:"#9CA3AF"}}>+{cycle.extra.length} more</div>}
    </div>
  </div>
}

// ==================== HEADER ====================
function Header({onNavigate,currentPage,currentUser,onLogin,onLogout}){
  const[sc,setSc]=useState(false);const[mob,setMob]=useState(false);
  useEffect(()=>{const fn=()=>setSc(window.scrollY>10);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn)},[]);
  const navItems=[["home","Home","🏠"],["loom","The Loom","🧵"],["forge","Debate Lab","⚡"],["arena","Arena","🎯"],["agent-community","Team","🤖"],["academy","Academy","🎓"],["studio","My Studio","📝"]];
  const bottomTabs=[["home","Home","🏠"],["loom","Loom","🧵"],["forge","Debate","⚡"],["arena","Arena","🎯"],["agent-community","Team","🤖"],["academy","Learn","🎓"]];
  return <><header className="fixed top-0 left-0 right-0 z-50" style={{background:"#FFFFFF",borderBottom:"0.8px solid #E5E7EB"}}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{height:56}}>
      <button onClick={()=>{onNavigate("home");setMob(false)}} className="flex items-center gap-2" style={{minHeight:'auto',minWidth:'auto'}}>
        <Re3Logo variant="full" size={24}/>
      </button>
      <nav className="re3-desktop-nav hidden md:flex items-center gap-0.5">{navItems.map(([pg,label,icon])=>{const a=currentPage===pg;
        return <button key={pg} onClick={()=>onNavigate(pg)} className="px-3 py-1.5 rounded-lg transition-all" style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:a?600:500,color:a?"#9333EA":"#4B5563",background:a?"#FAF5FF":"transparent",minHeight:'auto',minWidth:'auto'}}><span style={{marginRight:4}}>{icon}</span>{label}</button>})}</nav>
      <div className="flex items-center gap-2">
        {currentUser ? <><button onClick={()=>onNavigate("write")} className="hidden sm:block px-3 py-1.5 font-medium transition-all hover:shadow-md" style={{fontFamily:"'Inter',sans-serif",fontSize:12,background:"#9333EA",color:"white",borderRadius:8,minHeight:'auto',minWidth:'auto'}}>✏️ Write</button>
          <button onClick={()=>onNavigate("profile",currentUser.id)} className="w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden" style={{fontSize:9,background:"#FAF5FF",color:"#9333EA",border:"1px solid #E9D5FF",minHeight:'auto',minWidth:'auto'}}>{currentUser.photoURL?<img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>:currentUser.avatar}</button>
          <button onClick={onLogout} className="hidden sm:block" style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"#9CA3AF",minHeight:'auto',minWidth:'auto'}}>Logout</button>
        </> : <button onClick={onLogin} className="px-3 py-1.5 font-medium transition-all hover:shadow-md" style={{fontFamily:"'Inter',sans-serif",fontSize:12,background:"#9333EA",color:"white",borderRadius:8}}>Sign in</button>}
        <button onClick={()=>setMob(!mob)} className="md:hidden p-1" style={{color:"#4B5563",fontSize:18,minHeight:'auto',minWidth:'auto'}}>{mob?"\u2715":"\u2630"}</button>
      </div>
    </div>
  </header>
  {/* Mobile fullscreen menu (hamburger overlay) */}
  {mob&&<div className="fixed inset-0 z-40 pt-14" style={{background:"#FFFFFF"}}><div className="flex flex-col p-6 gap-1">
    {navItems.map(([pg,label,icon])=><button key={pg} onClick={()=>{onNavigate(pg);setMob(false)}} className="text-left p-3 rounded-xl text-base font-medium" style={{fontFamily:"'Inter',sans-serif",color:currentPage===pg?"#9333EA":"#4B5563",background:currentPage===pg?"#FAF5FF":"transparent"}}>{icon} {label}</button>)}
    {currentUser&&<><div className="my-2" style={{height:1,background:"#E5E7EB"}}/><button onClick={()=>{onNavigate("write");setMob(false)}} className="text-left p-3 rounded-xl text-base font-medium" style={{color:"#9333EA"}}>✏️ Write</button>
    <button onClick={()=>{onNavigate("studio");setMob(false)}} className="text-left p-3 rounded-xl text-base font-medium" style={{color:"#4B5563"}}>📝 My Studio</button></>}
  </div></div>}
  {/* Mobile bottom tab bar */}
  <nav className="re3-bottom-tabs">{bottomTabs.map(([pg,label,icon])=>{const a=currentPage===pg;
    return <button key={pg} onClick={()=>{onNavigate(pg);setMob(false)}} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,padding:"6px 0",gap:2,border:"none",background:"transparent",cursor:"pointer",minHeight:56,minWidth:'auto'}}><span style={{fontSize:18,lineHeight:1,opacity:a?1:0.5}}>{icon}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:a?700:500,color:a?"#9333EA":"#9CA3AF",letterSpacing:"0.02em"}}>{label}</span></button>})}</nav>
  </>
}

// ==================== HOME PAGE — Dark bento grid ====================
function HomePage({content,themes,articles,onNavigate,onVoteTheme,onAddTheme,onEditTheme,onDeleteTheme,currentUser,registry,forgeSessions,agents,onSubmitTopic}){
  const cycles = getCycles(content);
  const hero = cycles[0];
  const featured = cycles.slice(1, 4);
  const[newThemeTxt,setNewThemeTxt]=useState("");
  const[communityTopic,setCommunityTopic]=useState("");
  const[topicSubmitted,setTopicSubmitted]=useState(false);
  const[editingTheme,setEditingTheme]=useState(null);
  const[editThemeTxt,setEditThemeTxt]=useState("");
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}>
    {/* HERO — GIM style */}
    <section style={{background:"#F9FAFB"}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6" style={{paddingTop:56,paddingBottom:64}}>
        <FadeIn><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{background:"#F3E8FF",border:"1px solid rgba(147,51,234,0.2)"}}><span className="relative flex" style={{width:6,height:6}}><span className="animate-ping absolute inline-flex rounded-full opacity-75" style={{width:"100%",height:"100%",background:"#9333EA"}}/><span className="relative inline-flex rounded-full" style={{width:6,height:6,background:"#9333EA"}}/></span><span className="font-bold" style={{fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:"0.12em",color:"#9333EA"}}>HUMAN-AI SYNTHESIS LAB</span></div></FadeIn>
        <FadeIn delay={60}><h1 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:"clamp(36px,6vw,64px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:16}}><span style={{color:"#9333EA"}}>Rethink.</span>{" "}<span style={{color:"#9333EA"}}>Rediscover.</span>{" "}<span style={{color:"#9333EA"}}>Reinvent.</span></h1></FadeIn>
        <FadeIn delay={100}><p style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(14px,1.6vw,16px)",maxWidth:520,color:"#4B5563",lineHeight:1.7,marginBottom:24}}>Knowledge isn&apos;t created. It&apos;s uncovered. Layer by layer. Question by question. Until clarity emerges.</p></FadeIn>
        <FadeIn delay={140}><div className="flex flex-wrap items-center gap-3 re3-hero-buttons">
          <button onClick={()=>hero&&onNavigate("post",hero.posts[0]?.id)} className="px-5 py-2.5 font-semibold text-sm transition-all hover:shadow-lg" style={{fontFamily:"'Inter',sans-serif",background:"#9333EA",color:"white",borderRadius:8}}>Explore Latest Cycle &rarr;</button>
          <button onClick={()=>onNavigate("loom")} className="px-5 py-2.5 font-semibold text-sm transition-all" style={{fontFamily:"'Inter',sans-serif",background:"#FFFFFF",color:"#4B5563",border:"1px solid #E5E7EB",borderRadius:8}}>View The Loom</button>
          <button onClick={()=>onNavigate("agent-community")} className="px-5 py-2.5 font-semibold text-sm transition-all" style={{fontFamily:"'Inter',sans-serif",background:"#FFFFFF",color:"#4B5563",border:"1px solid #E5E7EB",borderRadius:8}}>Team</button>
        </div></FadeIn>
      </div>
    </section>

    {/* Three Pillars Explainer */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <FadeIn><h2 className="font-bold mb-1 text-center" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:22}}>Three Lenses, One Conversation</h2>
        <p className="mb-6 text-center" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)"}}>Every topic is examined through three complementary philosophical pillars</p></FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.values(PILLARS).map((p,i)=><FadeIn key={p.key} delay={i*80}><div className="relative p-5 rounded-xl text-center transition-all cursor-default group" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderLeft:`4px solid ${p.color}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{background:`${p.color}15`}}><PillarIcon pillar={p.key} size={20}/></div>
          <div className="font-bold mb-0.5" style={{fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:"0.1em",color:p.color}}>{p.label.toUpperCase()}</div>
          <div className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,color:"#111827"}}>{p.tagline}</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(0,0,0,0.4)",lineHeight:1.5}}>{p.key==="rethink"?"Deconstruct assumptions and question foundations":p.key==="rediscover"?"Find hidden patterns across disciplines":"Build implementable architectures"}</div>
        </div></FadeIn>)}
      </div>
      <div className="flex justify-center mt-4"><div className="flex items-center gap-1">{Object.values(PILLARS).map((p,i)=><Fragment key={p.key}><div style={{width:60,height:3,borderRadius:2,background:p.color,opacity:0.5}}/>{i<2&&<div style={{width:12,height:3,borderRadius:2,background:"rgba(0,0,0,0.1)"}}/>}</Fragment>)}</div></div>
    </section>

    {/* BENTO: Latest Cycle */}
    {hero&&<section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <FadeIn><div className="flex items-center justify-between mb-4"><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:24}}>Latest Cycle</h2><button onClick={()=>onNavigate("loom")} className="text-xs font-semibold" style={{fontFamily:"'Inter',sans-serif",color:"#9333EA"}}>View all in The Loom &rarr;</button></div></FadeIn>
      <FadeIn delay={50}><CycleCard cycle={hero} onNavigate={onNavigate} variant="hero"/></FadeIn>
    </section>}

    {/* Recent Debate Lab Sessions */}
    {forgeSessions&&forgeSessions.length>0&&<section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <FadeIn><div className="flex items-center justify-between mb-3"><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Recent Debate Sessions</h2><button onClick={()=>onNavigate("forge")} className="text-xs font-semibold" style={{fontFamily:"'Inter',sans-serif",color:"#9333EA"}}>View all in Debate Lab &rarr;</button></div></FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{forgeSessions.slice(0,6).map((s,i)=>{
        const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
        const modeIcons={debate:"⚔️",ideate:"💡",implement:"🔨"};
        return <FadeIn key={s.id} delay={i*40}><div onClick={()=>onNavigate("forge",s.id)} className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" style={{background:"white",border:"1px solid #E5E7EB"}}>
          <div className="flex items-center gap-2 mb-1"><span style={{fontSize:12}}>{modeIcons[s.mode]||"📝"}</span><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:`${modeColors[s.mode]||"#999"}15`,color:modeColors[s.mode]||"#999"}}>{s.mode}</span><span style={{fontSize:9,color:"rgba(0,0,0,0.3)"}}>{new Date(s.date).toLocaleDateString()}</span></div>
          <h4 className="font-semibold text-sm" style={{color:"#111827",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.topic?.title||"Untitled"}</h4>
        </div></FadeIn>
      })}</div>
    </section>}

    {/* Try It — Mini-Debate */}
    {agents&&agents.filter(a=>a.status==="active").length>0&&<section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <FadeIn delay={80}><MiniDebate agents={agents} onNavigate={onNavigate}/></FadeIn>
    </section>}

    {/* Quick links bar */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <FadeIn delay={90}><div className="flex flex-wrap gap-3">
        <button onClick={()=>onNavigate("debates")} className="flex-1 p-3 rounded-xl text-center transition-all hover:shadow-sm" style={{background:"white",border:"1px solid #E5E7EB",minWidth:140}}>
          <span style={{fontSize:16}}>⚔️</span><div className="font-semibold text-xs mt-1" style={{color:"#E8734A"}}>Debate Gallery</div><div className="text-xs" style={{color:"#CCC"}}>Browse all debates</div>
        </button>
        <button onClick={()=>onNavigate("search")} className="flex-1 p-3 rounded-xl text-center transition-all hover:shadow-sm" style={{background:"white",border:"1px solid #E5E7EB",minWidth:140}}>
          <span style={{fontSize:16}}>🔍</span><div className="font-semibold text-xs mt-1" style={{color:"#8B5CF6"}}>Artifact Search</div><div className="text-xs" style={{color:"#CCC"}}>Search across cycles</div>
        </button>
        <button onClick={()=>onNavigate("academy")} className="flex-1 p-3 rounded-xl text-center transition-all hover:shadow-sm" style={{background:"white",border:"1px solid #E5E7EB",minWidth:140}}>
          <span style={{fontSize:16}}>🎓</span><div className="font-semibold text-xs mt-1" style={{color:"#2D8A6E"}}>Academy</div><div className="text-xs" style={{color:"#CCC"}}>Learn AI skills</div>
        </button>
      </div></FadeIn>
    </section>

    {/* On the Horizon */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12"><div className="rounded-2xl p-5" style={{background:"linear-gradient(135deg,rgba(59,107,155,0.08),rgba(139,92,246,0.08),rgba(45,138,110,0.08))",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>On the Horizon</h3>
      <p className="mb-3" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)"}}>Upcoming themes the community wants to explore. Vote or suggest your own!</p>
      {isAdmin(currentUser)&&<div className="mb-3 flex gap-2"><input value={newThemeTxt} onChange={e=>setNewThemeTxt(e.target.value)} placeholder="Add a new topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",fontFamily:"'Inter',sans-serif"}} onKeyDown={e=>{if(e.key==="Enter"&&newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}}/><button onClick={()=>{if(newThemeTxt.trim()){onAddTheme(newThemeTxt.trim());setNewThemeTxt("")}}} className="px-4 py-2 rounded-xl font-semibold text-sm" style={{background:"#2D8A6E",color:"white"}}>Add</button></div>}
      <div className="space-y-1.5">{themes.map(th=><div key={th.id} className="flex items-center gap-2">
        {editingTheme===th.id?<div className="flex-1 flex gap-2"><input value={editThemeTxt} onChange={e=>setEditThemeTxt(e.target.value)} className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",fontFamily:"'Inter',sans-serif"}} onKeyDown={e=>{if(e.key==="Enter"&&editThemeTxt.trim()){onEditTheme(th.id,editThemeTxt.trim());setEditingTheme(null)}}}/><button onClick={()=>{if(editThemeTxt.trim()){onEditTheme(th.id,editThemeTxt.trim());setEditingTheme(null)}}} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:"#2D8A6E",color:"white"}}>Save</button><button onClick={()=>setEditingTheme(null)} className="px-3 py-1 rounded-lg text-xs" style={{color:"rgba(0,0,0,0.4)"}}>Cancel</button></div>
        :<button onClick={()=>onVoteTheme(th.id)} className="flex-1 flex items-center justify-between p-3 rounded-xl transition-all" style={{background:th.voted?"rgba(232,115,74,0.1)":"rgba(0,0,0,0.02)",border:`1px solid ${th.voted?"rgba(232,115,74,0.2)":"rgba(0,0,0,0.06)"}`}} onMouseEnter={e=>{if(!th.voted)e.currentTarget.style.background="rgba(0,0,0,0.06)"}} onMouseLeave={e=>{if(!th.voted)e.currentTarget.style.background="rgba(0,0,0,0.02)"}}>
          <span className="font-medium text-sm" style={{fontFamily:"'Inter',sans-serif",color:"#111827"}}>{th.title}</span>
          <span className="font-bold" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:th.voted?"#E8734A":"rgba(0,0,0,0.3)"}}>{th.votes}</span>
        </button>}
        {isAdmin(currentUser)&&editingTheme!==th.id&&<><button onClick={()=>{setEditingTheme(th.id);setEditThemeTxt(th.title)}} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{fontSize:12,color:"rgba(0,0,0,0.3)"}} title="Edit">✏️</button><button onClick={()=>onDeleteTheme(th.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{fontSize:12,color:"rgba(0,0,0,0.3)"}} title="Delete">🗑️</button></>}
      </div>)}</div>
      {/* Community topic submission — open to all users */}
      {currentUser&&<div className="mt-4 pt-3" style={{borderTop:"1px solid rgba(0,0,0,0.06)"}}>
        <p className="text-xs font-semibold mb-2" style={{color:"rgba(0,0,0,0.3)"}}>SUGGEST A TOPIC</p>
        {topicSubmitted?<p className="text-xs font-semibold" style={{color:"#2D8A6E"}}>Thanks! Your topic has been submitted for community voting.</p>
        :<div className="flex gap-2"><input value={communityTopic} onChange={e=>setCommunityTopic(e.target.value)} placeholder="What should we explore next?" className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",fontFamily:"'Inter',sans-serif"}} onKeyDown={e=>{if(e.key==="Enter"&&communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}}/><button onClick={()=>{if(communityTopic.trim()){if(onSubmitTopic)onSubmitTopic(communityTopic.trim());setCommunityTopic("");setTopicSubmitted(true);setTimeout(()=>setTopicSubmitted(false),3000)}}} className="px-4 py-2 rounded-xl font-semibold text-sm" style={{background:communityTopic.trim()?"#E8734A":"rgba(0,0,0,0.08)",color:communityTopic.trim()?"white":"rgba(0,0,0,0.3)"}}>Submit</button></div>}
      </div>}
      {!currentUser&&<div className="mt-4 pt-3 text-center" style={{borderTop:"1px solid rgba(0,0,0,0.06)"}}><p className="text-xs" style={{color:"rgba(0,0,0,0.3)"}}>Sign in to suggest topics and vote</p></div>}
    </div></section>
  </div>
}

// ==================== TRIPTYCH COMPONENTS ====================
function TriptychCard({cycle,onExpand,onArchiveCycle,currentUser}){
  const pillars=[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const connectionDensity=cycle.posts.reduce((sum,p)=>sum+(p.debate?.streams?.length||0),0);
  return <div className="cursor-pointer rounded-xl overflow-hidden transition-all hover:shadow-md" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onClick={()=>onExpand(cycle.id)}>
    <div className="flex items-center justify-between p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Cycle {cycle.number}{cycle.headline?': '+cycle.headline:''}</span><span style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
      <div className="flex items-center gap-3" style={{fontSize:11,color:"#9CA3AF"}}><span>{cycle.endorsements} endorsements</span>{connectionDensity>0&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:9,background:"#F3E8FF",color:"#9333EA"}}>{connectionDensity} threads</span>}
        <span onClick={e=>e.stopPropagation()}><ShareButton title={`Re³ Cycle ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this synthesis cycle on Re³" url={typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:''}/></span>
        {isAdmin(currentUser)&&onArchiveCycle&&<button onClick={e=>{e.stopPropagation();if(confirm('Archive this cycle? It will be hidden from views.'))onArchiveCycle(cycle.id)}} className="px-2 py-0.5 rounded-full font-semibold transition-all hover:bg-red-50" style={{fontSize:9,color:"rgba(229,62,62,0.6)",border:"1px solid rgba(229,62,62,0.2)"}}>Archive</button>}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">{pillars.map((post,i)=>{const pc=PILLARS[post.pillar]?.color||"#9CA3AF";return <div key={post.id} className="p-4" style={{borderRight:i<pillars.length-1?"1px solid #E5E7EB":"none",borderLeft:`4px solid ${pc}`}}>
      <PillarTag pillar={post.pillar}/>
      <h4 className="font-bold mt-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:"#111827",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</h4>
      <p className="mt-1" style={{fontSize:11,color:"#6B7280",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.paragraphs?.[0]?.slice(0,100)}...</p>
    </div>})}</div>
    <div className="text-center py-2" style={{borderTop:"1px solid #E5E7EB"}}><span className="text-xs font-medium" style={{color:"#9333EA"}}>Click to explore &rarr;</span></div>
  </div>
}

function TriptychExpanded({cycle,onNavigate,onCollapse,onForge,onArchiveCycle,currentUser}){
  const pillars=[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const getAgentPerspectives=(post)=>{if(!post?.debate?.rounds)return[];return post.debate.rounds.flat().filter(r=>r.status==="success"&&r.response).slice(0,2).map(r=>({name:r.name,excerpt:(r.response||"").slice(0,120)+"..."}))};
  const synthesisPost=pillars.find(p=>p?.debate?.loom);
  return <div className="rounded-xl overflow-hidden mb-2" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
    <div className="flex items-center justify-between p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2"><span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Cycle {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>{cycle.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E"}}>Connected Journey</span>}<span style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span></div>
      <div className="flex items-center gap-2">
        <ShareButton title={`Re³ Cycle ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this synthesis cycle on Re³" url={typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:''}/>
        {isAdmin(currentUser)&&onArchiveCycle&&<button onClick={()=>{if(confirm('Archive this cycle? It will be hidden from views.'))onArchiveCycle(cycle.id)}} className="px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:bg-red-50" style={{color:"rgba(229,62,62,0.6)",border:"1px solid rgba(229,62,62,0.2)"}}>Archive</button>}
        <button onClick={onCollapse} className="px-2 py-1 rounded-lg text-xs" style={{color:"rgba(0,0,0,0.3)",border:"1px solid rgba(0,0,0,0.08)"}}>Collapse</button>
      </div>
    </div>
    {/* Through-line question (for journey cycles) */}
    {cycle.throughLineQuestion&&<div className="px-4 py-2" style={{background:"#FAF5FF",borderBottom:"1px solid #E9D5FF"}}>
      <p className="text-xs font-semibold text-center" style={{color:"#8B5CF6",fontStyle:"italic"}}>"{cycle.throughLineQuestion}"</p>
    </div>}
    <div className="grid grid-cols-1 md:grid-cols-3">{pillars.map((post,i)=>{const pillar=PILLARS[post.pillar];const perspectives=getAgentPerspectives(post);
      return <div key={post.id} className="p-4" style={{borderRight:i<pillars.length-1?"1px solid #E5E7EB":"none",borderLeft:`4px solid ${pillar.color}`}}>
        <PillarTag pillar={post.pillar}/>
        <h3 className="font-bold mt-2 mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,color:"#111827",lineHeight:1.3}}>{post.title}</h3>
        <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.45)",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.paragraphs?.[0]?.slice(0,180)}...</p>
        {perspectives.length>0&&<div className="mb-3"><span className="font-bold" style={{fontSize:9,color:"rgba(0,0,0,0.3)",letterSpacing:"0.1em"}}>PERSPECTIVES</span><div className="mt-1 space-y-1">{perspectives.map((p,pi)=><div key={pi} className="p-2 rounded-lg" style={{background:"rgba(0,0,0,0.02)",fontSize:11,color:"#888"}}><span className="font-bold" style={{color:pillar.color}}>{p.name}: </span>{p.excerpt}</div>)}</div></div>}
        <button onClick={()=>onNavigate("post",post.id)} className="text-xs font-semibold" style={{color:"#9333EA"}}>Read full post &rarr;</button>
      </div>})}</div>
    {/* Action bar with full-cycle debate option */}
    <div className="flex items-center gap-3 px-4 py-3" style={{borderTop:"1px solid #E5E7EB",background:"#FAFAFA"}}>
      {onForge&&<button onClick={()=>onForge({title:cycle.throughLineQuestion||cycle.headline||pillars[0]?.title||"Cycle "+cycle.number,text:pillars.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n"),sourceType:"cycle",cycleDate:cycle.date,cycleId:cycle.id})} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#9333EA",color:"white"}}>Debate Full Cycle</button>}
      <button onClick={()=>onNavigate("loom-cycle",cycle.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid #E9D5FF",color:"#9333EA"}}>View Journey</button>
    </div>
    {synthesisPost?.debate?.loom&&<div className="p-4" style={{background:"#FAF5FF",borderTop:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-1.5 mb-1"><span style={{fontSize:12}}>&#128296;</span><span className="font-bold text-xs" style={{color:"#9333EA"}}>Hypatia&apos;s Synthesis</span></div>
      <p style={{fontSize:12,color:"rgba(0,0,0,0.5)",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{synthesisPost.debate.loom.slice(0,300)}...</p>
    </div>}
  </div>
}

// ==================== ARTIFACT BOX — Reusable component for journey artifacts ====================
function ArtifactBox({type,data,pillar}){
  if(!data)return null;
  const configs={questions:{icon:"🔍",label:"Questions Raised",color:"#3B6B9B",bg:"#E8EEF5"},principle:{icon:"💡",label:"Principle Extracted",color:"#E8734A",bg:"#FDE8E0"},blueprint:{icon:"🔧",label:"Blueprint",color:"#2D8A6E",bg:"#E0F2EC"}};
  const c=configs[type]||configs.questions;
  return <div className="rounded-xl p-4 mt-4" style={{background:c.bg,border:`1px solid ${c.color}30`}}>
    <div className="flex items-center gap-2 mb-2"><span style={{fontSize:14}}>{c.icon}</span><span className="font-bold text-xs" style={{color:c.color,letterSpacing:"0.05em"}}>{c.label.toUpperCase()}</span></div>
    {type==="questions"&&data.items?.map((q,i)=><div key={i} className="flex items-start gap-2 mb-1.5"><span className="font-bold text-xs mt-0.5" style={{color:c.color}}>{i+1}.</span><p className="text-sm" style={{color:"#444",lineHeight:1.5}}>{q}</p></div>)}
    {type==="principle"&&<><p className="text-sm font-semibold mb-2" style={{color:"#333",lineHeight:1.5,fontStyle:"italic"}}>"{data.statement}"</p>{data.evidence?.map((e,i)=><p key={i} className="text-xs mb-1" style={{color:"#888"}}>Evidence: {e}</p>)}</>}
    {type==="blueprint"&&<><div className="flex flex-wrap gap-1.5 mb-2">{data.components?.map((comp,i)=><span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:`${c.color}15`,color:c.color}}>{comp}</span>)}</div>{data.principle_applied&&<p className="text-xs" style={{color:"#888"}}>Principle applied: {data.principle_applied}</p>}{data.code_summary&&<p className="text-xs mt-1" style={{color:"#666"}}>{data.code_summary}</p>}</>}
  </div>
}

// ==================== BRIDGE TRANSITION — Visual divider between acts ====================
function BridgeTransition({from,to,bridgeSentence}){
  const fromColor=PILLARS[from]?.color||"#999";const toColor=PILLARS[to]?.color||"#999";
  const transitionTexts={rethink_rediscover:"The question echoes across time...",rediscover_reinvent:"The pattern crystallizes into a blueprint..."};
  const hint=transitionTexts[`${from}_${to}`]||"The thread continues...";
  return <div className="my-6 relative">
    <div className="w-full rounded-full" style={{height:3,background:`linear-gradient(90deg,${fromColor},${toColor})`}}/>
    {bridgeSentence&&<div className="mt-3 px-4 py-3 rounded-xl" style={{background:"rgba(147,51,234,0.04)",border:"1px solid rgba(147,51,234,0.1)"}}>
      <p className="text-sm" style={{color:"#666",fontStyle:"italic",lineHeight:1.6}}>{bridgeSentence}</p>
    </div>}
    <p className="text-center mt-2 text-xs font-semibold" style={{color:"rgba(0,0,0,0.2)"}}>{hint}</p>
  </div>
}

// ==================== LOOM CYCLE DETAIL PAGE — Journey View ====================
function LoomCyclePage({cycleDate,content,articles,onNavigate,onForge,currentUser}){
  const cycles=getCycles(content);
  const cycle=cycles.find(c=>c.id===cycleDate)||cycles.find(c=>c.date===cycleDate);
  const[activeAct,setActiveAct]=useState("rethink");
  // Hooks must be called before any early return
  const rethinkRef=useRef(null);const rediscoverRef=useRef(null);const reinventRef=useRef(null);
  const isJourney=cycle?.isJourney;
  useEffect(()=>{
    if(!isJourney)return;
    const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){setActiveAct(e.target.dataset.act)}})},{rootMargin:"-100px 0px -50% 0px",threshold:0.1});
    [rethinkRef,rediscoverRef,reinventRef].forEach(ref=>{if(ref.current)observer.observe(ref.current)});
    return()=>observer.disconnect();
  },[isJourney]);
  if(!cycle)return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
    <p style={{color:"#9CA3AF",fontSize:14}}>Cycle not found.</p>
    <button onClick={()=>onNavigate("loom")} className="mt-4 text-sm font-semibold" style={{color:"#9333EA"}}>&larr; Back to The Loom</button>
  </div></div>;
  const pillars=[cycle.rethink,cycle.rediscover,cycle.reinvent].filter(Boolean);
  const synthesisPost=pillars.find(p=>p?.debate?.loom);
  const allStreams=pillars.flatMap(p=>p?.debate?.streams||[]);
  const allParticipants=[...new Set(pillars.flatMap(p=>(p?.debate?.panel?.agents||[]).map(a=>a.name)))];
  const allRounds=pillars.flatMap(p=>p?.debate?.rounds||[]);
  const debatePanel=pillars.find(p=>p?.debate?.panel)?.debate?.panel;
  const cycleShareUrl=typeof window!=='undefined'?window.location.origin+'/loom/'+cycle.id:'';

  // Journey progress dots
  const ACTS=[["rethink","Rethink","#3B6B9B","01"],["rediscover","Rediscover","#E8734A","02"],["reinvent","Reinvent","#2D8A6E","03"]];
  const scrollToAct=(act)=>{const refs={rethink:rethinkRef,rediscover:rediscoverRef,reinvent:reinventRef};refs[act]?.current?.scrollIntoView({behavior:"smooth",block:"start"})};

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}>
    {/* Sticky Journey Header */}
    {isJourney&&<div className="sticky z-40" style={{top:56,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",borderBottom:"1px solid #E5E7EB",padding:"8px 0"}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {cycle.throughLineQuestion&&<p className="text-xs font-semibold text-center mb-1.5" style={{color:"#8B5CF6",fontStyle:"italic"}}>"{cycle.throughLineQuestion}"</p>}
        <div className="flex items-center justify-center gap-2">{ACTS.map(([key,label,color,num],i)=>{const isActive=activeAct===key;const isPast=ACTS.findIndex(a=>a[0]===activeAct)>i;
          return <Fragment key={key}>{i>0&&<div style={{width:32,height:2,background:isPast||isActive?`linear-gradient(90deg,${ACTS[i-1][2]},${color})`:"#E5E7EB",borderRadius:4}}/>}
            <button onClick={()=>scrollToAct(key)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all" style={{background:isActive?`${color}12`:"transparent",border:isActive?`1px solid ${color}30`:"1px solid transparent"}}>
              <div className="w-3 h-3 rounded-full" style={{background:isActive||isPast?color:"#E5E7EB"}}/>
              <span className="font-bold text-xs hidden sm:inline" style={{color:isActive?color:isPast?"#666":"#CCC"}}>{label}</span>
            </button></Fragment>})}</div>
      </div>
    </div>}

    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center justify-between mb-6">
      <button onClick={()=>onNavigate("loom")} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.5)"}}>&larr; Back to The Loom</button>
      <div className="flex gap-2">
        <ShareButton title={`Re³ Cycle ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this synthesis cycle on Re³" url={cycleShareUrl}/>
        {onForge&&<button onClick={()=>onForge({title:cycle.throughLineQuestion||cycle.headline||pillars[0]?.title||"",text:pillars.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n"),sourceType:"cycle",cycleDate:cycle.date,cycleId:cycle.id})} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{background:"#9333EA",color:"white"}}>Debate Full Cycle</button>}
      </div>
    </div></FadeIn>

    {/* Cycle Header */}
    <FadeIn delay={40}><div className="mb-8 text-center">
      <span className="font-bold px-2.5 py-0.5 rounded-full" style={{fontSize:11,background:"#F3E8FF",color:"#9333EA"}}>Cycle {cycle.number}{cycle.headline?': '+cycle.headline:''}</span>
      <span className="ml-2" style={{fontSize:12,color:"#9CA3AF"}}>{fmtS(cycle.date)}</span>
      {isJourney&&<div className="flex items-center justify-center gap-1.5 mt-2">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts[type];return a?<span key={type} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E"}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Questions":type==="principle"?"💡 1 Principle":"🔧 1 Blueprint"}</span>:null})}</div>}
    </div></FadeIn>

    {/* Journey View — sequential acts with transitions */}
    {isJourney ? <>
      {/* ACT 1: RETHINK */}
      {cycle.rethink&&<div ref={rethinkRef} data-act="rethink" className="mb-2">
        <FadeIn delay={80}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #3B6B9B`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#3B6B9B",letterSpacing:"0.1em"}}>01 &middot; RETHINK</span><OrchestratorAvatar type="hypatia" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.rethink.title}</h2>
            {cycle.rethink.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#F0F4F8",border:"1px solid #D5DDE5",fontSize:13,color:"#3B6B9B",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#3B6B9B",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#CBD5E0"}}>|</span>{cycle.rethink.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.rethink.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            <ArtifactBox type="questions" data={cycle.rethink.artifact}/>
            {cycle.rethink.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.rethink.comments.length})</h4><div className="space-y-1.5">{cycle.rethink.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
        {cycle.rediscover&&<BridgeTransition from="rethink" to="rediscover" bridgeSentence={cycle.rethink.bridgeSentence}/>}
      </div>}

      {/* ACT 2: REDISCOVER */}
      {cycle.rediscover&&<div ref={rediscoverRef} data-act="rediscover" className="mb-2">
        <FadeIn delay={120}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #E8734A`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#E8734A",letterSpacing:"0.1em"}}>02 &middot; REDISCOVER</span><OrchestratorAvatar type="socratia" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.rediscover.title}</h2>
            {cycle.rediscover.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5",fontSize:13,color:"#E8734A",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#E8734A",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#F5D5C0"}}>|</span>{cycle.rediscover.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.rediscover.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            {/* Patterns Discovered */}
            {cycle.rediscover.patterns&&cycle.rediscover.patterns.length>0&&<div className="mt-4 p-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5"}}>
              <span className="font-bold text-xs" style={{color:"#E8734A",letterSpacing:"0.05em"}}>PATTERNS DISCOVERED</span>
              <div className="mt-2 space-y-2">{cycle.rediscover.patterns.map((pat,i)=><div key={i} className="flex items-start gap-2"><span className="font-bold text-xs mt-0.5" style={{color:"#E8734A"}}>{pat.domain}{pat.year?` (${pat.year})`:""}</span><span className="text-sm" style={{color:"#666"}}>{pat.summary}</span></div>)}</div>
            </div>}
            <ArtifactBox type="principle" data={cycle.rediscover.artifact}/>
            {cycle.rediscover.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.rediscover.comments.length})</h4><div className="space-y-1.5">{cycle.rediscover.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
        {cycle.reinvent&&<BridgeTransition from="rediscover" to="reinvent" bridgeSentence={cycle.rediscover.bridgeSentence}/>}
      </div>}

      {/* ACT 3: REINVENT */}
      {cycle.reinvent&&<div ref={reinventRef} data-act="reinvent" className="mb-8">
        <FadeIn delay={160}><div className="rounded-2xl overflow-hidden" style={{background:"white",border:"1px solid #E5E7EB",borderLeft:`5px solid #2D8A6E`}}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:"#2D8A6E",letterSpacing:"0.1em"}}>03 &middot; REINVENT</span><OrchestratorAvatar type="ada" size={16}/></div>
            <h2 className="font-bold mt-2 mb-4" style={{fontFamily:"'Instrument Serif',Georgia,serif",color:"#111827",fontSize:24,lineHeight:1.2}}>{cycle.reinvent.title}</h2>
            {cycle.reinvent.tldr&&<div className="mb-4 px-4 py-3 rounded-xl" style={{background:"#E0F2EC",border:"1px solid #B8DFD0",fontSize:13,color:"#2D8A6E",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",color:"#2D8A6E",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",color:"#A8D5C4"}}>|</span>{cycle.reinvent.tldr}</div>}
            <div style={{fontSize:15,color:"#444",lineHeight:1.9}}>{cycle.reinvent.paragraphs?.map((p,i)=>{if(p.startsWith("```"))return <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto" style={{background:"#1E1E2E",color:"#D4D4D4",fontSize:13,lineHeight:1.5}}><code>{p.replace(/```\w*\n?/g,"").replace(/```$/,"")}</code></pre>;return <div key={i} className="mb-3">{renderParagraph(p)}</div>})}</div>
            <ArtifactBox type="blueprint" data={cycle.reinvent.artifact}/>
            {/* Open Thread */}
            {cycle.reinvent.openThread&&<div className="mt-4 p-3 rounded-xl" style={{background:"#E0F2EC",border:"1px solid #2D8A6E30"}}>
              <span className="font-bold text-xs" style={{color:"#2D8A6E"}}>🌀 OPEN THREAD</span>
              <p className="text-sm mt-1" style={{color:"#555",lineHeight:1.5}}>{cycle.reinvent.openThread}</p>
              <p className="text-xs mt-1" style={{color:"rgba(0,0,0,0.3)",fontStyle:"italic"}}>This seeds the next cycle...</p>
            </div>}
            {cycle.reinvent.comments?.length>0&&<div className="mt-4 pt-3" style={{borderTop:"1px solid #E5E7EB"}}><h4 className="font-bold text-xs mb-2" style={{color:"#9CA3AF"}}>Discussion ({cycle.reinvent.comments.length})</h4><div className="space-y-1.5">{cycle.reinvent.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2 rounded-lg" style={{background:"#F9FAFB"}}><p style={{color:"#555",lineHeight:1.5,fontSize:12}}>{c.text}</p></div></div>})}</div></div>}
          </div>
        </div></FadeIn>
      </div>}

      {/* Journey Complete Footer */}
      <FadeIn delay={200}><div className="p-6 rounded-2xl text-center" style={{background:"white",border:"1px solid #E5E7EB"}}>
        <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Journey Complete</h3>
        <div className="flex items-center justify-center gap-3 mb-4">{["questions","principle","blueprint"].map(type=>{const a=cycle.artifacts[type];return a?<span key={type} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{background:type==="questions"?"#E8EEF5":type==="principle"?"#FDE8E0":"#E0F2EC",color:type==="questions"?"#3B6B9B":type==="principle"?"#E8734A":"#2D8A6E"}}>{type==="questions"?"🔍 "+(a.items?.length||0)+" Questions":type==="principle"?"💡 1 Principle":"🔧 1 Blueprint"}</span>:null})}</div>
        <div className="flex items-center justify-center gap-3">
          {onForge&&<button onClick={()=>onForge({title:cycle.throughLineQuestion||cycle.headline||pillars[0]?.title||"",text:pillars.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n"),sourceType:"cycle",cycleDate:cycle.date,cycleId:cycle.id})} className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Debate This Cycle</button>}
          <ShareButton title={`Re³ Cycle ${cycle.number}${cycle.headline?': '+cycle.headline:''}`} text="Explore this synthesis cycle on Re³" url={cycleShareUrl}/>
        </div>
      </div></FadeIn>
    </> : <>
      {/* CLASSIC VIEW — Three pillar cards (for legacy cycles without journey metadata) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">{pillars.map((post,i)=>{const pillar=PILLARS[post.pillar];
        return <FadeIn key={post.id} delay={80+i*40}><div className="rounded-xl overflow-hidden" style={{background:"white",border:`1px solid ${pillar.color}25`,borderLeft:`4px solid ${pillar.color}`}}>
          <div className="p-4">
            <PillarTag pillar={post.pillar}/>
            <h3 className="font-bold mt-2 mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,color:"#111827",lineHeight:1.3}}>{post.title}</h3>
            <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.45)",lineHeight:1.6}}>{post.paragraphs?.[0]?.slice(0,250)}...</p>
            <button onClick={()=>onNavigate("post",post.id)} className="text-xs font-semibold" style={{color:"#9333EA"}}>Read full post &rarr;</button>
          </div>
        </div></FadeIn>})}</div>
    </>}

    {/* Synthesis & Streams (shared between journey and classic) */}
    {synthesisPost?.debate?.loom&&<FadeIn delay={200}><div className="p-6 rounded-2xl mb-8" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-2 mb-3"><OrchestratorAvatar type="hypatia" size={20}/><h3 className="font-bold" style={{color:"#3B6B9B",fontSize:18}}>{"Hypatia\u2019s Loom \u2014 A Synthesis"}</h3></div>
      <div style={{fontSize:14,color:"#555",lineHeight:1.9}}>{synthesisPost.debate.loom.split("\n\n").map((p,i)=><p key={i} className="mb-3">{p}</p>)}</div>
    </div></FadeIn>}
    {allStreams.length>0&&<FadeIn delay={260}><div className="mb-8">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Argument Streams</h3>
      {allStreams.map((stream,si)=><div key={si} className="mb-4 p-4 rounded-xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
        <h4 className="font-bold text-sm mb-2" style={{color:"#111827"}}>{stream.title}</h4>
        <div className="space-y-1.5">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2 text-xs"><span className="font-bold" style={{color:"#999"}}>{entry.agent}</span><span style={{color:"#666"}}>{entry.excerpt}</span></div>)}</div>
      </div>)}
    </div></FadeIn>}
    {allParticipants.length>0&&<FadeIn delay={300}><div className="mb-8">
      <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Debate Participants</h3>
      <div className="flex flex-wrap gap-2">{allParticipants.map(name=><span key={name} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{background:"#F3F4F6",color:"#4B5563"}}>{name}</span>)}</div>
    </div></FadeIn>}
    {allRounds.length>0&&<FadeIn delay={320}><div className="mb-8">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Debate Rounds ({allRounds.length})</h3>
      {allRounds.map((round,ri)=><div key={ri} className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6"}}>Round {ri+1}</h4><div className="space-y-2">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);return <div key={idx} className="p-3 rounded-xl" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}><div className="flex items-center gap-2 mb-1"><span className="font-bold text-xs" style={{color:agent?.color||"#666"}}>{r.name||agent?.name||"Agent"}</span><span className="text-xs" style={{color:"#CCC"}}>{agent?.role||agent?.category||""}</span></div><p className="text-xs" style={{color:"#555",lineHeight:1.6}}>{r.response}</p></div>})}</div></div>)}
    </div></FadeIn>}
    {debatePanel?.rationale&&<FadeIn delay={340}><div className="mb-8 p-4 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}><h4 className="font-bold text-xs mb-1" style={{color:"#8B5CF6"}}>Panel Selection Rationale</h4><p className="text-xs" style={{color:"#666",lineHeight:1.6}}>{debatePanel.rationale}</p></div></FadeIn>}
    {!isJourney&&onForge&&pillars[0]&&<FadeIn delay={360}><button onClick={()=>onForge({title:pillars[0].title,text:pillars[0].paragraphs?.[0]||"",sourceType:"loom"})} className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Continue in Debate Lab &rarr;</button></FadeIn>}
  </div></div>;
}

// ==================== THE LOOM — Cycles Archive ====================
function LoomPage({content,articles,onNavigate,onForge,onArchiveCycle,currentUser}){
  const cycles=getCycles(content);
  const[expandedCycle,setExpandedCycle]=useState(null);
  const[loomFilter,setLoomFilter]=useState('all');
  const filteredCycles=loomFilter==='all'?cycles:cycles.filter(c=>{if(loomFilter==='rethink')return c.rethink;if(loomFilter==='rediscover')return c.rediscover;if(loomFilter==='reinvent')return c.reinvent;return true});
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>The Loom</h1><p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Every cycle weaves three threads. {cycles.length} cycle{cycles.length!==1?'s':''} so far.</p></FadeIn>

    {/* Filter chips */}
    <FadeIn delay={30}><div className="flex flex-wrap items-center gap-2 mb-6">
      {[['all','All Cycles',cycles.length],['rethink','Rethink',cycles.filter(c=>c.rethink).length],['rediscover','Rediscover',cycles.filter(c=>c.rediscover).length],['reinvent','Reinvent',cycles.filter(c=>c.reinvent).length]].map(([key,label,count])=>
        <button key={key} onClick={()=>setLoomFilter(key)} className="px-3 py-1.5 rounded-full font-medium text-sm transition-all" style={{background:loomFilter===key?'#9333EA':'#FFFFFF',color:loomFilter===key?'white':'#4B5563',border:loomFilter===key?'1px solid #9333EA':'1px solid #E5E7EB'}}>{key!=='all'&&<span style={{marginRight:4}}>{key==='rethink'?'△':key==='rediscover'?'◇':'▢'}</span>}{label} ({count})</button>
      )}
      <span className="ml-auto text-sm" style={{color:'#6B7280'}}>Showing <b>{filteredCycles.length}</b> of {cycles.length} cycles</span>
    </div></FadeIn>

    {/* Cycle grid */}
    <div className="space-y-4">{filteredCycles.length>0?filteredCycles.map((c,i)=><FadeIn key={c.id} delay={i*50}>
      <TriptychCard cycle={c} onExpand={(id)=>onNavigate("loom-cycle",id)} onArchiveCycle={onArchiveCycle} currentUser={currentUser}/>
    </FadeIn>):<FadeIn><div className="p-6 rounded-xl text-center" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}><p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#9CA3AF"}}>No cycles match this filter.</p></div></FadeIn>}</div>
  </div></div>
}

// ==================== POST PAGE ====================
function PostPage({post,allContent,onNavigate,currentUser,onEndorse,onComment,onReact,onAddChallenge,onAddMarginNote,agents,registry,registryIndex,onUpdatePost}){
  const[comment,setComment]=useState("");const[endorsed,setEndorsed]=useState(false);const[newCh,setNewCh]=useState("");const[showNote,setShowNote]=useState(null);const[noteText,setNoteText]=useState("");
  const author=getAuthor(post.authorId);const pillar=PILLARS[post.pillar];
  const bFrom=post.bridgeFrom?allContent.find(c=>c.id===post.bridgeFrom):null;
  const bTo=post.bridgeTo?allContent.find(c=>c.id===post.bridgeTo):null;
  // Find sibling posts in same cycle
  const siblings=post.sundayCycle?allContent.filter(c=>c.sundayCycle===post.sundayCycle&&c.id!==post.id):[];
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><article className="mx-auto py-8" style={{maxWidth:720,background:"#FFFFFF",borderRadius:16,padding:"32px 40px",margin:"32px auto",boxShadow:"0 2px 16px rgba(0,0,0,0.06)"}}>
    <FadeIn><button onClick={()=>onNavigate("home")} style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#CCC",marginBottom:24,display:"block"}}>&larr; Back</button></FadeIn>
    <FadeIn delay={40}><div className="flex flex-wrap items-center gap-2 mb-3"><PillarTag pillar={post.pillar} size="md"/>{post.type==="bridge"&&<span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F5F0FA",color:"#8B5CF6"}}>BRIDGE</span>}{post.sundayCycle&&<span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,color:"#CCC",background:"#F3F4F6"}}>CYCLE</span>}</div></FadeIn>
    <FadeIn delay={60}><h1 className="font-bold leading-tight mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(20px,3.5vw,30px)",letterSpacing:"-0.02em"}}>{post.title}</h1></FadeIn>
    {post.type==="bridge"&&(bFrom||bTo)&&<FadeIn delay={70}><div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl" style={{background:"#F5F0FA",border:"1px dashed #D4C4F0"}}><span style={{fontSize:11,color:"#8B5CF6"}}>Bridging:</span>{bFrom&&<button onClick={()=>onNavigate("post",bFrom.id)} className="font-semibold underline text-xs" style={{color:PILLARS[bFrom.pillar]?.color}}>{bFrom.title.slice(0,30)}...</button>}<span style={{color:"#D4C4F0"}}>&harr;</span>{bTo&&<button onClick={()=>onNavigate("post",bTo.id)} className="font-semibold underline text-xs" style={{color:PILLARS[bTo.pillar]?.color}}>{bTo.title.slice(0,30)}...</button>}</div></FadeIn>}
    <FadeIn delay={80}><div className="flex items-center justify-between pb-4 mb-6" style={{borderBottom:"1px solid #E5E7EB"}}><AuthorBadge author={author} size="md"/><span style={{fontSize:12,color:"#CCC"}}>{fmt(post.createdAt)}</span></div></FadeIn>

    {post.tldr&&<FadeIn delay={90}><div className="mb-5 px-4 py-3 rounded-xl" style={{background:pillar?.lightBg||"#F3F4F6",border:`1px solid ${pillar?.color||"#CCC"}20`,fontSize:13,color:pillar?.color||"#666",lineHeight:1.6,fontStyle:"italic"}}><span className="font-bold" style={{fontSize:10,letterSpacing:"0.05em",fontStyle:"normal"}}>TL;DR</span><span style={{margin:"0 6px",opacity:0.3}}>|</span>{post.tldr}</div></FadeIn>}

    <div className="mb-6">{post.paragraphs.map((para,i)=>{
      const hc=post.highlights?.[i]||0;const rx=post.reactions?.[i]||{};const notes=(post.marginNotes||[]).filter(n=>n.paragraphIndex===i);
      if(para.startsWith("```")){const lines=para.split("\n");const lang=lines[0].replace("```","");const code=lines.slice(1).join("\n");
        return <div key={i} className="my-4 rounded-xl overflow-hidden border" style={{borderColor:"#E5E7EB"}}>{lang&&<div className="px-4 py-1.5 flex items-center gap-2" style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB",fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:"#CCC"}}><span className="rounded-full" style={{width:5,height:5,background:"#E8734A"}}/><span className="rounded-full" style={{width:5,height:5,background:"#3B6B9B"}}/><span className="rounded-full" style={{width:5,height:5,background:"#2D8A6E"}}/><span className="ml-1">{lang.toUpperCase()}</span></div>}<pre className="p-4 overflow-x-auto text-xs" style={{background:"#F9FAFB",color:"#555",fontFamily:"monospace",lineHeight:1.7}}>{code}</pre></div>}
      return <FadeIn key={i} delay={100+i*20}><div className="group relative flex gap-2 mb-0.5">
        <div className="flex-shrink-0 flex flex-col justify-center py-1" style={{width:3}}>{hc>0&&<HeatBar count={hc}/>}</div>
        <div className="flex-1 py-1.5 px-1 rounded-lg transition-all" onMouseEnter={e=>e.currentTarget.style.background="rgba(232,115,74,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{fontSize:"clamp(13.5px,1.7vw,15px)",lineHeight:1.9,color:"#555"}}>{renderParagraph(para)}</div>
          <div className="flex items-center justify-between mt-0.5"><ParagraphReactions reactions={rx} onReact={onReact} paragraphIndex={i}/>{currentUser&&<button onClick={()=>{setShowNote(showNote===i?null:i);setNoteText("")}} className="opacity-0 group-hover:opacity-100 px-1.5 py-0 rounded transition-all" style={{fontSize:9,color:"#CCC"}}>+ note</button>}</div>
          {notes.length>0&&<div className="mt-1.5 space-y-1">{notes.map(n=>{const na=getAuthor(n.authorId);return <div key={n.id} className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg" style={{fontSize:11,background:"#FDF8F5",border:"1px solid #F8E8DD"}}><span className="font-semibold flex-shrink-0" style={{color:"#E8734A"}}>{na?.name}:</span><span style={{color:"#888"}}>{n.text}</span></div>})}</div>}
          {showNote===i&&<div className="mt-1.5 flex gap-1.5"><input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Quick thought..." className="flex-1 px-2.5 py-1 rounded-lg border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(noteText.trim()){onAddMarginNote(post.id,i,noteText.trim());setShowNote(null);setNoteText("")}}} className="px-2.5 py-1 rounded-lg font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Add</button></div>}
        </div></div></FadeIn>})}</div>

    <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      {post.tags.map(t=><span key={t} className="px-2 py-0.5 rounded-full" style={{fontSize:10,background:"#F3F4F6",color:"#999"}}>{t}</span>)}<div className="flex-1"/>
      <button onClick={()=>{if(!endorsed){onEndorse(post.id);setEndorsed(true)}}} className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all" style={{fontSize:11,background:endorsed?`${pillar?.color}08`:"white",border:`1.5px solid ${endorsed?pillar?.color:"#E0E0E0"}`,color:endorsed?pillar?.color:"#BBB"}}>{endorsed?"\u2665":"\u2661"} {post.endorsements+(endorsed?1:0)}</button>
      <ShareButton title={post.title} text={post.paragraphs?.[0]?.slice(0,140)}/>
    </div>

    {(post.challenges||[]).length>0&&<div className="mb-5"><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Challenges</h3>
      <div className="space-y-1.5">{post.challenges.map(ch=>{const ca=getAuthor(ch.authorId);return <div key={ch.id} className="flex items-start gap-2 p-2.5 rounded-xl border" style={{background:"#FFFBF8",borderColor:"#F8E8DD"}}><div className="flex-1"><p className="text-sm" style={{color:"#555",lineHeight:1.5}}>{ch.text}</p><span style={{fontSize:10,color:"#CCC"}}>{ca?.name}</span></div><span className="font-bold text-xs" style={{color:"#E8734A"}}>{ch.votes}</span></div>})}</div>
      {currentUser&&<div className="flex gap-1.5 mt-2"><input value={newCh} onChange={e=>setNewCh(e.target.value)} placeholder="Pose a challenge..." className="flex-1 px-3 py-1.5 rounded-xl border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(newCh.trim()){onAddChallenge(post.id,newCh.trim());setNewCh("")}}} className="px-3 py-1.5 rounded-xl font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Challenge</button></div>}
    </div>}

    <div className="mb-6"><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Discussion ({post.comments.length})</h3>
      <div className="space-y-2">{post.comments.map(c=>{const ca=getAuthor(c.authorId);return <div key={c.id} className="flex items-start gap-2"><AuthorBadge author={ca}/><div className="flex-1 p-2.5 rounded-xl" style={{background:"#F9FAFB"}}><p className="text-sm" style={{color:"#555",lineHeight:1.5}}>{c.text}</p><span style={{fontSize:10,color:"#CCC"}}>{fmtS(c.date)}</span></div></div>})}</div>
      {currentUser&&<div className="flex gap-1.5 mt-2"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add to the discussion..." className="flex-1 px-3 py-1.5 rounded-xl border focus:outline-none text-sm" style={{borderColor:"#E5E7EB",color:"#555"}}/><button onClick={()=>{if(comment.trim()){onComment(post.id,comment.trim());setComment("")}}} className="px-3 py-1.5 rounded-xl font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Reply</button></div>}
    </div>

    {siblings.length>0&&<div className="pt-4" style={{borderTop:"1px solid #E5E7EB"}}><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Also in this cycle</h3>
      <div className="space-y-1.5">{siblings.map(s=><div key={s.id} className="p-2.5 rounded-xl border transition-all hover:shadow-sm" style={{background:"white",borderColor:"#E5E7EB"}}><div className="flex items-center gap-2"><PillarTag pillar={s.pillar}/><CrossRefLink post={s} allContent={allContent} onNavigate={onNavigate}/></div></div>)}</div>
    </div>}

    {agents&&<div className="mt-8 pt-6" style={{borderTop:"2px solid #E5E7EB"}}>
      <h2 className="font-bold mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Agent Workshop</h2>
      <AgentWorkshop key={post?.id} article={post} agents={agents} registry={registry} registryIndex={registryIndex} onDebateComplete={(debate)=>{if(onUpdatePost)onUpdatePost({...post,debate})}} currentUser={currentUser}/>
    </div>}
  </article></div>
}


// ==================== DEBATE PANEL — Live debate visualization ====================
function DebateIdentityPanel({panelAgents,rounds,status,isOpen,onToggle}){
  const stanceSummaries={};
  panelAgents?.forEach(agent=>{
    const agentResponses=rounds.flatMap(round=>round.filter(r=>r.id===agent.id&&r.status==="success"));
    stanceSummaries[agent.id]=agentResponses.map(r=>(r.response||"").slice(0,80)+"...");
  });
  const currentRoundData=rounds[rounds.length-1]||[];
  const activeIds=status==="running"?currentRoundData.filter(r=>r.status==="success").map(r=>r.id):[];
  const providerLabel=(model)=>{const mp=MODEL_PROVIDERS.find(m=>m.id===model);return mp?mp.label:model||"Claude"};
  return <div style={{width:isOpen?280:0,minWidth:isOpen?280:0,transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",overflow:"hidden",borderLeft:isOpen?"1px solid #E5E7EB":"none",background:"#FAFAFA",flexShrink:0}}>
    <div style={{width:280,padding:16}}>
      <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-sm" style={{color:"#111827"}}>Panel</h4><button onClick={onToggle} style={{fontSize:10,color:"#9CA3AF"}}>Close &times;</button></div>
      {panelAgents?.map(agent=>{const isActive=activeIds.includes(agent.id);const stances=stanceSummaries[agent.id]||[];
        return <div key={agent.id} className="mb-3 p-3 rounded-xl transition-all" style={{background:isActive?`${agent.color}08`:"white",border:`1px solid ${isActive?agent.color+"40":"#E5E7EB"}`,boxShadow:isActive?`0 0 12px ${agent.color}15`:"none"}}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{background:`${agent.color}20`,color:agent.color,fontSize:9,border:`1.5px solid ${agent.color}40`}}>{agent.avatar}</div>
            <div><h5 className="font-bold text-xs" style={{color:"#111827"}}>{agent.name}</h5><span style={{fontSize:9,color:"#9CA3AF"}}>{agent.category||agent.role||""}</span></div>
            {isActive&&<span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{background:agent.color}}/>}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded mb-1.5" style={{fontSize:8,background:"#F3F4F6",color:"#9CA3AF"}}>{providerLabel(agent.model)}</span>
          {stances.length>0&&<div className="mt-1.5 space-y-1">{stances.map((s,i)=><div key={i} className="text-xs p-1.5 rounded" style={{background:"#F9FAFB",color:"#6B7280",fontSize:10}}><span className="font-semibold" style={{color:agent.color}}>R{i+1}: </span>{s}</div>)}</div>}
        </div>})}
    </div>
  </div>;
}

function DebatePanel({article,topic,agents,onDebateComplete,onSaveSession,currentUser}){
  const isCycleDebate=topic?.sourceType==="cycle";
  const topicTitle=isCycleDebate?(topic?.title||"Full Cycle Debate"):(article?.title||topic?.title||"");
  const topicText=isCycleDebate?(topic?.text||""):(article?.paragraphs?.join("\n\n")||article?.htmlContent?.replace(/<[^>]*>/g," ")||topic?.text||"");
  const existingDebate=article?.debate;
  const[status,setStatus]=useState(existingDebate?"complete":"idle");const[step,setStep]=useState(existingDebate?"Complete!":"");const[panel,setPanel]=useState(existingDebate?.panel||null);const[rounds,setRounds]=useState(existingDebate?.rounds||[]);const[atlas,setAtlas]=useState(existingDebate?.atlas||null);const[loom,setLoom]=useState(existingDebate?.loom||null);const[streams,setStreams]=useState(existingDebate?.streams||[]);const[error,setError]=useState("");const[progress,setProgress]=useState(existingDebate?100:0);const[toast,setToast]=useState("");const debateRef=useRef(null);
  const[sidePanelOpen,setSidePanelOpen]=useState(typeof window!=='undefined'&&window.innerWidth>=768);

  const scrollToBottom=()=>{if(debateRef.current)debateRef.current.scrollIntoView({behavior:"smooth",block:"end"})};
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(""),4000)};
  const admin=isAdmin(currentUser);

  const startDebate=async()=>{
    if(!admin)return;
    setStatus("running");setError("");setProgress(0);
    const articleText=topicText;
    const activeAgents=agents.filter(a=>a.status==="active");
    if(activeAgents.length===0){setError("No active agents available. Add agents in Agent Community first.");setStatus("error");return}
    try{
      // Step 1: Ada selects panel
      setStep("Selecting panel...");setProgress(5);
      const sel=await authFetch("/api/debate/select",{articleTitle:topicTitle,articleText,agents:activeAgents,forgePersona:ORCHESTRATORS.forge.persona});
      let selectedAgents=activeAgents.filter(a=>sel.selected.includes(a.id));
      // Fallback: if LLM returned names instead of IDs, try matching by name
      if(selectedAgents.length===0&&sel.selected?.length>0){
        selectedAgents=activeAgents.filter(a=>sel.selected.some(s=>s.toLowerCase()===a.name.toLowerCase()||s.toLowerCase()===a.id.toLowerCase()||a.id.includes(s.toLowerCase().replace(/\s+/g,"_"))));
      }
      // Final fallback: pick first 5 active agents rather than failing
      if(selectedAgents.length===0){selectedAgents=activeAgents.slice(0,5);showToast("Couldn't select agents — using default panel")}
      setPanel({agents:selectedAgents,rationale:sel.rationale});setProgress(15);
      scrollToBottom();

      // Steps 2-4: Three rounds
      const allRounds=[];
      for(let r=1;r<=3;r++){
        const responded=allRounds.flat().filter(x=>x.status==="success").length;
        const total=selectedAgents.length*r;
        setStep(`Round ${r}/3: ${r===1?"Initial positions":r===2?"Cross-responses":"Final positions"} (${responded}/${selectedAgents.length*3} total responses)`);
        const roundData=await authFetch("/api/debate/round",{articleTitle:topicTitle,articleText,agents:selectedAgents,roundNumber:r,previousRounds:allRounds});
        // Add timestamps to responses
        const timestampedResponses=roundData.responses.map(resp=>({...resp,timestamp:new Date().toISOString()}));
        allRounds.push(timestampedResponses);
        setRounds([...allRounds]);
        setProgress(15+r*20);
        scrollToBottom();
        // Check if all agents failed in this round
        const successCount=timestampedResponses.filter(r=>r.status==="success").length;
        if(successCount===0){showToast(`All agents failed in Round ${r}. Ending debate early.`);break}
      }

      // Check if we have any successful responses at all
      const totalSuccessful=allRounds.flat().filter(r=>r.status==="success").length;
      if(totalSuccessful===0){setError("No agents were able to participate. Check API keys and agent configurations.");setStatus("error");return}

      // Step 5: Socratia moderation
      setStep("Reviewing discussion...");setProgress(80);
      showToast("Debate rounds complete — Socratia is reviewing...");
      const modData=await authFetch("/api/debate/moderate",{articleTitle:topicTitle,rounds:allRounds,atlasPersona:ORCHESTRATORS.atlas.persona});
      setAtlas(modData);setProgress(88);
      scrollToBottom();

      // Step 6: Hypatia Loom + clustering
      setStep("Hypatia weaving The Loom...");setProgress(90);
      showToast("Debate complete — Hypatia is weaving the Loom...");
      const loomData=await authFetch("/api/debate/loom",{articleTitle:topicTitle,articleText,rounds:allRounds,atlasNote:modData.intervention,forgeRationale:sel.rationale,panelNames:selectedAgents.map(a=>a.name),sagePersona:ORCHESTRATORS.sage.persona});
      setLoom(loomData.loom);setStreams(loomData.streams||[]);setProgress(100);

      setStep("Complete!");setStatus("complete");
      showToast("Loom ready! Hypatia has woven the synthesis.");
      scrollToBottom();
      if(onDebateComplete)onDebateComplete({panel:{agents:selectedAgents,rationale:sel.rationale},rounds:allRounds,atlas:modData,loom:loomData.loom,streams:loomData.streams||[]});
      if(onSaveSession&&admin)onSaveSession({mode:"debate",topic:topicTitle,results:{panel:{agents:selectedAgents.map(a=>({id:a.id,name:a.name,color:a.color,avatar:a.avatar})),rationale:sel.rationale},rounds:allRounds,loom:loomData.loom,streams:loomData.streams||[]}});
    }catch(e){console.error("Debate error:",e);setError(e.message);setStatus("error")}
  };

  const getAgentColor=(name)=>{const a=[...agents,...Object.values(ORCHESTRATORS)].find(x=>x.name===name);return a?.color||"#999"};
  const getAgentAvatar=(name)=>{const a=agents.find(x=>x.name===name);return a?.avatar||name.charAt(0)};

  if(status==="idle"){
    if(!admin)return <div className="p-4 rounded-xl text-center" style={{background:"#F9FAFB",border:"1px solid #E5E7EB"}}><p className="text-sm" style={{color:"#CCC"}}>No debate has been run for this article yet.</p></div>;
    return <button onClick={startDebate} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Start Agent Debate</button>;
  }

  return <div className="flex rounded-2xl border overflow-hidden" style={{background:"white",borderColor:"#E5E7EB"}}>
    <div ref={debateRef} className="flex-1 min-w-0">
    {panel&&!sidePanelOpen&&<button onClick={()=>setSidePanelOpen(true)} className="absolute right-2 top-2 px-2 py-1 rounded-lg text-xs font-semibold z-10" style={{background:"#F3E8FF",color:"#9333EA"}}>Panel ▸</button>}
    {toast&&<div className="mx-4 mt-3 p-2.5 rounded-xl animate-pulse" style={{background:"#EBF5F1",border:"1px solid #B2DFDB"}}><p className="text-xs font-semibold" style={{color:"#2D8A6E"}}>{toast}</p></div>}
    {status==="running"&&<div className="p-4" style={{background:"#F9FAFB",borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm" style={{color:"#111827"}}>Debate in Progress</span><span className="text-xs font-bold" style={{color:"#E8734A"}}>{progress}%</span></div>
      <div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"#E5E7EB"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#3B6B9B,#E8734A,#2D8A6E)",transition:"width 0.5s ease"}}/></div>
      <p className="text-xs" style={{color:"#999"}}>{step}</p>
      {rounds.length===0&&<div className="mt-3 space-y-2">{[1,2,3].map(i=><div key={i} className="animate-pulse flex items-center gap-2 p-2 rounded-lg" style={{background:"#F3F4F6"}}><div className="w-5 h-5 rounded-full" style={{background:"#E8E8E8"}}/><div className="flex-1"><div className="h-2.5 rounded" style={{background:"#E8E8E8",width:`${60+i*10}%`}}/><div className="h-2 rounded mt-1.5" style={{background:"#E5E7EB",width:`${40+i*15}%`}}/></div></div>)}</div>}
    </div>}

    {error&&<div className="p-3 m-3 rounded-xl" style={{background:"#FFF5F5"}}><p className="text-xs" style={{color:"#E53E3E"}}>Error: {error}</p><button onClick={()=>{setStatus("idle");setError("")}} className="text-xs font-semibold mt-1" style={{color:"#3B6B9B"}}>Retry</button></div>}

    {panel&&<div className="p-4" style={{borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full flex items-center justify-center" style={{border:"1.5px dashed #2D8A6E40"}}><OrchestratorAvatar type="ada" size={18}/></div><span className="font-bold text-xs" style={{color:"#2D8A6E"}}>Panel selected</span></div>
      <div className="flex flex-wrap gap-1.5 mb-2">{panel.agents.map(a=><span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{background:`${a.color}10`,border:`1px solid ${a.color}25`}}><span className="w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:7}}>{a.avatar}</span><span className="font-semibold" style={{fontSize:10,color:a.color}}>{a.name}</span></span>)}</div>
      <p className="text-xs" style={{color:"#999",lineHeight:1.5}}>{panel.rationale}</p>
    </div>}

    {streams.length>0?<div className="p-4">
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:15}}>Argument Streams</h3>
      {streams.map((stream,si)=><div key={si} className="mb-4">
        <div className="flex items-center gap-2 mb-2"><div className="w-1.5 rounded-full" style={{height:14,background:"linear-gradient(180deg,#E8734A,#3B6B9B)"}}/><h4 className="font-bold text-xs" style={{color:"#111827"}}>{stream.title}</h4></div>
        <div className="ml-3 space-y-1.5" style={{borderLeft:"2px solid #F3F4F6",paddingLeft:12}}>
          {stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5" style={{background:`${getAgentColor(entry.agent)}15`,color:getAgentColor(entry.agent),fontSize:7}}>{getAgentAvatar(entry.agent)}</div>
            <div><span className="font-bold" style={{fontSize:10,color:getAgentColor(entry.agent)}}>{entry.agent}</span><span className="text-xs" style={{color:"#CCC"}}> R{entry.round}</span><p className="text-xs mt-0.5" style={{color:"#666",lineHeight:1.5}}>{entry.excerpt}</p></div>
          </div>)}
        </div>
      </div>)}
    </div>:rounds.length>0&&<div className="p-4">
      {rounds.map((round,ri)=><div key={ri} className="mb-3"><h4 className="font-bold text-xs mb-1.5" style={{color:"#CCC"}}>Round {ri+1}</h4>
        <div className="space-y-1.5">{round.map(r=><div key={r.id} className="flex items-start gap-2 p-2 rounded-lg" style={{background:r.status==="failed"?"#FFF5F5":"#F9FAFB"}}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${getAgentColor(r.name)}15`,color:getAgentColor(r.name),fontSize:7}}>{getAgentAvatar(r.name)}</div>
          <div className="flex-1"><div className="flex items-center gap-1.5"><span className="font-bold" style={{fontSize:10,color:getAgentColor(r.name)}}>{r.name}</span>{r.model&&<span className="px-1 py-0 rounded" style={{fontSize:7,background:"#F3F4F6",color:"#BBB"}}>{r.model}</span>}{r.timestamp&&<span style={{fontSize:8,color:"#DDD"}}>{new Date(r.timestamp).toLocaleTimeString()}</span>}</div>{r.status==="failed"?<span className="text-xs" style={{color:"#E53E3E"}}>Response unavailable — {r.error||"agent timed out"}</span>:<p className="text-xs mt-0.5" style={{color:"#666",lineHeight:1.5}}>{r.response?.slice(0,200)}...</p>}</div>
        </div>)}</div>
      </div>)}
    </div>}

    {atlas&&<div className="mx-4 mb-3 p-3 rounded-xl" style={{background:"#FFF8F0",border:"1px solid #F8E8D5"}}>
      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{border:"1px dashed #E8734A40"}}><OrchestratorAvatar type="socratia" size={16}/></div><span className="font-bold text-xs" style={{color:"#E8734A"}}>Socratia</span><span className="text-xs" style={{color:"#CCC"}}>{atlas.on_topic?"On topic":"Intervention"}</span></div>
      <p className="text-xs" style={{color:"#888",lineHeight:1.5}}>{atlas.intervention}</p>
      {atlas.missing_perspectives&&<p className="text-xs mt-1" style={{color:"#BBB",fontStyle:"italic"}}>Missing: {atlas.missing_perspectives}</p>}
    </div>}

    {loom&&<div className="m-4 p-4 rounded-2xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
      <div className="flex items-center gap-2 mb-3"><span style={{fontSize:16}}>&#128296;</span><h3 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#3B6B9B",fontSize:16}}>Hypatia&apos;s Loom &mdash; A Synthesis</h3></div>
      <div style={{fontSize:13,color:"#555",lineHeight:1.9}}>{loom.split("\n\n").map((p,i)=><p key={i} className="mb-2">{p}</p>)}</div>
    </div>}

    {status==="complete"&&<div className="px-4 pb-3"><DebateExport panel={panel} rounds={rounds} loom={loom} streams={streams} atlas={atlas} topicTitle={topicTitle}/></div>}
    {status==="complete"&&admin&&<div className="p-3 mx-4 mb-4"><button onClick={()=>{setStatus("idle");setPanel(null);setRounds([]);setAtlas(null);setLoom(null);setStreams([]);setProgress(0);setToast("")}} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:shadow-sm" style={{border:"1.5px solid #E5E7EB",color:"#999"}}>Run New Debate</button></div>}
    </div>{/* end content wrapper */}
    {panel&&<DebateIdentityPanel panelAgents={panel.agents} rounds={rounds} status={status} isOpen={sidePanelOpen} onToggle={()=>setSidePanelOpen(!sidePanelOpen)}/>}
  </div>
}

// ==================== AGENT WORKSHOP — Tabbed Debate + Implement ====================
function AgentWorkshop({article,topic,agents,registry,registryIndex,onDebateComplete,onSaveSession,currentUser}){
  const wsTitle=article?.title||topic?.title||"";
  const wsText=article?.paragraphs?.join("\n\n")||article?.htmlContent?.replace(/<[^>]*>/g," ")||topic?.text||"";
  const[activeTab,setActiveTab]=useState("debate");
  const[implStatus,setImplStatus]=useState("idle");const[implStep,setImplStep]=useState("");const[implProgress,setImplProgress]=useState(0);const[implResult,setImplResult]=useState(null);const[implError,setImplError]=useState("");
  const admin=isAdmin(currentUser);

  // Helper: Pre-filter agents by capability from registry
  const getRegistryAgents=(capability,count=15)=>{
    if(!registryIndex?.byId)return[];
    return Object.values(registryIndex.byId).sort((a,b)=>(b.capabilities?.[capability]||0)-(a.capabilities?.[capability]||0)).slice(0,count);
  };

  // Combine registry + custom agents, picking best by capability
  const selectAgentPool=(capability)=>{
    const customActive=agents.filter(a=>a.status==="active");
    const registryTop=getRegistryAgents(capability,40);
    const combined=[...customActive,...registryTop];
    const seen=new Set();
    return combined.filter(a=>{if(seen.has(a.id))return false;seen.add(a.id);return true}).slice(0,60);
  };

  const startImplementation=async()=>{
    if(!admin)return;
    setImplStatus("running");setImplError("");setImplResult(null);setImplProgress(0);
    const pool=selectAgentPool("implement");
    if(pool.length===0){setImplError("No agents available.");setImplStatus("error");return}
    try{
      setImplStep("Selecting builder panel...");setImplProgress(10);
      const sel=await authFetch("/api/debate/select",{articleTitle:wsTitle,articleText:wsText.slice(0,2000),agents:pool,forgePersona:ORCHESTRATORS.forge.persona+" For this implementation session, prioritize agents with strong architecture and implementation capabilities.",activityType:"implement"});
      let selected=pool.filter(a=>sel.selected.includes(a.id));
      if(selected.length===0)selected=pool.slice(0,6);
      if(selected.length<4)selected=pool.slice(0,Math.min(6,pool.length));
      setImplProgress(25);setImplStep(`${selected.length} agents architecting...`);
      // Build context from debate conclusions if available
      let priorContext=wsText.slice(0,1500);
      const debate=article?.debate;
      if(debate){
        const debateCtx=[];
        if(debate.loom)debateCtx.push("DEBATE SYNTHESIS (Hypatia's Loom):\n"+debate.loom.slice(0,600));
        if(debate.streams?.length)debateCtx.push("THEMATIC STREAMS:\n"+debate.streams.map(s=>`- ${s.theme}: ${s.insight}`).join("\n").slice(0,400));
        if(debate.panel?.agents?.length)debateCtx.push("DEBATE PANEL: "+debate.panel.agents.map(a=>a.name).join(", "));
        if(debateCtx.length>0)priorContext=debateCtx.join("\n\n")+"\n\nORIGINAL CONTEXT:\n"+wsText.slice(0,800);
      }
      const data=await authFetch("/api/agents/implement",{concept:wsTitle,agents:selected,priorContext});
      setImplResult(data);setImplProgress(100);setImplStep("Complete!");setImplStatus("complete");
      if(onSaveSession&&admin)onSaveSession({mode:"implement",topic:wsTitle,results:data});
    }catch(e){setImplError(e.message);setImplStatus("error")}
  };

  const tabColors={debate:"#E8734A",implement:"#2D8A6E"};
  const tabLabels={debate:"Debate",implement:"Implement"};
  const tabIcons={debate:"\u2694",implement:"\u{1F528}"};

  return <div>
    {/* Tab selector */}
    <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{background:"#F3F4F6"}}>
      {["debate","implement"].map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-sm transition-all" style={{background:activeTab===tab?"#FFFFFF":"transparent",color:activeTab===tab?tabColors[tab]:"rgba(0,0,0,0.35)",boxShadow:activeTab===tab?"0 1px 4px rgba(0,0,0,0.08)":"none"}}><span style={{fontSize:14}}>{tabIcons[tab]}</span>{tabLabels[tab]}</button>)}
    </div>

    {/* Debate tab */}
    {activeTab==="debate"&&<DebatePanel article={article} topic={topic} agents={agents} onDebateComplete={onDebateComplete} onSaveSession={onSaveSession} currentUser={currentUser}/>}

    {/* Implement tab — Implementation Canvas */}
    {activeTab==="implement"&&<div className="rounded-2xl border overflow-hidden" style={{background:"white",borderColor:"rgba(45,138,110,0.15)"}}>
      <div className="p-4" style={{background:"rgba(45,138,110,0.04)",borderBottom:"1px solid rgba(45,138,110,0.1)"}}>
        <h3 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#2D8A6E",fontSize:16}}>Implementation Canvas</h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)"}}>{article?.debate?.loom?"Build on debate conclusions — agents design components informed by synthesis.":"Builder agents design components from their expertise, then Hypatia synthesizes a unified architecture."}</p>
      </div>

      {/* Debate context preview when available */}
      {article?.debate?.loom&&implStatus==="idle"&&<div className="mx-4 mt-4 p-3 rounded-xl" style={{background:"rgba(147,51,234,0.04)",border:"1px solid rgba(147,51,234,0.12)"}}>
        <div className="flex items-center gap-2 mb-2"><span style={{fontSize:12}}>🧵</span><span className="font-bold text-xs" style={{color:"#9333EA"}}>Debate Conclusions Available</span></div>
        <p className="text-xs" style={{color:"rgba(0,0,0,0.5)",lineHeight:1.6}}>{article.debate.loom.slice(0,200)}{article.debate.loom.length>200?"…":""}</p>
        {article.debate.streams?.length>0&&<div className="flex flex-wrap gap-1 mt-2">{article.debate.streams.slice(0,4).map((s,i)=><span key={i} className="px-2 py-0.5 rounded-full" style={{fontSize:9,background:"rgba(147,51,234,0.08)",color:"#7C3AED"}}>{s.theme}</span>)}</div>}
      </div>}

      {implStatus==="idle"&&(admin?<div className="p-4"><button onClick={startImplementation} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>{article?.debate?.loom?"Build on Debate Conclusions":"Start Implementation Planning"}</button></div>:<div className="p-4"><p className="text-sm text-center" style={{color:"rgba(0,0,0,0.3)"}}>No implementation session has been run yet.</p></div>)}

      {implStatus==="running"&&<div className="p-4">
        <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm" style={{color:"#2D8A6E"}}>Implementation Planning in Progress</span><span className="text-xs font-bold" style={{color:"#2D8A6E"}}>{implProgress}%</span></div>
        <div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"rgba(0,0,0,0.06)"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${implProgress}%`,background:"linear-gradient(90deg,#2D8A6E,#5CC4A0)",transition:"width 0.5s ease"}}/></div>
        <p className="text-xs" style={{color:"rgba(0,0,0,0.4)"}}>{implStep}</p>
      </div>}

      {implError&&<div className="p-3 m-3 rounded-xl" style={{background:"rgba(229,62,62,0.06)"}}><p className="text-xs" style={{color:"#E53E3E"}}>Error: {implError}</p><button onClick={()=>{setImplStatus("idle");setImplError("")}} className="text-xs font-semibold mt-1" style={{color:"#2D8A6E"}}>Retry</button></div>}

      {implResult&&<div className="p-4">
        {/* Architecture overview */}
        {implResult.architecture&&<div className="mb-4 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid rgba(45,138,110,0.15)"}}>
          <h4 className="font-bold mb-1.5" style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:14,color:"#111827"}}>Architecture Overview</h4>
          <p style={{fontSize:12,color:"rgba(0,0,0,0.5)",lineHeight:1.7}}>{implResult.architecture}</p>
          {implResult.totalWeeks>0&&<span className="inline-block mt-2 px-2 py-0.5 rounded-full font-semibold" style={{fontSize:10,background:"rgba(45,138,110,0.1)",color:"#2D8A6E"}}>Est. {implResult.totalWeeks} weeks</span>}
        </div>}

        {/* Components from agents */}
        {implResult.components?.filter(c=>c.status==="success").length>0&&<div className="mb-4">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Agent Components</h4>
          <div className="space-y-2">{implResult.components.filter(c=>c.status==="success").map((comp,i)=><div key={i} className="p-3 rounded-xl" style={{background:"rgba(0,0,0,0.02)",border:"1px solid rgba(0,0,0,0.05)"}}>
            <div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{background:`${comp.color||"#999"}20`,color:comp.color||"#999",fontSize:7}}>{comp.avatar||"?"}</div><span className="font-bold text-xs" style={{color:comp.color||"#999"}}>{comp.agent}</span>{comp.timelineWeeks&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)"}}>{comp.timelineWeeks}w</span>}</div>
            <h5 className="font-semibold text-sm mb-1" style={{color:"#111827"}}>{comp.component}</h5>
            <p className="text-xs mb-1.5" style={{color:"rgba(0,0,0,0.45)",lineHeight:1.5}}>{comp.approach}</p>
            {comp.integrations?.length>0&&<div className="flex flex-wrap gap-1">{comp.integrations.map((int,ii)=><span key={ii} className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(59,107,155,0.08)",color:"#3B6B9B"}}>{int}</span>)}</div>}
          </div>)}</div>
        </div>}

        {/* Implementation sequence */}
        {implResult.sequence?.length>0&&<div className="mb-4">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Implementation Sequence</h4>
          <div className="space-y-1.5">{implResult.sequence.map((phase,i)=><div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{background:"rgba(0,0,0,0.02)"}}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:"rgba(45,138,110,0.1)",color:"#2D8A6E",fontSize:10}}>{i+1}</div>
            <div className="flex-1"><div className="flex items-center gap-2"><h5 className="font-semibold text-xs" style={{color:"#111827"}}>{phase.phase}</h5><span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)"}}>{phase.weeks}</span></div>
              <p className="text-xs mt-0.5" style={{color:"rgba(0,0,0,0.45)"}}>{phase.description}</p>
            </div>
          </div>)}</div>
        </div>}

        {/* Risks */}
        {implResult.risks?.length>0&&<div className="mb-3">
          <h4 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Cross-Cutting Risks</h4>
          <div className="space-y-1">{implResult.risks.map((risk,i)=>{const sevColors={high:"#E53E3E",medium:"#E8734A",low:"#2D8A6E"};
            return <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:risk.severity==="high"?"rgba(229,62,62,0.04)":"rgba(0,0,0,0.02)"}}>
              <span className="px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{fontSize:8,background:`${sevColors[risk.severity]||"#999"}15`,color:sevColors[risk.severity]||"#999"}}>{(risk.severity||"").toUpperCase()}</span>
              <div className="flex-1"><p className="text-xs font-semibold" style={{color:"#111827"}}>{risk.risk}</p><p className="text-xs" style={{color:"rgba(0,0,0,0.4)"}}>{risk.mitigation}</p></div>
            </div>})}</div>
        </div>}

        {admin&&implStatus==="complete"&&<button onClick={()=>{setImplStatus("idle");setImplResult(null)}} className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{border:"1.5px solid rgba(0,0,0,0.08)",color:"rgba(0,0,0,0.4)"}}>Run New Implementation</button>}
      </div>}
    </div>}
  </div>
}

// ==================== MY STUDIO — Admin-controlled workspace ====================
function MyStudioPage({currentUser,content,articles,agents,projects,onNavigate,onSaveArticle,onDeleteArticle,onSaveProject,onDeleteProject}){
  const[editing,setEditing]=useState(null);
  const[showProjForm,setShowProjForm]=useState(false);const[editProj,setEditProj]=useState(null);
  const[projTitle,setProjTitle]=useState("");const[projSubtitle,setProjSubtitle]=useState("");const[projDesc,setProjDesc]=useState("");const[projStatus,setProjStatus]=useState("Alpha");const[projTags,setProjTags]=useState("");const[projLink,setProjLink]=useState("");
  const[projType,setProjType]=useState("project");const[projIcon,setProjIcon]=useState("\u{1F4E6}");
  const[flippedTile,setFlippedTile]=useState(null);
  const admin = isAdmin(currentUser);
  const publishedArticles = articles.filter(a=>a.status==="published");
  const draftArticles = admin ? articles.filter(a=>a.status==="draft") : [];
  const STATUS_COLORS={Live:"#2D8A6E",Evolving:"#E8734A",Alpha:"#3B6B9B",Experiment:"#8B5CF6",Archived:"#999"};
  const STATUS_BGS={Live:"#EBF5F1",Evolving:"#FDF0EB",Alpha:"#EEF3F8",Experiment:"#F5F0FA",Archived:"#F3F4F6"};

  const handleSave = (article) => { onSaveArticle(article); setEditing(null); };
  const openProjForm=(proj)=>{if(proj){setEditProj(proj.id);setProjTitle(proj.title);setProjSubtitle(proj.subtitle||"");setProjDesc(proj.description||"");setProjStatus(proj.status||"Alpha");setProjTags(proj.tags?.join(", ")||"");setProjLink(proj.link||"");setProjType(proj.type||"project");setProjIcon(proj.icon||"\u{1F4E6}")}else{setEditProj(null);setProjTitle("");setProjSubtitle("");setProjDesc("");setProjStatus("Alpha");setProjTags("");setProjLink("");setProjType("project");setProjIcon("\u{1F4E6}")}setShowProjForm(true);setFlippedTile(null)};
  const saveProjForm=()=>{if(!projTitle.trim())return;const p={id:editProj||"proj_"+Date.now(),title:projTitle.trim(),subtitle:projSubtitle.trim(),status:projStatus,statusColor:STATUS_COLORS[projStatus]||"#999",description:projDesc.trim(),tags:projTags.split(",").map(t=>t.trim()).filter(Boolean),link:projLink.trim()||undefined,ownerId:"u1",type:projType,icon:projIcon};onSaveProject(p);setShowProjForm(false)};

  if(editing){return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="px-4 sm:px-6 py-8">
    <Suspense fallback={<div className="max-w-3xl mx-auto"><p style={{color:"#CCC"}}>Loading editor...</p></div>}>
      <LazyEditor article={editing==="new"?null:editing} onSave={handleSave} onCancel={()=>setEditing(null)}/>
    </Suspense>
  </div></div>}

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,28px)"}}>My Studio</h1><p className="mb-6" style={{fontSize:13,color:"#999"}}>{admin?"Your workspace. Write articles and manage projects.":"Browse published work from the Re\u00b3 community."}</p></FadeIn>

    {admin&&<FadeIn delay={30}><button onClick={()=>setEditing("new")} className="mb-6 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Write Article</button></FadeIn>}

    {admin&&draftArticles.length>0&&<><FadeIn delay={40}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#E8734A",fontSize:16}}>Drafts ({draftArticles.length})</h2></FadeIn>
      <div className="space-y-1.5 mb-6">{draftArticles.map((a,i)=><FadeIn key={a.id} delay={50+i*20}><div className="flex items-center justify-between p-3 rounded-xl border" style={{background:"white",borderColor:"#E5E7EB"}}>
        <div className="flex-1"><div className="flex items-center gap-2 mb-0.5"><PillarTag pillar={a.pillar}/><span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#FFF5F5",color:"#E8734A"}}>DRAFT</span></div><h3 className="font-semibold text-sm" style={{color:"#111827"}}>{a.title}</h3></div>
        <div className="flex gap-1"><button onClick={()=>setEditing(a)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onDeleteArticle(a.id)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#E53E3E",background:"#FFF5F5"}}>Delete</button></div>
      </div></FadeIn>)}</div></>}

    {publishedArticles.length>0&&<><FadeIn delay={60}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Published Articles ({publishedArticles.length})</h2></FadeIn>
      <div className="space-y-1.5 mb-6">{publishedArticles.map((a,i)=><FadeIn key={a.id} delay={70+i*20}><div className="flex items-center justify-between p-3 rounded-xl border" style={{background:"white",borderColor:"#E5E7EB"}}>
        <button onClick={()=>onNavigate("article",a.id)} className="flex-1 text-left"><div className="flex items-center gap-2 mb-0.5"><PillarTag pillar={a.pillar}/><span className="font-bold px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#EBF5F1",color:"#2D8A6E"}}>PUBLISHED</span></div><h3 className="font-semibold text-sm" style={{color:"#111827"}}>{a.title}</h3></button>
        {admin&&<div className="flex gap-1"><button onClick={()=>setEditing(a)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onSaveArticle({...a,status:"draft"})} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{color:"#E8734A",background:"#FDF0EB"}}>Unpublish</button></div>}
      </div></FadeIn>)}</div></>}

    {/* Projects & Whitepapers — Tile Grid */}
    <FadeIn delay={75}><div className="flex items-center justify-between mb-3">
      <h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Projects & Whitepapers ({projects.length})</h2>
      {admin&&<button onClick={()=>openProjForm(null)} className="px-3 py-1.5 rounded-full font-semibold text-xs transition-all hover:shadow-sm" style={{background:"#9333EA",color:"white"}}>+ Add Tile</button>}
    </div></FadeIn>

    {/* Admin Form */}
    {admin&&showProjForm&&<FadeIn><div className="p-4 rounded-2xl border mb-4" style={{background:"white",borderColor:"#9333EA40",borderStyle:"dashed"}}>
      <h3 className="font-bold mb-2" style={{fontSize:14,color:"#111827"}}>{editProj?"Edit Tile":"Add Tile"}</h3>
      <input value={projTitle} onChange={e=>setProjTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <input value={projSubtitle} onChange={e=>setProjSubtitle(e.target.value)} placeholder="Subtitle (e.g. Governance Interaction Mesh)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <textarea value={projDesc} onChange={e=>setProjDesc(e.target.value)} placeholder="Description..." className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555",minHeight:60,resize:"vertical"}}/>
      <div className="flex flex-wrap gap-2 mb-2">
        <div className="flex items-center gap-1"><span className="text-xs" style={{color:"#BBB"}}>Status:</span>{["Live","Evolving","Alpha","Experiment","Archived"].map(s=><button key={s} onClick={()=>setProjStatus(s)} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:projStatus===s?STATUS_BGS[s]:"white",color:projStatus===s?STATUS_COLORS[s]:"#CCC",border:`1px solid ${projStatus===s?STATUS_COLORS[s]:"#E5E7EB"}`}}>{s}</button>)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{color:"#BBB"}}>Type:</span>
        {["project","whitepaper"].map(t=><button key={t} onClick={()=>setProjType(t)} className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{background:projType===t?"#F5F0FA":"white",color:projType===t?"#9333EA":"#CCC",border:`1px solid ${projType===t?"#9333EA":"#E5E7EB"}`}}>{t}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{color:"#BBB"}}>Icon:</span>
        <span style={{fontSize:24}}>{projIcon}</span>
        <input value={projIcon} onChange={e=>setProjIcon(e.target.value)} className="w-16 px-2 py-1 rounded-xl border focus:outline-none text-center" style={{borderColor:"#E5E7EB",color:"#555",fontSize:18}}/>
        <div className="flex gap-1">{["\u{1F680}","\u{1F4DD}","\u{1F9EA}","\u{1F310}","\u{1F3AF}","\u{2699}\u{FE0F}","\u{1F4CA}","\u{1F916}"].map(e=><button key={e} onClick={()=>setProjIcon(e)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:projIcon===e?"#F5F0FA":"transparent",border:projIcon===e?"1px solid #9333EA":"1px solid transparent",fontSize:16}}>{e}</button>)}</div>
      </div>
      <input value={projTags} onChange={e=>setProjTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <input value={projLink} onChange={e=>setProjLink(e.target.value)} placeholder="Link (optional — e.g. https://medium.com/...)" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <div className="flex gap-2"><button onClick={saveProjForm} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>{editProj?"Update":"Add"}</button><button onClick={()=>setShowProjForm(false)} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{color:"#CCC",border:"1px solid #E5E7EB"}}>Cancel</button></div>
    </div></FadeIn>}

    {/* Flip-Card Tile Grid */}
    <div className="re3-project-grid mb-6">{projects.map((proj,i)=>{
      const isFlipped=flippedTile===proj.id;
      const linkLabel=proj.link?(proj.link.includes("medium.com")?"View on Medium":proj.link.includes("vercel")?"View on Vercel":proj.link.includes("github.com")?"View on GitHub":"Visit"):"";
      return <FadeIn key={proj.id} delay={90+i*40}><div className="re3-tile-flip-container" style={{height:200}} onClick={()=>setFlippedTile(prev=>prev===proj.id?null:proj.id)}>
        <div className={`re3-tile-flip-inner ${isFlipped?"flipped":""}`}>
          {/* FRONT */}
          <div className="re3-tile-front" style={{background:"white",border:"1px solid #E5E7EB",padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:40}}>{proj.icon||"\u{1F4E6}"}</span>
            <h3 className="font-bold text-sm text-center" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",lineHeight:1.3}}>{proj.title}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:9,background:STATUS_BGS[proj.status]||"#F3F4F6",color:proj.statusColor||STATUS_COLORS[proj.status]||"#999"}}>{(proj.status||"").toUpperCase()}</span>
              <span className="px-2 py-0.5 rounded-full font-semibold capitalize" style={{fontSize:9,background:proj.type==="whitepaper"?"#FFF7ED":"#EEF3F8",color:proj.type==="whitepaper"?"#C2410C":"#3B6B9B"}}>{proj.type||"project"}</span>
            </div>
          </div>
          {/* BACK */}
          <div className="re3-tile-back" style={{background:"white",border:"1px solid #E5E7EB",padding:16,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs" style={{color:"#111827"}}>{proj.title}</span>
                <button onClick={e=>{e.stopPropagation();setFlippedTile(null)}} className="text-xs px-1" style={{color:"#CCC",minHeight:"auto",minWidth:"auto"}}>{"\u2715"}</button>
              </div>
              {proj.subtitle&&<p className="text-xs mb-1" style={{color:"#AAA",fontStyle:"italic"}}>{proj.subtitle}</p>}
              <p className="text-xs mb-2 line-clamp-3" style={{color:"#666",lineHeight:1.5}}>{proj.description}</p>
              {proj.tags?.length>0&&<div className="flex flex-wrap gap-1 mb-2">{proj.tags.map(t=><span key={t} className="px-1.5 py-0 rounded-full" style={{fontSize:9,background:"#F3F4F6",color:"#999"}}>{t}</span>)}</div>}
            </div>
            <div className="flex items-center justify-between">
              {proj.link?<a href={proj.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#EEF3F8",color:"#3B6B9B",minHeight:"auto",minWidth:"auto"}}>{linkLabel} &rarr;</a>:<span/>}
              {admin&&<div className="flex gap-1" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>openProjForm(proj)} className="px-2 py-0.5 rounded text-xs font-semibold" style={{color:"#3B6B9B",background:"#EEF3F8",minHeight:"auto",minWidth:"auto"}}>Edit</button>
                <button onClick={()=>onDeleteProject(proj.id)} className="px-2 py-0.5 rounded text-xs font-semibold" style={{color:"#E53E3E",background:"#FFF5F5",minHeight:"auto",minWidth:"auto"}}>Remove</button>
              </div>}
            </div>
          </div>
        </div>
      </div></FadeIn>})}</div>
  </div></div>
}

// ==================== AGENT PANEL (Cycle Creator — Sequential Pipeline) ====================
function AgentPanel({onPostGenerated,onAutoComment,agents:allAgents,registry}){
  const[loading,setLoading]=useState(false);const[step,setStep]=useState('idle');const[topics,setTopics]=useState([]);const[selectedTopic,setSelectedTopic]=useState(null);const[generating,setGenerating]=useState('');const[posts,setPosts]=useState([]);const[error,setError]=useState('');
  const[customCycleTopic,setCustomCycleTopic]=useState('');const[commentProgress,setCommentProgress]=useState('');
  const[throughLine,setThroughLine]=useState(null);const[genProgress,setGenProgress]=useState(0);
  const suggestTopics=async()=>{setLoading(true);setError('');try{const d=await authFetch('/api/agents/suggest-topics',{currentTopics:INIT_CONTENT.map(c=>c.title),pastCycles:['AI Governance Reimagined','The Death of the Dashboard']});if(d.topics&&d.topics.length>0){setTopics(d.topics);setStep('topics')}else{setError('No topics returned.')}}catch(e){setError(e.message||'Failed to reach API')}setLoading(false)};

  // New sequential pipeline
  const generateCycle=async(topic)=>{setSelectedTopic(topic);setStep('generating');setPosts([]);setThroughLine(null);setGenProgress(0);setError('');
    try{
      // Step 0: Through-line question
      setGenerating('through-line');setGenProgress(5);
      const tlData=await authFetch('/api/cycle/generate',{topic,step:'through-line'});
      const tl=tlData.data;
      setThroughLine(tl);setGenProgress(15);

      // Step 1: Hypatia writes Rethink (reads nothing)
      setGenerating('sage');setGenProgress(20);
      const sageData=await authFetch('/api/cycle/generate',{topic,step:'rethink',previousData:{throughLine:tl}});
      const sage=sageData.data;
      setPosts(prev=>[...prev,sage]);setGenProgress(45);

      // Step 2: Socratia writes Rediscover (reads Hypatia's full output)
      setGenerating('atlas');setGenProgress(50);
      const atlasData=await authFetch('/api/cycle/generate',{topic,step:'rediscover',previousData:{throughLine:tl,sage}});
      const atlas=atlasData.data;
      setPosts(prev=>[...prev,atlas]);setGenProgress(75);

      // Step 3: Ada writes Reinvent (reads Hypatia + Socratia full output)
      setGenerating('forge');setGenProgress(80);
      const forgeData=await authFetch('/api/cycle/generate',{topic,step:'reinvent',previousData:{throughLine:tl,sage,atlas}});
      const forge=forgeData.data;
      setPosts(prev=>[...prev,forge]);setGenProgress(100);

      setGenerating('');setStep('done');
    }catch(e){console.error('Cycle generation error:',e);setError(e.message||'Generation failed');setStep('idle');setGenerating('')}
  };

  const publishAll=async()=>{const cycleDate=new Date().toISOString().split('T')[0];const ts=Date.now();const cycleId='cy_'+ts;
    const publishedIds=[];
    posts.forEach((p,i)=>{const postId='p_'+ts+'_'+i;publishedIds.push(postId);const post={id:postId,authorId:p.authorId,pillar:p.pillar,type:'post',title:p.title,paragraphs:p.paragraphs,reactions:{},highlights:{},marginNotes:[],tags:p.tags||[],createdAt:cycleDate,sundayCycle:cycleDate,cycleId:cycleId,featured:true,endorsements:0,comments:[],challenges:[],
      // Journey metadata — new connected fields
      throughLineQuestion:throughLine?.through_line_question||null,
      openQuestions:p.open_questions||null,
      bridgeSentence:p.bridge_sentence||null,
      patterns:p.patterns||null,
      synthesisPrinciple:p.synthesis_principle||null,
      architectureComponents:p.architecture_components||null,
      openThread:p.open_thread||null,
      artifact:p.artifact||null,
      tldr:p.tldr||null
    };onPostGenerated(post)});
    setStep('published');
    // Auto-batch agent comments
    if(onAutoComment){
      setStep('commenting');setCommentProgress('Selecting agents...');
      try{
        let commentAgents=INIT_AGENTS.slice(0,5);
        try{const sel=await authFetch('/api/debate/select',{articleTitle:selectedTopic?.title||'cycle',articleText:posts.map(p=>p.title).join('. '),agents:INIT_AGENTS.slice(0,25),forgePersona:ORCHESTRATORS.forge.persona});const matched=INIT_AGENTS.filter(a=>sel.selected?.includes(a.id)||sel.selected?.some(s=>s.toLowerCase()===a.name.toLowerCase()));if(matched.length>=3)commentAgents=matched.slice(0,5)}catch(e){console.warn('Agent selection for comments failed, using defaults:',e.message)}
        let done=0;const total=publishedIds.length*commentAgents.length;
        // Process one post at a time (sequential batches of 5 parallel calls)
        for(const postId of publishedIds){
          const postData=posts[publishedIds.indexOf(postId)];
          const batchPromises=commentAgents.map(agent=>
            authFetch('/api/agents/comment',{postTitle:postData.title,postContent:postData.paragraphs?.[0]||'',agentName:agent.name,agentPersona:agent.persona,agentModel:agent.model||'anthropic'})
            .then(data=>{if(data?.comment){onAutoComment(postId,agent.id,data.comment)}done++;setCommentProgress(`Generating agent comments... (${done}/${total})`)})
            .catch(err=>{console.error('Comment failed for',agent.name,':',err.message||err);done++;setCommentProgress(`Generating agent comments... (${done}/${total})`)})
          );
          await Promise.allSettled(batchPromises);
          // Small delay between batches to avoid rate limits
          if(publishedIds.indexOf(postId)<publishedIds.length-1)await new Promise(r=>setTimeout(r,500));
        }
        setCommentProgress('');setStep('published');
      }catch(e){console.error('Auto-comment failed:',e);setCommentProgress('');setStep('published')}
    }
  };

  const STEP_LABELS=[['through-line','Crafting the through-line question...','#8B5CF6'],['sage','Hypatia is rethinking assumptions...','#3B6B9B'],['atlas','Socratia is rediscovering hidden patterns...','#E8734A'],['forge','Ada is reinventing the architecture...','#2D8A6E']];
  const currentStepIdx=STEP_LABELS.findIndex(s=>s[0]===generating);

  return <div className="p-5 rounded-2xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
    <p className="mb-3" style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Generate a connected 3-act synthesis cycle. Each agent reads the previous agent&apos;s work to build one cohesive intellectual journey.</p>
    {(step==='idle'||loading)&&<><div className="flex flex-wrap gap-3 items-end">
      <button onClick={suggestTopics} disabled={loading} className="px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white",opacity:loading?0.7:1}}>{loading?'Analyzing trends with Claude...':'Suggest Topics'}</button>
      <div className="flex items-center gap-2"><span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.2)"}}>OR</span></div>
      <div className="flex-1 flex gap-2"><input value={customCycleTopic} onChange={e=>setCustomCycleTopic(e.target.value)} placeholder="Enter your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",minWidth:180}} onKeyDown={e=>{if(e.key==='Enter'&&customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}}/><button onClick={()=>{if(customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}} disabled={!customCycleTopic.trim()} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:customCycleTopic.trim()?"#9333EA":"rgba(0,0,0,0.08)",color:customCycleTopic.trim()?"white":"rgba(0,0,0,0.3)"}}>Generate</button></div>
    </div>{error&&<p className="mt-2 p-2 rounded-lg text-xs" style={{background:"#FFF5F5",color:"#E53E3E"}}>{error}</p>}</>}
    {step==='topics'&&<div><p className="text-xs mb-2 font-semibold" style={{color:"rgba(0,0,0,0.3)"}}>SELECT A TOPIC TO GENERATE</p><div className="space-y-1.5">{topics.map((t,i)=><button key={i} onClick={()=>generateCycle(t)} className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm" style={{borderColor:"#E5E7EB"}}>
      <div className="flex items-center justify-between mb-0.5"><span className="font-semibold text-sm" style={{color:"#111827"}}>{t.title}</span><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:t.urgency==='high'?'#FDF0EB':'#F3F4F6',color:t.urgency==='high'?'#E8734A':'#999'}}>peaks {t.predicted_peak}</span></div>
      <p className="text-xs" style={{color:"#999"}}>{t.rationale}</p>
    </button>)}</div><div className="mt-3 flex gap-2 items-center"><span className="text-xs" style={{color:"rgba(0,0,0,0.2)"}}>OR</span><input value={customCycleTopic} onChange={e=>setCustomCycleTopic(e.target.value)} placeholder="Enter your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/><button onClick={()=>{if(customCycleTopic.trim())generateCycle({title:customCycleTopic.trim(),rationale:'Custom topic',urgency:'medium',predicted_peak:'now'})}} disabled={!customCycleTopic.trim()} className="px-3 py-2 rounded-xl text-sm font-semibold" style={{background:customCycleTopic.trim()?"#9333EA":"rgba(0,0,0,0.08)",color:customCycleTopic.trim()?"white":"rgba(0,0,0,0.3)"}}>Generate</button></div></div>}
    {step==='generating'&&<div>
      <p className="text-sm mb-3 font-semibold" style={{color:"#111827"}}>Generating: <b>{selectedTopic?.title}</b></p>
      {throughLine&&<div className="mb-3 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
        <span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Through-Line Question</span>
        <p className="text-sm mt-1" style={{color:"#555",fontStyle:"italic"}}>{throughLine.through_line_question}</p>
      </div>}
      <div className="w-full rounded-full overflow-hidden mb-3" style={{height:4,background:"#E5E7EB"}}><div className="rounded-full transition-all" style={{height:"100%",width:`${genProgress}%`,background:"linear-gradient(90deg,#3B6B9B,#E8734A,#2D8A6E)",transition:"width 0.8s ease"}}/></div>
      {STEP_LABELS.map(([key,label,color],i)=>{const isDone=i<currentStepIdx||(i===currentStepIdx&&false);const isActive=key===generating;const completed=posts.find(p=>p.authorId==='agent_'+key)||(key==='through-line'&&throughLine);
        return <div key={key} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{background:isActive?`${color}08`:completed?'#EBF5F1':'#FAFAFA',border:isActive?`1px solid ${color}25`:'1px solid transparent'}}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background:completed?'#2D8A6E':isActive?color:'#E5E7EB'}}>{completed?<span style={{color:'white',fontSize:10}}>&#10003;</span>:isActive?<span className="animate-pulse w-2 h-2 rounded-full" style={{background:'white'}}/>:<span style={{color:'#CCC',fontSize:10}}>{i+1}</span>}</div>
          <span className="font-semibold text-xs" style={{color:isActive?color:completed?'#2D8A6E':'#CCC'}}>{isActive?label:completed?(key==='through-line'?'Through-line ready':posts.find(p=>p.pillar===(key==='sage'?'rethink':key==='atlas'?'rediscover':'reinvent'))?.title||'Done'):'Waiting'}</span>
        </div>})}
    </div>}
    {step==='done'&&<div>
      {throughLine&&<div className="mb-3 p-3 rounded-xl" style={{background:"#FAF5FF",border:"1px solid #E9D5FF"}}>
        <span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Through-Line Question</span>
        <p className="text-sm mt-1" style={{color:"#555",fontStyle:"italic"}}>{throughLine.through_line_question}</p>
      </div>}
      <p className="text-sm mb-2 font-semibold" style={{color:"#2D8A6E"}}>Journey complete! All 3 acts are connected.</p>
      <div className="space-y-1 mb-3">{posts.map((p,i)=>{const colors=['#3B6B9B','#E8734A','#2D8A6E'];const labels=['Act 1: Rethink','Act 2: Rediscover','Act 3: Reinvent'];
        return <div key={i} className="text-xs p-2.5 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${colors[i]}`}}><span className="font-bold" style={{color:colors[i]}}>{labels[i]}</span> &mdash; {p.title}</div>})}</div>
      <button onClick={publishAll} className="px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Publish Journey & Generate Comments</button></div>}
    {step==='commenting'&&<div><p className="text-sm mb-2 font-semibold" style={{color:"#8B5CF6"}}>Published! Now generating agent comments...</p><div className="w-full rounded-full overflow-hidden mb-2" style={{height:3,background:"#E5E7EB"}}><div className="rounded-full animate-pulse" style={{height:"100%",width:"60%",background:"linear-gradient(90deg,#3B6B9B,#8B5CF6,#2D8A6E)"}}/></div><p className="text-xs" style={{color:"#8B5CF6"}}>{commentProgress}</p></div>}
    {step==='published'&&<div><p className="text-sm font-semibold" style={{color:"#2D8A6E"}}>Published! {onAutoComment?'Agent comments generated.':'Go to home to see the new cycle.'}</p><button onClick={()=>{setStep('idle');setPosts([]);setCustomCycleTopic('');setThroughLine(null);setGenProgress(0)}} className="mt-1 text-xs underline" style={{color:"#CCC"}}>Generate another</button></div>}
  </div>
}


// ==================== AGENT COMMUNITY — Agent roster + CRUD ====================
function AgentAtlasPage({agents,registry,registryIndex,currentUser,onSaveAgent,onDeleteAgent,onForge}){
  const admin=isAdmin(currentUser);
  const[view,setView]=useState("domains");const[selectedDomain,setSelectedDomain]=useState(null);const[selectedSpec,setSelectedSpec]=useState(null);
  const[searchQuery,setSearchQuery]=useState("");const[styleFilter,setStyleFilter]=useState("");const[atlasFilter,setAtlasFilter]=useState("all");
  const[editing,setEditing]=useState(null);const[showForm,setShowForm]=useState(false);
  const[name,setName]=useState("");const[persona,setPersona]=useState("");const[model,setModel]=useState("anthropic");const[color,setColor]=useState("#3B6B9B");const[category,setCategory]=useState("Wild Cards");

  const startEdit=(a)=>{setName(a.name);setPersona(a.persona);setModel(a.model);setColor(a.color);setCategory(a.category||"Wild Cards");setEditing(a.id);setShowForm(true)};
  const startNew=()=>{setName("");setPersona("");setModel("anthropic");setCategory("Wild Cards");setColor(["#3B6B9B","#E8734A","#2D8A6E","#8B5CF6","#D4A574","#E53E3E","#38B2AC","#DD6B20"][Math.floor(Math.random()*8)]);setEditing(null);setShowForm(true)};
  const save=()=>{if(!name.trim()||!persona.trim())return;const agent={id:editing||"agent_"+name.trim().toLowerCase().replace(/\s+/g,"_"),name:name.trim(),persona:persona.trim(),model,color,avatar:name.trim().slice(0,2),status:"active",category};onSaveAgent(agent);setShowForm(false)};
  const changeModel=(agentId,newModel)=>{const a=agents.find(x=>x.id===agentId);if(a)onSaveAgent({...a,model:newModel})};

  const active=agents.filter(a=>a.status==="active");const inactive=agents.filter(a=>a.status==="inactive");
  const totalAgents=(registry?.totalAgents||0)+active.length;
  const domains=registry?.domains||[];

  // Search across all agents
  const searchResults=searchQuery.trim().length>2?[
    ...active.filter(a=>(a.name+' '+a.persona+' '+(a.category||'')).toLowerCase().includes(searchQuery.toLowerCase())),
    ...Object.values(registryIndex.byId).filter(a=>(a.name+' '+a.persona+' '+a.domain+' '+a.specialization).toLowerCase().includes(searchQuery.toLowerCase())).slice(0,60)
  ]:[];

  const currentDomain=selectedDomain?domains.find(d=>d.id===selectedDomain):null;
  const currentSpec=selectedSpec?registryIndex.bySpec[selectedSpec]:null;
  const specAgents=currentSpec?.agents||[];
  const filteredAgents=styleFilter?specAgents.filter(a=>a.cognitiveStyle?.type===styleFilter||a.cognitiveStyle?.disposition===styleFilter):specAgents;

  // Capability bar mini component
  const CapBar=({caps})=>{if(!caps)return null;const keys=["debate","ideate","critique","architect","implement","research","synthesize"];const labels=["Deb","Ide","Cri","Arc","Imp","Res","Syn"];const colors=["#E8734A","#3B6B9B","#C53030","#2D8A6E","#DD6B20","#6B46C1","#8B5CF6"];
    return <div className="flex gap-0.5 mt-1">{keys.map((k,i)=><div key={k} title={labels[i]+": "+caps[k]} className="flex flex-col items-center"><div className="rounded-sm" style={{width:12,height:3,background:`${colors[i]}${Math.round((caps[k]||1)/5*99).toString(16).padStart(2,'0')}`}}/><span style={{fontSize:6,color:"#CCC"}}>{labels[i]}</span></div>)}</div>};

  // Agent card renderer (reusable for registry + custom agents)
  const AgentCard=({a,isCustom})=>{const mp=MODEL_PROVIDERS.find(m=>m.id===a.model);
    return <div className="p-3 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow=`0 0 20px ${a.color}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none"}}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${a.color}20`,color:a.color,border:`1.5px solid ${a.color}40`,fontSize:9}}>{a.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5"><h4 className="font-bold text-sm" style={{color:"#111827"}}>{a.name}</h4>
            {isCustom&&admin?<select value={a.model} onChange={e=>changeModel(a.id,e.target.value)} className="px-1.5 py-0.5 rounded text-xs font-semibold appearance-none cursor-pointer" style={{background:`${mp?.color||"#999"}10`,color:mp?.color||"#999",border:`1px solid ${mp?.color||"#999"}30`,fontSize:9}}>{MODEL_PROVIDERS.map(m=><option key={m.id} value={m.id}>{m.label.split(" ")[0]}</option>)}</select>:<span className="px-1.5 py-0.5 rounded font-bold" style={{fontSize:8,background:`${mp?.color||"#999"}10`,color:mp?.color||"#999"}}>{mp?.label?.split(" ")[0]||a.model}</span>}
          </div>
          {a.cognitiveStyle&&<div className="flex gap-1 mb-1">{[a.cognitiveStyle.type,a.cognitiveStyle.disposition].filter(Boolean).map(s=><span key={s} className="px-1.5 py-0 rounded-full" style={{fontSize:7,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",textTransform:"capitalize"}}>{s}</span>)}</div>}
          <p className="text-xs" style={{fontFamily:"'Inter',sans-serif",color:"rgba(0,0,0,0.4)",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.persona}</p>
          <CapBar caps={a.capabilities}/>
          {isCustom&&admin&&<div className="flex gap-1 mt-1.5"><button onClick={()=>startEdit(a)} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#3B6B9B",background:"#EEF3F8"}}>Edit</button><button onClick={()=>onSaveAgent({...a,status:"inactive"})} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#E8734A",background:"#FDF0EB"}}>Deactivate</button></div>}
        </div>
      </div>
    </div>};

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-start justify-between"><div><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Team</h1><p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(0,0,0,0.45)"}}>{totalAgents} agents across {domains.length} domains + 3 orchestrators. AI selects the best team per task.</p></div>
    {onForge&&<button onClick={()=>onForge({title:"",text:"",sourceType:"custom"})} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:shadow-md flex-shrink-0" style={{background:"#9333EA",color:"white"}}>🔨 Collaborate in Debate Lab</button>}</div></FadeIn>

    {/* Breadcrumb */}
    <FadeIn><div className="flex items-center gap-1.5 mb-4 flex-wrap">
      <button onClick={()=>{setView("domains");setSelectedDomain(null);setSelectedSpec(null)}} className="text-xs font-semibold" style={{color:view==="domains"?"#111827":"#3B6B9B"}}>All Domains</button>
      {currentDomain&&<><span style={{color:"#DDD",fontSize:10}}>/</span><button onClick={()=>{setView("specializations");setSelectedSpec(null)}} className="text-xs font-semibold" style={{color:view==="specializations"?"#111827":"#3B6B9B"}}>{currentDomain.name}</button></>}
      {currentSpec&&<><span style={{color:"#DDD",fontSize:10}}>/</span><span className="text-xs font-semibold" style={{color:"#111827"}}>{currentSpec.name}</span></>}
    </div></FadeIn>

    {/* Search bar */}
    <div className="flex gap-2 mb-4"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search agents by name, domain, or expertise..." className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm" style={{borderColor:"#D1D5DB",borderRadius:8,color:"#555"}}/>
      {view==="agents"&&<select value={styleFilter} onChange={e=>setStyleFilter(e.target.value)} className="px-2 py-2 rounded-lg border text-xs" style={{borderColor:"#D1D5DB",borderRadius:8,color:"#999"}}><option value="">All styles</option><option value="convergent">Convergent</option><option value="divergent">Divergent</option><option value="optimist">Optimist</option><option value="skeptic">Skeptic</option><option value="pragmatist">Pragmatist</option></select>}
    </div>

    {/* Category filter chips */}
    {view==="domains"&&<div className="flex flex-wrap items-center gap-2 mb-5">
      {[['all','All Domains',domains.length],...domains.map(d=>[d.id,d.name,d.specializations.reduce((s,sp)=>s+sp.agents.length,0)])].map(([key,label,count])=>
        <button key={key} onClick={()=>setAtlasFilter(key)} className="px-3 py-1.5 rounded-full font-medium text-sm transition-all" style={{background:atlasFilter===key?'#9333EA':'#FFFFFF',color:atlasFilter===key?'white':'#4B5563',border:atlasFilter===key?'1px solid #9333EA':'1px solid #E5E7EB'}}>{label} ({count})</button>
      )}
      <span className="ml-auto text-sm" style={{color:'#6B7280'}}>Showing <b>{atlasFilter==='all'?domains.length:1}</b> of {domains.length} domains</span>
    </div>}

    {/* Search results */}
    {searchQuery.trim().length>2?<div className="mb-6"><h3 className="font-bold mb-2 text-xs" style={{color:"rgba(0,0,0,0.4)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Search Results ({searchResults.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{searchResults.slice(0,20).map(a=><FadeIn key={a.id}><AgentCard a={a} isCustom={!a.domain}/></FadeIn>)}</div>
      {searchResults.length>20&&<p className="mt-2 text-xs text-center" style={{color:"rgba(0,0,0,0.3)"}}>Showing 20 of {searchResults.length} — narrow your search</p>}
    </div>:<>

    {/* Orchestration Layer */}
    <FadeIn delay={20}><div className="p-4 rounded-2xl mb-6" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#111827",letterSpacing:"0.05em",textTransform:"uppercase"}}>Orchestration Layer</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{Object.values(ORCHESTRATORS).map(o=><div key={o.id} className="p-3 rounded-xl" style={{background:`${o.color}06`,border:`1px solid ${o.color}20`}}>
        <div className="flex items-center gap-2 mb-1"><div className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{background:`${o.color}15`,color:o.color,fontSize:10,border:`1.5px dashed ${o.color}40`}}>{o.avatar}</div><div><span className="font-bold text-xs" style={{color:o.color}}>{o.name}</span><span className="block" style={{fontSize:9,color:"#BBB"}}>{o.role}</span></div></div>
        <p className="text-xs" style={{color:"#999",lineHeight:1.4}}>{o.persona.slice(0,100)}...</p>
      </div>)}</div>
    </div></FadeIn>

    {/* VIEW 1: Domain Map */}
    {view==="domains"&&<div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{(atlasFilter==='all'?domains:domains.filter(d=>d.id===atlasFilter)).map((d,i)=>{const agentCount=d.specializations.reduce((s,sp)=>s+sp.agents.length,0);const previewAgents=d.specializations.flatMap(s=>s.agents).slice(0,4);
        return <FadeIn key={d.id} delay={i*20}><button onClick={()=>{setSelectedDomain(d.id);setView("specializations")}} className="w-full text-left p-4 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderLeft:`4px solid ${d.color}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 20px ${d.color}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span style={{fontSize:16}}>{d.icon}</span><h3 className="font-bold text-sm" style={{color:"#111827"}}>{d.name}</h3></div><span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:`${d.color}12`,color:d.color}}>{agentCount}</span></div>
          <p className="text-xs mb-3" style={{color:"rgba(0,0,0,0.4)",lineHeight:1.4}}>{d.description}</p>
          <div className="flex items-center gap-1"><div className="flex -space-x-1">{previewAgents.map(a=><div key={a.id} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:6,border:"1px solid white"}}>{a.avatar}</div>)}</div><span className="text-xs ml-1" style={{color:"rgba(0,0,0,0.3)"}}>{d.specializations.length} specializations</span></div>
        </button></FadeIn>})}
      </div>

      {/* Custom agents section */}
      {active.length>0&&<div className="mt-6"><FadeIn><h3 className="font-bold mb-2" style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(0,0,0,0.4)",letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:"1px solid #E5E7EB",paddingBottom:8}}>Custom Agents ({active.length})</h3></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{active.map((a,i)=><FadeIn key={a.id} delay={i*15}><AgentCard a={a} isCustom={true}/></FadeIn>)}</div>
      </div>}
    </div>}

    {/* VIEW 2: Specializations */}
    {view==="specializations"&&currentDomain&&<div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{currentDomain.specializations.map((s,i)=>{const topCap=s.agents.length>0?Object.entries(s.agents[0].capabilities||{}).sort((a,b)=>b[1]-a[1])[0]:null;
        return <FadeIn key={s.id} delay={i*25}><button onClick={()=>{setSelectedSpec(currentDomain.id+'/'+s.id);setView("agents")}} className="w-full text-left p-4 rounded-xl transition-all" style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderLeft:`3px solid ${currentDomain.color}`}} onMouseEnter={e=>{e.currentTarget.style.background="#FAFCFF";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"}} onMouseLeave={e=>{e.currentTarget.style.background="#FFFFFF";e.currentTarget.style.boxShadow="none"}}>
          <div className="flex items-center justify-between mb-1"><h3 className="font-bold text-sm" style={{color:"#111827"}}>{s.name}</h3><span className="font-bold px-2 py-0.5 rounded-full" style={{fontSize:10,background:`${currentDomain.color}12`,color:currentDomain.color}}>{s.agents.length}</span></div>
          {topCap&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"rgba(0,0,0,0.04)",color:"rgba(0,0,0,0.4)",textTransform:"capitalize"}}>Top: {topCap[0]}</span>}
          <div className="flex -space-x-1 mt-2">{s.agents.slice(0,6).map(a=><div key={a.id} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color}20`,color:a.color,fontSize:6,border:"1px solid white"}}>{a.avatar}</div>)}{s.agents.length>6&&<div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.03)",color:"rgba(0,0,0,0.4)",fontSize:7}}>+{s.agents.length-6}</div>}</div>
        </button></FadeIn>})}
      </div>
    </div>}

    {/* VIEW 3: Agent Grid */}
    {view==="agents"&&currentSpec&&<div className="mb-6">
      <p className="text-xs mb-3" style={{color:"rgba(0,0,0,0.4)"}}>{filteredAgents.length} agents in {currentSpec.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{filteredAgents.map((a,i)=><FadeIn key={a.id} delay={i*15}><AgentCard a={a} isCustom={false}/></FadeIn>)}</div>
    </div>}

    </>}

    {/* Admin: Create agent */}
    {admin&&!showForm&&<FadeIn delay={30}><button onClick={startNew} className="mb-5 px-4 py-2 rounded-full font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>+ Create Custom Agent</button></FadeIn>}

    {showForm&&<FadeIn><div className="p-4 rounded-2xl border mb-5" style={{background:"white",borderColor:"#E8734A40",borderStyle:"dashed"}}>
      <h3 className="font-bold mb-3" style={{fontSize:14,color:"#111827"}}>{editing?"Edit Agent":"Create Agent"}</h3>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Agent name" className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555"}}/>
      <textarea value={persona} onChange={e=>setPersona(e.target.value)} placeholder="Persona prompt..." className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-2" style={{borderColor:"#E5E7EB",color:"#555",minHeight:80,resize:"vertical"}}/>
      <div className="flex flex-wrap gap-1.5 mb-2"><span className="text-xs self-center mr-1" style={{color:"#BBB"}}>Model:</span>{MODEL_PROVIDERS.map(m=><button key={m.id} onClick={()=>setModel(m.id)} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:model===m.id?`${m.color}15`:"white",color:model===m.id?m.color:"#CCC",border:`1px solid ${model===m.id?m.color:"#E5E7EB"}`}}>{m.label.split(" ")[0]}</button>)}</div>
      <div className="flex gap-2 mt-2"><button onClick={save} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>{editing?"Update":"Create"}</button><button onClick={()=>setShowForm(false)} className="px-4 py-1.5 rounded-full font-semibold text-sm" style={{color:"#CCC",border:"1px solid #E5E7EB"}}>Cancel</button></div>
    </div></FadeIn>}

    {inactive.length>0&&<div className="mt-4"><h3 className="font-bold mb-2" style={{fontSize:13,color:"#CCC"}}>Inactive ({inactive.length})</h3>
      <div className="space-y-1">{inactive.map(a=><div key={a.id} className="flex items-center justify-between p-2 rounded-lg" style={{background:"#F9FAFB"}}>
        <span className="text-xs" style={{color:"#CCC"}}>{a.name}</span>
        {admin&&<div className="flex gap-1"><button onClick={()=>onSaveAgent({...a,status:"active"})} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#2D8A6E",background:"#EBF5F1"}}>Activate</button><button onClick={()=>onDeleteAgent(a.id)} className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{color:"#E53E3E",background:"#FFF5F5"}}>Delete</button></div>}
      </div>)}</div>
    </div>}
  </div></div>
}

// ==================== ARTICLE VIEW — Public reading page + debate ====================
function ArticlePage({article,agents,registry,registryIndex,onNavigate,onUpdateArticle,currentUser}){
  if(!article)return null;
  const admin=isAdmin(currentUser);
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

// ==================== REMAINING PAGES ====================
function AgentsPage({content,onNavigate}){return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
  <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>AI Agents</h1><p className="mb-6" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(0,0,0,0.45)"}}>Three agents, three lenses, one continuous conversation.</p></FadeIn>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{AGENTS.map((a,i)=>{const posts=content.filter(c=>c.authorId===a.id);return <FadeIn key={a.id} delay={i*60}><div className="p-4 rounded-2xl text-center" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
    <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2" style={{background:`${a.color}10`,color:a.color,border:`2px dashed ${a.color}40`}}>{a.avatar}</div>
    <h3 className="font-bold mb-0.5" style={{fontFamily:"'Inter',system-ui,sans-serif",color:a.color,fontSize:16}}>{a.name}</h3>
    <p style={{fontSize:11,color:"#BBB"}}>{a.role}</p>
    <div className="mt-2 font-bold" style={{fontSize:11,color:a.color}}>{posts.length} posts</div>
  </div></FadeIn>})}</div></div></div>}

// CrossRefLink moved to components/shared/UIComponents.js

// ==================== DEBATE EXPORT — Markdown, LinkedIn, Copy ====================
function DebateExport({panel,rounds,loom,streams,atlas,topicTitle}){
  const[format,setFormat]=useState(null);const[copied,setCopied]=useState(false);
  const generateMarkdown=()=>{
    let md=`# ${topicTitle}\n\n`;
    md+=`*Debate conducted on Re³ — re3.live*\n\n`;
    if(panel?.agents?.length)md+=`**Panel:** ${panel.agents.map(a=>a.name).join(", ")}\n\n`;
    if(panel?.rationale)md+=`> ${panel.rationale}\n\n`;
    md+=`---\n\n`;
    if(rounds?.length){rounds.forEach((round,ri)=>{md+=`## Round ${ri+1}\n\n`;round.forEach(r=>{if(r.status==="success"&&r.response)md+=`### ${r.name}\n${r.response}\n\n`})});md+=`---\n\n`}
    if(atlas?.intervention)md+=`## Moderation Note\n${atlas.intervention}\n\n`;
    if(loom){md+=`## The Loom — Synthesis\n\n${loom}\n\n`}
    if(streams?.length){md+=`## Argument Streams\n\n`;streams.forEach(s=>{md+=`### ${s.title}\n`;s.entries?.forEach(e=>{md+=`- **${e.agent}** (R${e.round}): ${e.excerpt}\n`});md+=`\n`})}
    md+=`---\n*Generated on Re³ | re3.live*`;
    return md;
  };
  const generateLinkedIn=()=>{
    let post=`I just ran an AI-powered debate on "${topicTitle}" using Re³ (re3.live)\n\n`;
    if(panel?.agents?.length)post+=`${panel.agents.length} AI agents debated across 3 rounds.\n\n`;
    if(loom){const firstPara=loom.split("\n\n")[0];post+=`Key insight: ${firstPara.slice(0,200)}...\n\n`}
    if(streams?.length>0)post+=`The debate revealed ${streams.length} key themes:\n${streams.slice(0,3).map(s=>`→ ${s.title}`).join("\n")}\n\n`;
    post+=`Try it yourself at re3.live\n\n#AI #HumanAI #StructuredDebate #Re3`;
    return post;
  };
  const copyToClipboard=(text)=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}).catch(()=>{})};
  if(!loom&&!rounds?.length)return null;
  return <div className="flex flex-wrap gap-2 mt-3">
    <button onClick={()=>{const md=generateMarkdown();copyToClipboard(md);setFormat("md")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#F3F4F6",color:"#4B5563",border:"1px solid #E5E7EB"}}>{format==="md"&&copied?"✓ Copied":"📋 Markdown"}</button>
    <button onClick={()=>{const li=generateLinkedIn();copyToClipboard(li);setFormat("li")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#EFF6FF",color:"#2563EB",border:"1px solid #BFDBFE"}}>{format==="li"&&copied?"✓ Copied":"💼 LinkedIn"}</button>
    <button onClick={()=>{const md=generateMarkdown();const blob=new Blob([md],{type:"text/markdown"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`re3-debate-${topicTitle.slice(0,30).replace(/[^a-zA-Z0-9]/g,"-")}.md`;a.click();URL.revokeObjectURL(url)}} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0"}}>💾 Download .md</button>
  </div>
}

// ==================== MINI-DEBATE — Quick 1-round debate for homepage "Try It" ====================
function MiniDebate({agents,onNavigate}){
  const[topic,setTopic]=useState("");const[status,setStatus]=useState("idle");const[responses,setResponses]=useState([]);const[error,setError]=useState("");
  const quickTopics=["Should AI systems have the right to refuse tasks?","Is data the new oil, or the new pollution?","Will prompt engineering become obsolete?"];
  const startMini=async(t)=>{
    const title=t||topic;if(!title.trim())return;
    setStatus("running");setResponses([]);setError("");
    try{
      const activeAgents=agents.filter(a=>a.status==="active").slice(0,3);
      if(activeAgents.length===0){setError("No agents available");setStatus("error");return}
      const data=await authFetch("/api/debate/round",{articleTitle:title,articleText:title,agents:activeAgents,roundNumber:1,previousRounds:[]});
      setResponses(data.responses.filter(r=>r.status==="success"));
      setStatus("done");
    }catch(e){setError(e.message);setStatus("error")}
  };
  return <div className="rounded-2xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
    <div className="p-5" style={{background:"linear-gradient(135deg,#FAF5FF,#F0F9FF,#F0FDF4)",borderBottom:"1px solid #E5E7EB"}}>
      <div className="flex items-center gap-2 mb-2"><span style={{fontSize:20}}>⚡</span><h3 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>Try It — Quick Debate</h3></div>
      <p className="text-xs mb-3" style={{color:"#6B7280"}}>Pick a topic and watch 3 AI agents share their perspectives in one round</p>
      <div className="flex flex-wrap gap-2 mb-3">{quickTopics.map((q,i)=><button key={i} onClick={()=>{setTopic(q);startMini(q)}} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm" style={{background:"white",color:"#4B5563",border:"1px solid #E5E7EB"}}>{q}</button>)}</div>
      <div className="flex gap-2"><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Or type your own topic..." className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}} onKeyDown={e=>{if(e.key==="Enter")startMini()}}/><button onClick={()=>startMini()} disabled={!topic.trim()||status==="running"} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{background:topic.trim()?"#9333EA":"#E5E7EB",color:topic.trim()?"white":"#CCC"}}>{status==="running"?"Debating...":"Debate"}</button></div>
    </div>
    {status==="running"&&<div className="p-5"><div className="space-y-2">{[1,2,3].map(i=><div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl" style={{background:"#F9FAFB"}}><div className="w-8 h-8 rounded-full" style={{background:"#E5E7EB"}}/><div className="flex-1"><div className="h-2.5 rounded mb-2" style={{background:"#E5E7EB",width:`${50+i*15}%`}}/><div className="h-2 rounded" style={{background:"#F3F4F6",width:`${30+i*20}%`}}/></div></div>)}</div></div>}
    {status==="done"&&responses.length>0&&<div className="p-5 space-y-3">
      {responses.map((r,i)=>{const agent=agents.find(a=>a.id===r.id);const color=agent?.color||"#999";
        return <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all" style={{background:`${color}05`,border:`1px solid ${color}15`}}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:`${color}15`,color,fontSize:10}}>{agent?.avatar||r.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-bold text-sm" style={{color}}>{r.name}</span>{r.model&&<span className="px-1.5 py-0.5 rounded text-xs" style={{background:"#F3F4F6",color:"#BBB",fontSize:8}}>{r.model}</span>}</div>
            <p className="text-xs" style={{color:"#555",lineHeight:1.7}}>{r.response?.slice(0,300)}{r.response?.length>300?"...":""}</p>
          </div>
        </div>})}
      <div className="flex items-center justify-between pt-2" style={{borderTop:"1px solid #E5E7EB"}}>
        <span className="text-xs" style={{color:"#CCC"}}>Quick 1-round preview — run a full 3-round debate in Debate Lab</span>
        <button onClick={()=>onNavigate("forge")} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#9333EA",color:"white"}}>Full Debate &rarr;</button>
      </div>
    </div>}
    {error&&<div className="p-4"><p className="text-xs" style={{color:"#E53E3E"}}>{error}</p><button onClick={()=>setStatus("idle")} className="text-xs font-semibold mt-1" style={{color:"#3B6B9B"}}>Try again</button></div>}
  </div>
}

// ==================== DEBATE GALLERY PAGE — /debates ====================
function DebateGalleryPage({content,forgeSessions,onNavigate,onForge}){
  const cycles=getCycles(content);
  const[filter,setFilter]=useState("all");
  const[expanded,setExpanded]=useState(null);
  // Collect all debates from posts
  const allDebates=[];
  content.forEach(post=>{if(post.debate?.loom)allDebates.push({type:"post",id:post.id,title:post.title,pillar:post.pillar,loom:post.debate.loom,streams:post.debate.streams||[],panel:post.debate.panel,rounds:post.debate.rounds||[],date:post.createdAt})});
  forgeSessions?.forEach(s=>{if(s.mode==="debate"&&s.results?.loom)allDebates.push({type:"session",id:s.id,title:s.topic?.title||s.topic||"Untitled",loom:s.results.loom,streams:s.results.streams||[],panel:s.results.panel,rounds:s.results.rounds||[],date:s.date})});
  allDebates.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const filtered=filter==="all"?allDebates:filter==="sessions"?allDebates.filter(d=>d.type==="session"):allDebates.filter(d=>d.type==="post");
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Debate Gallery</h1>
      <p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Every debate, every synthesis. {allDebates.length} debate{allDebates.length!==1?"s":""} conducted.</p></FadeIn>
    <FadeIn delay={30}><div className="flex flex-wrap items-center gap-2 mb-6">
      {[["all","All",allDebates.length],["post","From Articles",allDebates.filter(d=>d.type==="post").length],["sessions","Lab Sessions",allDebates.filter(d=>d.type==="session").length]].map(([key,label,count])=>
        <button key={key} onClick={()=>setFilter(key)} className="px-3 py-1.5 rounded-full font-medium text-sm transition-all" style={{background:filter===key?"#E8734A":"#FFFFFF",color:filter===key?"white":"#4B5563",border:filter===key?"1px solid #E8734A":"1px solid #E5E7EB"}}>{label} ({count})</button>)}
    </div></FadeIn>
    {/* Stats bar */}
    <FadeIn delay={50}><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">{[
      ["Total Debates",allDebates.length,"#E8734A"],
      ["Unique Agents",new Set(allDebates.flatMap(d=>d.panel?.agents?.map(a=>a.name)||[])).size,"#3B6B9B"],
      ["Argument Streams",allDebates.reduce((s,d)=>s+(d.streams?.length||0),0),"#2D8A6E"],
      ["Total Rounds",allDebates.reduce((s,d)=>s+(d.rounds?.length||3),0),"#8B5CF6"]
    ].map(([label,val,color],i)=><div key={i} className="p-3 rounded-xl text-center" style={{background:`${color}08`,border:`1px solid ${color}15`}}>
      <div className="font-bold text-lg" style={{color}}>{val}</div>
      <div className="text-xs" style={{color:`${color}90`}}>{label}</div>
    </div>)}</div></FadeIn>
    <div className="space-y-3">{filtered.length>0?filtered.map((d,i)=><FadeIn key={d.id} delay={i*30}>
      <div className="rounded-xl overflow-hidden transition-all hover:shadow-md cursor-pointer" style={{background:"white",border:expanded===d.id?"2px solid #E8734A":"1px solid #E5E7EB"}} onClick={()=>{if(d.type==="post"){onNavigate("post",d.id)}else{onNavigate("forge",d.id)}}}>
        <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid #F3F4F6"}}>
          <div className="flex items-center gap-2">{d.pillar&&<PillarTag pillar={d.pillar}/>}<span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:d.type==="session"?"#FFF3E0":"#F3E8FF",color:d.type==="session"?"#E8734A":"#9333EA"}}>{d.type==="session"?"Lab Session":"Article Debate"}</span><span className="text-xs" style={{color:"#CCC"}}>{d.date?fmtS(d.date):""}</span></div>
          <div className="flex items-center gap-2">
            {d.panel?.agents&&<div className="flex -space-x-1">{d.panel.agents.slice(0,5).map((a,ai)=><div key={ai} className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",border:"1px solid white",fontSize:7,zIndex:5-ai}}>{a.avatar||a.name?.charAt(0)}</div>)}</div>}
            {d.type==="session"&&<span className="text-xs" style={{color:"#CCC"}}>{expanded===d.id?"▲":"▼"}</span>}
          </div>
        </div>
        <div className="p-4"><h3 className="font-bold text-sm mb-2" style={{color:"#111827"}}>{d.title}</h3>
          {expanded!==d.id&&<><p className="text-xs mb-2" style={{color:"#888",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{d.loom?.slice(0,250)}...</p>
          {d.streams?.length>0&&<div className="flex flex-wrap gap-1.5">{d.streams.slice(0,3).map((s,si)=><span key={si} className="px-2 py-0.5 rounded-full text-xs" style={{background:"#F3F4F6",color:"#666"}}>{s.title}</span>)}{d.streams.length>3&&<span className="text-xs" style={{color:"#CCC"}}>+{d.streams.length-3} more</span>}</div>}</>}
          {expanded===d.id&&<div onClick={e=>e.stopPropagation()}>
            {/* Panel */}
            {d.panel?.agents&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6",letterSpacing:"0.05em"}}>DEBATE PANEL</h4>
              <div className="flex flex-wrap gap-2 mb-2">{d.panel.agents.map((a,ai)=><span key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:`${a.color||"#999"}10`,border:`1px solid ${a.color||"#999"}25`}}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",fontSize:8}}>{a.avatar||a.name?.charAt(0)}</span>
                <span className="text-xs font-semibold" style={{color:a.color||"#666"}}>{a.name}</span>
              </span>)}</div>
              {d.panel.rationale&&<p className="text-xs" style={{color:"#888",lineHeight:1.6,fontStyle:"italic"}}>{d.panel.rationale}</p>}
            </div>}
            {/* Debate Rounds */}
            {d.rounds?.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#E8734A",letterSpacing:"0.05em"}}>DEBATE ROUNDS ({d.rounds.length})</h4>
              {d.rounds.map((round,ri)=><div key={ri} className="mb-3"><span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Round {ri+1}</span>
                <div className="space-y-1.5 mt-1">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{
                  const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);
                  return <div key={idx} className="p-2.5 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}>
                    <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:agent?.color||"#666"}}>{r.name||agent?.name||"Agent"}</span><span style={{fontSize:10,color:"#CCC"}}>{agent?.category||""}</span></div>
                    <p style={{fontSize:11,color:"#555",lineHeight:1.6}}>{r.response}</p>
                  </div>})}</div>
              </div>)}
            </div>}
            {/* Argument Streams */}
            {d.streams?.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#2D8A6E",letterSpacing:"0.05em"}}>ARGUMENT STREAMS</h4>
              {d.streams.map((stream,si)=><div key={si} className="mb-2 p-3 rounded-lg" style={{background:"#F9FAFB"}}>
                <span className="font-bold text-xs" style={{color:"#111827"}}>{stream.title}</span>
                <div className="mt-1 space-y-1">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2" style={{fontSize:11}}><span className="font-bold flex-shrink-0" style={{color:"#999"}}>{entry.agent}</span><span style={{color:"#666"}}>{entry.excerpt}</span></div>)}</div>
              </div>)}
            </div>}
            {/* Synthesis */}
            <div className="mb-2"><h4 className="font-bold text-xs mb-2" style={{color:"#3B6B9B",letterSpacing:"0.05em"}}>SYNTHESIS</h4>
              <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{d.loom?.split("\n\n").map((p,pi)=><p key={pi} className="mb-2">{p}</p>)}</div>
            </div>
          </div>}
        </div>
      </div>
    </FadeIn>):<FadeIn><div className="p-6 rounded-xl text-center" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}><p className="text-sm mb-3" style={{color:"#9CA3AF"}}>No debates yet. Start one in the Debate Lab!</p><button onClick={()=>onNavigate("forge")} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}}>Go to Debate Lab &rarr;</button></div></FadeIn>}</div>
  </div></div>
}

// ==================== ARTIFACT SEARCH — Cross-cycle artifact search ====================
function ArtifactSearchPage({content,onNavigate}){
  const cycles=getCycles(content);const[query,setQuery]=useState("");const[results,setResults]=useState([]);
  // Build searchable artifact index
  const artifacts=[];
  cycles.forEach(c=>{
    if(c.artifacts?.questions?.items)c.artifacts.questions.items.forEach(q=>artifacts.push({type:"question",text:q,cycle:c,pillar:"rethink",source:c.rethink?.title}));
    if(c.artifacts?.principle?.statement)artifacts.push({type:"principle",text:c.artifacts.principle.statement,cycle:c,pillar:"rediscover",source:c.rediscover?.title,evidence:c.artifacts.principle.evidence});
    if(c.artifacts?.blueprint?.components)c.artifacts.blueprint.components.forEach(comp=>artifacts.push({type:"component",text:comp,cycle:c,pillar:"reinvent",source:c.reinvent?.title}));
    if(c.throughLineQuestion)artifacts.push({type:"through-line",text:c.throughLineQuestion,cycle:c,pillar:"all",source:`Cycle ${c.number}`});
    // Also index patterns from rediscover posts
    if(c.rediscover?.patterns)c.rediscover.patterns.forEach(p=>artifacts.push({type:"pattern",text:`${p.domain}: ${p.principle||p.summary}`,cycle:c,pillar:"rediscover",source:c.rediscover.title}));
    // Index open thread from reinvent
    if(c.reinvent?.openThread)artifacts.push({type:"open-thread",text:c.reinvent.openThread,cycle:c,pillar:"reinvent",source:c.reinvent.title});
  });
  const doSearch=(q)=>{setQuery(q);if(!q.trim()){setResults([]);return}const lower=q.toLowerCase();setResults(artifacts.filter(a=>a.text.toLowerCase().includes(lower)))};
  const typeColors={"question":"#3B6B9B","principle":"#E8734A","component":"#2D8A6E","through-line":"#8B5CF6","pattern":"#E8734A","open-thread":"#2D8A6E"};
  const typeLabels={"question":"Open Question","principle":"Principle","component":"Blueprint Component","through-line":"Through-Line","pattern":"Pattern","open-thread":"Open Thread"};
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(22px,3.5vw,32px)"}}>Artifact Search</h1>
      <p className="mb-4" style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6B7280"}}>Search across all cycle artifacts — questions, principles, blueprints, patterns. {artifacts.length} artifacts indexed.</p></FadeIn>
    <FadeIn delay={30}><div className="mb-6"><input value={query} onChange={e=>doSearch(e.target.value)} placeholder="Search artifacts... (e.g. 'governance', 'architecture', 'trust')" className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none" style={{borderColor:"#E5E7EB",background:"white",fontSize:14}} autoFocus/></div></FadeIn>
    {/* Show all artifacts when no query */}
    {!query.trim()&&<FadeIn delay={50}><div className="mb-4">
      <h3 className="font-bold mb-3" style={{color:"#111827",fontSize:15}}>All Artifacts by Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">{Object.entries(typeLabels).map(([type,label])=>{const count=artifacts.filter(a=>a.type===type).length;return count>0&&<button key={type} onClick={()=>doSearch(type)} className="p-3 rounded-xl text-center transition-all hover:shadow-sm" style={{background:`${typeColors[type]}08`,border:`1px solid ${typeColors[type]}15`}}>
        <div className="font-bold text-lg" style={{color:typeColors[type]}}>{count}</div>
        <div className="text-xs" style={{color:`${typeColors[type]}90`}}>{label}s</div>
      </button>})}</div>
    </div></FadeIn>}
    {/* Results */}
    {query.trim()&&<div className="mb-2 text-xs" style={{color:"#CCC"}}>{results.length} result{results.length!==1?"s":""}</div>}
    <div className="space-y-2">{(query.trim()?results:artifacts.slice(0,30)).map((a,i)=><FadeIn key={i} delay={i*15}>
      <div className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" style={{background:"white",border:`1px solid ${typeColors[a.type]||"#E5E7EB"}20`}} onClick={()=>{const post=a.cycle[a.pillar==="all"?"rethink":a.pillar];if(post)onNavigate("post",post.id);else onNavigate("loom-cycle",a.cycle.id)}}>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:`${typeColors[a.type]}12`,color:typeColors[a.type]}}>{typeLabels[a.type]||a.type}</span>
          <span className="text-xs" style={{color:"#CCC"}}>Cycle {a.cycle.number}</span>
          {a.source&&<span className="text-xs" style={{color:"#BBB"}}>from: {a.source}</span>}
        </div>
        <p className="text-sm" style={{color:"#333",lineHeight:1.5}}>{a.text}</p>
        {a.evidence&&<div className="flex flex-wrap gap-1 mt-1">{a.evidence.map((ev,ei)=><span key={ei} className="text-xs px-1.5 py-0.5 rounded" style={{background:"#F3F4F6",color:"#888"}}>{ev}</span>)}</div>}
      </div>
    </FadeIn>)}</div>
  </div></div>
}

// ==================== DEBATE INSIGHTS DASHBOARD ====================
function DebateInsightsPanel({content,forgeSessions}){
  const cycles=getCycles(content);
  // Collect stats from all debates
  const allDebates=[];
  content.forEach(post=>{if(post.debate?.loom)allDebates.push({panel:post.debate.panel,rounds:post.debate.rounds||[],streams:post.debate.streams||[],loom:post.debate.loom,pillar:post.pillar})});
  forgeSessions?.forEach(s=>{if(s.mode==="debate"&&s.results?.loom)allDebates.push({panel:s.results.panel,streams:s.results.streams||[],loom:s.results.loom})});
  // Agent participation frequency
  const agentCounts={};allDebates.forEach(d=>{d.panel?.agents?.forEach(a=>{agentCounts[a.name]=(agentCounts[a.name]||0)+1})});
  const topAgents=Object.entries(agentCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  // Most common stream themes (word freq)
  const allStreamTitles=allDebates.flatMap(d=>d.streams?.map(s=>s.title)||[]);
  const wordFreq={};allStreamTitles.forEach(t=>{t.split(/\s+/).forEach(w=>{const lw=w.toLowerCase().replace(/[^a-z]/g,"");if(lw.length>3)wordFreq[lw]=(wordFreq[lw]||0)+1})});
  const topWords=Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,12);
  // Pillar distribution
  const pillarCounts={rethink:0,rediscover:0,reinvent:0};allDebates.forEach(d=>{if(d.pillar&&pillarCounts[d.pillar]!==undefined)pillarCounts[d.pillar]++});
  const totalPillar=Object.values(pillarCounts).reduce((s,v)=>s+v,0)||1;

  if(allDebates.length===0)return null;
  return <div className="rounded-2xl p-5" style={{background:"white",border:"1px solid #E5E7EB"}}>
    <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Debate Insights</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">{[
      ["Debates",allDebates.length,"#E8734A"],["Streams",allDebates.reduce((s,d)=>s+(d.streams?.length||0),0),"#3B6B9B"],
      ["Agents Used",Object.keys(agentCounts).length,"#2D8A6E"],["Avg Streams",allDebates.length?(allDebates.reduce((s,d)=>s+(d.streams?.length||0),0)/allDebates.length).toFixed(1):"0","#8B5CF6"]
    ].map(([label,val,color],i)=><div key={i} className="p-2.5 rounded-xl text-center" style={{background:`${color}06`}}>
      <div className="font-bold" style={{color,fontSize:18}}>{val}</div>
      <div className="text-xs" style={{color:"#999"}}>{label}</div>
    </div>)}</div>
    {/* Most active agents */}
    {topAgents.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>MOST ACTIVE AGENTS</h4>
      <div className="flex flex-wrap gap-1.5">{topAgents.map(([name,count],i)=><span key={i} className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:i===0?"#E8734A10":"#F3F4F6",color:i===0?"#E8734A":"#666"}}>{name} ({count})</span>)}</div>
    </div>}
    {/* Topic cloud */}
    {topWords.length>0&&<div className="mb-4"><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>DEBATE TOPICS</h4>
      <div className="flex flex-wrap gap-1.5">{topWords.map(([word,count],i)=>{const size=Math.min(12+count*2,20);return <span key={i} style={{fontSize:size,color:`rgba(0,0,0,${0.3+count*0.1})`,fontWeight:count>2?600:400}}>{word}</span>})}</div>
    </div>}
    {/* Pillar distribution bar */}
    {totalPillar>0&&<div><h4 className="font-bold text-xs mb-2" style={{color:"#CCC",letterSpacing:"0.08em"}}>PILLAR DISTRIBUTION</h4>
      <div className="flex rounded-full overflow-hidden" style={{height:8}}>
        <div style={{width:`${(pillarCounts.rethink/totalPillar)*100}%`,background:"#3B6B9B"}}/>
        <div style={{width:`${(pillarCounts.rediscover/totalPillar)*100}%`,background:"#E8734A"}}/>
        <div style={{width:`${(pillarCounts.reinvent/totalPillar)*100}%`,background:"#2D8A6E"}}/>
      </div>
      <div className="flex justify-between mt-1">{Object.entries(pillarCounts).map(([p,c])=><span key={p} className="text-xs" style={{color:PILLARS[p]?.color}}>{PILLARS[p]?.label}: {c}</span>)}</div>
    </div>}
  </div>
}

// ==================== THE FORGE — Standalone Collaboration Hub ====================
function ForgePage({content,themes,agents,registry,registryIndex,currentUser,onNavigate,forgeSessions,onSaveForgeSession,onDeleteForgeSession,forgePreload,onPostGenerated,onAutoComment,onUpdatePost,sessionId}){
  const[topicSource,setTopicSource]=useState(null);
  const[selectedTopic,setSelectedTopic]=useState(null);
  const[workshopActive,setWorkshopActive]=useState(false);
  const[customTitle,setCustomTitle]=useState("");
  const[customText,setCustomText]=useState("");
  const[urlInput,setUrlInput]=useState("");
  const[viewingSession,setViewingSession]=useState(null);
  const admin=isAdmin(currentUser);
  const cycles=getCycles(content);

  // Consume forgePreload
  useEffect(()=>{if(forgePreload){setSelectedTopic(forgePreload);setWorkshopActive(true)}},[forgePreload]);

  // Deep link: auto-open session by ID
  useEffect(()=>{if(sessionId&&forgeSessions?.length>0){const s=forgeSessions.find(fs=>fs.id===sessionId);if(s)setViewingSession(s)}},[sessionId,forgeSessions]);

  const confirmTopic=(topic)=>{setSelectedTopic(topic);setTopicSource(null)};
  const startSession=()=>{if(selectedTopic)setWorkshopActive(true)};
  const resetSession=()=>{setSelectedTopic(null);setWorkshopActive(false);setTopicSource(null);setCustomTitle("");setCustomText("");setUrlInput("")};

  const handleSaveSession=(sessionData)=>{
    if(!admin||!onSaveForgeSession)return;
    onSaveForgeSession({id:"fs_"+Date.now(),topic:selectedTopic,date:new Date().toISOString(),mode:sessionData.mode,results:sessionData.results,status:"saved"});
  };

  // When a cycle debate completes, save debate data back to the cycle posts
  const handleDebateComplete=(debate)=>{
    if(selectedTopic?.sourceType==="cycle"&&(selectedTopic?.cycleId||selectedTopic?.cycleDate)&&onUpdatePost){
      const cyclePosts=selectedTopic.cycleId?content.filter(c=>c.cycleId===selectedTopic.cycleId):content.filter(c=>c.sundayCycle===selectedTopic.cycleDate);
      cyclePosts.forEach(p=>{onUpdatePost({...p,debate})});
    }
  };

  // Viewing a saved session
  if(viewingSession){
    const s=viewingSession;
    const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
    return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <FadeIn><div className="flex items-center gap-3 mb-6">
        <button onClick={()=>{setViewingSession(null);onNavigate("forge")}} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.5)"}}>← Back</button>
        <div><h1 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>{s.topic?.title||"Session"}</h1>
          <div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:10,background:`${modeColors[s.mode]||"#999"}15`,color:modeColors[s.mode]||"#999"}}>{s.mode}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.35)"}}>{new Date(s.date).toLocaleDateString()}</span></div>
        </div>
        <div className="ml-auto"><ShareButton title={`Re³ Ada: ${s.topic?.title}`} text={`${s.mode} session on "${s.topic?.title}"`}/></div>
      </div></FadeIn>
      <FadeIn delay={60}><div className="p-4 rounded-2xl" style={{background:"white",border:"1px solid #E5E7EB"}}>
        {s.mode==="debate"&&s.results&&<div>
          {s.results.panel?.agents&&<div className="mb-5"><h4 className="font-bold text-xs mb-2" style={{color:"#8B5CF6",letterSpacing:"0.05em"}}>DEBATE PANEL</h4>
            <div className="flex flex-wrap gap-2 mb-2">{s.results.panel.agents.map((a,ai)=><span key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:`${a.color||"#999"}10`,border:`1px solid ${a.color||"#999"}25`}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{background:`${a.color||"#999"}15`,color:a.color||"#999",fontSize:8}}>{a.avatar||a.name?.charAt(0)}</span>
              <span className="text-xs font-semibold" style={{color:a.color||"#666"}}>{a.name}</span>
            </span>)}</div>
            {s.results.panel.rationale&&<p className="text-xs" style={{color:"#888",lineHeight:1.6,fontStyle:"italic"}}>{s.results.panel.rationale}</p>}
          </div>}
          {s.results.rounds?.length>0&&<div className="mb-5"><h4 className="font-bold text-xs mb-2" style={{color:"#E8734A",letterSpacing:"0.05em"}}>DEBATE ROUNDS ({s.results.rounds.length})</h4>
            {s.results.rounds.map((round,ri)=><div key={ri} className="mb-4"><span className="font-bold text-xs" style={{color:"#8B5CF6"}}>Round {ri+1}</span>
              <div className="space-y-1.5 mt-1">{(Array.isArray(round)?round:[]).filter(r=>r.status==="success"&&r.response).map((r,idx)=>{
                const agent=[...INIT_AGENTS,...Object.values(ORCHESTRATORS)].find(a=>a.id===r.id);
                return <div key={idx} className="p-2.5 rounded-lg" style={{background:"#F9FAFB",borderLeft:`3px solid ${agent?.color||"#999"}`}}>
                  <div className="flex items-center gap-2 mb-1"><span className="font-bold" style={{fontSize:11,color:agent?.color||"#666"}}>{r.name||agent?.name||"Agent"}</span><span style={{fontSize:10,color:"#CCC"}}>{agent?.category||""}</span></div>
                  <p style={{fontSize:11,color:"#555",lineHeight:1.6}}>{r.response}</p>
                </div>})}</div>
            </div>)}
          </div>}
          {s.results.streams?.length>0&&<div className="mb-5"><h4 className="font-bold text-xs mb-2" style={{color:"#2D8A6E",letterSpacing:"0.05em"}}>ARGUMENT STREAMS</h4>
            {s.results.streams.map((stream,si)=><div key={si} className="mb-2 p-3 rounded-lg" style={{background:"#F9FAFB"}}>
              <span className="font-bold text-xs" style={{color:"#111827"}}>{stream.title}</span>
              <div className="mt-1 space-y-1">{stream.entries?.map((entry,ei)=><div key={ei} className="flex items-start gap-2" style={{fontSize:11}}><span className="font-bold flex-shrink-0" style={{color:"#999"}}>{entry.agent}</span><span style={{color:"#666"}}>{entry.excerpt}</span></div>)}</div>
            </div>)}
          </div>}
          {s.results.loom&&<div><h4 className="font-bold text-xs mb-2" style={{color:"#3B6B9B",letterSpacing:"0.05em"}}>SYNTHESIS</h4>
            <div style={{fontSize:13,color:"#555",lineHeight:1.9}}>{s.results.loom.split("\n\n").map((p,i)=><p key={i} className="mb-2">{p}</p>)}</div>
          </div>}
        </div>}
        {s.mode==="ideate"&&s.results?.clusters?.map((cl,ci)=><div key={ci} className="mb-3"><h4 className="font-bold text-sm mb-1" style={{color:"#3B6B9B"}}>{cl.theme}</h4><div className="space-y-1">{(cl.ideas||[]).map((idea,ii)=><div key={ii} className="p-2 rounded-lg text-xs" style={{background:"rgba(0,0,0,0.02)"}}><span className="font-bold" style={{color:idea.color||"#999"}}>{idea.agent}: </span>{idea.concept}</div>)}</div></div>)}
        {s.mode==="implement"&&s.results?.architecture&&<div><p className="mb-3" style={{fontSize:13,color:"#555",lineHeight:1.7}}>{s.results.architecture}</p>{s.results.components?.filter(c=>c.status==="success").map((comp,i)=><div key={i} className="p-2 rounded-lg mb-1 text-xs" style={{background:"rgba(0,0,0,0.02)"}}><span className="font-bold" style={{color:comp.color||"#999"}}>{comp.agent}: </span>{comp.component} — {comp.approach?.slice(0,150)}</div>)}</div>}
        {!s.results&&<p style={{fontSize:13,color:"rgba(0,0,0,0.3)"}}>Session data not available.</p>}
      </div></FadeIn>
    </div></div>;
  }

  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    {/* Header */}
    <FadeIn><div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{background:"#F3E8FF"}}><span style={{fontSize:24}}>🔨</span></div>
      <h1 className="font-bold mb-1" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:"clamp(24px,4vw,36px)"}}>Debate Lab</h1>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(0,0,0,0.45)"}}>Where agents and humans shape ideas together</p>
    </div></FadeIn>

    {/* SECTION A: Cycle Creator (admin only) */}
    {admin&&onPostGenerated&&<FadeIn delay={40}><div className="mb-8">
      <div className="flex items-center gap-2 mb-4"><span style={{fontSize:18}}>⚡</span><div><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#9333EA",fontSize:20}}>Cycle Creator</h2><p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(0,0,0,0.4)"}}>Generate a new synthesis cycle — 3 articles across Rethink, Rediscover, Reinvent</p></div></div>
      <AgentPanel onPostGenerated={onPostGenerated} onAutoComment={onAutoComment} agents={agents} registry={registry}/>
    </div></FadeIn>}

    {/* Divider between sections */}
    {admin&&onPostGenerated&&<div className="mb-8 flex items-center gap-3"><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/><span className="text-xs font-bold px-3 py-1" style={{color:"#9CA3AF"}}>OR</span><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/></div>}

    {/* SECTION B: Brainstorm Workshop */}
    <FadeIn delay={60}><div className="mb-8">
      <div className="flex items-center gap-2 mb-4"><span style={{fontSize:18}}>🧠</span><div><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#9333EA",fontSize:20}}>Brainstorm Workshop</h2><p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(0,0,0,0.4)"}}>Pick any topic and run Debate, Ideate, or Implement sessions with AI agents</p></div></div>

    {/* Topic Picker — only show if no active workshop */}
    {!workshopActive&&<div className="rounded-2xl p-5 mb-6" style={{background:"white",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Pick a Topic</h3>

      {/* Source buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[["loom","📖 From Loom"],["horizon","🔮 From Horizon"],["custom","✏️ Custom Topic"],["url","🔗 From URL"]].map(([key,label])=>
          <button key={key} onClick={()=>setTopicSource(topicSource===key?null:key)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{background:topicSource===key?"#F3E8FF":"#FFFFFF",color:topicSource===key?"#9333EA":"#4B5563",border:`1px solid ${topicSource===key?"rgba(147,51,234,0.3)":"#E5E7EB"}`}}>{label}</button>
        )}
      </div>

      {/* Source panels */}
      {topicSource==="loom"&&<div className="space-y-1.5 mb-4" style={{maxHeight:300,overflowY:"auto"}}>
        {/* Full cycles first — debate all 3 articles together */}
        {cycles.slice(0,10).map(c=>{
          const fullText=c.posts.map(p=>p.paragraphs?.join("\n\n")||"").join("\n\n---\n\n");
          return <button key={c.id} onClick={()=>confirmTopic({title:c.throughLineQuestion||c.headline||c.rethink?.title||"Cycle "+c.number,text:fullText,sourceType:"cycle",cycleDate:c.date,cycleId:c.id})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(139,92,246,0.03)",border:"1px solid rgba(139,92,246,0.1)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(139,92,246,0.03)"}>
            <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:"#F3E8FF",color:"#9333EA"}}>Full Cycle {c.number}</span>{c.isJourney&&<span className="px-1.5 py-0.5 rounded-full" style={{fontSize:8,background:"#E0F2EC",color:"#2D8A6E"}}>Connected Journey</span>}</div>
            <span className="font-semibold text-sm" style={{color:"#111827"}}>{c.throughLineQuestion||c.headline||"Cycle "+c.number}</span>
            <div className="flex items-center gap-2 mt-1">{["rethink","rediscover","reinvent"].map(pil=>{const post=c[pil];return post?<span key={pil} className="text-xs" style={{color:PILLARS[pil]?.color||"#999"}}>{post.title?.slice(0,30)}...</span>:null})}</div>
          </button>})}
        <div className="my-2 flex items-center gap-2"><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/><span className="text-xs" style={{color:"#CCC"}}>or pick a single article</span><div className="flex-1" style={{height:1,background:"#E5E7EB"}}/></div>
        {/* Individual posts as fallback */}
        {cycles.flatMap(c=>c.posts).slice(0,15).map(post=>
        <button key={post.id} onClick={()=>confirmTopic({title:post.title,text:post.paragraphs?.[0]||"",sourceType:"loom"})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(0,0,0,0.02)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.02)"}>
          <div className="flex items-center gap-2"><PillarTag pillar={post.pillar}/><span className="font-semibold text-sm" style={{color:"#111827"}}>{post.title}</span></div>
        </button>
      )}</div>}

      {topicSource==="horizon"&&<div className="space-y-1.5 mb-4">{themes.map(th=>
        <button key={th.id} onClick={()=>confirmTopic({title:th.title,text:"",sourceType:"horizon"})} className="w-full text-left p-3 rounded-xl transition-all" style={{background:"rgba(0,0,0,0.02)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(232,115,74,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.02)"}>
          <span className="font-semibold text-sm" style={{color:"#111827"}}>{th.title}</span>
          <span className="ml-2 text-xs" style={{color:"rgba(0,0,0,0.3)"}}>{th.votes} votes</span>
        </button>
      )}</div>}

      {topicSource==="custom"&&<div className="mb-4 space-y-2">
        <input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder="Topic title..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/>
        <textarea value={customText} onChange={e=>setCustomText(e.target.value)} placeholder="Context or description (optional)..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)",minHeight:80,resize:"vertical"}}/>
        <button onClick={()=>{if(customTitle.trim())confirmTopic({title:customTitle.trim(),text:customText.trim(),sourceType:"custom"})}} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}} disabled={!customTitle.trim()}>Set Topic</button>
      </div>}

      {topicSource==="url"&&<div className="mb-4 space-y-2">
        <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" style={{borderColor:"rgba(0,0,0,0.1)"}}/>
        <button onClick={()=>{if(urlInput.trim())confirmTopic({title:urlInput.trim(),text:"Discuss content from: "+urlInput.trim(),sourceType:"url"})}} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"#9333EA",color:"white"}} disabled={!urlInput.trim()}>Set URL Topic</button>
      </div>}

      {/* Selected topic display */}
      {selectedTopic&&<div className="p-3 rounded-xl mb-4" style={{background:"#FAF5FF",border:"1px solid rgba(45,138,110,0.15)"}}>
        <div className="flex items-center justify-between"><div>
          <span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.3)"}}>SELECTED TOPIC</span>
          <h4 className="font-bold text-sm mt-0.5" style={{color:"#111827"}}>{selectedTopic.title}</h4>
          {selectedTopic.text&&<p className="text-xs mt-1" style={{color:"rgba(0,0,0,0.4)",lineHeight:1.5}}>{selectedTopic.text.slice(0,200)}{selectedTopic.text.length>200?"...":""}</p>}
        </div><button onClick={()=>setSelectedTopic(null)} className="text-xs" style={{color:"rgba(0,0,0,0.3)"}}>✕</button></div>
      </div>}

      {/* Start session button */}
      {selectedTopic&&<button onClick={startSession} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{background:"#9333EA",color:"white"}}>Start Session →</button>}
    </div>}

    {/* Active Workshop */}
    {workshopActive&&selectedTopic&&<div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div><span className="text-xs font-bold" style={{color:"rgba(0,0,0,0.3)"}}>FORGING</span><h2 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:18}}>{selectedTopic.title}</h2></div>
        <div className="flex items-center gap-2"><ShareButton title={`Re³ Debate Lab: ${selectedTopic.title}`} text={`Exploring "${selectedTopic.title}" in Debate Lab`}/><button onClick={resetSession} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:"1px solid rgba(0,0,0,0.1)",color:"rgba(0,0,0,0.4)"}}>New Topic</button></div>
      </div>
      <AgentWorkshop key={selectedTopic?.title||''} topic={selectedTopic} agents={agents} registry={registry} registryIndex={registryIndex} onDebateComplete={handleDebateComplete} onSaveSession={handleSaveSession} currentUser={currentUser}/>
    </div>}
    </div></FadeIn>

    {/* Saved Sessions */}
    {forgeSessions&&forgeSessions.length>0&&<FadeIn delay={120}><div className="rounded-2xl p-5" style={{background:"white",border:"1px solid #E5E7EB"}}>
      <h3 className="font-bold mb-3" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Saved Sessions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{forgeSessions.map(s=>{
        const modeColors={debate:"#E8734A",ideate:"#3B6B9B",implement:"#2D8A6E"};
        const modeIcons={debate:"⚔️",ideate:"💡",implement:"🔨"};
        return <div key={s.id} className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" style={{background:"rgba(0,0,0,0.02)",border:"1px solid #E5E7EB"}} onClick={()=>onNavigate("forge",s.id)}>
          <div className="flex items-center gap-2 mb-1"><span style={{fontSize:14}}>{modeIcons[s.mode]||"📝"}</span><span className="px-2 py-0.5 rounded-full font-bold" style={{fontSize:9,background:`${modeColors[s.mode]||"#999"}15`,color:modeColors[s.mode]||"#999"}}>{s.mode}</span><span style={{fontSize:10,color:"rgba(0,0,0,0.3)"}}>{new Date(s.date).toLocaleDateString()}</span></div>
          <h4 className="font-semibold text-sm" style={{color:"#111827"}}>{s.topic?.title||"Untitled"}</h4>
          {admin&&onDeleteForgeSession&&<button onClick={e=>{e.stopPropagation();onDeleteForgeSession(s.id)}} className="text-xs mt-1 font-semibold transition-all" style={{color:"rgba(229,62,62,0.5)"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(229,62,62,1)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(229,62,62,0.5)"}>Delete</button>}
        </div>
      })}</div>
    </div></FadeIn>}

    {/* Debate Insights Dashboard */}
    <FadeIn delay={140}><DebateInsightsPanel content={content} forgeSessions={forgeSessions}/></FadeIn>

  </div></div>;
}

function ProfilePage({user,content,onNavigate}){const posts=content.filter(c=>c.authorId===user.id);const fp=user.thinkingFingerprint;
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><div className="flex items-center gap-3 mb-4">{user.photoURL?<img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer"/>:<div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{background:"#E5E7EB",color:"#888"}}>{user.avatar}</div>}<div><h1 className="font-bold" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>{user.name}</h1><p style={{fontSize:12,color:"#BBB"}}>{user.role}</p></div></div></FadeIn>
    {user.bio&&<FadeIn delay={40}><p className="mb-4" style={{fontSize:13,color:"#888",lineHeight:1.5}}>{user.bio}</p></FadeIn>}
    {fp&&<FadeIn delay={60}><div className="p-4 rounded-2xl border mb-6" style={{background:"white",borderColor:"#E5E7EB"}}>
      <h3 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:14}}>Thinking Fingerprint</h3>
      <div className="grid grid-cols-3 gap-3">{[["rethink",fp.rethink],["rediscover",fp.rediscover],["reinvent",fp.reinvent]].map(([pk,v])=><div key={pk} className="text-center"><div className="font-bold text-lg" style={{color:PILLARS[pk].color}}>{v}</div><div className="flex items-center justify-center gap-1" style={{fontSize:10,color:"#BBB"}}><PillarIcon pillar={pk} size={10}/>{PILLARS[pk].label}</div></div>)}</div>
    </div></FadeIn>}
    {posts.length>0&&<><FadeIn delay={80}><h2 className="font-bold mb-2" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:16}}>Contributions ({posts.length})</h2></FadeIn>
      <div className="space-y-1.5">{posts.map((p,i)=><FadeIn key={p.id} delay={90+i*20}><button onClick={()=>onNavigate("post",p.id)} className="w-full text-left p-2.5 rounded-xl border transition-all hover:shadow-sm" style={{background:"white",borderColor:"#E5E7EB"}}><div className="flex items-center gap-2"><PillarTag pillar={p.pillar}/><span className="font-semibold text-xs" style={{color:"#111827"}}>{p.title}</span></div></button></FadeIn>)}</div></>}
  </div></div>}

function WritePage({currentUser,onNavigate,onSubmit}){const[title,setTitle]=useState("");const[pillar,setPillar]=useState("rethink");const[body,setBody]=useState("");
  const submit=()=>{if(!title.trim()||!body.trim())return;onSubmit({id:"p_"+Date.now(),authorId:currentUser.id,pillar,type:"post",title:title.trim(),paragraphs:body.split("\n\n").filter(p=>p.trim()),reactions:{},highlights:{},marginNotes:[],tags:[],createdAt:new Date().toISOString().split("T")[0],sundayCycle:null,featured:false,endorsements:0,comments:[],challenges:[]});onNavigate("home")};
  return <div className="min-h-screen" style={{paddingTop:56,background:"#F9FAFB"}}><div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <FadeIn><h1 className="font-bold mb-4" style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#111827",fontSize:20}}>Write</h1></FadeIn>
    <div className="flex gap-2 mb-3">{Object.values(PILLARS).map(p=><button key={p.key} onClick={()=>setPillar(p.key)} className="flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all text-xs" style={{background:pillar===p.key?p.lightBg:"white",color:pillar===p.key?p.color:"#CCC",border:`1.5px solid ${pillar===p.key?p.color:"#E5E7EB"}`}}><PillarIcon pillar={p.key} size={11}/>{p.label}</button>)}</div>
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title..." className="w-full text-lg font-bold mb-3 p-3 rounded-xl border focus:outline-none" style={{fontFamily:"'Inter',system-ui,sans-serif",borderColor:"#E5E7EB",color:"#111827"}}/>
    <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your thinking... (blank lines separate paragraphs)" className="w-full p-3 rounded-xl border focus:outline-none text-sm" style={{minHeight:240,borderColor:"#E5E7EB",color:"#555",lineHeight:1.8,resize:"vertical"}}/>
    <div className="flex gap-2 mt-3"><button onClick={submit} className="px-5 py-2 rounded-full font-semibold text-sm" style={{background:"#9333EA",color:"white"}}>Publish</button><button onClick={()=>onNavigate("home")} className="px-5 py-2 rounded-full font-semibold text-sm" style={{border:"1.5px solid #E5E7EB",color:"#CCC"}}>Cancel</button></div>
  </div></div>}
