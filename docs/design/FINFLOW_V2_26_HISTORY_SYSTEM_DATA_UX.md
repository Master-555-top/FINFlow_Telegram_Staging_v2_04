# FINFlow v2.26 — History/System/Data UX Foundation

Date: 2026-06-21

## Why

The Telegram screenshot showed that the app was still sometimes running an older deploy (`v2.22`) and that bottom navigation/history cards could feel cramped on iPhone Telegram. v2.26 fixes the layout source and adds the first safe MVP of the requested unified data model.

## Implemented

- Bottom navigation hardening: reset inherited `transform`, respect Telegram/iOS safe-area, allow controlled horizontal overflow on small screens, keep 44px+ touch targets for primary controls.
- Sleep history hierarchy: `Год → Месяц → День → Запись сна`.
- Sleep editor date text input: supports `05.06.26`, `05.06.2026`, `5.6.26`, `5.6.2026`, normalized internally to `YYYY-MM-DD`.
- System → Data:
  - `Хранилище данных` as a live data display/export layer.
  - `Сброс данных` as a safe MVP with preview, RESET confirmation, and one-step undo.
- New date utility layer: `src/lib/data/dateInput.ts`.
- New data registry/export/reset layer: `src/lib/data/finflowDataRegistry.ts`.
- DailyQuickInput history/rollover/cloud restore actions split into `useDailyQuickInputHistoryActions.ts`.

## Locked decisions preserved

- No full rewrite.
- Live sleep keys remain unchanged.
- Sleep >10h remains critical/red oversleep.
- Sleep → Day → Work bridge preserved.
- Telegram safe-area hook preserved.
- Deploy-safe/private separation preserved.

## MVP limitations

- Period reset currently scopes by data block/category first. Fine-grained deletion inside every JSON block by exact week/month/day is planned for a later data-engine pass.
- General History tab is not added to bottom navigation yet to avoid breaking MVP navigation. Sleep history now uses the correct hierarchy and System storage sees all key data blocks.
