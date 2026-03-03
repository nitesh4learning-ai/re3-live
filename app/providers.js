"use client";
// App-wide state provider for Re3 platform
// Centralizes state management using React Context so page components
// can be rendered from individual Next.js route files.
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import { INIT_CONTENT, INIT_THEMES, INIT_AGENTS, DEFAULT_PROJECTS, ALL_USERS } from './constants';
import { pathToPage, pageToPath } from './utils/routing';
import { DB, getFirestoreModule, getFirestoreModuleSync, syncToFirestore, getFirebase, authFetch, signInWithGoogle, firebaseSignOut } from './utils/firebase-client';

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
  const [editorPicks, setEditorPicks] = useState([]);
  const [forgePreload, setForgePreload] = useState(null);

  // UI state
  const [showLogin, setShowLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Track whether Firestore is the active source (vs offline cache)
  const firestoreActive = useRef(false);

  // Track write timestamps for cross-tab conflict detection
  const writeTimestamps = useRef({});

  // Phase 1: Load from localStorage cache (instant, for fast first paint)
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
    if (sp && Array.isArray(sp) && sp.length > 0) {
      const existingProjIds = new Set(sp.map(p => p.id));
      const missingProjects = DEFAULT_PROJECTS.filter(p => !existingProjIds.has(p.id));
      setProjects(missingProjects.length > 0 ? [...sp, ...missingProjects] : sp);
    }
    if (sfs) setForgeSessions(sfs);
    const sep = DB.get("editor_picks_v1", null);
    if (sep) setEditorPicks(sep);
    setLoaded(true);
  }, []);

  // Phase 2: Firestore is SOURCE OF TRUTH — replaces localStorage cache when reachable
  useEffect(() => {
    if (!loaded) return;
    getFirestoreModule().then(async (mod) => {
      if (!mod) return;
      // Migrate localStorage → Firestore if first visit, then ALWAYS load from Firestore
      if (mod.needsMigration()) { await mod.migrateLocalStorageToFirestore(); }
      Promise.allSettled([
        mod.loadContent(null), mod.loadThemes(null),
        mod.loadArticles(null), mod.loadForgeSessions(null),
        mod.loadAgents(null), mod.loadProjects(null),
        mod.loadEditorPicks(null),
      ]).then(results => {
        const [fc, ft, fa, ffs, fag, fp, fep] = results.map(r => r.status === 'fulfilled' ? r.value : null);
        // Firestore-authoritative: when Firestore returns data, it REPLACES local state.
        // Only merge INIT_CONTENT seeds that aren't in Firestore yet.
        if (fc?.source === 'firestore' && fc?.data?.length > 0) {
          firestoreActive.current = true;
          const fsIds = new Set(fc.data.map(p => p.id));
          const seeds = INIT_CONTENT.filter(p => !fsIds.has(p.id));
          setContent(seeds.length > 0 ? [...fc.data, ...seeds] : fc.data);
        }
        if (ft?.source === 'firestore') setThemes(ft.data);
        if (fa?.source === 'firestore') setArticles(fa.data);
        if (ffs?.source === 'firestore') setForgeSessions(ffs.data);
        if (fag?.source === 'firestore' && fag?.data?.length > 0) {
          const fsAgentIds = new Set(fag.data.map(a => a.id));
          const seedAgents = INIT_AGENTS.filter(a => !fsAgentIds.has(a.id));
          setAgents(seedAgents.length > 0 ? [...fag.data, ...seedAgents] : fag.data);
        }
        if (fp?.source === 'firestore') {
          const fpData = fp.data || [];
          // Merge: Firestore base + local-only projects (not yet synced) + default seeds
          setProjects(prev => {
            const fsIds = new Set(fpData.map(p => p.id));
            const defaultIds = new Set(DEFAULT_PROJECTS.map(p => p.id));
            // Keep local projects that aren't in Firestore (newly added, not yet synced)
            const localOnly = prev.filter(p => !fsIds.has(p.id) && !defaultIds.has(p.id));
            // Keep default seeds missing from both Firestore and local
            const allIds = new Set([...fsIds, ...localOnly.map(p => p.id)]);
            const seeds = DEFAULT_PROJECTS.filter(p => !allIds.has(p.id));
            return [...fpData, ...localOnly, ...seeds];
          });
        }
        if (fep?.source === 'firestore') setEditorPicks(fep.data || []);
      });
    }).catch(() => {});
  }, [loaded]);

  // Persist changes: localStorage (immediate) + Firestore (debounced background)
  // Each write stamps an updatedAt timestamp for cross-tab conflict detection.
  const persistWithTimestamp = useCallback((key, data, firestoreType) => {
    const ts = Date.now();
    writeTimestamps.current[key] = ts;
    DB.set(key, data);
    DB.set(key + "_ts", ts);
    syncToFirestore(firestoreType, data);
  }, []);

  useEffect(() => { if (loaded) persistWithTimestamp("content_v5", content, "content"); }, [content, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("themes", themes, "themes"); }, [themes, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("articles_v1", articles, "articles"); }, [articles, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("agents_v1", agents, "agents"); }, [agents, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("projects_v1", projects, "projects"); }, [projects, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("forge_sessions_v1", forgeSessions, "forge_sessions"); }, [forgeSessions, loaded, persistWithTimestamp]);
  useEffect(() => { if (loaded) persistWithTimestamp("editor_picks_v1", editorPicks, "editor_picks"); }, [editorPicks, loaded, persistWithTimestamp]);

  // Cross-tab conflict detection: reload state when another tab writes to localStorage.
  // The 'storage' event only fires in OTHER tabs, not the one that wrote.
  useEffect(() => {
    const keySetterMap = {
      re3_content_v5: (d) => { if (Array.isArray(d) && d.length > 0) setContent(d); },
      re3_themes: setThemes,
      re3_articles_v1: setArticles,
      re3_agents_v1: (d) => { if (Array.isArray(d) && d.length > 0) setAgents(d); },
      re3_projects_v1: setProjects,
      re3_forge_sessions_v1: setForgeSessions,
      re3_editor_picks_v1: setEditorPicks,
    };

    const handleStorage = (e) => {
      if (!e.key || !keySetterMap[e.key] || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        keySetterMap[e.key](data);
        // Notify UI via custom event (ToastProvider listens)
        window.dispatchEvent(new CustomEvent("re3:conflict", {
          detail: { key: e.key.replace("re3_", "") },
        }));
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Flush pending Firestore writes on tab close (synchronous to run before page unloads)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const mod = getFirestoreModuleSync();
      if (mod?.flushPendingWrites) mod.flushPendingWrites();
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

  // Dismiss loading skeleton once client has hydrated
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
  const addEditorPick = (pick) => setEditorPicks(prev => [pick, ...prev]);
  const removeEditorPick = (id) => setEditorPicks(prev => prev.filter(p => p.id !== id));
  const navToForge = (topic) => { setForgePreload(topic); nav("forge"); };
  const logout = async () => { await firebaseSignOut(); setUser(null); DB.clear("user"); };

  const value = {
    // State
    user, content, themes, articles, agents, projects,
    registry, registryIndex, forgeSessions, editorPicks, forgePreload,
    showLogin, loaded,
    // Setters (for login modal etc.)
    setUser, setShowLogin, setForgePreload,
    // Actions
    nav, endorse, cmnt, addPost, react, addCh, addMN, updatePost,
    archiveCycle, autoComment, voteTheme, addTheme, editTheme,
    deleteTheme, saveArticle, deleteArticle, saveAgent, deleteAgent,
    saveProject, deleteProject, saveForgeSession, deleteForgeSession,
    addEditorPick, removeEditorPick, navToForge, logout,
  };

  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
