# v1.55 — Supabase Profile Resolve/Create Dry-run API

## Goal

Prepare safe dry-run visibility for how Telegram user profile resolution will work before enabling real Supabase writes.

## Added

- `src/lib/server/supabaseProfileDryRun.ts`
- profile dry-run output in `/api/telegram/verify`
- explicit `/api/supabase/readiness` route
- project status report: what is done and what remains

## Important

No real database writes are performed.

Dry-run only returns:
- what would be selected/created;
- whether Supabase env appears ready;
- whether writes are enabled;
- why writes are currently blocked.
