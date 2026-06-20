# Codex Sync — v1.90

## Source

User uploaded corrected Codex package:

```text
FINFlow_v3_MASTER_PRIVATE_ALL_v1_87.zip
```

## Base

Current latest FINFlow package before this sync:

```text
FINFlow_v3_Latest_Working_Package_v1_89_Backup_Diff_Restore_Preview.zip
```

## Merge decision

The Codex package is based on v1.87 while current project is v1.89.  
Therefore, it was not copied wholesale.

Merged selectively:
- stricter `FinflowCloudDayDocument` validation;
- safer cloud day load behavior;
- hardened Supabase readiness route;
- optional browser anon key semantics in deployment readiness;
- hardened Deployment Acceptance Runner checks;
- improved profile fallback warning;
- stronger Supabase migration revokes/grants;
- hardened manual cloud wizard improvements;
- Codex full browser `localStorage` backup/restore tool;
- Codex completion/context docs under `docs/project/codex`.

Preserved from current v1.88/v1.89:
- backup-aware cloud test gate;
- local backup diff / restore preview;
- local day document backup/restore;
- no automatic cloud writes;
- no hardcoded secrets.

## Excluded

Codex `private_raw_data` was not included in this unified package.
