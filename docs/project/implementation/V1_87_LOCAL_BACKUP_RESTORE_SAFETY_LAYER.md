# v1.87 — Local Backup / Restore Safety Layer

## Added

- `src/lib/local/localBackupModel.ts`
- `src/components/local/LocalBackupRestorePanel.tsx`
- local backup creation
- local restore
- backup delete
- backup export JSON
- backup import JSON
- integration inside `DailyQuickInputPanel`

## Purpose

Reduce risk before real cloud save/load/conflict verification.
