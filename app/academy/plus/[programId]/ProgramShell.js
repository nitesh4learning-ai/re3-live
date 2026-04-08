"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useApp } from "../../../providers";
import { GIM, ADMIN_EMAIL } from "../../constants";
import FadeIn from "../../components/FadeIn";

// ── Portable: all data comes from props, no external dependencies ──

const RESOURCE_COLORS = {
  docs: '#2D8A6E', course: '#E8590C', tutorial: '#2F9E44', repo: '#1971C2',
  article: '#7C3AED', guide: '#D97706', cert: '#DC2626', video: '#0891B2',
  tool: '#6B7280', package: '#9333EA',
};

const PRIORITY_LABELS = {
  'start-here': { label: 'START HERE', bg: '#DCFCE7', color: '#16A34A' },
  'deep-dive': { label: 'DEEP DIVE', bg: '#EFF6FF', color: '#3B82F6' },
  'reference': { label: 'REFERENCE', bg: '#F3F4F6', color: '#6B7280' },
  'optional': { label: 'OPTIONAL', bg: '#FAF5FF', color: '#9333EA' },
  'consider': { label: 'CONSIDER', bg: '#FEF3C7', color: '#D97706' },
};

const STATUS_STYLES = {
  current: { bg: '#DCFCE7', color: '#16A34A', label: '● Current Week' },
  completed: { bg: '#EFF6FF', color: '#3B82F6', label: '✓ Completed' },
  upcoming: { bg: '#F3F4F6', color: '#6B7280', label: 'Upcoming' },
};

function ResourceLink({ resource }) {
  const typeColor = RESOURCE_COLORS[resource.type] || '#6B7280';
  const prio = PRIORITY_LABELS[resource.priority];

  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all hover:shadow-sm"
      style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
    >
      <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: typeColor + '18', color: typeColor, fontSize: 9, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {resource.type}
      </span>
      <span className="flex-1 text-xs font-medium" style={{ color: GIM.headingText }}>{resource.title}</span>
      {prio && (
        <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: prio.bg, color: prio.color, fontSize: 8, letterSpacing: '0.5px' }}>
          {prio.label}
        </span>
      )}
      <span style={{ fontSize: 10, color: GIM.mutedText }}>↗</span>
    </a>
  );
}

function WeekCard({ module, phaseColor, phaseAccent, isExpanded, onToggle }) {
  const status = STATUS_STYLES[module.status] || STATUS_STYLES.upcoming;

  return (
    <div className="rounded-xl border overflow-hidden transition-all" style={{
      background: GIM.cardBg,
      borderColor: isExpanded ? phaseColor : GIM.border,
      borderWidth: isExpanded ? 2 : 1,
    }}>
      {/* Header — always visible */}
      <button onClick={onToggle} className="w-full px-5 py-4 text-left flex items-center gap-3" style={{ fontFamily: GIM.fontMain }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{
          background: isExpanded ? phaseColor : '#F0F0F0',
          color: isExpanded ? 'white' : phaseColor,
        }}>
          W{module.week}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: GIM.headingText }}>{module.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: status.bg, color: status.color, fontSize: 10 }}>
              {status.label}
            </span>
            <span style={{ fontSize: 10, color: GIM.mutedText }}>~{module.estimatedHours}h</span>
          </div>
        </div>
        <span style={{ color: GIM.mutedText, fontSize: 16, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5" style={{ borderTop: `1px solid ${GIM.borderLight}` }}>
          {/* What to Learn */}
          <div className="mt-4 mb-5">
            <h4 className="text-xs font-bold mb-2" style={{ color: GIM.mutedText, letterSpacing: '2px', textTransform: 'uppercase' }}>LEARN</h4>
            {module.learn.map((item, i) => (
              <div key={i} className="py-1.5 pl-3 text-xs" style={{ borderLeft: `2px solid ${phaseAccent}`, color: GIM.bodyText, lineHeight: 1.6, marginBottom: 3 }}>
                {item}
              </div>
            ))}
          </div>

          {/* Build Project */}
          {module.build && (
            <div className="rounded-xl p-4 mb-5" style={{ background: phaseAccent }}>
              <h4 className="text-xs font-bold mb-2" style={{ color: phaseColor, letterSpacing: '2px', textTransform: 'uppercase' }}>🛠 BUILD THIS</h4>
              <h5 className="font-bold text-sm mb-1" style={{ color: GIM.headingText }}>{module.build.title}</h5>
              <p className="text-xs mb-3" style={{ color: GIM.bodyText, lineHeight: 1.6 }}>{module.build.description}</p>
              {module.build.stack?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {module.build.stack.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'white', color: GIM.bodyText, fontSize: 10, border: `1px solid ${GIM.border}` }}>{s}</span>
                  ))}
                </div>
              )}
              {module.build.deliverable && (
                <div className="text-xs mt-2 pt-2" style={{ borderTop: `1px solid ${phaseColor}20`, color: phaseColor, fontWeight: 600 }}>
                  📦 Deliverable: {module.build.deliverable}
                </div>
              )}
            </div>
          )}

          {/* Resources */}
          {module.resources?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-bold mb-2" style={{ color: GIM.mutedText, letterSpacing: '2px', textTransform: 'uppercase' }}>RESOURCES</h4>
              <div className="space-y-1.5">
                {module.resources.map((r, i) => <ResourceLink key={i} resource={r} />)}
              </div>
            </div>
          )}

          {/* Career & SnapSense Angles */}
          {module.careerAngle && (
            <div className="rounded-xl p-3 mb-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <h4 className="text-xs font-bold mb-1" style={{ color: '#92400E', fontSize: 10, letterSpacing: '1px' }}>💼 INTERVIEW ANGLE</h4>
              <p className="text-xs" style={{ color: '#92400E', lineHeight: 1.5 }}>{module.careerAngle}</p>
            </div>
          )}
          {module.snapSenseAngle && module.snapSenseAngle !== 'N/A' && (
            <div className="rounded-xl p-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <h4 className="text-xs font-bold mb-1" style={{ color: '#166534', fontSize: 10, letterSpacing: '1px' }}>📱 SNAPSENSE APPLICATION</h4>
              <p className="text-xs" style={{ color: '#166534', lineHeight: 1.5 }}>{module.snapSenseAngle}</p>
            </div>
          )}

          {/* Start Course Link */}
          {module.courseLink && (
            <Link
              href={`/academy/${module.courseLink}`}
              className="block w-full text-center rounded-xl py-3 mt-4 font-bold text-sm transition-all hover:shadow-md"
              style={{
                background: phaseColor,
                color: 'white',
                fontFamily: GIM.fontMain,
                textDecoration: 'none',
              }}
            >
              📖 Start Course →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function CertCard({ cert }) {
  const prioColor = cert.priority === 'HIGH' ? '#E8590C' : cert.priority === 'MEDIUM' ? '#1971C2' : '#6B7280';
  return (
    <div className="rounded-xl border p-4" style={{ background: GIM.cardBg, borderColor: GIM.border }}>
      <div className="flex items-start justify-between mb-1">
        <span className="font-bold text-sm" style={{ color: GIM.headingText }}>{cert.name}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: prioColor + '18', color: prioColor, fontSize: 9 }}>{cert.priority}</span>
      </div>
      <div className="text-xs mb-1.5" style={{ color: GIM.mutedText }}>{cert.provider} · {cert.effort}</div>
      <div className="text-xs italic" style={{ color: GIM.bodyText, lineHeight: 1.5 }}>{cert.note}</div>
      {cert.week && <div className="text-xs mt-2" style={{ color: GIM.mutedText }}>Aligned with Week {cert.week}</div>}
    </div>
  );
}

export default function ProgramShell({ programId, program }) {
  const { user } = useApp();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showCerts, setShowCerts] = useState(false);

  // Find current week for auto-expand
  const findCurrentWeek = useCallback(() => {
    for (const phase of program.phases || []) {
      for (const mod of phase.modules || []) {
        if (mod.status === 'current') return mod.week;
      }
    }
    return 1;
  }, [program]);

  // Auto-expand current week on first render
  useState(() => {
    setExpandedWeek(findCurrentWeek());
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: GIM.pageBg }}>
        <div className="text-center px-6">
          <span style={{ fontSize: 48 }}>🔒</span>
          <h1 className="font-bold mt-4" style={{ fontSize: 20, color: GIM.headingText }}>Admin Access Required</h1>
          <Link href="/academy" className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: GIM.primary, color: 'white' }}>← Back to Academy</Link>
        </div>
      </div>
    );
  }

  const currentWeek = findCurrentWeek();
  const progressPercent = Math.round(((currentWeek - 1) / program.totalWeeks) * 100);

  return (
    <div className="min-h-screen" style={{ background: GIM.pageBg, paddingTop: 56 }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb + Header */}
        <FadeIn>
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: GIM.mutedText }}>
            <Link href="/academy" className="hover:underline">Academy</Link>
            <span>›</span>
            <Link href="/academy/plus" className="hover:underline">Plus</Link>
            <span>›</span>
            <span style={{ color: GIM.headingText, fontWeight: 600 }}>{program.title}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 32 }}>{program.icon}</span>
            <div>
              <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(22px,4vw,32px)', lineHeight: 1.1, color: GIM.headingText }}>{program.title}</h1>
              <p style={{ fontSize: 13, color: GIM.primary, fontWeight: 600, marginTop: 2 }}>{program.subtitle}</p>
            </div>
          </div>

          <p className="mb-4" style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.7, maxWidth: 600 }}>{program.description}</p>

          {/* Overall progress */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: GIM.borderLight }}>
                <div className="rounded-full" style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #E8590C, #1971C2, #2F9E44)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <span style={{ fontSize: 12, color: GIM.mutedText, whiteSpace: 'nowrap' }}>Week {currentWeek}/{program.totalWeeks}</span>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              ['📅', `${program.totalWeeks} weeks`, 'Duration'],
              ['⏰', `${program.hoursPerWeek} hrs/wk`, 'Commitment'],
              ['🎯', `${program.phases?.length || 0} phases`, 'Structure'],
              ['📜', `${program.certifications?.length || 0}`, 'Certifications'],
            ].map(([icon, val, label]) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: GIM.cardBg, borderColor: GIM.border }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <div>
                  <div className="font-bold text-xs" style={{ color: GIM.headingText }}>{val}</div>
                  <div style={{ fontSize: 9, color: GIM.mutedText }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Phases + Weeks */}
        {(program.phases || []).map((phase, pi) => (
          <FadeIn key={phase.id} delay={50 + pi * 40}>
            <div className="mb-8">
              {/* Phase header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 rounded-full" style={{ background: phase.color }} />
                <div>
                  <h2 className="font-bold" style={{ fontSize: 18, color: GIM.headingText, fontFamily: GIM.fontMain }}>{phase.title}</h2>
                  <p style={{ fontSize: 12, color: GIM.mutedText }}>{phase.weeks}</p>
                </div>
              </div>

              {/* Phase goal */}
              <div className="rounded-xl p-4 mb-4" style={{ background: phase.accent, borderLeft: `4px solid ${phase.color}` }}>
                <p className="text-xs" style={{ color: GIM.bodyText, lineHeight: 1.6 }}>
                  <strong style={{ color: phase.color }}>Goal:</strong> {phase.goal}
                </p>
              </div>

              {/* Week cards */}
              <div className="space-y-3">
                {(phase.modules || []).map(mod => (
                  <WeekCard
                    key={mod.week}
                    module={mod}
                    phaseColor={phase.color}
                    phaseAccent={phase.accent}
                    isExpanded={expandedWeek === mod.week}
                    onToggle={() => setExpandedWeek(expandedWeek === mod.week ? null : mod.week)}
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        ))}

        {/* Certifications */}
        {program.certifications?.length > 0 && (
          <FadeIn delay={200}>
            <div className="mb-8">
              <button onClick={() => setShowCerts(!showCerts)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#1a1a1a', color: 'white', fontFamily: GIM.fontMain }}
              >
                <span>📜 Recommended Certifications ({program.certifications.length})</span>
                <span style={{ transform: showCerts ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </button>
              {showCerts && (
                <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {program.certifications.map((c, i) => <CertCard key={i} cert={c} />)}
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* Footer nav */}
        <div className="flex justify-between pt-4 mb-8" style={{ borderTop: `1px solid ${GIM.border}` }}>
          <Link href="/academy/plus" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText }}>← All Programs</Link>
          <Link href="/academy" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: GIM.primary, color: 'white' }}>Academy Home</Link>
        </div>
      </div>
    </div>
  );
}
