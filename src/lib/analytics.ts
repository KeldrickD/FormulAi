import { toast } from 'react-hot-toast';

// Google Analytics Measurement ID - replace with your actual ID in production
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Only load GA in production or if explicitly enabled in development
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false, // We'll manually send page views
      });
      
      (window as any).gtag = gtag;
      console.log('Google Analytics initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

// Track page views
export const trackPageView = (url: string): void => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  try {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  try {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Track spreadsheet-related operations
export const trackSpreadsheetOperation = (operation: string, successful: boolean, details?: string): void => {
  trackEvent(
    operation,
    'Spreadsheet',
    details || (successful ? 'Success' : 'Failed'),
    successful ? 1 : 0
  );
};

// Track share actions with integration platforms
export const trackShareAction = (platform: string, successful: boolean): void => {
  trackEvent(
    'Share',
    'Integration',
    `${platform} - ${successful ? 'Success' : 'Failed'}`,
    successful ? 1 : 0
  );
};

// Track feedback submissions
export const trackFeedbackSubmission = (type: string, rating?: number): void => {
  trackEvent(
    'Submit Feedback',
    'Feedback',
    type,
    rating
  );
};

// Track user interactions with features
export const trackFeatureUsage = (feature: string, action: string, successful?: boolean): void => {
  trackEvent(
    action,
    'Feature Usage',
    `${feature} - ${successful !== undefined ? (successful ? 'Success' : 'Failed') : 'Attempted'}`,
    successful !== undefined ? (successful ? 1 : 0) : undefined
  );
};

// Track performance metrics
export const trackPerformance = (metricName: string, duration: number): void => {
  trackEvent(
    'Performance',
    'Metrics',
    metricName,
    Math.round(duration) // Round to nearest integer
  );
};

// Track errors for analytics (separate from error monitoring)
export const trackError = (errorType: string, message: string): void => {
  trackEvent(
    'Error',
    'Application',
    `${errorType}: ${message.substring(0, 100)}` // Limit length
  );
};

// Types for global window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
} 