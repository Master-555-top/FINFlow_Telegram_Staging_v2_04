# FINFlow v2.28 — Section-scoped History Decision

Date: 2026-06-21

## User correction

Do not build one extra global `История` screen.

History must live inside the actual sections:

- `День` / dashboard overview: overview first, not a separate global history.
- `Деньги`: money history only.
- `Работа`: work, taxi, fuel history only.
- `Фонды`: funds/obligations history only.
- `Сон`: sleep history already has its own year → month → day structure.
- `AI`: reads context from existing section histories; it must not create a separate unsynced database.
- `Система`: no user-facing History tab. System keeps only storage/reset/export tools.

## Product rule

History is a local lens for a section, not a global destination. The global data engine can still exist internally for storage/reset/export, but UI must expose history where the user edits and understands that data.

## v2.28 implementation

- Added `SectionHistoryPanel` for scoped section histories.
- Added scoped history panels to Money, Work, Funds and AI context.
- Kept Sleep's own History tab.
- Renamed System `История` data option to `Архив дня` to avoid creating a fake global History screen.
- Updated System copy: storage is a data/export layer, not the main history UI.
- Preserved v2.27 History Engine as an internal engine for data storage/reset/sync.

## Next

v2.29 should move each section history panel into the section's own internal segmented navigation where appropriate, without adding a bottom-nav global history tab.
