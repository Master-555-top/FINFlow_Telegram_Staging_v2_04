# v1.51 — FINFlow Profile Resolver for Telegram User

## Goal

After Telegram `initData` is verified, FINFlow needs a safe server-side profile resolution step.

## Added

- `src/lib/server/finflowProfileResolver.ts`
- updated `/api/telegram/verify` response with draft FINFlow profile context

## Current behavior

The route now returns:

```text
verified Telegram user
+ draft FINFlow profile context
```

But it does not yet write to Supabase.

## Why this is safe

The current resolver is `draft_no_database`.

It does not:
- use service_role key;
- write to Supabase;
- create production sessions;
- expose secrets.

## Future production resolver

Production should do this server-side only:

```text
verified Telegram user
→ find profile by telegram_user_id
→ create profile if missing
→ return safe profile context
```

## Required future environment

Server-only:
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY` only if server route must bypass RLS for profile creation

Frontend:
- no service_role
- no bot token

## Local fallback

Local browser mode remains available until Supabase identity and persistence are tested.
