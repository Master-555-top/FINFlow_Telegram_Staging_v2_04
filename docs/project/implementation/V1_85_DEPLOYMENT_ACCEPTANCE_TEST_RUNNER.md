# v1.85 — Deployment Acceptance Test Runner Draft

## Added

- `src/lib/deployment/deploymentAcceptanceTestRunner.ts`
- `src/components/deployment/DeploymentAcceptanceTestRunnerPanel.tsx`
- safe route runner for deployment/supabase/telegram/cloud read-preview checks
- manual status controls for cloud save/conflict/RLS checks
- local persistence of results in browser localStorage

## Safety

No automatic cloud writes are performed.
