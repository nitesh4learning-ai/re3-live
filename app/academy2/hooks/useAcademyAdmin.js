"use client";
import { useState, useCallback } from "react";
import { COURSES } from "../../constants/courses";
import { TIER_DEFAULTS, DEFAULT_TIER_COLORS, ADMIN_EMAIL } from "../constants";

const ADB = {
  get: (key, fb) => { try { const d = typeof window !== 'undefined' && localStorage.getItem(`re3_academy_${key}`); return d ? JSON.parse(d) : fb; } catch { return fb; } },
  set: (key, v) => { try { typeof window !== 'undefined' && localStorage.setItem(`re3_academy_${key}`, JSON.stringify(v)); } catch {} },
};

export function isAcademyAdmin(user) {
  return user?.email === ADMIN_EMAIL;
}

export default function useAcademyAdmin() {
  const [config, setConfig] = useState(() => ADB.get('admin_config', null));

  const save = (next) => { setConfig(next); ADB.set('admin_config', next); };
  const reset = () => { setConfig(null); if (typeof window !== 'undefined') localStorage.removeItem('re3_academy_admin_config'); };

  // Merge admin tier overrides with hardcoded defaults.
  // BUG FIX #1: Old code only supported tiers 1-4. Now supports any number.
  const getTiers = useCallback(() => {
    const base = { ...TIER_DEFAULTS };
    if (!config?.tiers) return base;
    const merged = {};
    const allKeys = new Set([...Object.keys(base), ...Object.keys(config.tiers)]);
    allKeys.forEach(k => {
      const bk = base[k] || { accent: '#6B7280', bg: '#F3F4F6', label: `Tier ${k}` };
      const ak = config.tiers[k];
      merged[k] = {
        accent: ak?.accent || bk.accent,
        bg: ak?.bg || bk.bg,
        label: ak?.label || bk.label,
        order: ak?.order ?? parseInt(k),
      };
    });
    return merged;
  }, [config]);

  // BUG FIX #2: Old code built COURSE_TIER_MAP once from hardcoded COURSES
  // and never reflected admin overrides. getCourses() now applies all overrides
  // so any consumer gets the admin-adjusted tier for each course.
  const getCourses = useCallback(() => {
    let list = [...COURSES];
    if (config?.courses) {
      list = list.map(c => {
        const override = config.courses[c.id];
        if (!override) return c;
        return {
          ...c,
          tier: override.tier ?? c.tier,
          status: override.status ?? c.status,
          title: override.title || c.title,
          description: override.description || c.description,
        };
      });
    }
    // Add admin-created courses
    if (config?.customCourses) {
      config.customCourses.forEach(cc => {
        list.push({ ...cc, status: cc.status || 'coming_soon' });
      });
    }
    // Apply ordering
    if (config?.courseOrder) {
      const orderMap = {};
      config.courseOrder.forEach((id, i) => { orderMap[id] = i; });
      list.sort((a, b) => {
        const oa = orderMap[a.id] ?? 999;
        const ob = orderMap[b.id] ?? 999;
        return oa - ob;
      });
    }
    return list;
  }, [config]);

  const updateTier = (tierNum, updates) => {
    const next = { ...config || {}, tiers: { ...(config?.tiers || {}) } };
    next.tiers[tierNum] = { ...(next.tiers[tierNum] || {}), ...updates };
    save(next);
  };

  const addTier = () => {
    const existing = Object.keys(getTiers()).map(Number);
    const newNum = Math.max(...existing, 0) + 1;
    const colorIdx = (newNum - 1) % DEFAULT_TIER_COLORS.length;
    updateTier(newNum, {
      label: `New Tier ${newNum}`,
      accent: DEFAULT_TIER_COLORS[colorIdx],
      bg: '#F9FAFB',
      order: newNum,
    });
  };

  const removeTier = (tierNum) => {
    const courses = getCourses().filter(c => c.tier === tierNum);
    if (courses.length > 0) return false;
    const next = { ...config || {}, tiers: { ...(config?.tiers || {}) } };
    delete next.tiers[tierNum];
    save(next);
    return true;
  };

  const updateCourse = (courseId, updates) => {
    const next = { ...config || {}, courses: { ...(config?.courses || {}) } };
    next.courses[courseId] = { ...(next.courses[courseId] || {}), ...updates };
    save(next);
  };

  const moveCourse = (courseId, newTier) => updateCourse(courseId, { tier: newTier });

  // BUG FIX #3: Old reorderCourse swapped globally across all tiers.
  // Now scoped to intra-tier reordering only.
  const reorderCourse = (courseId, direction) => {
    const allCourses = getCourses();
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    // Only reorder within the same tier
    const tierCourses = allCourses.filter(c => c.tier === course.tier);
    const tierIdx = tierCourses.findIndex(c => c.id === courseId);
    if (tierIdx < 0) return;

    const swapIdx = direction === 'up' ? tierIdx - 1 : tierIdx + 1;
    if (swapIdx < 0 || swapIdx >= tierCourses.length) return;

    // Build a global order array, but only swap within the tier
    const order = allCourses.map(c => c.id);
    const globalIdx = order.indexOf(courseId);
    const swapCourseId = tierCourses[swapIdx].id;
    const globalSwapIdx = order.indexOf(swapCourseId);

    [order[globalIdx], order[globalSwapIdx]] = [order[globalSwapIdx], order[globalIdx]];
    save({ ...config || {}, courseOrder: order });
  };

  const addCourse = (courseData) => {
    const next = { ...config || {}, customCourses: [...(config?.customCourses || [])] };
    next.customCourses.push({
      id: `custom_${Date.now()}`,
      icon: '\uD83D\uDCD8',
      difficulty: 'Beginner',
      timeMinutes: 30,
      exerciseCount: 0,
      tabCount: 0,
      ...courseData,
    });
    save(next);
  };

  return {
    config, getTiers, getCourses, updateTier, addTier, removeTier,
    updateCourse, moveCourse, reorderCourse, addCourse, reset, save,
  };
}
