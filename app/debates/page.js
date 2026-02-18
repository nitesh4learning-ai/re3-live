import DebatesPage from '../components/pages/DebatesPage';

export const metadata = {
  title: 'Debates',
  description: 'Browse past multi-agent AI debate sessions on Re³. Explore how 25+ specialist agents analyze topics through structured 3-round discussions.',
};

export default function DebatesRoute() {
  return (
    <>
      <DebatesPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Debates on Re³</h1>
          <p>Browse past multi-agent AI debate sessions. See how specialist agents analyze topics
          through structured 3-round discussions, with synthesis and moderation by orchestrator agents.</p>
          <p><a href="/forge">Start a new debate</a> | <a href="https://re3.live">Visit re3.live</a></p>
        </div>
      </noscript>
    </>
  );
}
