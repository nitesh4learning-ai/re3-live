"use client";
import { lazy, Suspense } from "react";
import { useApp } from '../../providers';

const LazyAcademy = lazy(() => import("../../Academy"));

export default function AcademyPage(){
  const { nav: onNavigate, user: currentUser } = useApp();
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}><p style={{ color: "#9CA3AF", fontSize: 13 }}>Loading Academy...</p></div>}><LazyAcademy onNavigate={onNavigate} currentUser={currentUser} /></Suspense>;
}
