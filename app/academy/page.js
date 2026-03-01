import AcademyPage from '../components/pages/AcademyPage';

export const metadata = {
  title: 'Academy',
  description: 'Learn AI governance, data architecture, and human-AI collaboration through structured courses on Re³. Four tiers from fundamentals to advanced implementation.',
  openGraph: {
    title: 'Academy | Re³',
    description: 'Structured courses on AI governance, data architecture, and human-AI collaboration. From fundamentals to advanced implementation.',
  },
};

export default function AcademyRoute() {
  return (
    <>
      <AcademyPage />
      <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <h1>Re³ Academy — AI Governance &amp; Human-AI Collaboration Courses</h1>
        <p>Structured courses on AI governance, data architecture, and human-AI collaboration.
        37 courses across 4 tiers — from fundamentals to frontier research.</p>
        <h2>Learning Tiers</h2>
        <ul>
          <li><strong>Tier 1: Foundations</strong> — Core concepts in AI governance, data ethics, and collaborative intelligence</li>
          <li><strong>Tier 2: Applied</strong> — Hands-on implementation of AI systems, multi-agent architectures, and decision frameworks</li>
          <li><strong>Tier 3: Advanced</strong> — Deep dives into frontier topics, research methodologies, and complex system design</li>
          <li><strong>Tier 4: Research</strong> — Cutting-edge exploration of emergent AI capabilities and governance challenges</li>
        </ul>
        <p>Topics include responsible AI development, multi-agent systems, collaborative intelligence,
        AI safety, data governance frameworks, and human-AI interaction design.</p>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/forge">Debate Lab</a></li>
            <li><a href="/loom">The Loom</a></li>
            <li><a href="/agents">Agent Community</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
