# v1.54 — Supabase Server Client Wrapper Behind Env Checks

## Goal

Add the first real server-only Supabase client wrapper, but keep writes disabled by default.

## Added

- `@supabase/supabase-js`
- `src/lib/server/supabaseServerClient.ts`
- `/api/telegram/verify` now returns safe server status:
  - `ready`
  - `writesEnabled`
  - `reason`

## Critical safety rule

```text
SUPABASE_SERVICE_ROLE_KEY may be used only in server code.
It must never be imported into client components or exposed to browser.
```

## Write protection

Even if env variables exist, writes remain blocked unless:

```text
FINFLOW_ENABLE_SUPABASE_WRITES=true
```

## Status values

The route may report:

```text
missing_NEXT_PUBLIC_SUPABASE_URL
missing_SUPABASE_SERVICE_ROLE_KEY
FINFLOW_ENABLE_SUPABASE_WRITES_not_true
```

It never returns actual env values.

## Not implemented yet

- real profile select/insert
- record sync
- bank review persistence
- cloud/local merge
