import AtlasPage from '../components/pages/AtlasPage';

export const metadata = {
  title: { absolute: 'The Atlas — Re³' },
  description: 're3.live as a knowledge graph — the whole codebase, its modules and dependencies, and the agent code itself, regenerated automatically on every merge to main.',
};

export default function AtlasRoute() {
  return (
    <>
      <AtlasPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>The Atlas — re3.live, mapped</h1>
          <p>re3.live framed as one knowledge graph — every module, every dependency, and the agent
          code itself, regenerated automatically on every merge to main.</p>
          <p><a href="/atlas-graph.html">Open the live interactive knowledge graph</a>.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
