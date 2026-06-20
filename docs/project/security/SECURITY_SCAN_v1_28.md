# Security Scan — v1.28

## Result

No secrets were added.

## Checked areas

- No Supabase URL or service role key added.
- No Telegram token added.
- No `.env` values embedded.
- No raw bank PDF content rendered.
- No private_raw_data exposed in UI.
- LocalStorage stores demo structured state only.

## Notes

Browser localStorage is not secure storage for real sensitive data.

When moving to Supabase, implement:

- per-user RLS
- encryption-aware design for sensitive values
- no service role key in client bundle
- import review ownership checks
- audit logs without raw private excerpts
