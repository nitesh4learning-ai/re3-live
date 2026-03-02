// /academy2 — Academy 2.0 Hub Page (Server Component)
// Reads all course metadata at build time, passes to client hub.

import { getAllCourseMeta } from "./lib/course-loader";
import AcademyHub from "./AcademyHub";

export const metadata = {
  title: "Re³ Academy — Learn AI by Doing",
  description: "Interactive courses that teach you how AI systems work — from tokens to multi-agent orchestration. Every concept includes hands-on exercises.",
  openGraph: {
    title: "Re³ Academy — Learn AI by Doing",
    description: "Interactive AI courses from beginner to expert. Hands-on exercises for every concept.",
    type: "website",
  },
};

export default function AcademyPage() {
  const courses = getAllCourseMeta();
  return <AcademyHub courses={courses} />;
}
