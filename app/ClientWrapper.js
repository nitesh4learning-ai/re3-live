"use client";
// Client-side wrapper that provides AppProvider + AppShell around all routes.
// This is imported by layout.js (server component) to add client-side state.
import './globals.css';
import { AppProvider } from './providers';
import AppShell from './components/shared/AppShell';

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <AppShell>
        {children}
      </AppShell>
    </AppProvider>
  );
}
