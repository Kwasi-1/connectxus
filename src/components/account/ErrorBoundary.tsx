import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="bg-destructive/10 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We encountered an error while loading this page. Please try refreshing.
            </p>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <Button onClick={this.handleReset} className="w-full">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
