# v1.50 — Telegram initData Verification Server Route Draft

## Goal

Prepare safe server-side Telegram Mini App identity verification before real Supabase persistence.

## Added

- `src/lib/telegram/telegramInitData.ts`
- `app/api/telegram/verify/route.ts`

## Security model

Telegram `initData` is verified server-side using `TELEGRAM_BOT_TOKEN`.

The token is read from server environment only:

```text
process.env.TELEGRAM_BOT_TOKEN
```

It is not exposed to frontend.

## Route

```text
POST /api/telegram/verify
```

Request body:

```json
{
  "initData": "Telegram.WebApp.initData"
}
```

Successful response:

```json
{
  "ok": true,
  "profileReady": false,
  "telegramUser": {
    "id": 123,
    "username": "..."
  }
}
```

## Not implemented yet

- Supabase profile resolve/create.
- Session issuing.
- Persistent record sync.
- Production auth middleware.

## Next safe step

After this draft:
1. Add server-side profile resolver.
2. Connect `telegram_user_id` to `finflow_profiles`.
3. Keep local fallback until RLS and auth bridge are tested.
