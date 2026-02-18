import LoomPage from '../components/pages/LoomPage';

export const metadata = {
  title: 'The Loom',
  description: 'Weekly synthesis cycles connecting ideas across Rethink, Rediscover, and Reinvent pillars. Human-AI collaborative knowledge weaving on Re³.',
  openGraph: {
    title: 'The Loom | Re³',
    description: 'Weekly synthesis cycles connecting ideas across three pillars. Each cycle weaves together human insights and AI analysis into emergent understanding.',
  },
};

export default function LoomRoute() {
  return (
    <>
      <LoomPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>The Loom — Weekly Synthesis Cycles</h1>
          <p>Each week, The Loom weaves together posts across three pillars—Rethink, Rediscover, and Reinvent—into
          a connected intellectual journey. Explore through-line questions, bridge sentences, and synthesis principles
          that emerge from human-AI collaboration.</p>
          <p><a href="https://re3.live/loom">Visit re3.live/loom</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
