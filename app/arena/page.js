import ArenaPage from '../components/pages/ArenaPage';

export const metadata = {
  title: 'Arena — Agentic Orchestration',
  description: 'Submit a use case and watch a team of specialist AI agents assemble, coordinate, and deliver. Real-time visual canvas with cost tracking.',
  openGraph: {
    title: 'Arena | Re³',
    description: 'Agentic orchestration — specialist AI agents assemble, coordinate, and deliver on your use case.',
  },
};

export default function ArenaRoute() {
  return (
    <>
      <ArenaPage />
      <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <h1>Re³ Arena — Agentic Orchestration</h1>
        <p>Submit a use case and watch a team of specialist AI agents assemble, coordinate, and deliver.
        Real-time visual canvas with cost tracking and a blackboard shared memory system.</p>
        <h2>How the Arena Works</h2>
        <ul>
          <li><strong>Submit</strong> — Describe your use case, problem, or project idea</li>
          <li><strong>Assemble</strong> — AI automatically selects the right team of specialist agents</li>
          <li><strong>Orchestrate</strong> — Agents coordinate through a shared blackboard, building on each other's work</li>
          <li><strong>Deliver</strong> — Get a structured deliverable: architecture, analysis, prototype, or strategy</li>
        </ul>
        <p>Features real-time event streaming, guardrails for quality, and transparent cost tracking per agent.</p>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/forge">Debate Lab</a></li>
            <li><a href="/loom">The Loom</a></li>
            <li><a href="/academy">Academy</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
