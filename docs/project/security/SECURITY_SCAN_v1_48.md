# Security Scan — v1.48

No secrets added.

Added schema only. No Supabase URL, anon key, service_role key, bot token or OpenAI key added.

RLS:
- enabled on all new tables;
- draft policies use Supabase auth profile ownership.

Important:
- Telegram Mini App auth still needs secure backend validation.
- Do not expose Supabase service_role key in frontend.
- Do not upload `private_raw_data`, bank PDFs or raw CSVs to public cloud/GitHub.
