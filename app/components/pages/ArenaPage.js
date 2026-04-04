"use client";
import { lazy, Suspense, useState } from "react";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';
import { isAdmin } from '../../constants';
import { FadeIn } from '../shared/UIComponents';

const LazyOrchestration = lazy(() => import("../../components/orchestration/OrchestrationPage"));

export default function ArenaPage(){
  const { runId } = useParams() || {};
  const { user, nav: onNavigate, userAccess, accessRequests, requestAccess, setShowLogin } = useApp();
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Admin always has access
  const hasAccess = isAdmin(user) || userAccess?.arena;
  const hasPending = accessRequests?.some(r => r.feature === "arena" && r.status === "pending");

  // Guest users — prompt to sign in
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}>
      <FadeIn><div className="text-center max-w-md mx-auto px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "#F3E8FF" }}><span style={{ fontSize: 28 }}>🏗️</span></div>
        <h2 className="font-bold mb-2" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 24 }}>Arena Access Required</h2>
        <p className="mb-4" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>Sign in to request access to the Arena — where AI agent teams assemble and orchestrate solutions for your use cases.</p>
        <button onClick={() => setShowLogin(true)} className="px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "#9333EA", color: "white" }}>Sign In</button>
      </div></FadeIn>
    </div>;
  }

  // Logged in but no access
  if (!hasAccess) {
    const handleRequest = async () => {
      setRequesting(true);
      try { await requestAccess("arena"); setRequestSent(true); } catch (e) { console.error(e); }
      setRequesting(false);
    };

    return <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}>
      <FadeIn><div className="text-center max-w-md mx-auto px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "#F3E8FF" }}><span style={{ fontSize: 28 }}>🏗️</span></div>
        <h2 className="font-bold mb-2" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 24 }}>Arena Access</h2>
        {hasPending || requestSent ? <>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
            <span style={{ fontSize: 14 }}>⏳</span>
            <span className="font-semibold text-sm" style={{ color: "#92400E" }}>Request Pending</span>
          </div>
          <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>Your request has been submitted. You will get access once the admin approves it.</p>
        </> : <>
          <p className="mb-4" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>Arena lets AI agent teams assemble and orchestrate solutions. Request access to get started.</p>
          <button onClick={handleRequest} disabled={requesting} className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{ background: "#9333EA", color: "white" }}>
            {requesting ? "Requesting..." : "Request Access"}
          </button>
        </>}
      </div></FadeIn>
    </div>;
  }

  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Arena...</p></div>}><LazyOrchestration user={user} onNavigate={onNavigate} runId={runId} /></Suspense>;
}
