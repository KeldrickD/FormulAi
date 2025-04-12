import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

Sentry.init({
  dsn: SENTRY_DSN,
  // Set trace sampling based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
  // Enable debug mode in development
  debug: process.env.NODE_ENV !== 'production',
  // Set your environment
  environment: process.env.NODE_ENV,
  // Add app version if available
  release: process.env.NEXT_PUBLIC_APP_VERSION,
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