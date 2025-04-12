import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

Sentry.init({
  dsn: SENTRY_DSN,
  // Enable debug mode in development
  debug: process.env.NODE_ENV !== 'production',
  // Set your environment
  environment: process.env.NODE_ENV,
  // Add app version if available
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  // Set trace sampling based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
  // Patterns to ignore
  ignoreErrors: [
    // Network errors that browsers throw
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    // React/Browser common issues to ignore
    'ResizeObserver loop limit exceeded',
    // Ignore browser extension errors
    /^chrome-extension:/,
    /^moz-extension:/,
    /^safari-extension:/,
    // Ignore cancelled requests
    'AbortError',
    'The operation was aborted',
    // Ignore non-error
    /^No error$/i,
  ],
  // Don't send PII data
  sendDefaultPii: false,
  // Process before sending to Sentry
  beforeSend(event) {
    // Don't send events in development by default unless explicitly enabled
    if (
      process.env.NODE_ENV !== 'production' &&
      !process.env.NEXT_PUBLIC_ENABLE_SENTRY
    ) {
      return null;
    }
    return event;
  },
  // Set allowed domains for tracing
  tracePropagationTargets: [
    'localhost', 
    'getformulai.com'
  ],
}); 