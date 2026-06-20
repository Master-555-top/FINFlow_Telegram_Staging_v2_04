# Active Work State

## Current package

```text
v2.04 — Real Telegram Device Test / initData + viewport + cloud dry-run checklist
```

## Why this package is active

User asked to continue work after v2.03. The next protocol step was to move from Telegram staging preparation into a real Telegram device-test flow without enabling risky cloud writes.

## Completed in this package

- Added a Real Telegram Device Test model and System-tab panel.
- Added safe runtime diagnostics for Telegram WebApp bridge, initData presence, user presence, platform, theme, viewport height and expanded state.
- Added buttons to run safe checks for `/api/telegram/verify`, `/api/deployment/readiness`, `/api/supabase/readiness` and cloud read dry-run through `GET /api/sync/day`.
- Kept v2.04 cloud check read-only: no `PUT /api/sync/day`, no save/write action.
- Updated Telegram WebApp bridge typing with `viewportStableHeight`.
- Updated deploy-safe package generator to v2.04.
- Updated readiness percentages in required `было → стало` format.
- Preserved v2.03 staging, v2.02 static shell audit sync, v2.01 active day session, v2.00 live-state, and all cloud/backup safety gates.

## Next recommended package after this

```text
v2.05 — Telegram UX Touch Polish / Safe Cloud Save Pilot
```

Only start the safe cloud save pilot after an actual Telegram phone test report. If real device testing has not happened yet, keep working in dry-run/read-only mode.
