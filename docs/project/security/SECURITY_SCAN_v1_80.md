# Security Scan — v1.80

No secrets added.

This package intentionally refuses hardcoded runtime secrets.

Real secrets must be stored only in hosting/server environment variables:
- `TELEGRAM_BOT_TOKEN`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `OPENAI_API_KEY`;
- n8n webhook URLs if used.

The readiness endpoint returns only configured/missing booleans and safe labels. It does not return token values.

No `.env.local`, private_raw_data, bank PDFs/CSVs, runtime logs, `.next` or `node_modules` are included.
