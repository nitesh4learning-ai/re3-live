// Firestore data layer for Re³
// Provides read/write helpers with localStorage cache fallback
// Collections: cycles, content, themes, articles, agents, forge_sessions, users

import {
  db, doc, setDoc, getDoc, getDocs, collection, query,
  orderBy, limit, addDoc, updateDoc, serverTimestamp, where
} from './firebase';

// ==================== HELPERS ====================

const LS = {
  get: (key, fallback) => { try { const d = typeof window !== 'undefined' && localStorage.getItem(`re3_${key}`); return d ? JSON.parse(d) : fallback; } catch { return fallback; } },
  set: (key, val) => { try { typeof window !== 'undefined' && localStorage.setItem(`re3_${key}`, JSON.stringify(val)); } catch {} },
};

// Simple debounce for write operations
const debounceTimers = {};
const pendingWriteFns = {};
function debouncedWrite(key, fn, delay = 2000) {
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  pendingWriteFns[key] = fn;
  debounceTimers[key] = setTimeout(() => {
    delete pendingWriteFns[key];
    fn();
  }, delay);
}

// Flush all pending debounced writes immediately (call on beforeunload)
export function flushPendingWrites() {
  for (const [key, fn] of Object.entries(pendingWriteFns)) {
    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
    delete debounceTimers[key];
    delete pendingWriteFns[key];
    try { fn(); } catch (e) { console.warn('Flush write failed for', key, ':', e.message); }
  }
}

// ==================== USER PROFILE ====================

export async function saveUserProfile(user) {
  if (!user?.id) return;
  try {
    const ref = doc(db, 'users', user.id);
    await setDoc(ref, {
      ...user,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore saveUserProfile failed:', e.message);
  }
}

export async function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('Firestore getUserProfile failed:', e.message);
    return null;
  }
}

// ==================== CONTENT (Posts) ====================

export async function saveContent(contentArray) {
  if (!contentArray?.length) return;
  // Cache locally first (immediate)
  LS.set('content_v5', contentArray);
  // Debounced Firestore write
  debouncedWrite('content', async () => {
    try {
      // Write each post as a separate document for queryability
      const batch = [];
      for (const post of contentArray.slice(0, 100)) { // limit to 100 most recent
        const ref = doc(db, 'content', post.id);
        batch.push(setDoc(ref, { ...post, updatedAt: serverTimestamp() }, { merge: true }));
      }
      await Promise.allSettled(batch);
    } catch (e) {
      console.warn('Firestore saveContent failed:', e.message);
    }
  });
}

export async function loadContent(fallback = []) {
  // Try localStorage first (fast)
  const cached = LS.get('content_v5', null);
  try {
    const q = query(collection(db, 'content'), orderBy('updatedAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Remove Firestore timestamp objects for client compatibility
      const cleaned = posts.map(p => {
        const copy = { ...p };
        delete copy.updatedAt;
        return copy;
      });
      LS.set('content_v5', cleaned);
      return cleaned;
    }
  } catch (e) {
    console.warn('Firestore loadContent failed, using localStorage:', e.message);
  }
  return cached || fallback;
}

// ==================== THEMES ====================

export async function saveThemes(themesArray) {
  if (!themesArray) return;
  LS.set('themes', themesArray);
  debouncedWrite('themes', async () => {
    try {
      const ref = doc(db, 'config', 'themes');
      await setDoc(ref, { items: themesArray, updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('Firestore saveThemes failed:', e.message);
    }
  });
}

export async function loadThemes(fallback = []) {
  const cached = LS.get('themes', null);
  try {
    const snap = await getDoc(doc(db, 'config', 'themes'));
    if (snap.exists()) {
      const items = snap.data().items || [];
      LS.set('themes', items);
      return items;
    }
  } catch (e) {
    console.warn('Firestore loadThemes failed:', e.message);
  }
  return cached || fallback;
}

// ==================== ARTICLES ====================

export async function saveArticles(articlesArray) {
  if (!articlesArray) return;
  LS.set('articles_v1', articlesArray);
  debouncedWrite('articles', async () => {
    try {
      for (const article of articlesArray.slice(0, 50)) {
        const ref = doc(db, 'articles', article.id);
        await setDoc(ref, { ...article, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore saveArticles failed:', e.message);
    }
  });
}

export async function loadArticles(fallback = []) {
  const cached = LS.get('articles_v1', null);
  try {
    const q = query(collection(db, 'articles'), orderBy('updatedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const articles = snap.docs.map(d => {
        const data = { id: d.id, ...d.data() };
        delete data.updatedAt;
        return data;
      });
      LS.set('articles_v1', articles);
      return articles;
    }
  } catch (e) {
    console.warn('Firestore loadArticles failed:', e.message);
  }
  return cached || fallback;
}

// ==================== AGENTS ====================

export async function saveAgents(agentsArray) {
  if (!agentsArray) return;
  LS.set('agents_v1', agentsArray);
  debouncedWrite('agents', async () => {
    try {
      const ref = doc(db, 'config', 'agents');
      await setDoc(ref, { items: agentsArray, updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('Firestore saveAgents failed:', e.message);
    }
  });
}

export async function loadAgents(fallback = []) {
  const cached = LS.get('agents_v1', null);
  try {
    const snap = await getDoc(doc(db, 'config', 'agents'));
    if (snap.exists()) {
      const items = snap.data().items || [];
      LS.set('agents_v1', items);
      return items;
    }
  } catch (e) {
    console.warn('Firestore loadAgents failed:', e.message);
  }
  return cached || fallback;
}

// ==================== PROJECTS ====================

export async function saveProjects(projectsArray) {
  if (!projectsArray) return;
  LS.set('projects_v1', projectsArray);
  debouncedWrite('projects', async () => {
    try {
      const ref = doc(db, 'config', 'projects');
      await setDoc(ref, { items: projectsArray, updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('Firestore saveProjects failed:', e.message);
    }
  });
}

export async function loadProjects(fallback = []) {
  const cached = LS.get('projects_v1', null);
  try {
    const snap = await getDoc(doc(db, 'config', 'projects'));
    if (snap.exists()) {
      const items = snap.data().items || [];
      LS.set('projects_v1', items);
      return items;
    }
  } catch (e) {
    console.warn('Firestore loadProjects failed:', e.message);
  }
  return cached || fallback;
}

// ==================== FORGE SESSIONS ====================

export async function saveForgeSessions(sessionsArray) {
  if (!sessionsArray) return;
  LS.set('forge_sessions_v1', sessionsArray);
  debouncedWrite('forge_sessions', async () => {
    try {
      for (const session of sessionsArray.slice(0, 50)) {
        const ref = doc(db, 'forge_sessions', session.id);
        await setDoc(ref, { ...session, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore saveForgeSessions failed:', e.message);
    }
  });
}

export async function loadForgeSessions(fallback = []) {
  const cached = LS.get('forge_sessions_v1', null);
  try {
    const q = query(collection(db, 'forge_sessions'), orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const sessions = snap.docs.map(d => {
        const data = { id: d.id, ...d.data() };
        delete data.updatedAt;
        return data;
      });
      LS.set('forge_sessions_v1', sessions);
      return sessions;
    }
  } catch (e) {
    console.warn('Firestore loadForgeSessions failed:', e.message);
  }
  return cached || fallback;
}

// ==================== MIGRATION HELPER ====================
// One-time migration: push localStorage data to Firestore

export async function migrateLocalStorageToFirestore() {
  try {
    const content = LS.get('content_v5', null);
    const themes = LS.get('themes', null);
    const articles = LS.get('articles_v1', null);
    const agents = LS.get('agents_v1', null);
    const projects = LS.get('projects_v1', null);
    const forgeSessions = LS.get('forge_sessions_v1', null);

    const tasks = [];
    if (content?.length) tasks.push(saveContent(content));
    if (themes?.length) tasks.push(saveThemes(themes));
    if (articles?.length) tasks.push(saveArticles(articles));
    if (agents?.length) tasks.push(saveAgents(agents));
    if (projects?.length) tasks.push(saveProjects(projects));
    if (forgeSessions?.length) tasks.push(saveForgeSessions(forgeSessions));

    await Promise.allSettled(tasks);

    // Mark migration as done
    LS.set('firestore_migrated', true);
    console.log('Re³ Firestore migration complete');
    return true;
  } catch (e) {
    console.warn('Firestore migration failed:', e.message);
    return false;
  }
}

export function needsMigration() {
  return !LS.get('firestore_migrated', false);
}
