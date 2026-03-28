"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "../../providers";
import { GIM, ADMIN_EMAIL } from "../constants";
import FadeIn from "../components/FadeIn";

function AdminGate({ children }) {
  const { user } = useApp();
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: GIM.pageBg }}>
        <div className="text-center px-6">
          <span style={{ fontSize: 48 }}>🔒</span>
          <h1 className="font-bold mt-4 mb-2" style={{ fontSize: 24, color: GIM.headingText, fontFamily: GIM.fontMain }}>Academy Plus</h1>
          <p style={{ fontSize: 14, color: GIM.bodyText, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            This section is currently available to administrators only. Sign in with an admin account to access structured learning programs.
          </p>
          <Link href="/academy" className="inline-block mt-6 px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: GIM.primary, color: 'white' }}>
            ← Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

function PhasePill({ phase }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: phase.color + '15', color: phase.color }}>
      {phase.weeks} · {phase.title}
    </span>
  );
}

function ProgramCard({ program }) {
  const currentWeek = program.phases?.reduce((acc, p) => {
    const current = p.modules?.find?.(m => m?.status === 'current');
    return current ? current.week : acc;
  }, 1) || 1;

  const progressPercent = Math.round(((currentWeek - 1) / program.totalWeeks) * 100);

  return (
    <Link href={`/academy/plus/${program.id}`} className="block">
      <div
        className="rounded-2xl border p-6 transition-all hover:shadow-lg hover:border-purple-200 cursor-pointer"
        style={{ background: GIM.cardBg, borderColor: GIM.border }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 36 }}>{program.icon}</span>
            <div>
              <h2 className="font-bold" style={{ fontSize: 18, color: GIM.headingText, fontFamily: GIM.fontMain, lineHeight: 1.2 }}>
                {program.title}
              </h2>
              <p style={{ fontSize: 12, color: GIM.primary, fontWeight: 600, marginTop: 2 }}>{program.subtitle}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{
            background: program.status === 'active' ? '#DCFCE7' : '#FEF3C7',
            color: program.status === 'active' ? '#16A34A' : '#D97706',
          }}>
            {program.status === 'active' ? '● Active' : 'Draft'}
          </span>
        </div>

        <p className="mb-4" style={{ fontSize: 13, color: GIM.bodyText, lineHeight: 1.6 }}>{program.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: 11, color: GIM.mutedText }}>Week {currentWeek} of {program.totalWeeks}</span>
            <span style={{ fontSize: 11, color: GIM.mutedText }}>{progressPercent}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: GIM.borderLight }}>
            <div className="rounded-full" style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, #E8590C, #1971C2, #2F9E44)`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Phase pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(program.phases || []).map(p => <PhasePill key={p.id} phase={p} />)}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${GIM.borderLight}`, fontSize: 11, color: GIM.mutedText }}>
          <span>{program.totalWeeks} weeks</span>
          <span>·</span>
          <span>{program.hoursPerWeek} hrs/week</span>
          <span>·</span>
          <span>{program.certifications?.length || 0} certifications</span>
          <span>·</span>
          <span>{program.tags?.length || 0} topics</span>
        </div>
      </div>
    </Link>
  );
}

export default function PlusHub({ programs }) {
  return (
    <AdminGate>
      <div className="min-h-screen" style={{ background: GIM.pageBg, paddingTop: 56 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <FadeIn>
            <div className="mb-2">
              <Link href="/academy" className="inline-flex items-center gap-1 text-xs font-medium mb-4" style={{ color: GIM.mutedText }}>
                ← Academy
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #E8590C15, #1971C215, #2F9E4415)', border: '1px solid rgba(147,51,234,0.15)' }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 10, letterSpacing: '0.12em', color: GIM.primary }}>ACADEMY PLUS</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FEF3C7', color: '#92400E' }}>ADMIN</span>
            </div>
            <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GIM.headingText, marginBottom: 8 }}>
              Structured <span style={{ color: GIM.primary }}>Programs</span>
            </h1>
            <p style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(14px,1.6vw,16px)', maxWidth: 560, color: GIM.bodyText, lineHeight: 1.7, marginBottom: 24 }}>
              Multi-week learning journeys with weekly builds, curated resources, and career positioning. Each program produces portfolio-ready artifacts.
            </p>
          </FadeIn>

          {/* Programs */}
          {programs.length === 0 ? (
            <FadeIn delay={50}>
              <div className="rounded-2xl border p-12 text-center" style={{ borderColor: GIM.border, background: GIM.cardBg }}>
                <span style={{ fontSize: 48 }}>📦</span>
                <h2 className="font-bold mt-4 mb-2" style={{ fontSize: 18, color: GIM.headingText }}>No Programs Yet</h2>
                <p style={{ fontSize: 14, color: GIM.bodyText }}>Add a program.json to content/programs/ to get started.</p>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-4">
              {programs.map((program, i) => (
                <FadeIn key={program.id} delay={50 + i * 30}>
                  <ProgramCard program={program} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}
