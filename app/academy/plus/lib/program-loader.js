// Program loader for Academy Plus
// Reads program.json from content/programs/{programId}/
// Mirrors the pattern from course-loader.js for consistency.

import fs from "fs";
import path from "path";

const PROGRAMS_DIR = path.join(process.cwd(), "content", "programs");

export function getAllProgramIds() {
  if (!fs.existsSync(PROGRAMS_DIR)) return [];
  return fs.readdirSync(PROGRAMS_DIR).filter(dir => {
    const programPath = path.join(PROGRAMS_DIR, dir, "program.json");
    return fs.existsSync(programPath);
  });
}

export function getProgram(programId) {
  const programPath = path.join(PROGRAMS_DIR, programId, "program.json");
  if (!fs.existsSync(programPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(programPath, "utf-8"));
  } catch {
    return null;
  }
}

export function getAllPrograms() {
  const ids = getAllProgramIds();
  return ids.map(id => {
    const program = getProgram(id);
    if (!program) return null;
    // Return a summary for the hub page (don't include full module content)
    return {
      id,
      title: program.title,
      subtitle: program.subtitle,
      description: program.description,
      icon: program.icon,
      status: program.status,
      visibility: program.visibility,
      tags: program.tags,
      totalWeeks: program.totalWeeks,
      hoursPerWeek: program.hoursPerWeek,
      phaseCount: program.phases?.length || 0,
      phases: (program.phases || []).map(p => ({
        id: p.id,
        title: p.title,
        weeks: p.weeks,
        color: p.color,
        moduleCount: p.modules?.length || 0,
      })),
      certifications: program.certifications || [],
    };
  }).filter(Boolean);
}
