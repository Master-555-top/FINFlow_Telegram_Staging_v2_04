# Security Scan — v1.84

No secrets added.

Handoff export is local-only and does not call Telegram, Supabase, OpenAI or n8n.

The report builder sanitizes obvious long token-like strings and secret-key names from notes. Still, checklist notes must not contain real tokens, service_role keys, `.env.local`, private_raw_data or raw bank data.
