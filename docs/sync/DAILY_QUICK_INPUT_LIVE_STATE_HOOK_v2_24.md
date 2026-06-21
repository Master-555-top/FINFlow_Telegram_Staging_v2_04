# FINFlow v2.24 — DailyQuickInput Live-State Hook Extraction

Date: 2026-06-21

## Base

Built on v2.23 `DailyQuickInput Safe Split`.

## Goal

Continue reducing the largest runtime monolith without changing business logic. v2.24 moves hydration, local persistence, daily live-state sync and active-day session bootstrapping from `DailyQuickInputPanel.tsx` into a dedicated hook.

## Added

- `src/components/day-core/useDailyQuickInputLiveState.ts`

## Moved into the hook

- `dayInput` state and setter.
- `records` state and setter.
- `customTemplates` state and setter.
- `bankDecisions` state and setter.
- editable fuel state.
- fuel odometer history state.
- daily history state.
- active day session state.
- latest rollover entry state.
- rollover status state.
- initial hydration from daily live snapshot or legacy localStorage keys.
- cross-tab live-state subscription.
- localStorage persistence for day input, records, templates, bank decisions, fuel input and fuel history.
- daily live-state snapshot writing.
- parent `onDayInputChange` callback propagation.

## Preserved locked decisions

- No reset of live-state keys.
- Existing Day Core calculations preserved.
- Existing taxi/fuel/fund/obligation/bank review logic preserved.
- Existing Sleep → Day → Work bridge preserved.
- Existing Telegram safe-area work preserved.
- `private_vault`, `private_raw_data`, `MASTER_PRIVATE_DOCS`, secrets and design archives remain excluded from deploy-safe.

## Regression checks

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.

## Next

v2.25 should split action handlers from `DailyQuickInputPanel.tsx` into focused controller hooks, starting with records/templates/bank review before touching taxi/fuel/funds.
