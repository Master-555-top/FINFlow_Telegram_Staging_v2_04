# Security Scan — v1.45

No secrets added.

Bank preview uses redacted candidate CSV fields only.

Not exposed:
- raw bank PDF
- private transaction CSV
- private_raw_data raw contents
- raw private archives
- `.env`
- tokens
- Supabase keys

The UI still uses a limited redacted sample, not full raw bank data.
