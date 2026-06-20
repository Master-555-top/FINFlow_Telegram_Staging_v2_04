# Private Deployment + Real Secrets Environment Wiring — v1.80

## Why this package exists

User clarified that the real daily FINFlow ecosystem must work in a Telegram Mini App and therefore needs real secrets.

Important correction: secrets are required by the runtime, but they must not be hardcoded into source files or client bundles.

## Correct architecture

```text
source code -> reads process.env
hosting provider -> stores real secrets in Environment Variables
server routes -> use secrets server-side
browser/client -> receives only safe status booleans, never secret values
```

## Added

- server-side deployment readiness model;
- `/api/deployment/readiness`;
- Private Deployment UI panel;
- explicit secret status without exposing secret values;
- deployment/security docs.

## Required runtime secrets

- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `OPENAI_API_KEY`
- optional `FINFLOW_N8N_WEBHOOK_URL`

## Required flags

- `FINFLOW_ENABLE_CLOUD_SYNC=true`
- `FINFLOW_ENABLE_SUPABASE_WRITES=true`
- optional `FINFLOW_ENABLE_EXTERNAL_AI=true`

## Locked rule

Do not commit real secrets to GitHub, ZIP archives, source files, frontend code, docs or GPT chat.
