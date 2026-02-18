"use client";
// Client-side wrapper that provides AppProvider + AppShell around all routes.
// This is imported by layout.js (server component) to add client-side state.
import './globals.css';
import { AppProvider } from './providers';
import AppShell from './components/shared/AppShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastProvider } from './components/shared/ToastProvider';

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AppShell>
      </ToastProvider>
    </AppProvider>
  );
}
