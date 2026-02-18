import StudioPage from '../components/pages/StudioPage';

export const metadata = {
  title: 'My Studio',
  description: 'Your personal dashboard on Re³. Manage posts, articles, debate sessions, and track your contributions across Rethink, Rediscover, and Reinvent.',
};

export default function StudioRoute() {
  return (
    <>
      <StudioPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>My Studio</h1>
          <p>Your personal dashboard on Re³. Manage your posts, articles, and debate sessions.
          Sign in to access your studio.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
