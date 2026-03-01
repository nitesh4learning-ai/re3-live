// Vitest global setup
// Ensure clean globalThis state for rate limiter tests
beforeEach(() => {
  delete globalThis.__re3_rate_limit_windows__;
  delete globalThis.__re3_rate_limit_cleanup__;
});
