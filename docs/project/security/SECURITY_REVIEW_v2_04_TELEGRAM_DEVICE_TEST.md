# Security Review — v2.04 Telegram Device Test

## Scope

Review of the new Telegram device-test panel and related deploy-safe staging flow.

## Main security result

v2.04 adds runtime diagnostics and safe dry-run checks without introducing cloud write behavior.

## Checked rules

- `private_vault` is not imported by app code.
- `private_raw_data` is not imported by app code.
- Raw `initData` is not printed in UI.
- Telegram hash/token data is not printed in UI.
- The panel does not create fake Telegram initData.
- The cloud check uses `GET /api/sync/day` only.
- The panel does not call `PUT /api/sync/day`.
- Supabase writes remain controlled by server env feature flags.
- Service role key remains server-only.
- `TELEGRAM_BOT_TOKEN` remains server-only.

## Expected safe failures

- Browser mode without Telegram initData should not be treated as a successful Telegram test.
- Missing `TELEGRAM_BOT_TOKEN` should cause verify to fail safely.
- Disabled cloud sync should cause cloud read dry-run to fail safely with `FINFLOW_ENABLE_CLOUD_SYNC_not_true`.

## Deployment warning

Use only `finflow_app` or the generated deploy-safe package as Vercel/hosting root. Never upload MASTER PRIVATE FULL, `private_vault`, `private_raw_data`, real `.env` files, `.next`, `node_modules`, `.npm-cache`, or raw archives.
