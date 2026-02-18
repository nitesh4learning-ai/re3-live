import ForgePage from '../components/pages/ForgePage';

export const metadata = {
  title: 'Debate Lab',
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
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Debate Lab</h1>
          <p>Run multi-agent AI debates with 25+ specialist agents across 6 categories:
          Executive Suite, Builders, Human Lens, Cross-Domain, Wild Cards, and Industry Specialists.
          Three modes: Debate (structured 3-round discussions), Ideate (creative brainstorming),
          and Implement (architecture planning). Powered by Claude, GPT, Gemini, and LLaMA.</p>
          <p><a href="https://re3.live/forge">Visit re3.live/forge</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
