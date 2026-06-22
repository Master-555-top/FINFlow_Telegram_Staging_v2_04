# FINFlow Telegram Staging Deploy Safe Package v2.47

This package is generated from an explicit runtime allowlist. Project history, chat transcripts, private docs, vaults, raw data, build output and real env files are excluded.

## Upload rule
Use this deploy-safe package as the Vercel/private staging project root. Never upload MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS or real .env files to GitHub/Vercel/public cloud.

## Required server env vars
- TELEGRAM_BOT_TOKEN
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FINFLOW_ENABLE_CLOUD_SYNC=true only during an approved cloud test
- FINFLOW_ENABLE_SUPABASE_WRITES=true only after backup + RLS + conflict checks

External n8n calls remain fail-closed until webhook, auth, redaction, backup and explicit enable gates are all true.

## First staging flow
1. Deploy to private staging.
2. Open /api/deployment/readiness and confirm no secret values are returned.
3. Configure the HTTPS URL in BotFather.
4. Run Telegram device, viewport, readiness and cloud GET dry-run checks.
5. Create a local backup before any cloud write.
