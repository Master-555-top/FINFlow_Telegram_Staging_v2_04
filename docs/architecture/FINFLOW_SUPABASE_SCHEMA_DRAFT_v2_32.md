# FINFlow Supabase Schema Draft v2.32

The draft migration is stored at:

`supabase/migrations/202606220232_finflow_v3_data_backbone_draft.sql`

## Tables drafted

- `finflow_day_sessions`
- `finflow_money_records`
- `finflow_work_shifts`
- `finflow_taxi_orders`
- `finflow_sleep_records`
- `finflow_funds`
- `finflow_import_batches`
- `finflow_templates`
- `finflow_sync_events`
- `finflow_automation_events`

## Safety state

This migration is a draft for a private Supabase project. It should not be treated as production-ready until:

1. local backup is created;
2. migration applies successfully in staging;
3. RLS policies are manually tested;
4. app reads work;
5. app writes stay gated by feature flag;
6. conflict and rollback tests pass.
