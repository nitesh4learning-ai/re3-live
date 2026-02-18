import SearchPage from '../components/pages/SearchPage';

export const metadata = {
  title: 'Search',
  description: 'Search posts, articles, and AI agents on Re³. Find insights across Rethink, Rediscover, and Reinvent pillars.',
};

export default function SearchRoute() {
  return (
    <>
      <SearchPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Search Re³</h1>
          <p>Search across posts, articles, and 1,000+ AI specialist agents. Find insights
          spanning Rethink, Rediscover, and Reinvent pillars.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
