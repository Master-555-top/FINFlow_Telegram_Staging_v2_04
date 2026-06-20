# Cloud Save Preflight Backup Gate — v1.95

## Purpose

After cloud apply became reversible in v1.94, cloud save also needs a safety gate.

v1.95 adds preflight checks before saving the current local day into Supabase.

## Checks

- Telegram context exists.
- Local backup exists.
- Rollback snapshot exists if available.
- Cloud revision is known if possible.
- No pending cloud preview is waiting for apply/cancel.

## Behavior

- Save is blocked when there is no safety net.
- Save is blocked when pending cloud preview exists.
- Save is allowed with warning when there is only rollback but no local backup.
- Save is allowed with warning when cloud revision is unknown.
- Save remains manual.
