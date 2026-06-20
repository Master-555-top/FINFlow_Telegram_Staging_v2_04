-- FINFlow v1.26 — Supabase-ready schema for Import Review Queue
-- Security rule: raw banking PDFs, .env files, tokens and private_raw_data stay outside public repositories and outside public storage.

create table if not exists public.import_review_queues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  queue_key text not null,
  schema_version text not null default 'import_review_queue_v1_26',
  source_package text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, queue_key)
);

create table if not exists public.import_review_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  queue_id uuid not null references public.import_review_queues(id) on delete cascade,
  external_candidate_id text not null,
  source_id text not null,
  source_type text not null check (source_type in ('bank_statement', 'taxi_log', 'expense_text', 'income_text', 'chat_context', 'manual_backfill')),
  entity_type text not null check (entity_type in ('expense', 'income', 'taxi_shift', 'taxi_order', 'fund', 'obligation', 'day_note', 'unknown')),
  status text not null check (status in ('new', 'needs_review', 'approved', 'rejected', 'merged', 'archived')),
  risk text not null check (risk in ('low', 'medium', 'high', 'sensitive')),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  local_date date,
  amount numeric,
  title text not null,
  proposed_category text,
  proposed_day_id text,
  raw_excerpt_redacted text not null,
  review_reason text not null,
  duplicate_candidate_ids text[] not null default '{}',
  target_action text not null check (target_action in ('create', 'update', 'merge', 'ignore', 'needs_manual_decision')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (queue_id, external_candidate_id)
);

create table if not exists public.import_review_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  queue_id uuid not null references public.import_review_queues(id) on delete cascade,
  candidate_id uuid references public.import_review_candidates(id) on delete set null,
  external_candidate_id text not null,
  action text not null check (action in ('approve', 'reject', 'edit_before_apply', 'merge_duplicate', 'attach_to_day', 'create_audit_log_event')),
  actor text not null check (actor in ('user', 'ai_assistant', 'system')),
  note text not null,
  before_status text not null,
  after_status text not null,
  sensitive_data_included boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.import_review_queues enable row level security;
alter table public.import_review_candidates enable row level security;
alter table public.import_review_audit_events enable row level security;

-- Replace auth.uid() policies with the project's final auth model if Telegram auth becomes the primary identity provider.
create policy "Users can read own import queues" on public.import_review_queues
  for select using (auth.uid() = user_id);
create policy "Users can write own import queues" on public.import_review_queues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own import candidates" on public.import_review_candidates
  for select using (auth.uid() = user_id);
create policy "Users can write own import candidates" on public.import_review_candidates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own import audit" on public.import_review_audit_events
  for select using (auth.uid() = user_id);
create policy "Users can write own import audit" on public.import_review_audit_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
