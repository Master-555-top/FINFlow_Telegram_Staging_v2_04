# CHANGELOG LATEST

## v2.26 — History/System Data Foundation + Safe Action Split

Date: 2026-06-21

Added:
- Sleep history hierarchy: year → month → day → sleep record.
- Date text input parser for `05.06.26`, `05.06.2026`, `5.6.26`, `5.6.2026` with ISO normalization.
- System → Data section with `Хранилище данных` and `Сброс данных`.
- Safe reset MVP with preview, `RESET` confirmation and one-step undo.
- Data storage/export layer for summary, text, JSON and AI prompt formats.
- `useDailyQuickInputHistoryActions` hook for history / rollover / cloud restore actions.

Fixed:
- Bottom navigation inherited transform/position issues that could shift the dock on Telegram iPhone.
- History screen layout now has period navigation instead of one long flat list.

Preserved:
- v2.25 action split, v2.24 live-state hook, v2.23 shared split.
- Sleep storage keys and all sleep/day/work bridge logic.
- Telegram safe-area hook and deploy-safe/private separation.


## v2.25 — DailyQuickInput Action Handlers Split

Date: 2026-06-21

Continued safe code optimization from v2.24. DailyQuickInputPanel is still the main UI controller, but record/day action handlers are no longer embedded directly in the component.

Added:
- `useDailyQuickInputRecordActions.ts`
- `useDailyQuickInputDayActions.ts`
- v2.25 refactor notes and anti-regression check docs.

Moved:
- record/template/bank candidate actions;
- money/taxi/task/fund/obligation day editing actions;
- car-repair fund strengthening;
- odometer fuel apply-to-plan.

Preserved:
- Day Core calculations;
- Sleep → Day → Work bridge;
- daily live-state hook;
- active day rollover/history;
- cloud sync/backup panels;
- fuel odometer flow;
- assistant local advice;
- Telegram safe-area;
- deploy-safe private-data rules.

Verification:
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
