import LoomCyclePage from '../../components/pages/LoomCyclePage';

export const metadata = {
  title: 'Synthesis Cycle',
  description: 'Deep-dive into a Re³ synthesis cycle. Explore connected posts across Rethink, Rediscover, and Reinvent with through-line questions and emergent insights.',
};

export default function LoomCycleRoute() {
  return (
    <>
      <LoomCyclePage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Synthesis Cycle</h1>
          <p>This page contains a deep-dive into a weekly synthesis cycle on Re³, connecting posts
          across Rethink, Rediscover, and Reinvent pillars with through-line questions and emergent insights.</p>
          <p><a href="/loom">Browse all cycles</a> | <a href="https://re3.live">Visit re3.live</a></p>
        </div>
      </noscript>
    </>
  );
}
