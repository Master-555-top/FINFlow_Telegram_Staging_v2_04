# v1.95 — Cloud Save Preflight Backup Gate

## Added

- `src/lib/cloud/cloudSavePreflightModel.ts`
- cloud save preflight UI in `CloudDaySyncPanel`
- local backup state reading
- backup refresh event listener
- save blocking without safety net
- warning confirmation for partial safety states

## Purpose

Prevent risky Supabase save without local protection.
