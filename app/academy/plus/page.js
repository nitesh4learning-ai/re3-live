// /academy/plus — Academy Plus Hub (Server Component)
// Admin-only: structured multi-week learning programs.
// Reads program data from content/programs/

import { getAllPrograms } from "./lib/program-loader";
import PlusHub from "./PlusHub";

export const metadata = {
  title: { absolute: "Re³ Academy Plus — Structured Learning Programs" },
  description: "Multi-week structured learning programs with hands-on projects, career positioning, and certifications.",
};

export default function AcademyPlusPage() {
  const programs = getAllPrograms();
  return <PlusHub programs={programs} />;
}
