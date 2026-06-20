# Security Scan — v1.54

No secrets added.

Added server-only Supabase wrapper. It reads env variables at runtime but does not store values.

Not exposed:
- TELEGRAM_BOT_TOKEN
- SUPABASE_SERVICE_ROLE_KEY
- Supabase URL/key values
- OpenAI key
- raw bank PDF
- private transaction CSV
- private_raw_data

Writes remain gated by:

```text
FINFLOW_ENABLE_SUPABASE_WRITES=true
```

Default `.env.example` remains false.
