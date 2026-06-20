# v2.04 — Real Telegram Device Test / initData + viewport + cloud dry-run checklist

## Goal

Move FINFlow from “Telegram staging package is prepared” to “Telegram device-test flow is built into the app and ready to run on a real phone”.

This version does not enable risky cloud writes. It adds a safe diagnostic and dry-run layer so the user can open the mini app through Telegram and verify the real client/server chain step by step.

## Added code

- `src/lib/deployment/telegramDeviceTestModel.ts`
- `src/components/deployment/TelegramDeviceTestPanel.tsx`

## Updated code

- `src/lib/telegram/telegramWebApp.ts`
  - bridge version bumped to `telegram_web_app_bridge_v2_04`;
  - added `viewportStableHeight` typing.
- `src/components/dashboard/DashboardShell.tsx`
  - System tab now includes the Real Telegram Device Test panel;
  - topbar subtitle includes `device test v2.04`.
- `src/lib/project/ecosystemReadinessAudit.ts`
  - readiness updated with `было → стало` values.
- `src/components/project/EcosystemReadinessBoard.tsx`
  - board marker updated to v2.04.
- `scripts/create-telegram-staging-package.mjs`
  - deploy-safe package version updated to v2.04.
- `app/globals.css`
  - added styling for the device-test panel.
- `package.json` / `package-lock.json`
  - version updated to `0.2.4`.

## Runtime checks added

The System tab can now safely check:

1. Telegram WebApp bridge and `initData` presence.
2. Safe device diagnostics:
   - platform;
   - Telegram WebApp version;
   - color scheme;
   - viewport height;
   - stable viewport height;
   - expanded state;
   - Telegram user presence.
3. `/api/telegram/verify` with real `initData` only.
4. `/api/deployment/readiness`.
5. `/api/supabase/readiness`.
6. `GET /api/sync/day?localDate=YYYY-MM-DD` as a read-only cloud dry-run.

## Security boundaries

- Raw `initData` is never printed in UI.
- Hash/token values are not displayed.
- No fake initData is generated to avoid false positives.
- Cloud dry-run uses only GET.
- The v2.04 panel does not call PUT/save.
- `TELEGRAM_BOT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` remain server-only env variables.
- `private_vault` and `private_raw_data` remain outside runtime/client bundle.

## Expected behavior

In a normal browser:

- Telegram bridge check should show safe browser/local fallback.
- Verify/cloud dry-run can be skipped because real Telegram initData is absent.
- Readiness APIs still work.

In real Telegram Mini App:

- `initData` should be present.
- Verify should return either:
  - `telegram_verified + local_fallback` when Supabase/cloud is not ready; or
  - `telegram_verified + supabase_server` when Supabase is configured;
  - safe fail if token/env is missing or wrong.
- Cloud read dry-run should either:
  - safely fail with `FINFLOW_ENABLE_CLOUD_SYNC_not_true`; or
  - return `ok` with an existing/empty day record without writing.

## Anti-regression preservation

Preserved from previous packages:

- v2.03 Telegram staging deploy-safe package/runbook.
- v2.02 static client shell and API dynamic routes.
- v2.01 active day rollover and rollback.
- v2.00 daily live-state persistence and cross-tab sync.
- v1.98 Daily Mode Polish.
- v1.97 functional bottom navigation.
- v1.95 cloud save preflight backup gate.
- v1.94 cloud apply rollback snapshot.
- v1.93 cloud restore diff.
- Local backup/restore and diff preview.

## Next step

`v2.05 — Telegram UX Touch Polish / Safe Cloud Save Pilot`

Only proceed to real cloud write pilot after the user runs v2.04 on an actual phone through Telegram and reports the results.
