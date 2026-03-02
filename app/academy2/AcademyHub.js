"use client";
import { useState } from "react";
import Link from "next/link";
import { GIM, TIER_DEFAULTS } from "./constants";
import FadeIn from "./components/FadeIn";
import ProgressBar from "./components/ProgressBar";
import useAcademyProgress from "./hooks/useAcademyProgress";
import useAcademyAdmin, { isAcademyAdmin } from "./hooks/useAcademyAdmin";

function DepthBadge() {
  return (
    <div className="flex gap-1">
      <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#FAF5FF', color: '#9333EA', fontSize: 10 }} title="For Visionaries">{'\uD83D\uDD2D'}</span>
      <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#FAF5FF', color: '#9333EA', fontSize: 10 }} title="Go Deep">{'\uD83D\uDD2C'}</span>
    </div>
  );
}

export default function AcademyHub({ courses: serverCourses }) {
  const admin = useAcademyAdmin();
  const [adminMode, setAdminMode] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editTierLabel, setEditTierLabel] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({});
  const [showAddCourse, setShowAddCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', tier: 1, icon: '\uD83D\uDCD8', difficulty: 'Beginner', timeMinutes: 30, exerciseCount: 0, tabCount: 0 });

  // Use admin-overridden courses (merges serverCourses with localStorage admin config)
  const courses = admin.getCourses();
  const [progress] = useAcademyProgress(courses);
  const tiers = admin.getTiers();

  // TODO: Get currentUser from auth context when available
  const currentUser = null;
  const isAdmin = isAcademyAdmin(currentUser);

  const totalCourses = courses.length;
  const availableCourses = courses.filter(c => c.status === 'available');
  const overallPercent = availableCourses.length > 0
    ? Math.round(availableCourses.reduce((s, c) => s + (progress[c.id]?.percent || 0), 0) / availableCourses.length)
    : 0;
  const tierKeys = Object.keys(tiers).map(Number).sort((a, b) => (tiers[a]?.order ?? a) - (tiers[b]?.order ?? b));

  const completedCourses = availableCourses.filter(c => (progress[c.id]?.percent || 0) >= 100);
  const inProgressCourses = availableCourses.filter(c => { const p = progress[c.id]?.percent || 0; return p > 0 && p < 100; });
  const totalExercisesDone = Object.values(progress).reduce((s, c) => s + Object.keys(c.sections || {}).length, 0);
  const remainingTime = availableCourses.filter(c => (progress[c.id]?.percent || 0) < 100).reduce((s, c) => s + c.timeMinutes, 0);
  const completedByTier = {};
  tierKeys.forEach(tier => {
    const tc = availableCourses.filter(c => c.tier === tier);
    completedByTier[tier] = { done: tc.filter(c => (progress[c.id]?.percent || 0) >= 100).length, total: tc.length };
  });

  const statusCycle = { available: 'draft', draft: 'coming_soon', coming_soon: 'available' };
  const statusColors = { available: '#2D8A6E', draft: '#D97706', coming_soon: '#9CA3AF' };

  return (
    <div className="min-h-screen" style={{ background: GIM.pageBg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Admin Bar */}
        {adminMode && (
          <FadeIn>
            <div className="flex items-center justify-between p-3 rounded-xl mb-6" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#F59E0B', color: 'white' }}>ADMIN MODE</span>
                <span style={{ fontSize: 12, color: '#92400E' }}>Changes save to this browser automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { admin.reset(); setAdminMode(false); }} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ color: '#DC2626', border: '1px solid #FECACA' }}>Reset to Defaults</button>
                <button onClick={() => setAdminMode(false)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ color: '#4B5563', border: '1px solid #E5E7EB' }}>Exit Admin</button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Hero */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: GIM.primaryBadge, border: '1px solid rgba(147,51,234,0.2)' }}>
                <span style={{ fontSize: 14 }}>{'\uD83C\uDF93'}</span>
                <span className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 10, letterSpacing: '0.12em', color: GIM.primary }}>RE{'\u00b3'} ACADEMY</span>
              </div>
              {isAdmin && !adminMode && (
                <button onClick={() => setAdminMode(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>{'\u2699\uFE0F'} Manage</button>
              )}
            </div>
            <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GIM.headingText, marginBottom: 8 }}>
              Learn AI by <span style={{ color: GIM.primary }}>Doing</span>
            </h1>
            <p style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(14px,1.6vw,16px)', maxWidth: 540, color: GIM.bodyText, lineHeight: 1.7, marginBottom: 16 }}>
              Interactive courses that teach you how AI systems work -- from tokens to multi-agent orchestration. Every concept includes hands-on exercises you can try right here.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1"><ProgressBar percent={overallPercent} size="lg" /></div>
              <span style={{ fontSize: 12, color: GIM.mutedText, whiteSpace: 'nowrap' }}>{overallPercent}% complete</span>
            </div>
          </div>
        </FadeIn>

        {/* Quick Stats */}
        <FadeIn delay={50}>
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              ['\uD83D\uDCDA', `${completedCourses.length}/${availableCourses.length}`, 'Completed'],
              ['\uD83D\uDD04', `${inProgressCourses.length}`, 'In Progress'],
              ['\u23F1\uFE0F', remainingTime > 60 ? `${Math.round(remainingTime / 60)}h+` : `${remainingTime}m`, 'Remaining'],
              ['\uD83D\uDD25', `${totalExercisesDone}`, 'Exercises Done'],
            ].map(([icon, num, label]) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ background: GIM.cardBg, borderColor: GIM.border }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <div className="font-bold" style={{ fontSize: 18, color: GIM.headingText, fontFamily: GIM.fontMain }}>{num}</div>
                  <div style={{ fontSize: 11, color: GIM.mutedText }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Tier Sections */}
        {tierKeys.map(tier => {
          const tc = tiers[tier] || TIER_DEFAULTS[tier] || { accent: '#6B7280', bg: '#F3F4F6', label: `Tier ${tier}` };
          const tierCourses = courses.filter(c => c.tier === tier);

          return (
            <FadeIn key={tier} delay={80 + tier * 40}>
              <div className="mb-8">
                {/* Tier Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 rounded-full" style={{ height: 20, background: tc.accent }} />
                  {editingTier === tier ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editTierLabel}
                        onChange={e => setEditTierLabel(e.target.value)}
                        className="flex-1 px-3 py-1 rounded-lg border text-sm font-bold focus:outline-none"
                        style={{ borderColor: GIM.border, color: tc.accent }}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') { admin.updateTier(tier, { label: editTierLabel }); setEditingTier(null); } }}
                      />
                      <button onClick={() => { admin.updateTier(tier, { label: editTierLabel }); setEditingTier(null); }} className="px-2 py-1 rounded text-xs font-semibold" style={{ background: tc.accent, color: 'white' }}>Save</button>
                      <button onClick={() => setEditingTier(null)} className="px-2 py-1 rounded text-xs" style={{ color: GIM.mutedText }}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 18, color: tc.accent }}>Tier {tier}: {tc.label}</h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: tc.bg, color: tc.accent }}>{completedByTier[tier]?.done || 0}/{completedByTier[tier]?.total || tierCourses.length} completed</span>
                      {adminMode && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button onClick={() => { setEditingTier(tier); setEditTierLabel(tc.label); }} className="p-1 rounded hover:bg-gray-100" title="Rename" style={{ fontSize: 12 }}>{'\u270F\uFE0F'}</button>
                          {tierKeys.indexOf(tier) > 0 && (
                            <button onClick={() => { const prev = tierKeys[tierKeys.indexOf(tier) - 1]; admin.updateTier(tier, { order: tiers[prev]?.order ?? prev }); admin.updateTier(prev, { order: tiers[tier]?.order ?? tier }); }} className="p-1 rounded hover:bg-gray-100" title="Move up" style={{ fontSize: 12 }}>{'\u2B06\uFE0F'}</button>
                          )}
                          {tierKeys.indexOf(tier) < tierKeys.length - 1 && (
                            <button onClick={() => { const next = tierKeys[tierKeys.indexOf(tier) + 1]; admin.updateTier(tier, { order: tiers[next]?.order ?? next }); admin.updateTier(next, { order: tiers[tier]?.order ?? tier }); }} className="p-1 rounded hover:bg-gray-100" title="Move down" style={{ fontSize: 12 }}>{'\u2B07\uFE0F'}</button>
                          )}
                          {tierCourses.length === 0 && (
                            <button onClick={() => admin.removeTier(tier)} className="p-1 rounded hover:bg-red-50" title="Delete empty tier" style={{ fontSize: 12 }}>{'\uD83D\uDDD1\uFE0F'}</button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Course Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tierCourses.map((course, ci) => {
                    const cp = progress[course.id] || { percent: 0 };
                    const isComing = course.status === 'coming_soon';
                    const isDraft = course.status === 'draft';
                    const isComplete = cp.percent >= 100;
                    const isStarted = cp.percent > 0 && !isComplete;

                    return (
                      <div
                        key={course.id}
                        className="rounded-xl border p-4 transition-all"
                        style={{
                          background: isComing || isDraft ? GIM.borderLight : GIM.cardBg,
                          borderColor: adminMode ? tc.accent + '40' : GIM.border,
                          opacity: isComing ? 0.65 : isDraft ? 0.75 : 1,
                        }}
                        onMouseEnter={e => { if (!isComing) e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        {/* Admin controls row */}
                        {adminMode && (
                          <div className="flex items-center gap-1 mb-2 pb-2" style={{ borderBottom: `1px solid ${GIM.border}` }}>
                            <button
                              onClick={() => admin.updateCourse(course.id, { status: statusCycle[course.status] || 'available' })}
                              className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: statusColors[course.status] + '18', color: statusColors[course.status], border: `1px solid ${statusColors[course.status]}30` }}
                            >
                              {course.status}
                            </button>
                            <select
                              value={course.tier}
                              onChange={e => admin.moveCourse(course.id, parseInt(e.target.value))}
                              className="px-1 py-0.5 rounded text-xs border"
                              style={{ borderColor: GIM.border, fontSize: 10 }}
                            >
                              {tierKeys.map(t => <option key={t} value={t}>Tier {t}</option>)}
                            </select>
                            <div className="ml-auto flex items-center gap-0.5">
                              {ci > 0 && <button onClick={() => admin.reorderCourse(course.id, 'up')} className="p-0.5 rounded hover:bg-gray-100" style={{ fontSize: 10 }}>{'\u25B2'}</button>}
                              {ci < tierCourses.length - 1 && <button onClick={() => admin.reorderCourse(course.id, 'down')} className="p-0.5 rounded hover:bg-gray-100" style={{ fontSize: 10 }}>{'\u25BC'}</button>}
                              <button onClick={() => { setEditingCourse(course.id); setEditCourseData({ title: course.title, description: course.description, icon: course.icon }); }} className="p-0.5 rounded hover:bg-gray-100" style={{ fontSize: 10 }}>{'\u270F\uFE0F'}</button>
                            </div>
                          </div>
                        )}

                        {/* Course edit form */}
                        {editingCourse === course.id ? (
                          <div className="space-y-2">
                            <input value={editCourseData.title || ''} onChange={e => setEditCourseData({ ...editCourseData, title: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border text-sm font-bold focus:outline-none" style={{ borderColor: GIM.border }} placeholder="Course title" />
                            <textarea value={editCourseData.description || ''} onChange={e => setEditCourseData({ ...editCourseData, description: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none" style={{ borderColor: GIM.border }} rows={2} placeholder="Description" />
                            <div className="flex gap-2">
                              <button onClick={() => { admin.updateCourse(course.id, editCourseData); setEditingCourse(null); }} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: GIM.primary, color: 'white' }}>Save</button>
                              <button onClick={() => setEditingCourse(null)} className="px-3 py-1 rounded-lg text-xs" style={{ color: GIM.mutedText }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <span style={{ fontSize: 28 }}>{course.icon}</span>
                              <div className="flex items-center gap-2">
                                <DepthBadge />
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: tc.bg, color: tc.accent }}>{course.difficulty}</span>
                                {isDraft && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FEF3C7', color: '#D97706' }}>Draft</span>}
                              </div>
                            </div>
                            <h3 className="font-bold mb-1" style={{ fontSize: 15, color: GIM.headingText, fontFamily: GIM.fontMain }}>{course.title}</h3>
                            <p className="mb-3" style={{ fontSize: 12, color: GIM.bodyText, lineHeight: 1.5 }}>{course.description}</p>
                            <div className="flex items-center gap-2 mb-3" style={{ fontSize: 11, color: GIM.mutedText }}>
                              <span>{course.timeMinutes} min</span><span>{'\u00b7'}</span>
                              <span>{course.exerciseCount} exercises</span><span>{'\u00b7'}</span>
                              <span>{course.tabCount} lessons</span>
                            </div>
                            {!isComing && !isDraft && <div className="mb-3"><ProgressBar percent={cp.percent} size="sm" /></div>}
                            {isComing ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: GIM.borderLight, color: GIM.mutedText }}>Coming Soon</span>
                            ) : isDraft ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#FEF3C7', color: '#D97706' }}>Draft — Admin Only</span>
                            ) : (
                              <Link
                                href={`/academy2/${course.id}`}
                                className="inline-block px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm"
                                style={{
                                  background: isComplete ? '#2D8A6E' : isStarted ? GIM.primary : GIM.primaryBadge,
                                  color: isComplete ? 'white' : isStarted ? 'white' : GIM.primary,
                                  border: isComplete ? '1px solid #2D8A6E' : 'none',
                                }}
                              >
                                {isComplete ? '\u2713 Review' : isStarted ? 'Continue' : 'Start Course'}
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Course button (admin) */}
                {adminMode && (
                  <div className="mt-3">
                    {showAddCourse === tier ? (
                      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: GIM.border, background: GIM.cardBg }}>
                        <input value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border text-sm font-bold focus:outline-none" style={{ borderColor: GIM.border }} placeholder="Course title" />
                        <textarea value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none" style={{ borderColor: GIM.border }} rows={2} placeholder="Description" />
                        <div className="flex gap-2">
                          <button onClick={() => { if (newCourse.title.trim()) { admin.addCourse({ ...newCourse, tier }); setNewCourse({ title: '', description: '', tier: 1, icon: '\uD83D\uDCD8', difficulty: 'Beginner', timeMinutes: 30, exerciseCount: 0, tabCount: 0 }); setShowAddCourse(null); } }} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: tc.accent, color: 'white' }}>Add Course</button>
                          <button onClick={() => setShowAddCourse(null)} className="px-3 py-1 rounded-lg text-xs" style={{ color: GIM.mutedText }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddCourse(tier)} className="w-full py-2 rounded-xl border-2 border-dashed text-xs font-semibold transition-all hover:border-solid" style={{ borderColor: tc.accent + '40', color: tc.accent }}>+ Add Course to Tier {tier}</button>
                    )}
                  </div>
                )}
              </div>
            </FadeIn>
          );
        })}

        {/* Add Tier button (admin) */}
        {adminMode && (
          <FadeIn>
            <button onClick={admin.addTier} className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid mb-8" style={{ borderColor: GIM.primary + '40', color: GIM.primary }}>+ Add New Tier</button>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
