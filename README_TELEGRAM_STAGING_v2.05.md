# FINFlow Telegram Staging Deploy Safe Package v2.05

This package is safe to use as the Vercel/hosting project root for the first Telegram Mini App staging + real device test.

## Upload rule
Use this deploy-safe package or the `finflow_app` folder only. Never upload MASTER PRIVATE FULL, `private_vault`, `private_raw_data`, raw archives, or real .env files to public GitHub/Vercel root/Supabase Storage.

## Required Vercel/hosting env vars
- TELEGRAM_BOT_TOKEN — server-only.
- SUPABASE_URL — server-side cloud sync.
- SUPABASE_SERVICE_ROLE_KEY — server-only, never NEXT_PUBLIC.
- FINFLOW_ENABLE_CLOUD_SYNC=true — only when ready for cloud test.
- FINFLOW_ENABLE_SUPABASE_WRITES=true — only after backup + manual checklist.

## First staging flow
1. Deploy this package to a private staging deployment.
2. Open `/api/deployment/readiness` and confirm no secret values are returned.
3. Put the HTTPS deployment URL into BotFather as Mini App URL.
4. Open from real Telegram on phone, go to System → Telegram, and run the v2.05 Real Telegram Device Test panel inside the sectioned System menu: initData, viewport, readiness API, cloud GET dry-run.
5. Run local backup before any cloud write.
