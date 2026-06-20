# Security Review v2.03 — Telegram Staging

## Security posture
This version prepares a deploy-safe Telegram staging package while keeping MASTER PRIVATE FULL local-only.

## Positive controls
- Deploy-safe package is allowlist-based.
- `private_vault`, `private_raw_data`, MASTER_PRIVATE_DOCS, node_modules, .next and real env files are not included in deploy-safe package.
- `TELEGRAM_BOT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` remain server-only.
- Cloud sync and writes remain behind feature flags.
- API readiness routes return status/reasons, not secret values.
- Telegram initData verification remains server-side.

## Risks remaining
- Real Telegram phone test has not been completed.
- Real Supabase RLS/security test has not been completed.
- Vercel project must be private and env variables must be configured carefully.

## Required manual security checks before writes
1. Inspect Vercel env variables.
2. Confirm `SUPABASE_SERVICE_ROLE_KEY` is not exposed as `NEXT_PUBLIC_*`.
3. Confirm `/api/deployment/readiness` does not leak secrets.
4. Confirm Supabase migration/RLS expectations.
5. Create local backup before cloud save/load/conflict tests.
