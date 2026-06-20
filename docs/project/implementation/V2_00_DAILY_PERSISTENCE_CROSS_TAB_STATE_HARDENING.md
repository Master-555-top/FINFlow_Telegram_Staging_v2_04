# v2.00 — Daily Persistence / Cross-tab State Hardening

Date: 2026-06-20

## Purpose

v2.00 hardens the active daily state so the main product tabs no longer rely only on component remount + legacy localStorage hydration.

The goal is to keep one current active-day model shared across:

- День
- Деньги
- Работа
- Фонды
- AI
- Система
- another browser tab/window of the same local app

## Implemented

### New shared live-state layer

Added:

```text
src/lib/day-core/dailyLiveStatePersistence.ts
```

This module provides:

- `DAILY_LIVE_STATE_STORAGE_KEY = finflow.dailyLiveState.v2_00`
- schema version `daily_live_state_v2_00`
- unified snapshot for:
  - `dayInput`
  - `records`
  - `customTemplates`
  - `bankDecisions`
  - `fuelInputState`
  - `fuelHistoryState`
- safe JSON parse/read/write helpers
- per-tab origin id
- signature-based duplicate suppression
- same-tab `CustomEvent` notification
- cross-tab `BroadcastChannel` notification
- browser `storage` event fallback

### DashboardShell integration

Updated:

```text
src/components/dashboard/DashboardShell.tsx
```

DashboardShell now:

- hydrates `liveDayInput` from the v2.00 shared snapshot when available;
- subscribes to daily live-state changes;
- updates Day Core / NetCalculation source data when another tab or panel changes the active day;
- displays a small live-state banner under the live time widget.

### DailyQuickInputPanel integration

Updated:

```text
src/components/day-core/DailyQuickInputPanel.tsx
```

DailyQuickInputPanel now:

- reads the v2.00 live-state snapshot first;
- falls back to the old v1.47 individual localStorage keys for compatibility;
- keeps writing legacy keys so old systems are not broken;
- writes one unified v2.00 snapshot after daily state changes;
- listens for cross-tab and same-tab live-state updates;
- avoids update loops with snapshot signatures and origin ids;
- shows a small `v2.00 live-state` sync status in daily/work/system views.

### CSS

Updated:

```text
app/globals.css
```

Added styles for:

- `.daily-live-state-banner`
- `.live-state-status-pill`

## Preserved systems

v2.00 does not remove or downgrade:

- v1.98 Daily Mode Polish / Evening Summary Flow;
- v1.97 six-tab navigation;
- v1.96 Ecosystem Readiness Board;
- v1.95 Cloud Save Preflight Backup Gate;
- v1.94 Cloud Apply Rollback Snapshot;
- v1.93 Cloud Restore Preview Diff;
- legacy v1.47 storage keys;
- local backup/restore;
- manual cloud test wizard;
- verification checklist;
- private_vault / MASTER PRIVATE FULL structure.

## Anti-regression notes

- The new v2.00 live-state key is additive, not destructive.
- Existing legacy keys remain readable/writable.
- No secrets, `.env.local`, raw bank data, `private_raw_data` or `private_vault` imports were added to runtime.
- No Supabase writes were added.
- No public cloud upload behavior was added.

## Next recommended step

```text
v2.01 — Active Day Session Controls / New Day Roll-over
```

Recommended scope:

- explicit “start new day” flow instead of demo reset;
- archive yesterday before new day;
- preserve daily live-state while creating a new active day;
- guard against accidental deletion of current day records.
