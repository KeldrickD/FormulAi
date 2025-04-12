import * as Sentry from '@sentry/nextjs';
import { toast } from 'react-hot-toast';

// Configuration
interface MonitoringConfig {
  dsn: string;
  environment: string;
  release?: string;
  debug?: boolean;
  tracesSampleRate?: number;
  ignoreErrors?: (string | RegExp)[];
}

// Default config - replace with actual values from environment variables
const defaultConfig: MonitoringConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  debug: process.env.NODE_ENV !== 'production',
  tracesSampleRate: 1.0,
  ignoreErrors: [
    // Add patterns for errors you want to ignore
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^No error$/i,
  ]
};

// Track if Sentry is initialized
let isSentryInitialized = false;

// Breadcrumb interface for tracking user actions
export interface Breadcrumb {
  type: 'navigation' | 'ui' | 'error' | 'http' | 'info';
  category: string;
  message: string;
  data?: Record<string, any>;
  timestamp: number;
}

// Store breadcrumbs for context when errors occur
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 50;

/**
 * Initialize error monitoring with Sentry
 */
export const initErrorMonitoring = (config: Partial<MonitoringConfig> = {}): void => {
  if (typeof window === 'undefined') return;
  
  const finalConfig = { ...defaultConfig, ...config };
  
  // Only initialize if we have a DSN and we're not in development
  if (!finalConfig.dsn || (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_SENTRY)) {
    console.warn('Sentry monitoring disabled: No DSN provided or in development environment');
    return;
  }
  
  try {
    Sentry.init({
      dsn: finalConfig.dsn,
      environment: finalConfig.environment,
      release: finalConfig.release,
      debug: finalConfig.debug,
      tracesSampleRate: finalConfig.tracesSampleRate,
      ignoreErrors: finalConfig.ignoreErrors,
      beforeSend(event: Sentry.Event) {
        // You can modify or filter events before they're sent to Sentry
        return event;
      },
    });
    
    isSentryInitialized = true;
    
    // Add global error handlers
    window.addEventListener('error', captureUnhandledError);
    window.addEventListener('unhandledrejection', captureUnhandledRejection);
    
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Capture and report an error to Sentry
 */
export const captureError = (
  error: Error | string,
  context: Record<string, any> = {}
): void => {
  try {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    console.error('Captured error:', errorObj, context);
    
    // Add breadcrumbs as context
    const errorContext = {
      ...context,
      breadcrumbs: [...breadcrumbs]
    };
    
    // Send to Sentry if initialized
    if (isSentryInitialized) {
      Sentry.withScope((scope: Sentry.Scope) => {
        // Add extra context to the error
        Object.entries(errorContext).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        
        // Set user context if available
        if (context.user) {
          scope.setUser(context.user);
        }
        
        // Set tag if available
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, String(value));
          });
        }
        
        // Capture the exception
        Sentry.captureException(errorObj);
      });
    }
    
    // Optionally show a toast notification for user errors
    if (context.showToast) {
      toast.error(context.userMessage || 'An error occurred. Our team has been notified.');
    }
  } catch (captureError) {
    console.error('Error in captureError:', captureError);
  }
};

/**
 * Capture a message with a specific severity level
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context: Record<string, any> = {}
): void => {
  console.log(`[${level}] ${message}`, context);
  
  if (isSentryInitialized) {
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setLevel(level);
      
      // Add extra context to the message
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      
      Sentry.captureMessage(message);
    });
  }
};

/**
 * Capture unhandled window errors
 */
const captureUnhandledError = (event: ErrorEvent): void => {
  event.preventDefault();
  captureError(
    event.error || new Error(event.message),
    {
      source: 'unhandled error',
      showToast: true,
      url: window.location.href,
      userMessage: 'Something went wrong. Please try again or refresh the page.'
    }
  );
};

/**
 * Capture unhandled promise rejections
 */
const captureUnhandledRejection = (event: PromiseRejectionEvent): void => {
  event.preventDefault();
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  
  captureError(error, {
    source: 'unhandled rejection',
    showToast: true,
    url: window.location.href,
    userMessage: 'Something went wrong. Please try again or refresh the page.'
  });
};

/**
 * Leave a breadcrumb to track user actions leading up to an error
 */
export const leaveBreadcrumb = (
  message: string,
  data?: Record<string, any>,
  type: Breadcrumb['type'] = 'info',
  category = 'custom'
): void => {
  const breadcrumb: Breadcrumb = {
    type,
    category,
    message,
    data,
    timestamp: Date.now()
  };
  
  breadcrumbs.push(breadcrumb);
  
  // Keep only the most recent breadcrumbs
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
  
  // Also add to Sentry breadcrumbs
  if (isSentryInitialized) {
    Sentry.addBreadcrumb({
      type,
      category,
      message,
      data,
      level: 'info'
    });
  }
};

/**
 * Set user information for error context
 */
export const setUserInfo = (
  userId?: string,
  email?: string,
  username?: string
): void => {
  if (!userId && !email && !username) return;
  
  const userInfo = {
    ...(userId && { id: userId }),
    ...(email && { email }),
    ...(username && { username })
  };
  
  leaveBreadcrumb('Set user info', userInfo, 'info', 'user');
  
  if (isSentryInitialized) {
    Sentry.setUser(userInfo);
  }
};

/**
 * Clear user information
 */
export const clearUserInfo = (): void => {
  leaveBreadcrumb('Clear user info', {}, 'info', 'user');
  
  if (isSentryInitialized) {
    Sentry.setUser(null);
  }
};

/**
 * Start performance tracking for an operation
 */
export const startPerformanceTracking = (
  operation: string,
  data: Record<string, any> = {}
): { finish: () => number } => {
  const startTime = performance.now();
  
  leaveBreadcrumb(
    `Started: ${operation}`,
    data,
    'info',
    'performance'
  );
  
  let transaction: Sentry.Transaction | undefined;
  if (isSentryInitialized) {
    transaction = Sentry.startTransaction({
      name: operation,
      data
    });
  }
  
  return {
    finish: () => {
      const duration = performance.now() - startTime;
      
      leaveBreadcrumb(
        `Completed: ${operation}`,
        { ...data, duration: `${duration.toFixed(2)}ms` },
        'info',
        'performance'
      );
      
      if (transaction) {
        transaction.finish();
      }
      
      captureMessage(
        `Performance: ${operation} took ${duration.toFixed(2)}ms`,
        'debug',
        { ...data, duration }
      );
      
      return duration;
    }
  };
};

// Clean up function to remove event listeners
export const cleanupErrorMonitoring = (): void => {
  if (typeof window === 'undefined') return;
  
  window.removeEventListener('error', captureUnhandledError);
  window.removeEventListener('unhandledrejection', captureUnhandledRejection);
}; 