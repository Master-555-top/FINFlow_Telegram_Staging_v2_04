# Security Review — v2.02 Claude Audit Sync

Date: 2026-06-20

## Security-relevant changes

- Preserved the full external Claude archive in `private_vault`, not in runtime source.
- Removed obsolete Supabase profile draft/dry-run files from runtime source.
- Kept real Supabase logic behind existing server-only guarded repository/API route pattern.
- Kept cloud writes guarded by environment flags and existing safety checks.
- Removed unnecessary page-level dynamic SSR for the client shell; API routes remain the server boundary.

## Secrets check

No secrets, tokens, keys, connection strings, bank files or raw private data were added to runtime/client code.

## Private data rule

`private_vault` and `private_raw_data` remain local MASTER PRIVATE content only. They must not be uploaded to GitHub public, Vercel root, Supabase Storage, or public cloud.

## Deployment note

For Telegram/Vercel staging, create a deploy-safe package from `finflow_app` only. Do not deploy the full MASTER PRIVATE FULL archive.
