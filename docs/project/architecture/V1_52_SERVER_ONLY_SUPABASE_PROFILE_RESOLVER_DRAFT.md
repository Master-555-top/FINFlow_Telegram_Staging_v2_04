# v1.52 — Server-only Supabase Profile Resolver Draft

## Goal

Prepare the server-only layer that will later resolve or create `finflow_profiles` after Telegram identity has been verified.

## Added

- `src/lib/server/supabaseProfileResolverDraft.ts`
- updated `/api/telegram/verify` response with a safe `supabaseProfilePlan`

## Important

This version still does **not** write to Supabase.

It only checks whether server env appears ready and returns a safe implementation plan/status.

## Required env

Server/runtime:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Critical:

```text
SUPABASE_SERVICE_ROLE_KEY must never be exposed to frontend.
```

## Future production resolver

Server-only flow:

```text
verified Telegram user
→ server-only Supabase client
→ select finflow_profiles by telegram_user_id
→ create profile if missing
→ return safe profile id/context
```

## Why this step is separate

This prevents jumping straight from schema to unsafe DB writes.

The app now has:
- schema
- Telegram verification
- draft profile context
- server-only Supabase resolver plan

But cloud writes remain disabled until env/RLS/auth are tested.
