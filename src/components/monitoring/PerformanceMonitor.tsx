import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Performance thresholds in milliseconds
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay
  CLS: 0.1,   // Cumulative Layout Shift
  TTI: 3800,  // Time to Interactive
  FCP: 1800,  // First Contentful Paint
};

// Interface for performance metrics
interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTI?: number;
  FCP?: number;
  navigationTime?: number;
  resourceLoadTime?: number;
  memoryUsage?: number;
}

export function reportError(error: Error, context?: Record<string, string>) {
  console.error('Application error:', error, context);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example of sending to an API endpoint
    fetch('/api/error-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('Failed to report error:', err));
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [hasIssues, setHasIssues] = useState(false);

  useEffect(() => {
    // Collect basic performance metrics on mount
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        const collectNavigationMetrics = () => {
          const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navEntry) {
            setMetrics(prev => ({
              ...prev,
              navigationTime: navEntry.loadEventEnd - navEntry.startTime,
              FCP: navEntry.domContentLoadedEventStart - navEntry.startTime,
            }));
          }
        };

        // Collect resource timing
        const collectResourceMetrics = () => {
          const resourceEntries = performance.getEntriesByType('resource');
          const totalResourceTime = resourceEntries.reduce(
            (total, entry) => total + entry.duration,
            0
          );
          
          setMetrics(prev => ({
            ...prev,
            resourceLoadTime: totalResourceTime,
          }));
        };

        // Memory usage if available
        const collectMemoryMetrics = () => {
          if (performance && 'memory' in performance) {
            const memory = (performance as any).memory;
            setMetrics(prev => ({
              ...prev,
              memoryUsage: memory?.usedJSHeapSize,
            }));
          }
        };

        // Load web-vitals library dynamically if needed
        const collectWebVitals = async () => {
          try {
            // This would typically use dynamic import, but simplified for this example
            // const webVitals = await import('web-vitals');
            // webVitals.getLCP((metric) => setMetrics(prev => ({ ...prev, LCP: metric.value })));
            // webVitals.getFID((metric) => setMetrics(prev => ({ ...prev, FID: metric.value })));
            // webVitals.getCLS((metric) => setMetrics(prev => ({ ...prev, CLS: metric.value })));
            // webVitals.getTTFB((metric) => setMetrics(prev => ({ ...prev, TTFB: metric.value })));
          } catch (error) {
            console.error('Failed to load web-vitals:', error);
          }
        };

        // Execute all collectors
        collectNavigationMetrics();
        collectResourceMetrics();
        collectMemoryMetrics();
        collectWebVitals();

        // Setup ongoing monitoring
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Check for long tasks (potential UI blocking)
            if (entry.entryType === 'longtask' && entry.duration > 50) {
              console.warn('Long task detected:', entry.duration, 'ms');
              
              if (entry.duration > 100) {
                toast.error('The application is experiencing performance issues', {
                  id: 'performance-warning',
                  duration: 3000,
                });
              }
            }
          });
        });
        
        // Observe long tasks
        observer.observe({ entryTypes: ['longtask'] });
        
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        if (error instanceof Error) {
          reportError(error, { component: 'PerformanceMonitor' });
        }
      }
    }
  }, []);

  // Check for performance issues and warn if needed
  useEffect(() => {
    const checkPerformanceIssues = () => {
      const issues = [];
      
      if (metrics.LCP && metrics.LCP > PERFORMANCE_THRESHOLDS.LCP) {
        issues.push(`Slow content loading (LCP: ${Math.round(metrics.LCP)}ms)`);
      }
      
      if (metrics.FID && metrics.FID > PERFORMANCE_THRESHOLDS.FID) {
        issues.push(`Poor input responsiveness (FID: ${Math.round(metrics.FID)}ms)`);
      }
      
      if (metrics.navigationTime && metrics.navigationTime > 5000) {
        issues.push(`Slow page load (${Math.round(metrics.navigationTime)}ms)`);
      }
      
      if (issues.length > 0) {
        setHasIssues(true);
        
        // Report to analytics in production
        if (process.env.NODE_ENV === 'production') {
          fetch('/api/performance-log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              metrics,
              issues,
              timestamp: new Date().toISOString(),
            }),
          }).catch(err => console.error('Failed to log performance issues:', err));
        }
      }
    };
    
    if (Object.keys(metrics).length > 0) {
      checkPerformanceIssues();
    }
  }, [metrics]);

  // This component doesn't render anything visible
  return null;
} 