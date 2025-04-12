# Error Monitoring with Sentry

This project implements error monitoring using [Sentry](https://sentry.io/), a robust error tracking service that helps identify, track and fix errors in real-time.

## Setup

1. **Install Sentry packages**:
   ```bash
   npm install @sentry/nextjs
   ```

2. **Environment Configuration**:
   Add the following to your `.env.local` file:
   ```
   # Required - Sentry DSN from your Sentry project
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-from-sentry.io

   # Optional - Enable Sentry in development (default is disabled)
   # NEXT_PUBLIC_ENABLE_SENTRY=true

   # Optional - Set app version for tracking
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Sentry is auto-initialized** using the configuration files:
   - `sentry.client.config.ts` (for browser)
   - `sentry.server.config.ts` (for server)

## Usage

### Basic Error Capture

```typescript
import { captureError } from '@/lib/errorMonitoring';

try {
  // Your code that might throw an error
} catch (error) {
  captureError(error, {
    // Optional context data
    showToast: true, // Shows a toast message to user
    userMessage: 'Custom error message to display to user'
  });
}
```

### Capture Messages

```typescript
import { captureMessage } from '@/lib/errorMonitoring';

// Log an informational message
captureMessage('User completed onboarding', 'info', { userId: 'user123' });

// Log a warning
captureMessage('API rate limit approaching', 'warning', { endpoint: '/api/data' });
```

### User Context

```typescript
import { setUserInfo, clearUserInfo } from '@/lib/errorMonitoring';

// When user logs in
setUserInfo('user-123', 'user@example.com', 'username');

// When user logs out
clearUserInfo();
```

### Performance Tracking

```typescript
import { startPerformanceTracking } from '@/lib/errorMonitoring';

const operation = startPerformanceTracking('dataProcessing', { 
  fileSize: '5MB', 
  recordCount: 1000 
});

// Process data...

// When operation completes
const duration = operation.finish(); // Returns duration in ms
console.log(`Operation took ${duration}ms`);
```

### Adding Breadcrumbs

```typescript
import { leaveBreadcrumb } from '@/lib/errorMonitoring';

// Track user actions for context if an error occurs later
leaveBreadcrumb('Clicked save button', { documentId: 'doc-123' }, 'ui', 'interaction');
leaveBreadcrumb('API request', { endpoint: '/api/save', method: 'POST' }, 'http', 'api');
```

## Error Boundary

The project includes a React Error Boundary component to catch and report errors in React components:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function MyApp() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Configuration

You can modify the error monitoring behavior by editing:
- `src/lib/errorMonitoring.ts` - Core monitoring functionality
- `sentry.client.config.ts` - Browser-specific settings
- `sentry.server.config.ts` - Server-specific settings

### Ignoring Errors

To ignore specific errors from being reported to Sentry, add patterns to the `ignoreErrors` array in the Sentry configuration files.

## Best Practices

1. **Provide Context**: Always add relevant context data when capturing errors
2. **Use Breadcrumbs**: Leave breadcrumbs for important user actions to trace what led to an error
3. **Don't Capture PII**: Avoid capturing personally identifiable information
4. **Use Appropriate Severity Levels**: Use the right severity level for messages
5. **Monitor Performance**: Track performance for critical operations

## Debugging

During development, Sentry is disabled by default. To enable it for testing:

1. Set `NEXT_PUBLIC_ENABLE_SENTRY=true` in your `.env.local` file
2. Check the browser console for Sentry initialization messages 