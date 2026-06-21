# FINFlow v2.25 — DailyQuickInput Action Handlers Split

Date: 2026-06-21

## Base

Built on v2.24 DailyQuickInput Live-State Hook.

## Goal

Reduce the DailyQuickInput runtime monolith without changing product behavior.

## Extracted modules

- `src/components/day-core/useDailyQuickInputRecordActions.ts`
- `src/components/day-core/useDailyQuickInputDayActions.ts`

## Moved out of DailyQuickInputPanel

Record/template/bank layer:
- taxi order records;
- fuel records;
- task expenses;
- manual record add/patch/delete;
- template add/patch/delete;
- bank candidate approve/reject/postpone/patch.

Day edit layer:
- current money edits;
- taxi numeric edits;
- odometer fuel apply-to-plan;
- car-repair fund strengthening;
- task edits/deletion;
- date/time edits;
- fund add/edit/delete;
- obligation add/edit/delete.

## Preserved

- Day Core calculations.
- Sleep → Day → Work bridge.
- Active day / rollover / history flow.
- Local storage keys.
- Cloud sync and backup flow.
- Fuel odometer model.
- Assistant local advice.
- Telegram safe-area logic.
- Deploy-safe/private separation.

## Anti-regression notes

This version does not move persistence, rollover, cloud restore, assistant chat or fuel history export actions yet. Those remain in `DailyQuickInputPanel.tsx` to avoid a risky multi-layer rewrite.

Next safe step: v2.26 can move history/rollover actions into another hook after Telegram testing.
