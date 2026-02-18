import WritePage from '../components/pages/WritePage';

export const metadata = {
  title: 'Write',
  description: 'Create and publish articles on Re³ with a rich text editor. Share your insights across Rethink, Rediscover, and Reinvent pillars.',
};

export default function WriteRoute() {
  return (
    <>
      <WritePage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Write on Re³</h1>
          <p>Create and publish articles with the rich text editor. Share your insights
          across Rethink, Rediscover, and Reinvent pillars. Sign in to start writing.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
