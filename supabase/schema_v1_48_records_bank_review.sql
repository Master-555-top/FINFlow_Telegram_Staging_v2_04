-- FINFlow v1.48 — Supabase Schema for Records & Bank Review
-- Security-first draft. Do not run blindly in production without reviewing project/user auth flow.

create extension if not exists "pgcrypto";

-- 1. User profile bridge
create table if not exists public.finflow_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  telegram_user_id text unique,
  display_name text,
  timezone text not null default 'Asia/Kamchatka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Daily Day Core header
create table if not exists public.finflow_days (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  local_date date not null,
  local_time_snapshot time,
  status text not null default 'draft' check (status in ('draft','review_needed','confirmed','archived')),
  source text not null default 'manual',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, local_date)
);

-- 3. Editable daily records: orders, fuel, Drivee top-up, expenses, income
create table if not exists public.finflow_daily_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  day_id uuid not null references public.finflow_days(id) on delete cascade,
  record_type text not null check (record_type in ('taxi_order','fuel','drivee_topup','expense','income')),
  title text not null,
  amount numeric(14,2) not null check (amount >= 0),
  category text not null default 'other',
  note text,
  enabled boolean not null default true,
  source text not null default 'manual_record',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_finflow_daily_records_profile_day on public.finflow_daily_records(profile_id, day_id);
create index if not exists idx_finflow_daily_records_type on public.finflow_daily_records(profile_id, record_type);
create index if not exists idx_finflow_daily_records_category on public.finflow_daily_records(profile_id, category);

-- 4. Custom templates
create table if not exists public.finflow_record_templates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  label text not null,
  record_type text not null check (record_type in ('taxi_order','fuel','drivee_topup','expense','income')),
  category text not null default 'other',
  default_title text not null,
  default_amount numeric(14,2) not null default 0 check (default_amount >= 0),
  priority text not null default 'normal' check (priority in ('critical','high','normal','flexible')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Funds
create table if not exists public.finflow_funds (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  title text not null,
  target_amount numeric(14,2) not null default 0 check (target_amount >= 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  deadline date,
  priority text not null default 'normal' check (priority in ('critical','high','normal','flexible')),
  can_receive_today boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Obligations
create table if not exists public.finflow_obligations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  title text not null,
  amount_due numeric(14,2) not null default 0 check (amount_due >= 0),
  due_day_of_month integer check (due_day_of_month between 1 and 31),
  current_saved numeric(14,2) not null default 0 check (current_saved >= 0),
  priority text not null default 'high' check (priority in ('critical','high','normal','flexible')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Bank candidates: redacted review records, never raw private bank statement rows
create table if not exists public.finflow_bank_candidates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  source_batch_id text not null,
  external_transaction_id text not null,
  operation_date date,
  operation_time time,
  amount numeric(14,2) not null,
  direction text,
  movement_type text,
  suggested_category text,
  suggested_subcategory text,
  description_redacted text not null,
  review_status text not null default 'needs_review' check (review_status in ('needs_review','approved','rejected','postponed')),
  import_action text not null default 'review_before_import',
  approved_record_id uuid references public.finflow_daily_records(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, source_batch_id, external_transaction_id)
);

create index if not exists idx_finflow_bank_candidates_profile_status on public.finflow_bank_candidates(profile_id, review_status);
create index if not exists idx_finflow_bank_candidates_profile_category on public.finflow_bank_candidates(profile_id, suggested_category);

-- 8. Allocation snapshots / daily history
create table if not exists public.finflow_day_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.finflow_profiles(id) on delete cascade,
  day_id uuid references public.finflow_days(id) on delete set null,
  local_date date not null,
  summary jsonb not null default '{}'::jsonb,
  day_input jsonb not null default '{}'::jsonb,
  net_result jsonb not null default '{}'::jsonb,
  allocation_result jsonb not null default '{}'::jsonb,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Updated-at trigger
create or replace function public.finflow_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_finflow_profiles_updated_at on public.finflow_profiles;
create trigger trg_finflow_profiles_updated_at before update on public.finflow_profiles
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_days_updated_at on public.finflow_days;
create trigger trg_finflow_days_updated_at before update on public.finflow_days
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_daily_records_updated_at on public.finflow_daily_records;
create trigger trg_finflow_daily_records_updated_at before update on public.finflow_daily_records
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_record_templates_updated_at on public.finflow_record_templates;
create trigger trg_finflow_record_templates_updated_at before update on public.finflow_record_templates
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_funds_updated_at on public.finflow_funds;
create trigger trg_finflow_funds_updated_at before update on public.finflow_funds
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_obligations_updated_at on public.finflow_obligations;
create trigger trg_finflow_obligations_updated_at before update on public.finflow_obligations
for each row execute function public.finflow_touch_updated_at();

drop trigger if exists trg_finflow_bank_candidates_updated_at on public.finflow_bank_candidates;
create trigger trg_finflow_bank_candidates_updated_at before update on public.finflow_bank_candidates
for each row execute function public.finflow_touch_updated_at();

-- RLS
alter table public.finflow_profiles enable row level security;
alter table public.finflow_days enable row level security;
alter table public.finflow_daily_records enable row level security;
alter table public.finflow_record_templates enable row level security;
alter table public.finflow_funds enable row level security;
alter table public.finflow_obligations enable row level security;
alter table public.finflow_bank_candidates enable row level security;
alter table public.finflow_day_snapshots enable row level security;

-- Draft RLS policies for Supabase auth users.
-- For Telegram-only auth flow, create a secure backend service mapping instead of exposing service_role key.

create policy "profiles_select_own_auth_user"
on public.finflow_profiles for select
using (auth.uid() = auth_user_id);

create policy "profiles_update_own_auth_user"
on public.finflow_profiles for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "profiles_insert_own_auth_user"
on public.finflow_profiles for insert
with check (auth.uid() = auth_user_id);

create policy "days_own_profile"
on public.finflow_days for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "daily_records_own_profile"
on public.finflow_daily_records for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "record_templates_own_profile"
on public.finflow_record_templates for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "funds_own_profile"
on public.finflow_funds for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "obligations_own_profile"
on public.finflow_obligations for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "bank_candidates_own_profile"
on public.finflow_bank_candidates for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));

create policy "day_snapshots_own_profile"
on public.finflow_day_snapshots for all
using (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()))
with check (profile_id in (select id from public.finflow_profiles where auth_user_id = auth.uid()));
