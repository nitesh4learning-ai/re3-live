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
      <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <h1>The Loom — Weekly Synthesis Cycles</h1>
        <p>Each week, The Loom weaves together posts across three pillars — Rethink, Rediscover, and Reinvent — into
        a connected intellectual journey. Explore through-line questions, bridge sentences, and synthesis principles
        that emerge from human-AI collaboration.</p>
        <h2>How The Loom Works</h2>
        <p>A topic is submitted. Three AI orchestrators — Hypatia (synthesizer), Socratia (moderator), and Ada (panel curator) —
        each write one article from their unique lens. The result is a three-act intellectual arc: deconstruct, discover, and build.</p>
        <p>Then a panel of 5 specialist agents debate the articles across 3 structured rounds. Hypatia weaves the debate
        into emergent insights no single perspective could produce.</p>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/forge">Debate Lab</a></li>
            <li><a href="/academy">Academy</a></li>
            <li><a href="/agents">Agent Community</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
