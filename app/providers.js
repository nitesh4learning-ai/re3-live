"use client";
// App-wide state provider for Re3 platform
// Centralizes state management using React Context so page components
// can be rendered from individual Next.js route files.
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import { INIT_CONTENT, INIT_THEMES, INIT_AGENTS, DEFAULT_PROJECTS, ALL_USERS } from './constants';
import { pathToPage, pageToPath } from './utils/routing';
import { DB, getFirestoreModule, syncToFirestore, getFirebase, authFetch, signInWithGoogle, firebaseSignOut } from './utils/firebase-client';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const router = useRouter();
  // Core data state
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(INIT_CONTENT);
  const [themes, setThemes] = useState(INIT_THEMES);
  const [articles, setArticles] = useState([]);
  const [agents, setAgents] = useState(INIT_AGENTS);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [registry, setRegistry] = useState(null);
  const [registryIndex, setRegistryIndex] = useState({ byDomain: {}, byId: {}, bySpec: {} });
  const [forgeSessions, setForgeSessions] = useState([]);
  const [forgePreload, setForgePreload] = useState(null);

  // UI state
  const [showLogin, setShowLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Phase 1: Load from localStorage (instant)
  useEffect(() => {
    const su = DB.get("user", null);
    const sc = DB.get("content_v5", null);
    const st = DB.get("themes", null);
    const sa = DB.get("articles_v1", null);
    const sag = DB.get("agents_v1", null);
    const sp = DB.get("projects_v1", null);
    const sfs = DB.get("forge_sessions_v1", null);
    if (su) setUser(su);
    if (sc && Array.isArray(sc) && sc.length > 0) {
      // Merge: keep all localStorage posts + add any INIT_CONTENT posts not already present
      const existingIds = new Set(sc.map(p => p.id));
      const missing = INIT_CONTENT.filter(p => !existingIds.has(p.id));
      setContent(missing.length > 0 ? [...sc, ...missing] : sc);
    }
    if (st) setThemes(st);
    if (sa) setArticles(sa);
    if (sag && Array.isArray(sag) && sag.length > 0) {
      const existingAgentIds = new Set(sag.map(a => a.id));
      const missingAgents = INIT_AGENTS.filter(a => !existingAgentIds.has(a.id));
      setAgents(missingAgents.length > 0 ? [...sag, ...missingAgents] : sag);
    }
    if (sp) setProjects(sp);
    if (sfs) setForgeSessions(sfs);
    setLoaded(true);
  }, []);

  // Phase 2: Background Firestore hydration (non-blocking, merges newer data)
  useEffect(() => {
    if (!loaded) return;
    getFirestoreModule().then(mod => {
      if (!mod) return;
      if (mod.needsMigration()) { mod.migrateLocalStorageToFirestore(); return; }
      Promise.allSettled([
        mod.loadContent(null), mod.loadThemes(null),
        mod.loadArticles(null), mod.loadForgeSessions(null)
      ]).then(results => {
        const [fc, ft, fa, ffs] = results.map(r => r.status === 'fulfilled' ? r.value : null);
        if (fc && fc.length > 0) {
          // Merge Firestore posts with current state (new posts only, no duplicates)
          const currentIds = new Set(content.map(p => p.id));
          const newFromFirestore = fc.filter(p => !currentIds.has(p.id));
          if (newFromFirestore.length > 0) setContent(prev => [...newFromFirestore, ...prev]);
        }
        if (ft && ft.length) setThemes(prev => ft.length >= prev.length ? ft : prev);
        if (fa && fa.length > articles.length) setArticles(fa);
        if (ffs && ffs.length > forgeSessions.length) setForgeSessions(ffs);
      });
    }).catch(() => {});
  }, [loaded]);

  // Persist changes: localStorage (immediate) + Firestore (debounced background)
  useEffect(() => { if (loaded) { DB.set("content_v5", content); syncToFirestore('content', content); } }, [content, loaded]);
  useEffect(() => { if (loaded) { DB.set("themes", themes); syncToFirestore('themes', themes); } }, [themes, loaded]);
  useEffect(() => { if (loaded) { DB.set("articles_v1", articles); syncToFirestore('articles', articles); } }, [articles, loaded]);
  useEffect(() => { if (loaded) { DB.set("agents_v1", agents); syncToFirestore('agents', agents); } }, [agents, loaded]);
  useEffect(() => { if (loaded) { DB.set("projects_v1", projects); syncToFirestore('projects', projects); } }, [projects, loaded]);
  useEffect(() => { if (loaded) { DB.set("forge_sessions_v1", forgeSessions); syncToFirestore('forge_sessions', forgeSessions); } }, [forgeSessions, loaded]);

  // Flush pending Firestore writes on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      getFirestoreModule().then(mod => { if (mod?.flushPendingWrites) mod.flushPendingWrites(); }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Load agent registry
  useEffect(() => {
    fetch('/agents-registry.json').then(r => r.json()).then(data => {
      setRegistry(data);
      const byDomain = {}, byId = {}, bySpec = {};
      data.domains.forEach(d => {
        byDomain[d.id] = d;
        d.specializations.forEach(s => {
          const key = d.id + '/' + s.id;
          bySpec[key] = { ...s, domainId: d.id, domainName: d.name, domainColor: d.color };
          s.agents.forEach(a => { byId[a.id] = a; });
        });
      });
      setRegistryIndex({ byDomain, byId, bySpec });
    }).catch(() => {});
  }, []);

  // Dismiss loading skeleton
  useEffect(() => {
    if (loaded) {
      const sk = document.getElementById("re3-loading-skeleton");
      if (sk) { sk.style.opacity = "0"; setTimeout(() => sk.remove(), 400); }
    }
  }, [loaded]);

  // ==================== Actions ====================
  const nav = useCallback((p, id = null) => {
    const path = pageToPath(p, id);
    router.push(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  const endorse = (id) => setContent(p => p.map(c => c.id === id ? { ...c, endorsements: c.endorsements + 1 } : c));

  const cmnt = (id, text) => {
    if (!user) return;
    setContent(p => p.map(c => c.id === id ? { ...c, comments: [...(c.comments || []), { id: "cm_" + Date.now(), authorId: user.id, text, date: new Date().toISOString().split("T")[0] }] } : c));
  };

  const addPost = (p) => setContent(prev => [p, ...prev]);

  const react = (postId, pi, key) => {
    setContent(p => p.map(c => {
      if (c.id !== postId) return c;
      const r = { ...c.reactions };
      if (!r[pi]) r[pi] = {};
      r[pi] = { ...r[pi], [key]: (r[pi][key] || 0) + 1 };
      return { ...c, reactions: r };
    }));
  };

  const addCh = (postId, text) => {
    if (!user) return;
    setContent(p => p.map(c => c.id === postId ? { ...c, challenges: [...(c.challenges || []), { id: "ch_" + Date.now(), authorId: user.id, text, date: new Date().toISOString().split("T")[0], votes: 1 }] } : c));
  };

  const addMN = (postId, pi, text) => {
    if (!user) return;
    setContent(p => p.map(c => c.id === postId ? { ...c, marginNotes: [...(c.marginNotes || []), { id: "mn_" + Date.now(), paragraphIndex: pi, authorId: user.id, text, date: new Date().toISOString().split("T")[0] }] } : c));
  };

  const updatePost = (updated) => { setContent(prev => prev.map(c => c.id === updated.id ? updated : c)); };
  const archiveCycle = (cycleId) => setContent(p => p.map(c => (c.cycleId === cycleId || c.sundayCycle === cycleId) ? { ...c, archived: true } : c));
  const autoComment = (postId, agentId, text) => { setContent(p => p.map(c => c.id === postId ? { ...c, comments: [...(c.comments || []), { id: "cm_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), authorId: agentId, text, date: new Date().toISOString().split("T")[0] }] } : c)); };
  const voteTheme = (id) => setThemes(t => t.map(th => th.id === id ? { ...th, votes: th.votes + (th.voted ? 0 : 1), voted: true } : th));
  const addTheme = (title) => setThemes(t => [...t, { id: "t_" + Date.now(), title, votes: 0, voted: false }]);
  const editTheme = (id, newTitle) => setThemes(t => t.map(th => th.id === id ? { ...th, title: newTitle } : th));
  const deleteTheme = (id) => setThemes(t => t.filter(th => th.id !== id));
  const saveArticle = (a) => { setArticles(prev => { const idx = prev.findIndex(x => x.id === a.id); let next; if (idx >= 0) { next = [...prev]; next[idx] = a; } else { next = [a, ...prev]; } DB.set("articles_v1", next); return next; }); };
  const deleteArticle = (id) => setArticles(prev => prev.filter(a => a.id !== id));
  const saveAgent = (a) => setAgents(prev => { const idx = prev.findIndex(x => x.id === a.id); if (idx >= 0) { const up = [...prev]; up[idx] = a; return up; } return [...prev, a]; });
  const deleteAgent = (id) => setAgents(prev => prev.filter(a => a.id !== id));
  const saveProject = (p) => setProjects(prev => { const idx = prev.findIndex(x => x.id === p.id); if (idx >= 0) { const up = [...prev]; up[idx] = p; return up; } return [...prev, p]; });
  const deleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));
  const saveForgeSession = (session) => setForgeSessions(prev => [session, ...prev]);
  const deleteForgeSession = (id) => setForgeSessions(prev => prev.filter(s => s.id !== id));
  const navToForge = (topic) => { setForgePreload(topic); nav("forge"); };
  const logout = async () => { await firebaseSignOut(); setUser(null); DB.clear("user"); };

  const value = {
    // State
    user, content, themes, articles, agents, projects,
    registry, registryIndex, forgeSessions, forgePreload,
    showLogin, loaded,
    // Setters (for login modal etc.)
    setUser, setShowLogin, setForgePreload,
    // Actions
    nav, endorse, cmnt, addPost, react, addCh, addMN, updatePost,
    archiveCycle, autoComment, voteTheme, addTheme, editTheme,
    deleteTheme, saveArticle, deleteArticle, saveAgent, deleteAgent,
    saveProject, deleteProject, saveForgeSession, deleteForgeSession,
    navToForge, logout,
  };

  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
