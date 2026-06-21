# Security Review — v2.05 System Menu Polish

## Result

No new external network write path was added.

## Checked

- `private_vault` and `private_raw_data` remain outside runtime imports.
- System menu change is client-side UI organization only.
- Existing Telegram/Supabase checks remain behind their existing safe panels.
- Cloud write flags remain disabled by default.
- Real Telegram Device Test still must not display raw `initData` or hash.
- Deploy-safe generator uses an allowlist and includes `.npmrc`; it still excludes private vaults, raw data, build outputs, and real env files.

## Locked warning

Do not upload MASTER PRIVATE FULL, `private_vault`, `private_raw_data`, raw archives, `.env.local`, or secrets into GitHub public, Vercel root, Supabase Storage, or public cloud.
