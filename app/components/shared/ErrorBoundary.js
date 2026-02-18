"use client";
// React Error Boundary for catching render errors in page components.
// Must be a class component — React does not support error boundaries with hooks.
import { Component } from "react";
import { Re3Logo } from './Icons';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development
    console.error("[Re3 ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB", paddingTop: 56 }}>
          <div className="text-center p-8" style={{ maxWidth: 440 }}>
            <div className="mb-6"><Re3Logo variant="mark" size={48} /></div>
            <h2 className="font-bold mb-2" style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 20, color: "#111827" }}>
              Something went wrong
            </h2>
            <p className="mb-4" style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              An unexpected error occurred while rendering this page. You can try refreshing or navigating back.
            </p>
            {this.state.error && (
              <pre className="text-left p-3 rounded-xl mb-4 overflow-x-auto" style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                fontSize: 11, color: "#991B1B", lineHeight: 1.5, maxHeight: 120,
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md"
                style={{ background: "#9333EA", color: "white" }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ border: "1px solid #E5E7EB", color: "#6B7280" }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
