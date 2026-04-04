"use client";
import { lazy, Suspense, useState } from "react";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { isAdmin } from '../../constants';
import { FadeIn } from '../shared/UIComponents';

const LazyOrchestration = lazy(() => import("../../components/orchestration/OrchestrationPage"));

function AccessBanner({ user, hasAccess, hasPending, requestSent, requesting, onRequest, onSignIn }) {
  if (hasAccess) return null;

  return <div className="rounded-xl p-4 mb-6 flex items-center justify-between" style={{ background: "#FAF5FF", border: "1px solid #E9D5FF" }}>
    <div>
      <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
        {!user ? "Sign in to run orchestrations" : hasPending || requestSent ? "Access request pending" : "Request access to run orchestrations"}
      </h3>
      <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
        {!user ? "You can browse past runs. Sign in and request access to submit your own use cases."
          : hasPending || requestSent ? "Your request has been submitted. You'll get access once the admin approves it. You can browse past runs below."
          : "You can browse past runs. Request access to submit your own use cases."}
      </p>
    </div>
    {!user ? <button onClick={onSignIn} className="px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0" style={{ background: "#9333EA", color: "white" }}>Sign In</button>
      : hasPending || requestSent ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
        <span style={{ fontSize: 12 }}>⏳</span><span className="font-semibold text-xs" style={{ color: "#92400E" }}>Pending</span>
      </span>
      : <button onClick={onRequest} disabled={requesting} className="px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all" style={{ background: "#9333EA", color: "white" }}>
        {requesting ? "Requesting..." : "Request Access"}
      </button>
    }
  </div>;
}

export default function ArenaPage(){
  const { runId } = useParams() || {};
  const { user, nav: onNavigate, userAccess, accessRequests, requestAccess, setShowLogin } = useApp();
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const hasAccess = isAdmin(user) || userAccess?.arena;
  const hasPending = accessRequests?.some(r => r.feature === "arena" && r.status === "pending");

  const handleRequest = async () => {
    setRequesting(true);
    try { await requestAccess("arena"); setRequestSent(true); } catch (e) { console.error(e); }
    setRequesting(false);
  };

  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Arena...</p></div>}>
    <LazyOrchestration
      user={user}
      onNavigate={onNavigate}
      runId={runId}
      readOnly={!hasAccess}
      accessBanner={<AccessBanner user={user} hasAccess={hasAccess} hasPending={hasPending} requestSent={requestSent} requesting={requesting} onRequest={handleRequest} onSignIn={() => setShowLogin(true)} />}
    />
  </Suspense>;
}
