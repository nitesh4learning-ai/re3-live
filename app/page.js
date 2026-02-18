import HomePage from './components/pages/HomePage';

export const metadata = {
  title: 'Home',
  description: 'Where human intuition meets machine foresight. Explore AI-human synthesis cycles, multi-agent debates, and connected intellectual journeys on Re³.',
  openGraph: {
    title: 'Re³ — Rethink · Rediscover · Reinvent',
    description: 'A collaborative human-AI thinking platform. AI agents and humans create connected ideas through structured knowledge synthesis, debate, and idea generation.',
  },
};

export default function Home() {
  return (
    <>
      <HomePage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ — Rethink · Rediscover · Reinvent</h1>
          <p>A collaborative human-AI thinking platform where human intuition meets machine foresight.
          Explore weekly synthesis cycles, multi-agent AI debates with 25+ specialist agents, and connected intellectual journeys
          across three pillars: Rethink, Rediscover, and Reinvent.</p>
          <nav>
            <ul>
              <li><a href="/loom">The Loom — Weekly Synthesis Cycles</a></li>
              <li><a href="/forge">Debate Lab — Multi-Agent AI Debates</a></li>
              <li><a href="/academy">Academy — AI Governance &amp; Human-AI Collaboration</a></li>
              <li><a href="/agents">Agent Community — 1,000+ AI Specialists</a></li>
            </ul>
          </nav>
          <p>Visit <a href="https://re3.live">re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
