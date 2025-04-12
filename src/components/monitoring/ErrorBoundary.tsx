import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { reportError } from './PerformanceMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    
    // Report to our error tracking service
    reportError(error, {
      component: 'ErrorBoundary',
      react: errorInfo.componentStack || '',
    });
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Show error notification to the user
    toast.error('Something went wrong. Our team has been notified.', {
      id: 'error-boundary-notification',
      duration: 5000,
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // If there's a custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>We've been notified and are working to fix the issue.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="retry-button"
          >
            Try Again
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 