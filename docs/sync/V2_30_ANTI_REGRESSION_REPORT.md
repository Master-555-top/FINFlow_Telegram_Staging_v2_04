# V2.30 Anti-regression Report — Sleep Overview Start Card Cleanup

Date: 2026-06-22

Scope: local Sleep `Обзор` start card only.

## User request
- Keep top Sleep structure as 3 tabs: `Обзор / История / Редактор`.
- Keep the `Основной режим` text.
- Remove the explanatory paragraph under the main Sleep start message.
- Remove the visible `после смены` checkbox card.
- Remove the visible `смена закрыта` time card.
- Rename the `Лёг` button to a cleaner wording.
- Keep a functional field for entering what time the user went to bed.
- Preserve the logic where sleep start time affects the record and future sync with other sections.

## Accepted implementation
- Sleep top tabs remain unchanged: `Обзор / История / Редактор`.
- `SleepNowPanel` no-session card now shows:
  - moon icon;
  - `Основной режим`;
  - `Во сколько лёг` time input;
  - `Засыпаю` primary action.
- Removed the visible start-card paragraph and visible shift controls.
- Added `buildLiveSleepStartDate()` so a manually entered start time powers the live session.
- If the user enters a future late-evening time after midnight, the session start is moved to the previous day to keep duration human-correct.

## Preserved
- Sleep localStorage keys:
  - `finflow_sleep_records_v2_17`;
  - `finflow_sleep_live_session_v2_17`;
  - legacy awareness for `finflow_sleep_records_v2_16`.
- Sleep status rules and no-score recommendation logic.
- Wake decision logic and Morning Planner bridge.
- Sleep History year → month → day grouping.
- Sleep Editor manual date parser and shift fields.
- Section-scoped History decision.
- Deploy-safe/private separation.

## Not changed
- No global History screen added.
- No separate visible `Сейчас` or `Статистика` tabs reintroduced.
- No storage key migration.
- No private data or secrets moved into Deploy-safe.

## Verification required
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- ZIP integrity and SHA-256 checks for final artifacts.
