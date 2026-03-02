// Course loader for Academy 2.0
// Reads meta.json and MDX files from content/courses/{courseId}/
// Used at build time (server-side) for generateStaticParams and page rendering.

import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

const COURSES_DIR = path.join(process.cwd(), "content", "courses");

/**
 * Get all course IDs that have a meta.json file.
 * Used by generateStaticParams().
 */
export function getAllCourseIds() {
  if (!fs.existsSync(COURSES_DIR)) return [];
  return fs.readdirSync(COURSES_DIR).filter(dir => {
    const metaPath = path.join(COURSES_DIR, dir, "meta.json");
    return fs.existsSync(metaPath);
  });
}

/**
 * Read a course's meta.json.
 * Returns null if not found.
 */
export function getCourseMeta(courseId) {
  const metaPath = path.join(COURSES_DIR, courseId, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Get all course metadata objects for the hub page.
 */
export function getAllCourseMeta() {
  const ids = getAllCourseIds();
  return ids.map(id => ({ id, ...getCourseMeta(id) })).filter(Boolean);
}

/**
 * List MDX tab files for a course at a given depth.
 * Returns sorted array of { slug, filePath, order }.
 * Files are named like: 01-introduction.mdx, 02-tokens.mdx, etc.
 */
export function getCourseTabFiles(courseId, depth = "visionary") {
  const depthDir = path.join(COURSES_DIR, courseId, depth);
  if (!fs.existsSync(depthDir)) return [];

  return fs
    .readdirSync(depthDir)
    .filter(f => f.endsWith(".mdx"))
    .sort()
    .map(f => {
      const match = f.match(/^(\d+)-(.+)\.mdx$/);
      return {
        filename: f,
        slug: match ? match[2] : f.replace(".mdx", ""),
        order: match ? parseInt(match[1]) : 0,
        filePath: path.join(depthDir, f),
      };
    });
}

/**
 * Read and compile a single MDX tab file.
 * Returns { content (React element), frontmatter }.
 */
export async function compileCourseTab(courseId, depth, filename, components = {}) {
  const filePath = path.join(COURSES_DIR, courseId, depth, filename);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  try {
    const { content, frontmatter } = await compileMDX({
      source,
      options: { parseFrontmatter: true },
      components,
    });
    return { content, frontmatter };
  } catch (err) {
    // Log MDX compilation errors but don't fail the build.
    // Courses with broken MDX will show "Content Coming Soon" placeholder.
    console.warn(`[Academy2] MDX error in ${courseId}/${depth}/${filename}: ${err.message}`);
    return null;
  }
}

/**
 * Load all tabs for a course at a given depth.
 * Returns array of { slug, order, content, frontmatter }.
 */
export async function loadCourseTabs(courseId, depth = "visionary", components = {}) {
  const files = getCourseTabFiles(courseId, depth);
  const tabs = [];

  for (const file of files) {
    const result = await compileCourseTab(courseId, depth, file.filename, components);
    if (result) {
      tabs.push({
        slug: file.slug,
        order: file.order,
        label: result.frontmatter?.label || file.slug.replace(/-/g, " "),
        icon: result.frontmatter?.icon || "",
        content: result.content,
        frontmatter: result.frontmatter || {},
      });
    }
  }

  return tabs;
}
