# Telegram Mini App Staging Runbook v2.03

## Purpose
Move FINFlow from local-only development toward a real Telegram Mini App staging test.

## Upload rule
Allowed upload root:
- `finflow_app`; or
- `exports/FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_v2_03.zip`.

Forbidden upload root:
- MASTER PRIVATE FULL zip as a whole;
- `private_vault`;
- `private_raw_data`;
- real `.env` files;
- `node_modules`, `.next`, `.npm-cache`;
- raw bank/chat/private archives.

## Environment variables
Server-only in Vercel/hosting:
- `TELEGRAM_BOT_TOKEN`;
- `SUPABASE_URL`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS`;
- `FINFLOW_DEFAULT_TIMEZONE`.

Feature flags:
- `FINFLOW_ENABLE_CLOUD_SYNC=true` only when ready to test cloud load/save;
- `FINFLOW_ENABLE_SUPABASE_WRITES=true` only after backup + RLS/security checklist.

Optional:
- `OPENAI_API_KEY`, `FINFLOW_ENABLE_EXTERNAL_AI`, `FINFLOW_N8N_WEBHOOK_URL` stay off until Telegram/cloud baseline works.

## Vercel staging flow
1. Upload/import only the deploy-safe package or `finflow_app`.
2. Install with `npm ci --ignore-scripts`.
3. Build with `npm run build`.
4. Set env variables in Vercel project settings, not in repository.
5. Open `/api/deployment/readiness` and confirm no secret values are returned.
6. Open `/api/supabase/readiness` and confirm status/reasons only.
7. Keep cloud writes disabled until manual backup/checklist.

## BotFather flow
1. Create or select the FINFlow bot.
2. Set Mini App/Web App URL to the HTTPS staging deployment.
3. Configure Menu Button or Mini App button to open the staging URL.
4. Open the app from real Telegram on the phone, not from a normal browser.
5. Confirm `TelegramSessionPill` is not simply `Локальный режим`.

## First phone test
- app loads in Telegram viewport;
- `initData` verify route responds correctly;
- local fallback is safe if cloud env is incomplete;
- no secrets appear in response body;
- Daily Mode works: morning plan, quick-flow, evening summary;
- live-state persists across tabs;
- New Day rollover creates archive/rollback;
- cloud writes remain gated by backup/preflight.

## Rollback
- keep v2.03 MASTER PRIVATE FULL locally;
- rollback Vercel deployment or remove BotFather URL if staging fails;
- disable `FINFLOW_ENABLE_SUPABASE_WRITES`;
- use local backup/rollback before any cloud apply.
