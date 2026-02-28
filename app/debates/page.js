import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Debates — The Loom',
  description: 'Browse past multi-agent AI debate sessions on Re³. Explore how 25+ specialist agents analyze topics through structured 3-round discussions.',
};

// Debates are now part of The Loom — redirect there
export default function DebatesRoute() {
  redirect('/loom');
}
