import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { trackError } from '@/lib/analytics';
import { captureError } from '@/lib/errorMonitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Report to error monitoring
    captureError(error, {
      type: 'react-error-boundary',
      componentStack: errorInfo.componentStack
    });
    
    // Track for analytics
    trackError('ReactComponentError', error.message);
    
    // Notify the user
    toast.error('Something went wrong. Our team has been notified.');
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 mx-auto my-8 max-w-2xl bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            We've been notified and will fix this issue as soon as possible.
          </p>
          <p className="text-sm text-red-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 