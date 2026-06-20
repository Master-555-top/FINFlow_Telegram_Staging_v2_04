# Security Scan — v1.53

No secrets added.

Added:
- `.env.example` with empty placeholders only.
- Deployment checklist.
- Env variable documentation.

Not exposed:
- TELEGRAM_BOT_TOKEN
- SUPABASE_SERVICE_ROLE_KEY
- Supabase URL/key values
- OpenAI key
- raw bank PDF
- private transaction CSV
- private_raw_data

Critical:
- `.env.local` must never be committed.
- `private_raw_data/` must never be uploaded to GitHub/Vercel/public cloud.
