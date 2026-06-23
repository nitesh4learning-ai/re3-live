import StudioPage from '../components/pages/StudioPage';

export const metadata = {
  title: 'The Studio',
  description: 'Everything Nitesh Srivastava has delivered and thought about — the systems, the work, and the frameworks, in one place.',
};

export default function StudioRoute() {
  return (
    <>
      <StudioPage />
      <noscript>
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1>The Studio</h1>
          <p>Everything Nitesh Srivastava has delivered and thought about — the systems, the work,
          and the frameworks, in one place.</p>
          <p><a href="https://re3.live">Visit re3.live</a> with JavaScript enabled for the full experience.</p>
        </div>
      </noscript>
    </>
  );
}
