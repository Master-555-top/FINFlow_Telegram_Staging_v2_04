# Security Scan — v1.40

No secrets added.

This version adds context summaries, traceability and source maps.

Not exposed:
- raw bank PDFs
- raw private archives
- raw private transaction CSV
- `.env`
- tokens
- Supabase keys

Important:
- `private_raw_data` remains inside project package for internal continuity, but must never be uploaded to GitHub/public cloud/public archives.
- Context docs intentionally use hashes, summaries and redacted reports rather than raw private content.
