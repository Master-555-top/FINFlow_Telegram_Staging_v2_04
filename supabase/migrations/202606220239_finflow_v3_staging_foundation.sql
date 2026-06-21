-- FINFlow v3 Supabase Staging Foundation v2.39
-- Safe rule: review manually before applying. This file prepares staging-only
-- queues/review tables for local-first preview -> confirm -> rollback flows.
-- It does not contain secrets and it must not be used as a reason to enable
-- production writes before backup + RLS + conflict tests pass.

create extension if not exists "pgcrypto";

create table if not exists public.finflow_sync_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  local_date date,
  entity_kind text not null,
  action text not null check (action in ('create','update','delete','apply_template','apply_import','close_shift')),
  dedupe_key text,
  status text not null default 'queued' check (status in ('queued','previewed','applied','conflict','rolled_back','blocked')),
  expected_revision integer,
  payload jsonb not null default '{}'::jsonb,
  rollback_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(payload) = 'object'),
  check (jsonb_typeof(rollback_payload) = 'object')
);

create index if not exists idx_finflow_sync_queue_profile_status
  on public.finflow_sync_queue(profile_id, status, created_at desc);

create unique index if not exists idx_finflow_sync_queue_dedupe
  on public.finflow_sync_queue(profile_id, dedupe_key)
  where dedupe_key is not null and status in ('queued','previewed','applied');

create table if not exists public.finflow_import_batches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  source_label text not null,
  source_kind text not null default 'manual_text' check (source_kind in ('manual_text','csv','json','telegram_message','n8n_webhook')),
  status text not null default 'preview' check (status in ('preview','confirmed','applied','rolled_back','blocked')),
  parsed_count integer not null default 0 check (parsed_count >= 0),
  review_count integer not null default 0 check (review_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists idx_finflow_import_batches_profile_created
  on public.finflow_import_batches(profile_id, created_at desc);

create table if not exists public.finflow_template_instances (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  template_id text not null,
  local_date date not null,
  section text not null,
  status text not null default 'preview' check (status in ('preview','confirmed','applied','skipped','rolled_back')),
  amount numeric(14,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, template_id, local_date, section),
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists idx_finflow_template_instances_profile_date
  on public.finflow_template_instances(profile_id, local_date desc);

create table if not exists public.finflow_cloud_conflict_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  local_date date,
  entity_kind text not null default 'day_document',
  local_revision integer,
  cloud_revision integer,
  status text not null default 'open' check (status in ('open','resolved_local','resolved_cloud','resolved_merge','dismissed')),
  local_payload jsonb not null default '{}'::jsonb,
  cloud_payload jsonb not null default '{}'::jsonb,
  resolution_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(local_payload) = 'object'),
  check (jsonb_typeof(cloud_payload) = 'object'),
  check (jsonb_typeof(resolution_payload) = 'object')
);

create index if not exists idx_finflow_cloud_conflict_reviews_profile_status
  on public.finflow_cloud_conflict_reviews(profile_id, status, created_at desc);

create or replace function public.finflow_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_finflow_sync_queue_updated_at on public.finflow_sync_queue;
create trigger trg_finflow_sync_queue_updated_at
before update on public.finflow_sync_queue
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_import_batches_updated_at on public.finflow_import_batches;
create trigger trg_finflow_import_batches_updated_at
before update on public.finflow_import_batches
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_template_instances_updated_at on public.finflow_template_instances;
create trigger trg_finflow_template_instances_updated_at
before update on public.finflow_template_instances
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_cloud_conflict_reviews_updated_at on public.finflow_cloud_conflict_reviews;
create trigger trg_finflow_cloud_conflict_reviews_updated_at
before update on public.finflow_cloud_conflict_reviews
for each row execute function public.finflow_touch_updated_at();

alter table public.finflow_sync_queue enable row level security;
alter table public.finflow_import_batches enable row level security;
alter table public.finflow_template_instances enable row level security;
alter table public.finflow_cloud_conflict_reviews enable row level security;

revoke all on table public.finflow_sync_queue from public, anon, authenticated;
revoke all on table public.finflow_import_batches from public, anon, authenticated;
revoke all on table public.finflow_template_instances from public, anon, authenticated;
revoke all on table public.finflow_cloud_conflict_reviews from public, anon, authenticated;

grant all on table public.finflow_sync_queue to service_role;
grant all on table public.finflow_import_batches to service_role;
grant all on table public.finflow_template_instances to service_role;
grant all on table public.finflow_cloud_conflict_reviews to service_role;
