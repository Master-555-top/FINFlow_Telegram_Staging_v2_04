# Security Scan — v1.44

No secrets added.

Bank Candidate Review uses redacted candidate fields only.

Not exposed:
- raw bank PDF
- private transaction CSV
- private_raw_data raw contents
- raw private archives
- `.env`
- tokens
- Supabase keys

Important:
- The UI embeds only a small redacted sample from the already-redacted candidate CSV.
- Full bank processing must remain review-based.
