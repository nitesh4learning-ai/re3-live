// /academy/[courseId] — Individual Course Page (Server Component)
// Loads course metadata + MDX tabs at build time, renders with client shell.

import { notFound } from "next/navigation";
import { getAllCourseIds, getCourseMeta, loadCourseTabs } from "../lib/course-loader";
import { mdxComponents } from "../components/mdx-components";
import CourseShell from "./CourseShell";

export async function generateStaticParams() {
  const ids = getAllCourseIds();
  return ids.map(courseId => ({ courseId }));
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const meta = getCourseMeta(courseId);
  if (!meta) return { title: "Course Not Found" };
  return {
    title: meta.title,
    description: meta.seo?.metaDescription || meta.description,
    openGraph: {
      title: meta.seo?.metaTitle || `${meta.title} — Re³ Academy`,
      description: meta.seo?.metaDescription || meta.description,
      type: "article",
    },
  };
}

export default async function CoursePage({ params }) {
  const { courseId } = await params;
  const meta = getCourseMeta(courseId);
  if (!meta) notFound();

  // Load both depth tracks
  const [visionaryTabs, deepTabs] = await Promise.all([
    loadCourseTabs(courseId, "visionary", mdxComponents),
    loadCourseTabs(courseId, "deep", mdxComponents),
  ]);

  // Serialize tab data for client (content stays as React elements)
  const serializeTabs = (tabs) => (tabs || []).map(t => ({
    id: t.slug,
    label: t.label,
    icon: t.icon,
    content: t.content,
  }));

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: meta.title,
    description: meta.description,
    provider: {
      "@type": "Organization",
      name: "Re³",
      url: "https://re3.live",
    },
    educationalLevel: meta.difficulty,
    timeRequired: `PT${meta.timeMinutes}M`,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${meta.timeMinutes}M`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseShell
        courseId={courseId}
        meta={meta}
        visionaryTabs={serializeTabs(visionaryTabs)}
        deepTabs={serializeTabs(deepTabs)}
      />
    </>
  );
}
