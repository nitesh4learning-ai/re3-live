"use client";
import { useState, useEffect, lazy, Suspense } from "react";
import { useApp } from '../../providers';

// Home renders the personal-brand presentation (LandingPage) for everyone. The
// debate-product marketing (debate sample, Editor's Picks, Trending Topics,
// "Why not just ask ChatGPT?") was removed from Home — those belong to the
// feature pages, not the personal homepage. The underlying features and their
// data/handlers are unchanged and still reachable from the Studio + nav.
const LandingPage = lazy(() => import('./LandingPage'));

export default function HomePage(){
  const app = useApp();
  const { user: currentUser, nav: onNavigate, articles } = app;
  const [visitCount, setVisitCount] = useState(null);
  const publishedArticles = (articles || []).filter(a => a.status === "published");

  useEffect(() => {
    fetch("/api/visits", { method: "POST" })
      .then(r => r.json())
      .then(data => { if (data.count) setVisitCount(data.count); })
      .catch(() => {});
  }, []);

  return <Suspense fallback={null}>
    <LandingPage
      onSignIn={() => app.setShowLogin(true)}
      onNavigate={onNavigate}
      user={currentUser}
      visitCount={visitCount}
      articles={publishedArticles}
    />
  </Suspense>;
}
