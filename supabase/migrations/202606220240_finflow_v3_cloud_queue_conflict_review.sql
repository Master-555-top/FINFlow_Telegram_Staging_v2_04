-- FINFlow v3 Cloud Sync Queue + Conflict Review UI v2.40
-- Manual review before applying. This migration only aligns the staging queue
-- action vocabulary with the local v2.40 client queue model. It does not
-- enable writes, expose secrets, or replace RLS/security testing.

alter table if exists public.finflow_sync_queue
  drop constraint if exists finflow_sync_queue_action_check;

alter table if exists public.finflow_sync_queue
  add constraint finflow_sync_queue_action_check
  check (action in (
    'create',
    'update',
    'delete',
    'apply_template',
    'apply_import',
    'close_shift',
    'save_day',
    'load_preview',
    'apply_cloud_preview',
    'rollback_apply',
    'resolve_conflict'
  ));

comment on table public.finflow_sync_queue is
  'FINFlow local-first sync queue mirror. v2.40 adds save/load/apply/rollback/conflict review actions. Service-role only until RLS and cross-user tests pass.';

comment on table public.finflow_cloud_conflict_reviews is
  'FINFlow cloud conflict review cards. Conflicts must be resolved manually: local, cloud, merge, or dismissed. No automatic overwrite.';
