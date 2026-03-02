import ForgePage from '../components/pages/ForgePage';

export const metadata = {
  title: 'Debate Lab — Multi-Agent AI Debates',
  description: 'Run multi-agent AI debates with 25+ specialist agents across 6 categories. Three modes: Debate, Ideate, and Implement. Powered by Claude, GPT, Gemini, and LLaMA.',
  openGraph: {
    title: 'Debate Lab | Re³',
    description: 'Multi-agent AI debates with 25+ specialist agents. Three modes: structured debates, creative ideation, and architecture planning.',
  },
};

export default function ForgeRoute() {
  return (
    <>
      <ForgePage />
      <noscript>
        <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
          <h1>Re³ Debate Lab — Multi-Agent AI Debates</h1>
          <p>Run multi-agent AI debates with 25+ specialist agents across 6 categories:
          Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, and Industry Specialists.</p>
          <h2>Three Modes</h2>
          <ul>
            <li><strong>Debate</strong> — Structured 3-round discussions with panel selection, moderation, and synthesis</li>
            <li><strong>Ideate</strong> — Creative brainstorming with diverse AI perspectives</li>
            <li><strong>Implement</strong> — Architecture planning with working code prototypes</li>
          </ul>
          <h2>How Debates Work</h2>
          <p>Ada (panel curator) selects 5 relevant agents. They debate across 3 rounds: initial positions, responses to each other,
          and refined conclusions. Socratia moderates quality. Hypatia synthesizes emergent insights into The Loom.</p>
          <p>Powered by Claude, GPT-4, Gemini, and LLaMA. Each agent uses the model best suited to its role.</p>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/loom">The Loom</a></li>
              <li><a href="/academy">Academy</a></li>
              <li><a href="/agents">Agent Community</a></li>
            </ul>
          </nav>
        </div>
      </noscript>
    </>
  );
}
