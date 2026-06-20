# Security Scan — v1.32

No secrets added.

Quick Daily Input stores demo structured state in browser localStorage.
It does not expose:

- private_raw_data
- raw bank PDFs
- raw chat exports
- `.env`
- tokens
- Supabase keys
- Telegram bot token

Production warning:
localStorage must not be the final storage for sensitive real financial history.
