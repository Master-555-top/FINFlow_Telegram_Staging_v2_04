-- FINFlow v3 Data Backbone draft migration v2.32
-- Safe rule: apply only in private Supabase project after local backup + manual RLS review.
-- Cloud writes remain safe-off in the app until verification is complete.

create extension if not exists "pgcrypto";

create table if not exists public.finflow_day_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table if not exists public.finflow_money_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  type text not null,
  source text,
  category text,
  title text not null,
  amount numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_work_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  started_at timestamptz,
  ended_at timestamptz,
  gross_amount numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  active_hours numeric(8,2),
  full_shift_hours numeric(8,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_taxi_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shift_id uuid references public.finflow_work_shifts(id) on delete set null,
  local_date date not null,
  amount numeric(14,2) not null default 0,
  from_label text,
  to_label text,
  zone text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_sleep_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  slept_at text not null,
  woke_at text not null,
  minutes integer not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(14,2) not null default 0,
  current_amount numeric(14,2) not null default 0,
  priority text not null default 'normal',
  deadline date,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finflow_import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'review_needed',
  source_kind text not null default 'manual_text',
  raw_hash text,
  preview jsonb not null default '{}'::jsonb,
  applied_at timestamptz,
  rolled_back_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  title text not null,
  template_kind text not null,
  enabled boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finflow_sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_kind text not null,
  safe_mode boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finflow_automation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'n8n',
  workflow_key text not null,
  event_kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.finflow_day_sessions enable row level security;
alter table public.finflow_money_records enable row level security;
alter table public.finflow_work_shifts enable row level security;
alter table public.finflow_taxi_orders enable row level security;
alter table public.finflow_sleep_records enable row level security;
alter table public.finflow_funds enable row level security;
alter table public.finflow_import_batches enable row level security;
alter table public.finflow_templates enable row level security;
alter table public.finflow_sync_events enable row level security;
alter table public.finflow_automation_events enable row level security;

-- Policy pattern: each user can access only own rows. Review before production.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'finflow_day_sessions', 'finflow_money_records', 'finflow_work_shifts', 'finflow_taxi_orders',
    'finflow_sleep_records', 'finflow_funds', 'finflow_import_batches', 'finflow_templates',
    'finflow_sync_events', 'finflow_automation_events'
  ] loop
    execute format('drop policy if exists "%1$s own rows" on public.%1$I', table_name);
    execute format('create policy "%1$s own rows" on public.%1$I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
  end loop;
end $$;

create index if not exists finflow_money_records_user_date_idx on public.finflow_money_records(user_id, local_date desc);
create index if not exists finflow_work_shifts_user_date_idx on public.finflow_work_shifts(user_id, local_date desc);
create index if not exists finflow_sleep_records_user_to_date_idx on public.finflow_sleep_records(user_id, to_date desc);
create index if not exists finflow_import_batches_user_status_idx on public.finflow_import_batches(user_id, status, created_at desc);
