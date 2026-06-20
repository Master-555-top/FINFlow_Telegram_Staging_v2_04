# v1.88 — Backup-Aware Cloud Test Flow

## Added

- `src/lib/deployment/backupAwareCloudTestFlow.ts`
- `create_local_backup` wizard step
- backup gate in `ManualCloudTestWizardPanel`
- backup state refresh bridge from `LocalBackupRestorePanel`

## Purpose

Make backup a required gate before real manual cloud write/conflict verification.
