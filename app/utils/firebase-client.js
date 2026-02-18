// Client-side Firebase helpers: lazy init, auth, Firestore sync

export const DB = {
  get: (key, fallback) => { try { const d = typeof window !== 'undefined' && localStorage.getItem(`re3_${key}`); return d ? JSON.parse(d) : fallback; } catch { return fallback; } },
  set: (key, val) => { try { typeof window !== 'undefined' && localStorage.setItem(`re3_${key}`, JSON.stringify(val)); } catch {} },
  clear: (key) => { try { typeof window !== 'undefined' && localStorage.removeItem(`re3_${key}`); } catch {} },
};

// Lazy Firestore sync — loads module on demand, never blocks initial render
let _firestoreModule = null;
export async function getFirestoreModule() {
  if (!_firestoreModule) {
    try { _firestoreModule = await import("../../lib/firestore"); } catch (e) { console.warn("Firestore module unavailable:", e.message); _firestoreModule = null; }
  }
  return _firestoreModule;
}

// Background Firestore sync (non-blocking)
export function syncToFirestore(type, data) {
  getFirestoreModule().then(mod => {
    if (!mod) return;
    switch (type) {
      case 'content': mod.saveContent(data); break;
      case 'themes': mod.saveThemes(data); break;
      case 'articles': mod.saveArticles(data); break;
      case 'agents': mod.saveAgents(data); break;
      case 'projects': mod.saveProjects(data); break;
      case 'forge_sessions': mod.saveForgeSessions(data); break;
    }
  }).catch(() => {});
}

let firebaseAuth = null;
export async function getFirebase() {
  if (!firebaseAuth) {
    try { const mod = await import("../../lib/firebase"); firebaseAuth = mod.auth; } catch (e) { console.warn("Firebase not configured:", e.message); }
  }
  return { auth: firebaseAuth };
}

// Authenticated API fetch — attaches Firebase ID token to every request
export async function authFetch(endpoint, body) {
  const { auth } = await getFirebase();
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.text(); throw new Error(`API ${res.status}: ${err}`); }
  return res.json();
}

export async function signInWithGoogle() {
  try {
    const { auth } = await getFirebase();
    if (!auth) return null;
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const u = result.user;
    return { id: u.uid, name: u.displayName || "Thinker", avatar: (u.displayName || "T").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2), email: u.email, photoURL: u.photoURL, role: "Contributor", bio: "", expertise: [], isAgent: false, thinkingFingerprint: { rethink: 0, rediscover: 0, reinvent: 0, highlights: 0, challenges: 0, bridges: 0 } };
  } catch (e) { console.error("Google sign-in error:", e); return null; }
}

export async function firebaseSignOut() {
  try { const { auth } = await getFirebase(); if (auth) { const { signOut } = await import("firebase/auth"); await signOut(auth); } } catch (e) {}
}
