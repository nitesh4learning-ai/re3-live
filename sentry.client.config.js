import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only initialize if DSN is configured (skip in dev without DSN)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sample 10% of transactions for performance monitoring (keep costs low)
  tracesSampleRate: 0.1,

  // Don't capture session replays by default (expensive)
  replaysSessionSampleRate: 0,

  // Capture replay on every error for debugging context
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop",
    // Network errors users cause by navigating away
    "AbortError",
    "Failed to fetch",
    "Load failed",
  ],
});
