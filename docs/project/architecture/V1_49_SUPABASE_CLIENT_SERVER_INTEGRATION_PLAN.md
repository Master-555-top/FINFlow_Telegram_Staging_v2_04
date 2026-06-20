# v1.49 — Supabase Client/Server Integration Plan

## Goal

Prepare the safe architecture for connecting FINFlow to Supabase without breaking the local MVP and without exposing private keys.

## Core rule

```text
Frontend may use only public anon key + RLS.
Frontend must never receive service_role key.
Telegram initData must be verified on server.
```

## Architecture

```text
Telegram Mini App
→ sends initData to Next.js server route
→ server verifies Telegram hash with BOT_TOKEN
→ server resolves/creates FINFlow profile
→ frontend receives safe session/profile context
→ data reads/writes go through:
   A) Supabase anon client with RLS, or
   B) server routes for operations requiring trusted validation
```

## Environment variables

Allowed in frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only:
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY` only in server runtime, never frontend
- `OPENAI_API_KEY` server-only later

## Integration phases

### Phase 1 — Local fallback remains default

Keep current localStorage mode working.

Add documentation and typed adapter boundaries:
- Local adapter
- Supabase adapter draft
- Sync strategy draft

### Phase 2 — Supabase read/write adapter

Create data adapter interfaces for:
- daily records
- templates
- funds
- obligations
- bank candidates
- snapshots

Do not yet remove local fallback.

### Phase 3 — Telegram identity bridge

Add server route:
- validate Telegram `initData`
- map Telegram user to profile
- create profile if missing
- return safe profile id/session marker

### Phase 4 — Production persistence

Use Supabase tables from v1.48.

Add:
- error handling
- optimistic UI
- sync status
- offline/local fallback
- import review persistence

## Risk controls

- Do not connect production DB until RLS is tested.
- Do not upload `private_raw_data` to Supabase Storage.
- Do not store raw bank PDF in public tables.
- Do not store service_role key in client code.
- Keep local fallback until cloud sync is verified.
