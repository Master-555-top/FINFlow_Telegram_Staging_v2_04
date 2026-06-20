# Supabase Schema v1.48 — Records & Bank Review

## Purpose

Prepare production persistence for the local FINFlow systems that already exist:

- editable daily records
- custom templates
- funds
- obligations
- bank candidate review
- day snapshots/history

## Tables

- `finflow_profiles`
- `finflow_days`
- `finflow_daily_records`
- `finflow_record_templates`
- `finflow_funds`
- `finflow_obligations`
- `finflow_bank_candidates`
- `finflow_day_snapshots`

## Security

RLS is enabled on all tables.

Draft policies are based on Supabase `auth.uid()` matching `finflow_profiles.auth_user_id`.

## Important Telegram note

Telegram Mini App auth is not the same as Supabase Auth.

For Telegram-only production:
- do not expose service_role key in frontend;
- validate Telegram initData on backend;
- map Telegram user to `finflow_profiles`;
- perform privileged writes only server-side if needed.

## Bank rule

`finflow_bank_candidates` stores redacted review candidates only.

Raw bank PDFs and raw private CSVs must stay out of public DB tables unless there is a deliberate encrypted/private storage design later.
