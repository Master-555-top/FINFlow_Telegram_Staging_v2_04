# FINFlow v2.39 — Supabase Staging Foundation

Date: 2026-06-22

## Goal

Move Supabase from a general plan into a controlled staging foundation without enabling unsafe production writes.

This build does **not** turn cloud sync into a finished feature. It prepares the gates that must pass before writes can be trusted.

## Added

- `src/lib/persistence/supabaseStagingFoundation.ts`
  - staging gates;
  - migration inventory;
  - RLS/security checklist;
  - safe-off rules;
  - next actions for staging.
- `src/components/cloud/SupabaseStagingPanel.tsx`
  - System → Cloud → Staging panel;
  - compact readiness cards;
  - migrations list;
  - RLS checklist;
  - next actions.
- Updated `/api/supabase/readiness`
  - returns server readiness;
  - returns guard status without secrets;
  - returns v2.39 staging model;
  - explicitly reports that secrets are not returned.
- New migration draft:
  - `supabase/migrations/202606220239_finflow_v3_staging_foundation.sql`.

## Migration scope

The v2.39 migration draft adds staging/review tables:

- `finflow_sync_queue`
- `finflow_import_batches`
- `finflow_template_instances`
- `finflow_cloud_conflict_reviews`

These tables are for local-first preview/apply/rollback flows and future Supabase sync queue work.

## Security posture

Cloud writes remain safe-off until all required gates pass:

1. server-only Supabase env exists;
2. Telegram identity check works from Mini App context;
3. RLS / cross-user isolation test passes;
4. local backup or rollback snapshot exists;
5. revision conflict test passes;
6. write flags are intentionally enabled server-side.

`SUPABASE_SERVICE_ROLE_KEY` must never be used in client code or committed to GitHub.

## Preserved locked decisions

- No standalone global History tab.
- Section-scoped history remains the UX rule.
- Sleep remains `Обзор / История / Редактор`.
- Sleep localStorage keys are unchanged.
- Visual baseline remains locked: Sleep History list, Sleep weekly chart, System grid.
- MASTER/private/secrets do not go to GitHub/Vercel/public cloud.

## Next build

v2.40 should implement Cloud Sync Queue + Conflict Review UI:

- local queue view;
- save/load preview cards;
- conflict review cards;
- Telegram staging smoke test path;
- no blind cloud writes.
