import ArenaPage from '../../components/pages/ArenaPage';

export const metadata = {
  title: 'Arena Run — Agentic Orchestration',
  description: 'View an agentic orchestration run. Real-time visual canvas with specialist AI agents coordinating to solve your use case.',
  openGraph: {
    title: 'Arena Run | Re³',
    description: 'Agentic orchestration run with specialist AI agents.',
  },
};

export default function ArenaRunRoute() {
  return (
    <>
      <ArenaPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Arena — Agentic Orchestration Run</h1>
          <p>This page shows an agentic orchestration run with specialist AI agents coordinating
          to solve a specific use case. Real-time visual canvas with cost tracking and shared memory.</p>
          <p><a href="https://re3.live/arena">Visit re3.live/arena</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
