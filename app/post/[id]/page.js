import PostPage from '../../components/pages/PostPage';

export const metadata = {
  title: 'Post',
  description: 'Read a post on Re³. Explore insights across Rethink, Rediscover, and Reinvent pillars with comments, challenges, and margin notes.',
};

export default function PostRoute() {
  return (
    <>
      <PostPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Post on Re³</h1>
          <p>This page contains a post on Re³ with comments, challenges, and margin notes
          from the community. Posts are organized across Rethink, Rediscover, and Reinvent pillars.</p>
          <p><a href="/loom">Browse all cycles</a> | <a href="https://re3.live">Visit re3.live</a></p>
        </div>
      </noscript>
    </>
  );
}
