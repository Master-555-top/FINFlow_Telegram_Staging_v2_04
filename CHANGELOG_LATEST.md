# CHANGELOG LATEST

## v2.41 — n8n Automation Contract + API Safety

Date: 2026-06-22

Added:
- `src/lib/automation/n8nAutomationContract.ts` with workflow registry, dry-run payloads, forbidden payload keys, credentials policy and production blockers.
- `src/components/automation/N8nAutomationPanel.tsx` in System → Cloud → n8n.
- `/api/automation/n8n/dry-run` server route with compact payload preview and no external calls.
- Workflow contracts for morning brief, evening report, backup signal, historical import review, cloud sync watch and weekly money/work review.
- Mini app readiness updated to about 74% ready / 26% remaining.

Preserved:
- External n8n calls remain blocked.
- Automation cannot auto-apply imports, cloud changes or conflict resolutions.
- No secrets, `.env`, Telegram initData hash, private vault or private raw data are returned by the dry-run endpoint.
- Visual baseline remains locked.
- Section-scoped history and Sleep tabs remain unchanged.
- MASTER/private/secrets remain local/private only.

Verification:
- `npm ci --ignore-scripts --no-audit --prefer-offline` completed with sandbox EBADENGINE warning only.
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
- ZIP integrity and deploy-safe forbidden scan completed during packaging.

## v2.40 — Cloud Sync Queue + Conflict Review UI

Date: 2026-06-22

Added:
- `src/lib/cloud/cloudSyncQueueModel.ts` with local cloud queue, conflict review and safe preview summaries.
- `src/components/cloud/CloudSyncQueuePanel.tsx` in System → Cloud → Sync.
- CloudDaySyncPanel now writes safe queue events for load preview, save attempt, save success, apply preview, rollback and revision conflict.
- Local conflict cards for revision conflicts. Conflict resolution is manual: keep local, accept cloud, merge later or dismiss.
- Migration draft `202606220240_finflow_v3_cloud_queue_conflict_review.sql` to align staging queue actions with v2.40.
- Mini app readiness updated to about 72% ready / 28% remaining.

Preserved:
- Cloud writes are still gated and safe-off until real Telegram/Supabase/RLS/backup tests pass.
- Visual baseline remains locked.
- Section-scoped history and Sleep tabs remain unchanged.
- MASTER/private/secrets remain local/private only.

Verification:
- `npm ci --ignore-scripts --no-audit --prefer-offline` completed with sandbox EBADENGINE warning only.
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
- ZIP integrity and deploy-safe forbidden scan completed during packaging.

## v2.39 — Supabase Staging Foundation

Date: 2026-06-22

Added:
- Supabase staging readiness model with gates for server env, Telegram identity, RLS, backup, conflict handling and write flags.
- System → Cloud → Staging panel.
- Updated `/api/supabase/readiness` to return guard/staging status without exposing secrets.
- New migration draft `202606220239_finflow_v3_staging_foundation.sql` for sync queue, import batches, template instances and conflict review.
- Updated mini app delivery model: about 70% complete, 30% remaining.

Preserved:
- Cloud writes remain safe-off.
- Visual baseline remains locked.
- Section-scoped history and Sleep tabs remain unchanged.
- MASTER/private/secrets remain local/private only.

## v2.38 — Recurring Apply + Work Shift Lifecycle

Date: 2026-06-22

Added:
- `src/lib/templates/templateApplyEngine.ts` with template → preview → confirm/apply → rollback foundation.
- Recurring occurrence preview for daily/weekly/monthly/deadline templates.
- `src/lib/work/workShiftLifecycle.ts` with local shift lifecycle: open/needs orders/open/ready to close.
- Work close preview: gross, fuel, Drivee estimate, work costs, net after work costs.
- Templates UI now shows apply-ready drafts, recurring preview and safe rollback demo in System → Data → Шаблоны.
- Work UI now shows lifecycle checkpoints without changing the global visual style.
- Mini app readiness updated to about 68% ready / 32% remaining.

Preserved:
- No global visual redesign.
- Visual baseline locked screens remain protected: Sleep History, 7-day Sleep chart, System grid.
- Section-scoped history; no global History screen.
- Sleep tabs and sleep storage keys.
- Cloud/Supabase writes remain safe-off.
- MASTER/private/deploy-safe separation.

Verification:
- `npm ci --ignore-scripts --no-audit --prefer-offline` completed with sandbox EBADENGINE warning only.
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
- ZIP integrity and deploy-safe forbidden scan completed during packaging.



## v2.37 — Manual Taxi Order Log Import

- Added parser for the user's real manual taxi order journal format.
- Historical import now detects manual taxi logs and creates one shift preview plus order-level candidates.
- Order candidates preserve date/time and can become taxi_order Daily Records after confirmation.
- Work/Taxi Engine now has manual log import preview calculations: orders, gross, active time, full shift, idle time, active ₽/h, shift ₽/h.
- Templates Engine includes a user-locked import rule for taxi order journals.
- Visual baseline unchanged; no global UI redesign.
- Strong mini app readiness estimate: about 65% ready / 35% remaining.
# CHANGELOG LATEST

## v2.34 — Money Engine

Date: 2026-06-22

Changed direction:
- Continued the global build-package mode instead of small UI polishing.
- Focused on the Деньги layer: income, expenses, sources, obligations, safe-to-spend estimate and template foundation.

Added:
- `src/lib/money/moneyEngine.ts` with Money Engine snapshot calculation.
- `src/components/money/MoneyEnginePanel.tsx` inside the existing Деньги flow.
- User-locked money categories: Такси / работа, Доп. доходы, Работа: заправка, Работа: комиссия, Продукты / еда, Машина, Встречи / личное, Прочее.
- Money source summary: taxi, other income, cash, card, Drivee, work costs and personal expenses.
- Obligation summary connected to Day Core obligations.
- Template suggestions for future Templates Engine.
- Updated strong mini app progress model: about 52% complete / 48% remaining.

Preserved:
- No global UI redesign.
- Locked visual baseline screens: Sleep History list, Sleep 7-day chart, System grid.
- Section-scoped history decision; no global History tab.
- Sleep tabs and sleep storage keys.
- Cloud writes remain safe-off.
- MASTER/private/deploy-safe separation.

Verification:
- `npm ci --ignore-scripts --no-audit --prefer-offline` completed with sandbox EBADENGINE warning only.
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.

## v2.33 — Historical Import + Money/Work Write Adapters

Date: 2026-06-22

Added:
- Safe historical import review foundation.
- Canonical write preview for Money/Work records.
- Duplicate hints and local apply/rollback model foundation.
- Visual baseline lock doc for Sleep History, Sleep chart and System grid.

Preserved:
- No global redesign.
- Section-scoped history.
- Sleep locked tabs and storage keys.
- Cloud writes safe-off and deploy-safe/private split.

Verification:
- v2.33 package was previously built and checksummed before v2.34.

## v2.32 — Global Data Backbone + Strong Mini App Progress

Date: 2026-06-22

Changed direction:
- Paused micro UI-polish and moved FINFlow back to large system-building steps.
- Added an honest progress model for a fully working strong Telegram Mini App: data, import, money, work, templates, Supabase, n8n, security and QA.

Added:
- `src/lib/project/miniAppDeliveryPlan.ts` with weighted readiness and remaining-work model.
- `src/lib/data/finflowCanonicalDataModel.ts` with canonical sections/entities, local keys and future Supabase table mapping.
- `src/lib/data/historicalImportDraft.ts` with safe manual historical import draft parsing; it creates preview items only and does not write to storage.
- `src/components/system/GlobalDataBackbonePanel.tsx` available in System → Data → Backbone.
- System → Overview now shows the real strong mini app readiness board instead of static old rows.
- Data Storage can now scope by broader project areas: Деньги, Работа, AI, Система, Импорт and n8n.
- Draft Supabase migration: `supabase/migrations/202606220232_finflow_v3_data_backbone_draft.sql`.
- Architecture docs for Global Data Backbone, Supabase schema draft and n8n automation plan.

Fixed:
- Removed a duplicated `woke` declaration in the History Engine sleep summary branch.

Preserved:
- Existing visual style; no global redesign.
- Sleep tabs and sleep storage keys.
- Section-scoped History decision; no global History screen.
- Cloud writes remain safe-off.
- MASTER/private/deploy-safe separation.

Verification:
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
- Sandbox warning: EBADENGINE because local runtime uses Node v22.16.0 / npm 10.9.2 while project targets Node 24.x / npm >=11.

## v2.31 — Sleep Overview Mode Cleanup

Date: 2026-06-22

Changed:
- Sleep Overview now follows the latest Telegram screenshots without changing the global visual style.
- Simplified the confusing `Контроль режима` status card into a clear `Последний сон` signal with duration, night label and one short implication.
- Removed the separate visible Work/control card from Sleep Overview to avoid duplicated text and unclear source logic.
- Removed the selected sleep detail card from Overview; detailed day records remain in `История` and manual editing remains in `Редактор`.
- Synced the four compact sleep stat cards to the same current week period as the chart (`ПН–ВС`) instead of showing all-time stats beside a recent-days chart.
- Reworked the chart logic to exactly 7 days from Monday through Sunday, with weekday labels `ПН / ВТ / ...` above lowercase date labels.
- Replaced the duplicated lower `Режим` block with a compact weekly mode summary: target, week coverage, work mode and one practical recommendation.

Preserved:
- Sleep tabs remain `Обзор / История / Редактор`.
- Existing dark/glass/cosmic visual direction remains intact; no global redesign was introduced.
- Sleep live session, wake decision, morning planner and Sleep → Day → Work bridge remain active.
- Sleep storage keys remain unchanged: `finflow_sleep_records_v2_17` and `finflow_sleep_live_session_v2_17`.
- Manual shift-related sleep fields remain in `Редактор` for old/forgotten records.
- Section-scoped history decision remains locked; no global History screen was added.

Verification:
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.


## v2.30 — Sleep Overview Start Card Cleanup

Date: 2026-06-22

Local Sleep Overview polish based on the latest Telegram screenshots.

Changed:
- Kept Sleep top structure locked as `Обзор / История / Редактор`.
- In `Обзор`, removed the explanatory paragraph under `Основной режим` to reduce visual noise.
- Removed the visible `после смены` checkbox card from the main Sleep start card.
- Removed the visible `смена закрыта` time card from the main Sleep start card.
- Added a functional `Во сколько лёг` time input before starting a live sleep session.
- Renamed the primary start action from `Лёг` to `Засыпаю`.
- Live sleep now starts from the entered local time; if a 23:xx time is entered after midnight, it is treated as the previous day.

Preserved:
- 3-tab Sleep MVP, localStorage keys, live session persistence, wake decision, Morning Planner bridge, editor/history, section-scoped history and Deploy-safe/private separation.

## v2.29 — Sleep Local Polish

Date: 2026-06-22

Local Sleep tab polish based on Telegram screenshot feedback.

Changed:
- Merged `Сейчас` and `Обзор` functionally: the live `Лёг / Встал` flow now lives inside `Обзор`.
- Removed separate visible `Статистика` tab; statistics remain available inside `Обзор`.
- Reduced Sleep heading letter compression so `Сон` reads cleaner.
- Changed Sleep segmented control to 3 visible tabs on phone: `Обзор / История / Редактор`.

Preserved:
- Live sleep session, history, editor, stats, wake decision, morning planner, localStorage keys, section-scoped history, deploy-safe rules.


## v2.28 — Section-scoped History Correction

Date: 2026-06-21

Corrected the v2.27 direction based on user feedback: FINFlow should not get one separate global History screen. History belongs inside each working section, while System only keeps data/storage/reset tools.

Added:
- `src/components/history/SectionHistoryPanel.tsx` for section-scoped history blocks.
- Scoped history panels for Money, Work, Funds and AI context.
- Design doc `FINFLOW_V2_28_SECTION_SCOPED_HISTORY.md`.
- Anti-regression report for the history architecture correction.

Changed:
- System Data option label `История` → `Архив дня` to avoid implying a global history screen.
- System copy now says storage is a data/export layer, not the main history UI.

Preserved:
- Sleep local History tab and year → month → day structure.
- v2.27 internal History Engine for storage/reset/export.
- Bottom navigation without global History tab.
- Day Core, Sleep → Day → Work bridge, Telegram safe-area, DailyQuickInput split hooks, backup/cloud panels and localStorage keys.


## v2.27 — Unified History Engine + Exact Data Reset Foundation

Date: 2026-06-21

Added:
- `src/lib/data/finflowHistoryEngine.ts`.
- Unified timeline extraction for sleep, records, daily snapshots, rollover entries, fuel history and day state.
- Period-aware Data Storage timeline.
- Period-aware Data Reset preview and exact filtering for supported collections.
- Correct runtime keys for daily history and fuel history, while retaining legacy awareness.
- Bottom navigation hardening pass after Telegram screenshot review.

Improved:
- Data Storage is now a live view over current state, not a stale copy.
- Reset by year/month/week/day no longer defaults to removing whole supported storage blocks.
- Exports include exact timeline entries for selected period and section.
- UI copy explains that unknown text blocks are not partially mutated.

Verification:
- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.


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

## v2.36 — Templates Engine

- Added canonical Templates Engine for day, money, work, funds, system import rules and future recurring actions.
- Added user-locked template seeds from known FINFlow context: taxi shift, fuel, Drivee, products, car, meeting, car payment, bankruptcy, working fund, freedom, computer, UK, day focus and historical import.
- Added adapters from existing Daily Record templates, Money Engine suggestions, Work Taxi templates, live obligations, live funds, live tasks and custom templates.
- Added System → Data → Шаблоны panel.
- Added compact template snapshot cards to Money/Work context.
- Updated strong mini app progress model: templates moved from scattered foundation to usable local registry.
- Preserved visual baseline, section-scoped history, Sleep keys, MASTER/deploy-safe separation and cloud safe-off state.
