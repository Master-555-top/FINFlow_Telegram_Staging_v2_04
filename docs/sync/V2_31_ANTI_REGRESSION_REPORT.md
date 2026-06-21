# V2.31 Anti-regression Report — Sleep Overview Mode Cleanup

Date: 2026-06-22

## Scope
Local Sleep section update from Telegram screenshots. No global visual redesign. No cross-section rewrite.

## Accepted changes
- Simplified Sleep Overview status card into `Последний сон`.
- Removed confusing/duplicated visible Overview cards: separate Work/control card and selected-day detail card.
- Replaced duplicated lower statistics with compact `Режим` summary.
- Synced stat cards to the same current week period as the chart.
- Changed chart to exact Monday-Sunday week with weekday labels above lowercase date labels.

## Preserved
- `Обзор / История / Редактор` Sleep tabs.
- v2.30 start card behavior.
- Live sleep session start/finish/cancel.
- Wake decision and morning planner bridge.
- History hierarchy and Editor form.
- Sleep storage keys: `finflow_sleep_records_v2_17`, `finflow_sleep_live_session_v2_17`.
- Deploy-safe/private separation.

## Explicit non-goals
- No global design change.
- No assistant concept-image direction adopted.
- No global History tab.
- No storage key migration.
- No deletion of Editor shift metadata.

## Verification
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.

## Notes
The sandbox emitted `EBADENGINE` because it uses Node v22/npm 10 while the project targets Node 24/npm >=11. This is an environment warning, not a build failure.
