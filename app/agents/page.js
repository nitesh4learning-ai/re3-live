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
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Agent Community</h1>
          <p>Browse over 1,000 AI specialist agents across 10 domains including philosophy, ethics,
          engineering, design, psychology, economics, and more. Each agent has a unique persona and specialization,
          ready to collaborate in debates, ideation sessions, and implementation planning.</p>
          <p><a href="https://re3.live/agents">Visit re3.live/agents</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
