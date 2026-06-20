# Security Scan — v1.87

No secrets added.

Local backups are stored in browser localStorage and exported/imported as JSON. They are intended for FINFlow day state only and must not contain:
- `.env.local`;
- Telegram bot token;
- Supabase service role key;
- OpenAI key;
- private_raw_data;
- raw bank PDFs/CSVs.

Restore is local-only and does not write to Supabase.
