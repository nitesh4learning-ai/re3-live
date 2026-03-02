"use client";
import { useState, useCallback } from "react";

const ADB = {
  get: (key, fb) => { try { const d = typeof window !== 'undefined' && localStorage.getItem(`re3_academy_${key}`); return d ? JSON.parse(d) : fb; } catch { return fb; } },
  set: (key, v) => { try { typeof window !== 'undefined' && localStorage.setItem(`re3_academy_${key}`, JSON.stringify(v)); } catch {} },
};

export default function useAcademyProgress(courses) {
  const [progress, setProgress] = useState(() => ADB.get('progress', {}));

  const update = useCallback((courseId, tabId, sectionId) => {
    setProgress(prev => {
      const course = prev[courseId] || { sections: {}, percent: 0 };
      const sections = course.sections || {};
      const key = `${tabId}_${sectionId}`;
      if (sections[key]) return prev;
      const newSections = { ...sections, [key]: true };
      const courseData = courses.find(c => c.id === courseId);
      const total = courseData?.exerciseCount || 8;
      const percent = Math.min(100, Math.round(Object.keys(newSections).length / total * 100));
      const next = { ...prev, [courseId]: { sections: newSections, percent } };
      ADB.set('progress', next);
      return next;
    });
  }, [courses]);

  return [progress, update];
}
