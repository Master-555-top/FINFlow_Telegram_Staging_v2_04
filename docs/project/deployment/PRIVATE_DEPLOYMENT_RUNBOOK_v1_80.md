# Private Deployment Runbook — v1.80

## Step 1 — private repository

Use a private GitHub repository. Do not upload:
- `.env.local`;
- `private_raw_data`;
- bank PDFs/CSVs;
- service-role keys;
- Telegram bot token;
- OpenAI key;
- raw chat exports.

## Step 2 — Supabase

1. Create private Supabase project.
2. Apply `supabase/migration_v1_73_telegram_cloud_day.sql`.
3. Copy only required values into hosting environment variables:
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Step 3 — Telegram

1. Create Telegram bot.
2. Create Mini App / Web App URL after HTTPS deployment.
3. Set `TELEGRAM_BOT_TOKEN` in hosting environment variables.
4. Do not paste the token into code or chat.

## Step 4 — feature flags

Start with:

```env
FINFLOW_ENABLE_CLOUD_SYNC=false
FINFLOW_ENABLE_SUPABASE_WRITES=false
FINFLOW_ENABLE_EXTERNAL_AI=false
```

After real Supabase + Telegram checks:

```env
FINFLOW_ENABLE_CLOUD_SYNC=true
FINFLOW_ENABLE_SUPABASE_WRITES=true
```

## Step 5 — verification

Check:

```text
/api/deployment/readiness
/api/telegram/verify
/api/supabase/readiness
/api/sync/day
```

Then real phone tests:
- Telegram Mini App opens;
- profile resolves/creates;
- save day;
- load day preview;
- apply loaded day manually;
- conflict test from two sessions.

## Step 6 — external AI

Enable external AI only after cloud baseline works.
Keep `OPENAI_API_KEY` or n8n webhook server-side only.
