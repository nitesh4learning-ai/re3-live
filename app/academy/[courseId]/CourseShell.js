"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GIM } from "../constants";
import FadeIn from "../components/FadeIn";
import ProgressBar from "../components/ProgressBar";
import useAcademyProgress from "../hooks/useAcademyProgress";
import useDepthPreference from "../hooks/useDepthPreference";
import { COURSES } from "../../constants/courses";

function DepthSelector({ depth, onChangeDepth }) {
  return (
    <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: GIM.borderLight }} role="radiogroup" aria-label="Content depth">
      <button
        onClick={() => onChangeDepth('visionary')}
        role="radio"
        aria-checked={depth === 'visionary'}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all"
        style={{ background: depth === 'visionary' ? 'white' : 'transparent', color: depth === 'visionary' ? GIM.primary : GIM.mutedText, boxShadow: depth === 'visionary' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}
      >
        <span>{'\uD83D\uDD2D'}</span> For Visionaries
      </button>
      <button
        onClick={() => onChangeDepth('deep')}
        role="radio"
        aria-checked={depth === 'deep'}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all"
        style={{ background: depth === 'deep' ? 'white' : 'transparent', color: depth === 'deep' ? GIM.primary : GIM.mutedText, boxShadow: depth === 'deep' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}
      >
        <span>{'\uD83D\uDD2C'}</span> Go Deep
      </button>
    </div>
  );
}

export default function CourseShell({ courseId, meta, visionaryTabs, deepTabs }) {
  const [getDepth, setDepth] = useDepthPreference();
  const [progress, updateProgress] = useAcademyProgress(COURSES);
  const depth = getDepth(courseId);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = depth === 'deep' ? deepTabs : visionaryTabs;
  const hasTabs = tabs.length > 0;
  const cp = progress[courseId]?.percent || 0;

  // Reset tab index when switching depth if current exceeds new tab count
  useEffect(() => {
    if (tabs.length > 0 && activeTab >= tabs.length) {
      setActiveTab(tabs.length - 1);
    }
  }, [activeTab, tabs.length]);

  // Placeholder when no MDX content exists yet
  if (!hasTabs) {
    return (
      <div className="min-h-screen" style={{ background: GIM.pageBg }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/academy" className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText }}>{'\u2190'} All Courses</Link>
              <span style={{ fontSize: 24 }}>{meta.icon}</span>
              <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(20px,4vw,28px)', color: GIM.headingText }}>{meta.title}</h1>
            </div>
            <DepthSelector depth={depth} onChangeDepth={(d) => setDepth(courseId, d)} />
            <div className="rounded-xl border p-8 text-center" style={{ borderColor: GIM.border, background: GIM.cardBg }}>
              <span style={{ fontSize: 48 }}>{'\uD83D\uDCD6'}</span>
              <h2 className="font-bold mt-4 mb-2" style={{ fontSize: 18, color: GIM.headingText, fontFamily: GIM.fontMain }}>Content Coming Soon</h2>
              <p style={{ fontSize: 14, color: GIM.bodyText, lineHeight: 1.6 }}>
                This course is being migrated to the new Academy format. Check back soon!
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: GIM.pageBg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <FadeIn>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/academy" className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:shadow-sm" style={{ border: `1px solid ${GIM.border}`, color: GIM.bodyText }}>{'\u2190'} All Courses</Link>
            <span style={{ fontSize: 24 }}>{meta.icon}</span>
            <h1 className="font-bold" style={{ fontFamily: GIM.fontMain, fontSize: 'clamp(20px,4vw,28px)', color: GIM.headingText }}>{meta.title}</h1>
          </div>
          <ProgressBar percent={cp} size="md" />
          <p className="mt-1 mb-4" style={{ fontSize: 12, color: GIM.mutedText }}>
            {Math.round(cp)}% complete {'\u00b7'} {meta.timeMinutes} min {'\u00b7'} {meta.exerciseCount} exercises
          </p>
        </FadeIn>

        <FadeIn delay={20}>
          <DepthSelector depth={depth} onChangeDepth={(d) => setDepth(courseId, d)} />
        </FadeIn>

        {/* Tab Navigation */}
        <FadeIn delay={30}>
          <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: GIM.borderLight }} role="tablist" aria-label="Course lessons">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                role="tab"
                aria-selected={activeTab === i}
                aria-controls={`tabpanel-${tab.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap"
                style={{
                  background: activeTab === i ? GIM.cardBg : 'transparent',
                  color: activeTab === i ? GIM.primary : GIM.mutedText,
                  boxShadow: activeTab === i ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab.icon && <span>{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Tab Content (MDX rendered) */}
        <FadeIn key={`${depth}-${activeTab}`} delay={0}>
          <div
            id={`tabpanel-${tabs[activeTab]?.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tabs[activeTab]?.id}`}
            className="prose-academy"
            style={{ fontFamily: GIM.fontMain, color: GIM.bodyText, lineHeight: 1.8 }}
          >
            {tabs[activeTab]?.content}
          </div>
        </FadeIn>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-8 pt-4" style={{ borderTop: `1px solid ${GIM.border}` }}>
          <button
            onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            className="px-4 py-2 rounded-lg font-medium text-sm"
            style={{ background: activeTab === 0 ? GIM.borderLight : 'white', color: activeTab === 0 ? GIM.mutedText : GIM.bodyText, border: `1px solid ${GIM.border}` }}
          >
            {'\u2190'} Previous
          </button>
          {activeTab === tabs.length - 1 ? (
            <Link
              href="/academy"
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md"
              style={{ background: cp >= 100 ? '#2D8A6E' : GIM.primary, color: 'white' }}
            >
              {cp >= 100 ? '\u2713 Finish Course' : 'Back to Courses'}
            </Link>
          ) : (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="px-4 py-2 rounded-lg font-medium text-sm"
              style={{ background: GIM.primary, color: 'white' }}
            >
              Next {'\u2192'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
