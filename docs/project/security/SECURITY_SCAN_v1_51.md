# Security Scan — v1.51

No secrets added.

The profile resolver is a draft and does not connect to Supabase yet.

Not exposed:
- TELEGRAM_BOT_TOKEN
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OpenAI key
- raw bank PDF
- private transaction CSV
- private_raw_data

Critical:
- production profile creation must remain server-side.
- service_role key must never be used in frontend code.
