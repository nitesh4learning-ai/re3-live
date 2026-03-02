import Link from "next/link";

export default function CourseNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFB' }}>
      <div className="text-center max-w-md px-4">
        <span style={{ fontSize: 64 }}>📚</span>
        <h1 className="font-bold mt-4 mb-2" style={{ fontSize: 24, color: '#111827', fontFamily: "'Inter',system-ui,sans-serif" }}>
          Course Not Found
        </h1>
        <p className="mb-6" style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>
          This course doesn't exist or hasn't been published yet.
        </p>
        <Link
          href="/academy"
          className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-md"
          style={{ background: '#9333EA', color: 'white' }}
        >
          Browse All Courses
        </Link>
      </div>
    </div>
  );
}
