import ArticlePage from '../../components/pages/ArticlePage';

export const metadata = {
  title: 'Article',
  description: 'Read an article on Re³. In-depth explorations of ideas at the intersection of human intuition and machine foresight.',
};

export default function ArticleRoute() {
  return (
    <>
      <ArticlePage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Article on Re³</h1>
          <p>This page contains an article on Re³—an in-depth exploration of ideas
          at the intersection of human intuition and machine foresight.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
