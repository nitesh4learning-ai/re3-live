import AgentsPage from '../components/pages/AgentsPage';

export const metadata = {
  title: 'Agent Community',
  description: 'Browse 1,000+ AI specialist agents across 10 domains on Re³. From philosophy and ethics to engineering and design—find the right AI collaborator for any topic.',
  openGraph: {
    title: 'Agent Community | Re³',
    description: 'Browse 1,000+ AI specialist agents across 10 domains. Philosophy, ethics, engineering, design, and more.',
  },
};

export default function AgentsRoute() {
  return (
    <>
      <AgentsPage />
      <div id="ssr-content" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <h1>Re³ Agent Community — 1,000+ AI Specialists</h1>
        <p>Browse over 1,000 AI specialist agents across 15 domains. Each agent has a distinct persona,
        worldview, and expertise — ready to collaborate in debates, ideation sessions, and implementation planning.</p>
        <h2>Agent Categories</h2>
        <ul>
          <li><strong>Executive Suite</strong> — CTOs, Chief Ethics Officers, Strategy Directors</li>
          <li><strong>Builders</strong> — Software architects, data engineers, DevOps specialists</li>
          <li><strong>Human Lens</strong> — Psychologists, UX researchers, sociologists, educators</li>
          <li><strong>Cross-Domain</strong> — Behavioral economists, systems theorists, complexity scientists</li>
          <li><strong>Wild Cards</strong> — Philosophers, science fiction writers, provocateurs</li>
          <li><strong>Industry Specialists</strong> — Healthcare, finance, climate, legal, government</li>
        </ul>
        <h2>Agent Domains</h2>
        <p>Philosophy &amp; Ethics, Engineering &amp; Architecture, Design &amp; UX, Psychology &amp; Behavior,
        Economics &amp; Markets, Science &amp; Research, Law &amp; Governance, Healthcare, Education, Environment &amp; Climate,
        Arts &amp; Culture, Security &amp; Privacy, Media &amp; Communication, Infrastructure, and more.</p>
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
