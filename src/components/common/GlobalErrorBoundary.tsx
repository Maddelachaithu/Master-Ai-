import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by GlobalErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e1224] border border-rose-500/30 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                MASTER AI encountered an unexpected client error. Your stored session and profile data remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-mono text-rose-300 text-left truncate">
                {this.state.error.message || 'Unknown Application Error'}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleReset}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="glow"
                size="md"
                onClick={this.handleReload}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload App
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
