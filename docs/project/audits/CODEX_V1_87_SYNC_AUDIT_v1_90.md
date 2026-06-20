# Codex v1.87 Sync Audit — v1.90

## Compared packages

- current: `FINFlow_v3_Latest_Working_Package_v1_89_Backup_Diff_Restore_Preview.zip`
- Codex: `FINFlow_v3_MASTER_PRIVATE_ALL_v1_87.zip`

## Result

The Codex package contained useful hardening but was older than the current package.

## Integrated Codex improvements

### Cloud document validation

`src/lib/cloud/finflowCloudDayDocument.ts` now validates:
- records;
- custom templates;
- bank decisions;
- fuel history entries;
- timestamps;
- day core input substructures.

### Deployment readiness

`src/lib/server/deploymentReadiness.ts` now treats `NEXT_PUBLIC_SUPABASE_ANON_KEY` as optional for the current server-only cloud bridge and keeps secret values hidden.

### Supabase readiness

`app/api/supabase/readiness/route.ts` now:
- runs as Node;
- is dynamic;
- uses `Cache-Control: no-store`;
- includes cloud sync status.

### Acceptance runner

`DeploymentAcceptanceTestRunnerPanel` now uses stricter ready predicates:
- deployment readiness must report `cloudReady`;
- Supabase readiness must report ready + writes + cloud sync enabled;
- Telegram verification requires `profileReady`;
- local date uses local calendar date rather than UTC date.

### Manual cloud wizard

Merged:
- legacy storage migration awareness;
- skipped status;
- stricter progress parsing;
- RLS/security review step;
- all existing v1.88 backup-aware gates.

### Browser localStorage backup

Added Codex full browser localStorage backup/restore tool:
- exports allowed FINFlow localStorage keys;
- validates schema/checksum;
- restore is merge-only;
- rollback snapshot is kept in session.

## Excluded

- `private_raw_data/*`
- raw bank PDF/CSV
- original uploaded archives
- `.env.local`
- real tokens/keys
