# FINFlow v2.29 — Sleep Local Polish

Scope: local Sleep tab only.

User feedback addressed:
- `Статистика` tab was not visible on phone without horizontal scrolling.
- `Сейчас` and `Обзор` should be functionally merged for now.
- The short title `Сон` had overly tight letter spacing.

Implemented:
- Removed visible `Сейчас` and `Статистика` segmented tabs.
- Sleep now uses 3 visible tabs: `Обзор / История / Редактор`.
- `Обзор` now contains the live `Лёг / Встал` flow, wake decision, morning planner, overview, chart, selected record and compact stats.
- Added v2.29 CSS overrides so the 3 tabs fit on phone without horizontal scrolling.
- Relaxed the Sleep heading letter-spacing.

Preserved:
- Live sleep session key.
- Sleep history storage key.
- Manual editor.
- History year/month/day model from v2.26/v2.28.
- Sleep → Day → Work bridge.
