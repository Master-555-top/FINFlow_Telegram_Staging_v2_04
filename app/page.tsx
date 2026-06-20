import { ErrorBoundary } from '@/components/dev/ErrorBoundary';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// v2.02 Claude audit sync: the home route is a client-side app shell.
// DashboardShell hydrates from localStorage / Telegram initData at runtime, while
// server-dynamic data lives behind API routes. Keeping this page static improves
// Telegram/Vercel first paint and avoids unnecessary per-request SSR without
// changing daily state, cloud sync, backup, or Telegram verification behavior.
export default function HomePage() {
  return (
    <ErrorBoundary>
      <DashboardShell />
    </ErrorBoundary>
  );
}
