# v2.01 — Active Day Session Controls / New Day Roll-over

Date: 2026-06-20

## Goal

Make FINFlow safer for real daily use by adding a clear day boundary flow.

Before v2.01, the app had strong daily live-state but no production-style “start a new day” behavior. A reset could be dangerous because it might feel like deleting yesterday.

## Implemented

- Added `src/lib/day-core/activeDaySessionModel.ts`.
- Added local active session metadata:
  - `finflow.activeDaySession.v2_01`
- Added local rollover archive:
  - `finflow.activeDayRolloverArchive.v2_01`
- Added Daily Mode Active Day Session card.
- Added `закрыть день → новый день` action.
- Added latest rollover restore action.

## Rollover behavior

When the user starts a new day:

1. FINFlow asks for confirmation.
2. The current daily live-state is captured.
3. A Daily History snapshot is saved.
4. The full previous state is written to rollover archive.
5. A clean new active day is created.
6. Daily records/orders/fuel paid reset to zero.
7. Balances, obligations, funds, templates, bank-review decisions and fuel settings are preserved.
8. Fuel odometer previous value rolls to the current odometer value.

## Anti-regression notes

Preserved:
- v2.00 live-state/cross-tab sync.
- v1.98 Daily Mode Polish.
- v1.97 navigation split.
- v1.95+ cloud/backup safety layers.
- private_vault separation.

## Telegram relevance

This step is important before Telegram staging because daily Telegram use requires safe day sessions. Without New Day flow, Telegram usage would risk mixing yesterday and today.
