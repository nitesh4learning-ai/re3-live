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
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Arena — Agentic Orchestration</h1>
          <p>Submit a use case and watch a team of specialist AI agents assemble, coordinate, and deliver.
          Features real-time visual canvas, cost tracking, and a blackboard shared memory system.</p>
          <p><a href="https://re3.live/arena">Visit re3.live/arena</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
