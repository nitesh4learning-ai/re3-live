import AcademyPage from '../components/pages/AcademyPage';

export const metadata = {
  title: 'Academy',
  description: 'Learn AI governance, data architecture, and human-AI collaboration through structured courses on Re³. Four tiers from fundamentals to advanced implementation.',
  openGraph: {
    title: 'Academy | Re³',
    description: 'Structured courses on AI governance, data architecture, and human-AI collaboration. From fundamentals to advanced implementation.',
  },
};

export default function AcademyRoute() {
  return (
    <>
      <AcademyPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Re³ Academy</h1>
          <p>Structured courses on AI governance, data architecture, and human-AI collaboration.
          Four learning tiers from fundamentals to advanced implementation, covering topics like
          responsible AI development, multi-agent systems, and collaborative intelligence.</p>
          <p><a href="https://re3.live/academy">Visit re3.live/academy</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
