// Academy Layout — wraps all /academy/* pages
// Provides shared metadata and structure.

export const metadata = {
  title: {
    template: '%s — Re³ Academy',
    default: 'Re³ Academy — Learn AI by Doing',
  },
  description: 'Interactive AI courses from beginner to expert. Hands-on exercises for every concept.',
};

export default function AcademyLayout({ children }) {
  return children;
}
