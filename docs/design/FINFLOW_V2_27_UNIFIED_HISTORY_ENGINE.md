# FINFlow v2.27 — Unified History Engine

Date: 2026-06-21

## Goal

Unify History, Data Storage and Data Reset around one period-aware timeline model.

## Implemented

- Added `src/lib/data/finflowHistoryEngine.ts`.
- Data Storage now shows an exact timeline for the selected section/period.
- Data Reset now uses exact period-aware filtering for supported arrays instead of deleting whole localStorage blocks for every period.
- Registry keys corrected for actual runtime storage:
  - `finflow.dailyHistory.v1_33`
  - `finflow.fuelOdometerHistory.v1_68`
- Legacy keys remain recognized.
- Bottom nav received another Telegram/iPhone hardening pass after screenshot review.
- Export format advanced to `finflow_storage_export_v2_27`.

## UX model

History / Storage / Reset now share:

Year → Month → Week/Day → Entry

The MVP is not a separate database. It is a live view over current local state.

## Anti-regression

Preserved:
- Sleep live flow.
- Sleep history and editor.
- Sleep → Day → Work bridge.
- Day cockpit and Day Core calculations.
- DailyQuickInput hooks from v2.24/v2.25/v2.26.
- Telegram safe-area hook.
- Deploy-safe/private split.
- Local storage keys for sleep.

## Known limits

- Some deeply nested data objects are summarized as blocks until their internal schema is normalized in later versions.
- Reset by period is exact for supported arrays/collections; unknown text blocks are not partially edited.
