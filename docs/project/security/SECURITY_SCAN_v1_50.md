# Security Scan — v1.50

No secrets added.

Added Telegram verification code only.

Important:
- `TELEGRAM_BOT_TOKEN` must exist only in server runtime.
- Do not expose bot token in frontend.
- Do not expose Supabase service_role key in frontend.
- `initData` verification uses server-side HMAC validation.

Not exposed:
- bot token
- Supabase keys
- OpenAI key
- raw bank PDF
- private transaction CSV
- private_raw_data
