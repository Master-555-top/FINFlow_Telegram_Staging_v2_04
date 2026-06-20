# v1.90 — Codex v1.87 Synchronization

## Added / merged

- `docs/project/codex/CODEX_COMPLETION_REPORT_v1_87.md`
- `docs/project/codex/00_FINFLOW_MASTER_CONTEXT_v1_87.md`
- `src/lib/backup/localBackupRestore.ts`
- `src/components/backup/LocalBackupRestorePanel.tsx`
- hardened `src/lib/cloud/finflowCloudDayDocument.ts`
- hardened `src/components/deployment/DeploymentAcceptanceTestRunnerPanel.tsx`
- hardened `src/lib/deployment/manualCloudTestWizard.ts`
- hardened `src/lib/server/deploymentReadiness.ts`
- hardened `app/api/supabase/readiness/route.ts`
- improved `supabase/migration_v1_73_telegram_cloud_day.sql`

## Preserved

- v1.89 local backup diff/restore preview
- v1.88 backup-aware cloud test flow
- v1.87 local day document backup/restore
- v1.86 manual cloud test wizard
- no automatic cloud writes
- no hardcoded secrets
