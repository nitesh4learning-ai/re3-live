"use client";
// Client-side wrapper that provides AppProvider + AppShell around all routes.
// This is imported by layout.js (server component) to add client-side state.
import { useEffect } from 'react';
import './globals.css';
import { AppProvider } from './providers';
import AppShell from './components/shared/AppShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastProvider, useToast } from './components/shared/ToastProvider';

// Listens for cross-tab conflict events from providers.js and shows a toast
function ConflictNotifier() {
  const { toast } = useToast();
  useEffect(() => {
    const handler = () => toast("Content updated from another tab", "info");
    window.addEventListener("re3:conflict", handler);
    return () => window.removeEventListener("re3:conflict", handler);
  }, [toast]);
  return null;
}

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <ToastProvider>
        <ConflictNotifier />
        <AppShell>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AppShell>
      </ToastProvider>
    </AppProvider>
  );
}
