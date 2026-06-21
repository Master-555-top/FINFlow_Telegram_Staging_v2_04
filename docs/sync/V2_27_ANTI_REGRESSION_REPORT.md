# V2.27 Anti-Regression Report

Date: 2026-06-21

## Checked dependencies

- `finflowDataRegistry` now delegates period logic to `finflowHistoryEngine`.
- `DataStoragePanel` and `DataResetPanel` use the same preview model.
- Storage reset keeps one-step rollback.
- Runtime storage keys are corrected while legacy keys remain listed where useful.

## Preserved systems

- Day Core calculations.
- Taxi records / fuel / funds / tasks / obligations.
- Sleep live `Лёг` / `Встал`.
- Sleep editor / history / statistics.
- Sleep → Day → Work bridge.
- Telegram viewport/safe-area handling.
- Cloud sync panels and backup panels.
- DailyQuickInput split hooks.

## Remaining risks

- Fine-grained deletion inside every future data schema needs schema-by-schema adapters.
- User should test reset on expendable data first or export before reset.
- Telegram cache can keep old UI; use `?v=227`.
