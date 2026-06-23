import HomePage from './components/pages/HomePage';

export const metadata = {
  title: { absolute: 'Nitesh Srivastava — Re³ Lab' },
  description: 'Enterprise data & AI leader. Agentic systems, multi-agent orchestration, and the frameworks behind them — created, delivered, and thought about, in one studio.',
  openGraph: {
    title: 'Nitesh Srivastava — Re³ Lab',
    description: 'Enterprise data & AI leader. Agentic systems, multi-agent orchestration, and the frameworks behind them — created, delivered, and thought about, in one studio.',
  },
};

// Server-rendered content for search engine crawlers.
// Removed by providers.js after client hydration so users see the interactive app.
function SSRContent() {
  return (
    <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <h1>Nitesh Srivastava — Re³ Lab</h1>
      <p>Systems to think with. I make enterprise data trustworthy and governable — and build
      the agentic systems, and the frameworks behind them, that make AI legible at enterprise scale.
      Everything I&rsquo;ve delivered and thought about, converged in one studio.</p>
      <p><a href="/studio">Enter the Studio</a></p>

      <h2>Delivered</h2>
      <p>Live multi-agent systems, plus the bodies of work behind them.</p>
      <h3>Live systems</h3>
      <ul>
        <li><a href="/arena">The Arena</a> — agentic debate &amp; orchestration: agent teams auto-assemble, architect, and ship a working result from your use case.</li>
        <li><a href="/arena">Use-Case Orchestration Engine</a> — the pipeline inside the Arena: intake → decompose → assemble → execute → synthesize.</li>
        <li><a href="/agents">Agent Registry</a> — 1,000 specialist personas across 15 domains, the talent pool every orchestration draws from.</li>
      </ul>
      <h3>Bodies of work</h3>
      <ul>
        <li><a href="/work/context-as-a-frontier">Context as a Frontier</a> — a six-stage spine to derive one trusted, living source of truth (golden context) for humans and agents.</li>
        <li>The Agentic SDLC — how software delivery changes when agents do the building.</li>
        <li><a href="/academy">Agentic AI Mastery</a> — a structured 12-week curriculum, from agentic architecture to production.</li>
      </ul>

      <h2>Thought about</h2>
      <p>The frameworks underneath the work.</p>
      <ul>
        <li><a href="/academy">GIM — Governance Interaction Mesh</a> — a mesh-based model for enterprise AI governance across five pillars.</li>
        <li>The Pinwheel Framework — four execution blades powered by business engagement for enterprise AI adoption.</li>
        <li>CodeMesh — comprehend the system, codify its truth, compose what&rsquo;s next.</li>
      </ul>

      <nav>
        <h2>Explore the Re³ Lab</h2>
        <ul>
          <li><a href="/studio">The Studio — delivered work &amp; frameworks</a></li>
          <li><a href="/arena">The Arena — agentic orchestration</a></li>
          <li><a href="/academy">Academy — AI &amp; data governance courses</a></li>
          <li><a href="/agents">Agent Registry — 1,000 AI specialists</a></li>
          <li><a href="/work/context-as-a-frontier">Context as a Frontier — the golden-context spine</a></li>
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
