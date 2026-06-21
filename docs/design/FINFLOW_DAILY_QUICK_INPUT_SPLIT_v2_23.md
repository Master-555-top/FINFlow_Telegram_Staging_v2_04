# FINFlow v2.23 — DailyQuickInput Safe Split

Date: 2026-06-21

## Goal

Start reducing the largest runtime monolith without breaking Day Core, live state, records, bank review, fuel, AI, funds, history, backup, cloud sync, or Telegram flows.

## Base

Built on v2.22 File Delivery Fix + CSS/Component Split.

## What changed

- Extracted shared DailyQuickInput UI helpers into `src/components/day-core/DailyQuickInputShared.tsx`.
- Extracted DailyQuickInput storage keys, view type, presets, and expense presets into `src/components/day-core/DailyQuickInputConfig.ts`.
- Removed old visible `v2.00 live-state` label from the pill; it now shows `live-state`.
- Updated versions to v2.23.

## Why this is intentionally conservative

`DailyQuickInputPanel.tsx` controls many connected systems at once. The first split must not move state machines, persistence, or cross-tab live-state logic until those pieces are isolated and covered by checks. This version reduces component clutter and creates safe seams for the next extraction.

## Preserved

- Day Core calculations.
- Taxi orders, fuel, expenses, funds and obligations.
- Active Day Session / rollover archive.
- Daily records and custom templates.
- Bank candidate review.
- Fuel odometer and maintenance assistant context.
- Assistant chat and local advice.
- Cloud sync / backup panels.
- Sleep → Day → Work bridge.
- Telegram safe-area behavior.
- File delivery protocol.

## Next split targets

1. `DailyQuickInputPersistence.ts` or hook: localStorage + live-state hydration/persistence.
2. `DailyQuickInputActions.ts`: records/funds/tasks/update helpers.
3. `DailyQuickInputViews/*`: separate Daily / Work / Money / Funds / AI / System views.
4. Component CSS modules for Day/Sleep/System after view extraction.
