import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('eduflix_'))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* noop */ }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-white text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-1">
              An unexpected error occurred. Your data is safe.
            </p>
            {this.state.error && (
              <p className="text-gray-600 text-xs mb-6 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#E50914] text-white font-bold rounded-lg hover:bg-[#f6121d] transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset App State
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
