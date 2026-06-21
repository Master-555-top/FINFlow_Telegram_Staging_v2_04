# v2.28 Anti-Regression Report

## Preserved

- No global History bottom-nav tab was added.
- Existing bottom navigation remains: Day, Money, Work, Funds, Sleep, AI, System.
- System keeps Data Storage / Data Reset, but no user-facing History screen.
- Sleep History remains local to Sleep and keeps year → month → day navigation.
- v2.27 History Engine remains as internal data engine for storage/reset/export.
- Day Core, DailyQuickInput hooks, Sleep → Day → Work bridge, Telegram safe-area, backup/cloud panels and localStorage keys are preserved.

## Changed

- Added section-scoped history panels for Money, Work, Funds and AI context.
- Renamed System option `История` to `Архив дня`.
- Updated copy to make the data storage layer clearly separate from the main section histories.

## Risk

This is an MVP UI correction. Some section histories still depend on available records in localStorage. v2.29 should add true internal `История` tabs inside each section's segmented navigation.
