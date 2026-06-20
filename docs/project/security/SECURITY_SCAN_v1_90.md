# Security Scan — v1.90

No secrets added.

The Codex package included `private_raw_data`; it was intentionally excluded from the unified package.

Excluded:
- `private_raw_data`;
- raw bank PDFs/CSVs;
- original private archives;
- `.env.local`;
- tokens;
- Supabase service-role keys;
- OpenAI keys.

Merged security hardening:
- stricter cloud document validation;
- stronger Supabase revoke/grant migration;
- safer readiness routes;
- browser localStorage backup with allowlisted key prefix and checksum;
- restore is local/merge-only with rollback.
