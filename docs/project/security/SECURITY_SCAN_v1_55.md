# Security Scan — v1.55

No secrets added.

Profile resolver remains dry-run only.

Not exposed:
- TELEGRAM_BOT_TOKEN
- SUPABASE_SERVICE_ROLE_KEY
- Supabase URL/key values
- OpenAI key
- raw bank PDF
- private transaction CSV
- private_raw_data

Dry-run does not perform DB writes.
