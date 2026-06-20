-- FINFlow v1.73 — Telegram server bridge + versioned cloud Day Core document
-- Run only in the private FINFlow Supabase project after reviewing the target schema.
-- Browser clients must never receive SUPABASE_SERVICE_ROLE_KEY.

create extension if not exists "pgcrypto";

create table if not exists public.finflow_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  telegram_user_id text unique,
  display_name text,
  timezone text not null default 'Asia/Kamchatka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finflow_profiles
  add column if not exists telegram_username text,
  add column if not exists telegram_language_code text,
  add column if not exists last_seen_at timestamptz;

create table if not exists public.finflow_day_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  local_date date not null,
  document jsonb not null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, local_date),
  check (jsonb_typeof(document) = 'object'),
  check (document ->> 'schemaVersion' = 'finflow_cloud_day_v1_73')
);

create index if not exists idx_finflow_day_documents_profile_date
  on public.finflow_day_documents(profile_id, local_date desc);

create table if not exists public.finflow_sync_audit (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  local_date date,
  action text not null check (action in ('profile_resolved','cloud_day_loaded','cloud_day_created','cloud_day_updated','cloud_day_conflict')),
  revision integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_finflow_sync_audit_profile_created
  on public.finflow_sync_audit(profile_id, created_at desc);

create or replace function public.finflow_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_finflow_profiles_updated_at on public.finflow_profiles;
create trigger trg_finflow_profiles_updated_at
before update on public.finflow_profiles
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_day_documents_updated_at on public.finflow_day_documents;
create trigger trg_finflow_day_documents_updated_at
before update on public.finflow_day_documents
for each row execute function public.finflow_touch_updated_at();

-- Telegram identity is verified by the Next.js server. These tables intentionally
-- expose no anon/authenticated policies. The server-only service role is the bridge.
alter table public.finflow_profiles enable row level security;
alter table public.finflow_day_documents enable row level security;
alter table public.finflow_sync_audit enable row level security;

revoke all on table public.finflow_profiles from public, anon, authenticated;
revoke all on table public.finflow_day_documents from public, anon, authenticated;
revoke all on table public.finflow_sync_audit from public, anon, authenticated;
grant all on table public.finflow_profiles to service_role;
grant all on table public.finflow_day_documents to service_role;
grant all on table public.finflow_sync_audit to service_role;

comment on table public.finflow_day_documents is
  'Server-only versioned FINFlow day documents. Telegram initData is validated before every API access.';

comment on column public.finflow_day_documents.revision is
  'Optimistic concurrency revision. Updates must match the previously loaded revision.';
