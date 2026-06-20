# v1.73 — Deployment and Verification Runbook

## 1. Supabase

1. Create a private project.
2. Open SQL Editor.
3. Review and run `supabase/migration_v1_73_telegram_cloud_day.sql`.
4. Confirm `finflow_profiles`, `finflow_day_documents`, and `finflow_sync_audit` exist.
5. Confirm RLS is enabled and anon/authenticated roles cannot access day documents.

## 2. Server environment

Configure only in the private deployment environment:

```text
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only
TELEGRAM_BOT_TOKEN=server-only
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS=3600
FINFLOW_DEFAULT_TIMEZONE=Asia/Kamchatka
FINFLOW_ENABLE_SUPABASE_WRITES=true
FINFLOW_ENABLE_CLOUD_SYNC=true
```

Do not prefix service-role or bot-token values with `NEXT_PUBLIC_`.

## 3. Deploy

1. Run `npm ci`.
2. Run `npm run check`.
3. Deploy behind HTTPS.
4. Set the Telegram Mini App URL to the deployment URL.

## 4. Real-device acceptance test

1. Open the Mini App from the bot.
2. Call `/api/telegram/verify`; expect `profileReady: true`.
3. Save a day; expect revision `1`.
4. Reload from cloud; expect preview only.
5. Apply the preview; verify local Day Core changes.
6. Modify cloud from a second session and confirm stale save returns HTTP `409`.
7. Verify no service-role key, bot token, raw bank row or private source appears in browser responses/logs.

## 5. Rollback

Set both flags to `false`:

```text
FINFLOW_ENABLE_SUPABASE_WRITES=false
FINFLOW_ENABLE_CLOUD_SYNC=false
```

The app returns to local-only mode without deleting localStorage data.
