# v1.80 — Private Deployment + Real Secrets Environment Wiring

## Added

- `src/lib/server/deploymentReadiness.ts`
- `app/api/deployment/readiness/route.ts`
- `src/components/deployment/PrivateDeploymentPanel.tsx`
- UI integration in `DashboardShell`
- private deployment runbook
- security docs and checks

## Purpose

Make the real Telegram/Supabase deployment path explicit without ever hardcoding secrets.
