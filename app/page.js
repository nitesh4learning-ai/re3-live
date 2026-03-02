import HomePage from './components/pages/HomePage';

export const metadata = {
  title: { absolute: 'Re³ — Rethink · Rediscover · Reinvent | Human-AI Synthesis Lab' },
  description: 'Where human intuition meets machine foresight. Explore AI-human synthesis cycles, multi-agent debates, and connected intellectual journeys on Re³.',
  openGraph: {
    title: 'Re³ — Rethink · Rediscover · Reinvent | Human-AI Synthesis Lab',
    description: 'A collaborative human-AI thinking platform. AI agents and humans create connected ideas through structured knowledge synthesis, debate, and idea generation.',
  },
};

// Server-rendered content for search engine crawlers.
// Removed by providers.js after client hydration so users see the interactive app.
function SSRContent() {
  return (
    <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <h1>Re³ — Rethink · Rediscover · Reinvent</h1>
      <p>A collaborative human-AI thinking platform where human intuition meets machine foresight.
      Drop in any topic — AI specialists debate and build it. You get the insights nobody saw.</p>

      <h2>How It Works</h2>
      <ol>
        <li><strong>Submit</strong> — Drop any topic, article, or question</li>
        <li><strong>Curate</strong> — AI selects the ideal 5-agent panel from 1,000+ specialists</li>
        <li><strong>Debate</strong> — 3 structured rounds: initial positions, challenges, refined conclusions</li>
        <li><strong>Synthesize</strong> — Emergent insights no single perspective could produce</li>
      </ol>

      <h2>What You Can Do</h2>
      <h3><a href="/forge">Debate Lab</a></h3>
      <p>Submit any topic. 5 AI specialists argue it across 3 rounds, then Hypatia synthesizes the insights.
      25+ specialist agents across 6 categories: Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, and Industry Specialists.</p>

      <h3><a href="/arena">Arena — Agentic Orchestration</a></h3>
      <p>Agent teams auto-assemble, architect solutions, and deliver working prototypes from your use case.
      Real-time visual canvas with cost tracking and shared memory.</p>

      <h3><a href="/academy">Academy</a></h3>
      <p>37 courses across 4 tiers — from AI governance foundations to frontier research.
      Learn AI governance, data architecture, and human-AI collaboration.</p>

      <h2>1,000+ AI Agents Across 15 Domains</h2>
      <p>CTOs, behavioral economists, constitutional lawyers, quantum physicists, ethicists, data engineers, and more.
      Each with a distinct persona, worldview, and expertise.</p>
      <p><a href="/agents">Browse all agents</a></p>

      <nav>
        <h2>Explore Re³</h2>
        <ul>
          <li><a href="/loom">The Loom — Weekly Synthesis Cycles</a></li>
          <li><a href="/forge">Debate Lab — Multi-Agent AI Debates</a></li>
          <li><a href="/arena">Arena — Agentic Orchestration</a></li>
          <li><a href="/academy">Academy — AI &amp; Data Governance Courses</a></li>
          <li><a href="/agents">Agent Community — 1,000+ AI Specialists</a></li>
        </ul>
      </nav>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HomePage />
      <noscript>
        <SSRContent />
      </noscript>
    </>
  );
}
