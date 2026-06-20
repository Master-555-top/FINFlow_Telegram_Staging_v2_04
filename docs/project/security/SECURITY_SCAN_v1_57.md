# Security Scan — v1.57

No secrets added.

No real OpenAI or n8n call is made.

External AI bridge is dry-run only and returns:
- provider status
- prompt preview
- minimized payload preview

Not exposed:
- OpenAI key
- n8n webhook secret
- Supabase service_role key
- Telegram bot token
- raw bank rows
- private_raw_data
