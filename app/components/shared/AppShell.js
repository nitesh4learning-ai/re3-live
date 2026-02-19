"use client";
// AppShell: wraps all pages with Header, Footer, LoginModal, and Disclaimer.
// Used by the root layout once the provider is active.
import { useState, useEffect } from "react";
import { useApp } from "../../providers";
import { Re3Logo } from './Icons';
import { FadeIn, Disclaimer } from './UIComponents';
import { DB, getFirestoreModule, signInWithGoogle } from '../../utils/firebase-client';
import { GIM, PILLARS } from '../../constants';
import { PillarIcon } from './Icons';

// ==================== HEADER ====================
export function Header() {
  const { nav, user, showLogin, setShowLogin, logout } = useApp();
  const [sc, setSc] = useState(false);
  const [mob, setMob] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // Track current page from URL
  useEffect(() => {
    const updatePage = () => {
      const p = window.location.pathname;
      if (p === "/") setCurrentPage("home");
      else if (p.startsWith("/loom")) setCurrentPage("loom");
      else if (p === "/forge") setCurrentPage("forge");
      else if (p === "/academy") setCurrentPage("academy");
      else if (p === "/agents") setCurrentPage("agent-community");
      else if (p === "/studio") setCurrentPage("studio");
      else if (p === "/write") setCurrentPage("write");
      else if (p === "/debates") setCurrentPage("debates");
      else if (p === "/search") setCurrentPage("search");
    };
    updatePage();
    window.addEventListener("popstate", updatePage);
    return () => window.removeEventListener("popstate", updatePage);
  }, []);

  useEffect(() => {
    const fn = () => setSc(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navItems = [["home", "Home", "🏠"], ["loom", "The Loom", "🧵"], ["forge", "Debate Lab", "⚡"], ["academy", "Academy", "🎓"], ["agent-community", "Team", "🤖"], ["studio", "My Studio", "📝"]];
  const bottomTabs = [["home", "Home", "🏠"], ["loom", "Loom", "🧵"], ["forge", "Debate", "⚡"], ["academy", "Learn", "🎓"], ["agent-community", "Team", "🤖"]];

  return <>
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: "#FFFFFF", borderBottom: "0.8px solid #E5E7EB" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: 56 }}>
        <button onClick={() => { nav("home"); setMob(false); }} className="flex items-center gap-2" style={{ minHeight: 'auto', minWidth: 'auto' }}>
          <Re3Logo variant="full" size={24} />
        </button>
        <nav className="re3-desktop-nav hidden md:flex items-center gap-0.5">{navItems.map(([pg, label, icon]) => {
          const a = currentPage === pg;
          return <button key={pg} onClick={() => nav(pg)} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: a ? 600 : 500, color: a ? "#9333EA" : "#4B5563", background: a ? "#FAF5FF" : "transparent", minHeight: 'auto', minWidth: 'auto' }}><span style={{ marginRight: 4 }}>{icon}</span>{label}</button>;
        })}</nav>
        <div className="flex items-center gap-2">
          {user ? <>
            <button onClick={() => nav("write")} className="hidden sm:block px-3 py-1.5 font-medium transition-all hover:shadow-md" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, background: "#9333EA", color: "white", borderRadius: 8, minHeight: 'auto', minWidth: 'auto' }}>✏️ Write</button>
            <button onClick={() => nav("profile", user.id)} className="w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden" style={{ fontSize: 9, background: "#FAF5FF", color: "#9333EA", border: "1px solid #E9D5FF", minHeight: 'auto', minWidth: 'auto' }}>{user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.avatar}</button>
            <button onClick={logout} className="hidden sm:block" style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#9CA3AF", minHeight: 'auto', minWidth: 'auto' }}>Logout</button>
          </> : <button onClick={() => setShowLogin(true)} className="px-3 py-1.5 font-medium transition-all hover:shadow-md" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, background: "#9333EA", color: "white", borderRadius: 8 }}>Sign in</button>}
          <button onClick={() => setMob(!mob)} className="md:hidden p-1" style={{ color: "#4B5563", fontSize: 18, minHeight: 'auto', minWidth: 'auto' }}>{mob ? "\u2715" : "\u2630"}</button>
        </div>
      </div>
    </header>
    {/* Mobile fullscreen menu */}
    {mob && <div className="fixed inset-0 z-40 pt-14" style={{ background: "#FFFFFF" }}><div className="flex flex-col p-6 gap-1">
      {navItems.map(([pg, label, icon]) => <button key={pg} onClick={() => { nav(pg); setMob(false); }} className="text-left p-3 rounded-xl text-base font-medium" style={{ fontFamily: "'Inter',sans-serif", color: currentPage === pg ? "#9333EA" : "#4B5563", background: currentPage === pg ? "#FAF5FF" : "transparent" }}>{icon} {label}</button>)}
      {user && <><div className="my-2" style={{ height: 1, background: "#E5E7EB" }} /><button onClick={() => { nav("write"); setMob(false); }} className="text-left p-3 rounded-xl text-base font-medium" style={{ color: "#9333EA" }}>✏️ Write</button>
        <button onClick={() => { nav("studio"); setMob(false); }} className="text-left p-3 rounded-xl text-base font-medium" style={{ color: "#4B5563" }}>📝 My Studio</button></>}
    </div></div>}
    {/* Mobile bottom tab bar */}
    <nav className="re3-bottom-tabs">{bottomTabs.map(([pg, label, icon]) => {
      const a = currentPage === pg;
      return <button key={pg} onClick={() => { nav(pg); setMob(false); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "6px 0", gap: 2, border: "none", background: "transparent", cursor: "pointer", minHeight: 56, minWidth: 'auto' }}><span style={{ fontSize: 18, lineHeight: 1, opacity: a ? 1 : 0.5 }}>{icon}</span><span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: a ? 700 : 500, color: a ? "#9333EA" : "#9CA3AF", letterSpacing: "0.02em" }}>{label}</span></button>;
    })}</nav>
  </>;
}

// ==================== LOGIN MODAL ====================
export function LoginModal() {
  const { showLogin, setShowLogin, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!showLogin) return null;

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const u = await signInWithGoogle();
    if (u) {
      DB.set("user", u);
      setUser(u);
      setShowLogin(false);
      getFirestoreModule().then(mod => { if (mod) mod.saveUserProfile(u); }).catch(() => {});
    } else {
      setError("Sign-in failed. Check Firebase config.");
    }
    setLoading(false);
  };

  return <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 100 }} onClick={() => setShowLogin(false)}>
    <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)" }} />
    <FadeIn><div className="relative w-full rounded-2xl" onClick={e => e.stopPropagation()} style={{ maxWidth: 340, background: "#FFFFFF", boxShadow: "0 16px 40px rgba(0,0,0,0.15)" }}>
      <div style={{ height: 3, background: "#9333EA", borderRadius: "16px 16px 0 0" }} />
      <button onClick={() => setShowLogin(false)} className="absolute" style={{ top: 12, right: 12, fontSize: 12, color: "rgba(0,0,0,0.3)" }}>{"✕"}</button>
      <div className="p-5">
        <h2 className="font-bold mb-1" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 16 }}>Join Re{"\u00b3"}</h2>
        <p className="mb-4" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(0,0,0,0.45)" }}>Sign in to think together</p>
        {error && <p className="mb-3 p-2 rounded-lg text-xs" style={{ background: "rgba(229,62,62,0.1)", color: "#E53E3E" }}>{error}</p>}
        <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium hover:shadow-md transition-all text-sm" style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", color: "#111827", opacity: loading ? 0.6 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 4 }}>By signing in, you agree that:</p>
          <ul style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#9CA3AF", lineHeight: 1.7, paddingLeft: 12, margin: 0 }}>
            <li>This is an experimental alpha platform {"\u2014"} features may change or reset</li>
            <li>Content is generated through human-AI collaboration and may be inaccurate</li>
            <li>We store your name, email, and profile photo from Google</li>
            <li>Your contributions (posts, comments) are publicly visible</li>
          </ul>
        </div>
      </div>
    </div></FadeIn>
  </div>;
}

// ==================== APP SHELL ====================
export default function AppShell({ children }) {
  return <div className="min-h-screen re3-main-content" style={{ background: "#F9FAFB" }}>
    <Header />
    {children}
    <LoginModal />
    <footer className="py-5" style={{ borderTop: "1px solid #E5E7EB", background: "#F3F4F6" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Re3Logo variant="full" size={20} /><span className="ml-1 hidden sm:inline" style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(0,0,0,0.35)" }}>Knowledge isn't created. It's uncovered.</span></div>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(0,0,0,0.1)" }}>A Nitesh Srivastava project</span>
      </div>
    </footer>
    <Disclaimer />
  </div>;
}
