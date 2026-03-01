"use client";
import { lazy, Suspense } from "react";
import { useParams } from 'next/navigation';
import { useApp } from '../../providers';

const LazyOrchestration = lazy(() => import("../../components/orchestration/OrchestrationPage"));

export default function ArenaPage(){
  const { runId } = useParams() || {};
  const { user, nav: onNavigate } = useApp();
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Arena...</p></div>}><LazyOrchestration user={user} onNavigate={onNavigate} runId={runId} /></Suspense>;
}
