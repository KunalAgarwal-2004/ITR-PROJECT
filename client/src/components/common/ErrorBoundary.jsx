import React from 'react';

/**
 * Catches render errors in a page so a crash shows the error instead of a blank screen.
 * Remount it with a changing `key` (e.g. the pathname) to reset after navigation.
 */
export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Page crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="max-w-xl mx-auto my-16 p-6 bg-surface-white border border-border rounded-md text-center shadow-card">
        <h2 className="text-lg font-bold text-content-primary mb-2">Something went wrong on this page</h2>
        <p className="text-xs text-content-muted mb-3">Please reload, or go back and try again.</p>
        <pre className="text-left text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-3 whitespace-pre-wrap break-words">
          {error?.message || String(error)}
        </pre>
      </div>
    );
  }
}

export default ErrorBoundary;
