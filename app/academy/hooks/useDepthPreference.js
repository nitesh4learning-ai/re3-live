"use client";
import { useState, useCallback } from "react";

const ADB = {
  get: (key, fb) => { try { const d = typeof window !== 'undefined' && localStorage.getItem(`re3_academy_${key}`); return d ? JSON.parse(d) : fb; } catch { return fb; } },
  set: (key, v) => { try { typeof window !== 'undefined' && localStorage.setItem(`re3_academy_${key}`, JSON.stringify(v)); } catch {} },
};

export default function useDepthPreference() {
  const [prefs, setPrefs] = useState(() => ADB.get('depth_prefs', { _default: 'visionary' }));

  const getDepth = useCallback((courseId) => {
    return prefs[courseId] || prefs._default || 'visionary';
  }, [prefs]);

  const setDepth = useCallback((courseId, depth) => {
    setPrefs(prev => {
      const next = { ...prev, [courseId]: depth, _default: depth };
      ADB.set('depth_prefs', next);
      return next;
    });
  }, []);

  return [getDepth, setDepth];
}
