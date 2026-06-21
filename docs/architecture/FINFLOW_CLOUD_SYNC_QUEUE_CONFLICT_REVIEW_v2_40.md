# FINFlow v2.40 — Cloud Sync Queue + Conflict Review UI

Date: 2026-06-22

## Goal

Move Supabase from a static staging checklist toward a practical local-first sync flow:

local change / cloud load / cloud save → queue item → preview → manual apply → rollback or conflict review.

Cloud writes remain safe-off until real Telegram + Supabase + RLS + backup tests pass.

## Added

- `src/lib/cloud/cloudSyncQueueModel.ts`
  - `CloudSyncQueueItem`
  - `CloudConflictReview`
  - queue snapshot summary
  - localStorage parse/upsert/resolve helpers
- `src/components/cloud/CloudSyncQueuePanel.tsx`
  - System → Cloud → Sync now shows queue summary, conflict cards, latest queue and safety rules.
- `CloudDaySyncPanel` integration
  - records load preview into queue;
  - records save attempt into queue;
  - records successful save into queue;
  - records apply preview into queue;
  - records rollback into queue;
  - creates local conflict review when Supabase returns revision conflict.
- `supabase/migrations/202606220240_finflow_v3_cloud_queue_conflict_review.sql`
  - aligns staging queue action vocabulary with v2.40 local queue actions.

## Storage keys

- `finflow.cloudSyncQueue.v2_40`
- `finflow.cloudConflictReviews.v2_40`

These are local UI/safety keys only. They do not replace canonical records, daily local state, local backups or Supabase tables.

## Safety rules

- No blind cloud overwrite.
- Conflict does not auto-resolve.
- Apply requires preview and user confirmation.
- Save requires preflight checks.
- Rollback snapshot remains local.
- Queue stores compact safe previews, not private raw data or secrets.

## Preserved

- Visual baseline screens are not redesigned.
- Section-scoped history remains locked.
- Sleep tabs and sleep localStorage keys are untouched.
- MASTER/private/deploy-safe separation is preserved.
- Supabase writes remain gated by server flags and staging checks.
