# Telegram Device Test Runbook v2.04

## Purpose

Use this runbook for the first real Telegram Mini App device test of FINFlow.

## Required package

Use:

```text
FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_v2_04.zip
```

Do not deploy MASTER PRIVATE FULL.

## First test sequence

1. Deploy the v2.04 deploy-safe package to private staging hosting.
2. Configure server-only env variables:
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_URL` if testing Supabase readiness
   - `SUPABASE_SERVICE_ROLE_KEY` only server-side
   - `FINFLOW_ENABLE_CLOUD_SYNC=false` or true only for read dry-run
   - `FINFLOW_ENABLE_SUPABASE_WRITES=false` for first device test
3. Set BotFather Mini App URL to the HTTPS staging URL.
4. Open the app from Telegram on phone.
5. Go to `Система` → `Real Telegram Device Test`.
6. Refresh diagnostics.
7. Run safe device checks.
8. Screenshot or write down:
   - Telegram mode;
   - initData present/absent;
   - viewport height;
   - verify result;
   - readiness result;
   - cloud dry-run result.

## No-write rule

v2.04 is a read-only/dry-run stage. Do not enable real cloud writes until a local backup exists and the guarded cloud wizard is used.
