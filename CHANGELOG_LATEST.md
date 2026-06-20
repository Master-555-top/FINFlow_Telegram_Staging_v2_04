# CHANGELOG LATEST

## v1.2
- Added structured in-project memory files.
- Added user/financial context file.
- Added taxi vehicle cost model.
- Added funds and smart allocation model.
- Added daily money planner spec.
- Added calendar/time planner spec.
- Added AI memory and learning spec.
- Added dedicated protocols: locked decisions, AI development protocol, anti-regression checklist.
- Added error log system spec.
- Added private raw data folder warning.

## v1.1
- Foundation package with live time, time of day, dashboard shell, error log panel, and Step 2 planning docs.

## v1.3 — Project Memory & Safety Upgrade
- Added `SECURITY_AND_PRIVATE_DATA_RULES.md`.
- Added `PROJECT_UPDATE_PROTOCOL.md`.
- Added `CURRENT_STATE.md`.
- Added `DATA_SOURCES_AND_IMPORT_PLAN.md`.
- Added `NORMALIZED_DATA_TEMPLATE.md` for converting historical files into one consistent data format.
- Added `REQUIREMENTS_COVERAGE_AUDIT.md` to track whether global requirements are covered.
- Added `CODE_CHANGE_PROTOCOL.md` to reinforce local, anti-regression code changes.
- Updated `.gitignore` to prevent committing `private_raw_data/`, `.env`, database backups, and raw exports.
- Reinforced rule: update project memory/docs/changelog as work progresses.


## v1.4 — Pre-start full review and historical data lock

- Added PRE_START_FULL_REVIEW_STATUS.md.
- Added HISTORICAL_DATA_NORMALIZATION_PLAN.md.
- Added HISTORICAL_SOURCE_INDEX.md.
- Updated REQUIREMENTS_COVERAGE_AUDIT.md.
- Strengthened PROJECT_UPDATE_PROTOCOL.md.
- Locked rule: old income/expense/shift history must be normalized into unified templates, not ignored.
- Locked rule: start coding with local changes only, but keep import architecture ready for all historical data.


## v1.5 — Pre-Start Full Review & Historical Normalization

Дата: 2026-06-15

Добавлено:

- `docs/project/history/CHAT_TIMELINE_AND_DECISION_HISTORY.md`
- `docs/project/import/normalized/RAW_TEXT_LINE_INDEX_REDACTED.csv`
- `docs/project/import/normalized/HISTORICAL_NORMALIZED_CANDIDATES_REVIEW.csv`
- `docs/project/import/normalized/EXPENSE_CANDIDATES_REVIEW.csv`
- `docs/project/import/normalized/INCOME_CANDIDATES_REVIEW.csv`
- `docs/project/import/normalized/ROUGH_CATEGORY_SUMMARY_REVIEW.csv`
- `docs/project/import/reports/HISTORICAL_SOURCE_INVENTORY.json`
- `docs/project/import/reports/HISTORICAL_NORMALIZATION_REPORT.md`
- обновлён `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- обновлён `docs/project/state/CURRENT_STATE.md`

Смысл версии:

Перед началом разработки зафиксирована хронология решений текущего чата, создан review-layer для старых доходов/расходов/смен/банковских строк, подтверждён статус требований и закреплено, что исторические данные будут импортироваться через нормализацию и проверку, а не теряться.

## v1.6 — Real-Time Allocation Advisor added

Added documentation for exact allocation recommendations, corrected Drivee gross calculation logic, 15.06.26 live example, late-day feasibility at 16:07, and Recovery/Emergency mode behavior.

## v1.7 — Live Shift Progress & Order Tracking

Added requirement that today's completed orders and already-earned gross turnover must update the daily plan in real time. Added spec file for live order tracking and updated Daily Money Planner, Real-Time Allocation Advisor, Locked Decisions, Requirements Audit, Project Memory, Current State, and Chat Timeline.

## v1.8 — Incremental File and Code Update Protocol

Added:
- `docs/project/protocols/INCREMENTAL_FILE_AND_CODE_UPDATE_PROTOCOL.md`

Updated:
- `docs/project/protocols/CODE_CHANGE_PROTOCOL.md`
- `docs/project/protocols/PROJECT_UPDATE_PROTOCOL.md`
- `docs/project/memory/PROJECT_MEMORY.md`
- `docs/project/history/CHAT_TIMELINE_AND_DECISION_HISTORY.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- `docs/project/state/CURRENT_STATE.md`

Decision:
- FinFlow files and code are not rewritten from scratch on every change. All work must be incremental, harmonious, anti-regression checked, and documented.


## v1.9 — Money Allocation Recommendation Engine
- Added a dedicated spec for concrete money allocation recommendations.
- Locked the requirement that FinFlow must recommend exact amounts and priorities, not only totals.
- Confirmed that recommendations must update after each order, income, expense, balance update, task, time change, or mini-goal.
- Reinforced Recovery/Emergency mode for late-day unrealistic plans.

## v1.10 — Context-aware protocol + Meetings Fund

Updated: 2026-06-15 04:18

Added:
- `docs/project/protocols/CONTEXT_AWARE_RESPONSE_PROTOCOL.md`
- `docs/project/data/MEETINGS_FUND_AND_RELATIONSHIP_TIME_SPEC.md`

Updated:
- Locked decisions
- Project memory
- Requirements coverage audit
- Current state
- Changelog

Important:
- FinFlow must recommend concrete money allocation amounts.
- FinFlow must account for 2,000–3,000 ₽ meeting buffer and average days per week spent with girlfriend.
- Assistant/project responses must use full context, not isolated latest message.

## v1.11 — Meeting frequency correction + stronger timeline/context discipline

Updated: 2026-06-15 04:22

Changed:
- Corrected average meetings frequency to 5 times per week.
- Replaced old 2–3/week assumption.

Added:
- `docs/project/audit/MASTER_REQUIREMENTS_INDEX.md`
- Expanded `docs/project/history/CHAT_TIMELINE_AND_DECISION_HISTORY.md`
- Strengthened `CONTEXT_AWARE_RESPONSE_PROTOCOL.md`
- Updated Meetings Fund spec.

Reason:
The user emphasized that project answers must rely on project files and full chat history, not quick memory.

## v1.12 — Conversation provenance correction

Updated: 2026-06-15 04:27

Added:
- `docs/project/history/CONVERSATION_PROVENANCE_AND_SOURCE_DATES.md`

Changed:
- Timeline now distinguishes current chat, previous/imported context, historical source data, and generated artifacts.

Correction:
- 03.06.2026 belongs to earlier Taxi Income Bot / FinFlow context, not current active chat start.
- Current active working conversation for v1.x package sequence is treated as 15.06.2026.

## v1.13 — External share link and imported project policy

Updated: 2026-06-15 04:30

Added:
- `docs/project/history/EXTERNAL_SHARE_LINKS_AND_IMPORTED_PROJECT_CONTEXT.md`
- `docs/project/import/IMPORTED_PROJECT_SOURCE_POLICY.md`

Updated:
- Project memory
- Conversation provenance
- Requirements coverage audit
- Data sources/import plan

Note:
The provided ChatGPT share link was reachable but did not expose full conversation content through the browsing tool. It is registered as pending full extraction.

## v1.14 — Response integrity and context-check protocol

Updated: 2026-06-15 04:32

Added:
- `docs/project/protocols/RESPONSE_INTEGRITY_AND_CONTEXT_CHECK_PROTOCOL.md`

Updated:
- Locked decisions
- Context-aware response protocol
- Project update protocol
- Master requirements index
- Requirements coverage audit
- Project memory
- Current state

Reason:
The user emphasized that answers must always check whether anything was lost/deleted and must be based on full chat/files/protocols, not only the latest message.

## v1.15 — Full context audit layer

Updated: 2026-06-15 07:35

Added:
- `docs/project/audit/FULL_CONTEXT_AUDIT_REPORT_v1_15.md`
- `docs/project/audit/SOURCE_TO_REQUIREMENT_MAP_v1_15.md`
- `docs/project/audit/LOST_REQUIREMENTS_RECOVERY_REPORT_v1_15.md`
- `docs/project/audit/CONTEXT_CONTROL_DASHBOARD_v1_15.md`

Updated:
- Project memory
- Requirements coverage audit
- Current state

Reason:
The user asked whether the assistant can do the context consolidation itself using the data already available in this chat. This version adds an audit layer so the project is less dependent on memory alone.

## v1.16 — Step 1 coding: Day Core mock UI

Updated: 2026-06-15 07:46

Added/changed:
- Upgraded Foundation Dashboard into real Day Core mock UI.
- Added `src/components/day-core/DayCoreDashboard.tsx`.
- Added `src/lib/day-core/dayCoreModel.ts`.
- Updated `src/components/dashboard/DashboardShell.tsx`.
- Extended `app/globals.css` for Day Core cards, allocation rows, progress bars, meetings fund, and Recovery mode UI.
- Updated dependencies: removed unused Supabase client from Foundation runtime for now; added PostCSS override.
- Added `package-lock.json`.
- Added `docs/project/state/CODE_IMPLEMENTATION_STATUS_v1_16.md`.

Now visible in UI:
- orders done today;
- gross done;
- remaining gross;
- realistic remaining gross range;
- Drivee 13%;
- meetings 5/week;
- meetings fund 2,000–3,000 ₽ target;
- allocation recommendation buckets;
- Recovery Mode.

Verification:
- npm install: success;
- npm run build: success;
- npm audit --audit-level=moderate: 0 vulnerabilities.

## v1.17 — Source intake and canonicalization phase

Updated: 2026-06-15 08:19

Added:
- `docs/project/import/SOURCE_INTAKE_AND_CANONICALIZATION_PROTOCOL.md`
- `docs/project/import/SOURCE_INTAKE_QUEUE.md`
- `docs/project/import/SOURCE_REVIEW_TEMPLATE.md`

Updated:
- Project memory
- Current state
- Requirements coverage audit

Reason:
The user proposed pausing direct app work to process all major files one by one, clean and integrate them into a complete canonical knowledge base before continuing implementation.

## v1.18 — Source 01 current chat text processed

Updated: 2026-06-17 11:28

Added:
- `docs/project/import/source_reviews/SOURCE_REVIEW_01_CURRENT_CHAT_TEXT.md`
- `docs/project/import/SOURCE_INVENTORY.md`
- `docs/project/audit/CURRENT_CHAT_CANONICAL_REQUIREMENTS_v1_18.md`
- private raw copy: `private_raw_data/source_intake/SOURCE_01_current_chat_text.txt`

Updated:
- `docs/project/import/SOURCE_INTAKE_QUEUE.md`
- `docs/project/memory/PROJECT_MEMORY.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- `docs/project/state/CURRENT_STATE.md`
- `docs/project/audit/SOURCE_TO_REQUIREMENT_MAP_v1_15.md`

Reason:
The user provided the first source file: full/current chat text. It was reviewed and canonized before continuing to the next source.

Code:
- No app code changes in v1.18.
- v1.16 Day Core mock UI remains preserved.

## v1.19 — Combined transcript intake support

Updated: 2026-06-17 11:30

Added:
- `docs/project/import/COMBINED_TRANSCRIPT_PROCESSING_PROTOCOL.md`

Updated:
- `SOURCE_INTAKE_QUEUE.md`
- `SOURCE_INTAKE_AND_CANONICALIZATION_PROTOCOL.md`
- `PROJECT_MEMORY.md`
- `REQUIREMENTS_COVERAGE_AUDIT.md`
- `CURRENT_STATE.md`

Reason:
The user clarified that user and assistant messages will not be separated into separate files. The intake process now supports combined raw transcripts.

## v1.20 — Bank statement intake

Updated: 2026-06-17 11:39

Processed:
- Source 03 bank document.

Added:
- `docs/project/import/source_reviews/SOURCE_REVIEW_03_BANK_STATEMENT.md`
- `docs/project/import/BANK_IMPORT_AND_REVIEW_QUEUE_SPEC.md`
- `docs/project/import/BANK_CATEGORY_MAPPING_DRAFT_v1_20.md`
- `docs/project/import/normalized/BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv`
- `docs/project/import/reports/BANK_STATEMENT_EXTRACTION_SUMMARY_v1_20.json`
- private raw copy and raw extracted CSV under `private_raw_data/source_intake/`

Updated:
- Source intake queue
- Project memory
- Requirements coverage audit
- Current state

Important:
Bank statement rows are candidates only. Transfers/replenishments require review before production import.

## v1.21 — Source 04 archive inspection + session tracking

Updated: 2026-06-17 13:18

Processed:
- Source 04: `Все файлы.rar`.

Result:
- The file is a 24-byte RAR5 archive.
- It contains zero files.
- Source 04 is closed as `processed_empty_archive`.

Added:
- `docs/project/import/source_reviews/SOURCE_REVIEW_04_ALL_FILES_RAR.md`
- `docs/project/import/reports/SOURCE_04_RAR_INSPECTION_SUMMARY_v1_21.json`
- `docs/project/operations/AGENT_SESSION_TRACKER.md`
- private raw copy: `private_raw_data/source_intake/SOURCE_04_all_files_archive_original.rar`

Updated:
- Source intake queue
- Source inventory
- Project memory
- Current state
- Requirements coverage audit

Important:
Do not repeat extraction attempts for this same archive. Continue with standalone uploaded files or request a new non-empty archive.

## v1.22 — Source 05 real context archive processed

Updated: 2026-06-17 15:11

Processed:
- `Все файлы с контекстами для проекта(2).7z`.

Added:
- `docs/project/import/source_reviews/SOURCE_REVIEW_05_CONTEXT_ARCHIVE.md`
- `docs/project/import/reports/SOURCE05_FILE_INVENTORY.csv`
- `docs/project/import/reports/SOURCE05_KEYWORD_SCAN.json`
- `docs/project/import/reports/SOURCE05_EXTRACTION_AND_SCAN_SUMMARY.json`
- `docs/project/import/reports/SOURCE05_REDACTED_KEY_EXCERPTS.md`
- `private_raw_data/source_intake/SOURCE_05_context_archive_original.7z`

Result:
- Archive was successfully extracted.
- Extracted files: 44.
- Source 05 is valid and useful for context/historical import.
- No application code changed in v1.22.

Important:
- Do not upload `private_raw_data`, raw bank PDFs, raw chat exports, `.env`, or raw archives to GitHub/cloud/public storage.

## v1.23 — Source 05 semantic review
- Added semantic review of Source 05 context archive.
- Added semantic requirements matrix.
- Added import candidates report.
- Added conflicts and locked decisions report.
- No application code changed.
- Source 05 remains private context/import source, not a replacement for the current project.


## v1.24 — Import Review Queue + Day Core Input Model

- Added first code-level Import Review Queue model.
- Added first code-level Day Core Input Model.
- Added safe UI panel showing import candidates without exposing real private data.
- Added docs for import review architecture, Day Core input contract, implementation notes, regression check, and build report.
- Confirmed build passes after dependency install.
- No raw bank data was connected to UI.
- No existing Day Core UI was removed.

## v1.25 — Review Actions Layer

Updated: 2026-06-17 21:47

Added:
- `src/lib/import-review/importReviewActions.ts`
- interactive approve/reject/edit/attach/merge actions in Import Review Queue UI
- audit log preview for review actions
- candidate editor before apply
- Day Core application guard rules

Docs added:
- `docs/project/import/REVIEW_ACTIONS_LAYER_ARCHITECTURE_v1_25.md`
- `docs/project/data/DAY_CORE_IMPORT_APPLICATION_RULES_v1_25.md`
- `docs/project/implementation/V1_25_IMPLEMENTATION_NOTES.md`
- `docs/project/validation/REGRESSION_CHECK_v1_25.md`
- `docs/project/validation/BUILD_REPORT_v1_25.md`
- `docs/project/security/SECURITY_SCAN_v1_25.md`

Build:
- `NEXT_TELEMETRY_DISABLED=1 npx next build` passed.

No raw data imported. No private data exposed.


## v1.26 — Persistent Review State + Supabase-ready Schema

- Added persistent browser-local review state for Import Review Queue.
- Added Supabase-ready SQL schema for import_review_queues, import_review_candidates and import_review_audit_events.
- Updated Import Review UI with persistence status and reset demo action.
- No raw private data is shown in UI.
- No real database connection or secrets were added.

## v1.27 — Apply-to-Day Core Layer

Updated: 2026-06-17 22:52

Added:
- Day Core dry-run apply preview.
- Rollback-ready Day Core patches.
- Apply-to-Day Core demo action in Import Review Queue panel.
- Apply history preview.
- v1.27 documentation, build, regression and security reports.

Preserved:
- Day Core.
- Import Review Queue.
- Persistent Review State.
- Source 05.
- v2.0 UI Safe.

## v1.28 — Persistent Applied Patch Storage + Rollback Commands

Added:
- `src/lib/day-core/dayCorePatchPersistence.ts`
- persistent applied Day Core patch records
- rollback command for applied records
- patch audit preview
- reset action now clears both import review state and patch state

Changed:
- Import Review persistence schema advanced to v1.28.
- UI label updated to v1.28.
- Package version updated to 0.1.28.

Preserved:
- Day Core model
- Review Queue model
- Source 05
- private_raw_data isolation
- anti-blind-import rule

## v1.29 — Daily Use MVP: Net Calculation Layer

Added:
- `src/lib/day-core/netCalculationModel.ts`
- `src/components/day-core/NetCalculationPanel.tsx`
- clean money calculation after Drivee and fuel
- remaining clean target calculation
- gross needed to reach target net
- warnings when gross plan is not enough for clean goal

Preserved:
- Import Review Queue
- Review actions
- Apply-to-Day Core
- persistent patch rollback
- Source 05
- private_raw_data isolation

## v1.30 — Net Terminology Correction

User clarified that daily clean taxi income means:
`gross - Drivee/commission - fuel`.

Changed:
- renamed clean calculation to "Чистые со смены"
- separated "Свободные после дневного плана"
- added UI definition block
- updated docs with locked terminology

Preserved:
- Day Core
- Net Calculation Layer
- Import Review Queue
- Apply/rollback layer
- private_raw_data isolation

## v1.31 — Current Chat Alignment Audit

Added a control audit comparing the current v1.30 package against the user's current chat requirements.

Result:
- direction is mostly correct;
- final templates are documented but not fully implemented in UI;
- current dashboard values are still demo/mock;
- next recommended implementation is Quick Daily Input, not more architecture-only work.

## v1.32 — Quick Daily Input

Added:
- `src/components/day-core/DailyQuickInputPanel.tsx`
- quick order input
- quick fuel input
- quick expense/task input
- current cash/card/Drivee balance input
- browser-local demo persistence
- live recalculation of gross, clean shift income and free money after plan

Preserved:
- Day Core dashboard
- Net Calculation Layer
- Import Review Queue
- Apply/rollback layer
- Source 05
- private_raw_data isolation

## v1.33 — Daily History + Save Day Snapshot

Added:
- Daily history model
- save day snapshot
- local history summary
- lock/unlock snapshot
- delete unlocked snapshot

Preserved:
- Quick Daily Input
- clean shift calculation
- free after plan calculation
- Import Review Queue
- rollback patch layer
- private_raw_data isolation

## v1.34 — Daily History Detail + Restore Snapshot

Added:
- snapshot detail panel
- restore saved snapshot into Quick Input
- compare current Quick Input vs saved snapshot
- helper functions for daily history detail/restore

Preserved:
- Quick Daily Input
- daily history
- clean shift calculation
- free after plan calculation
- Import Review Queue
- private_raw_data isolation

## v1.35 — Daily Analytics Summary

Added:
- Daily history analytics
- average gross / clean / free
- best and worst saved day
- target hit rate
- clean trend delta
- analytics recommendation

Preserved:
- Quick Daily Input
- save/restore snapshots
- clean shift calculation
- private_raw_data isolation

## v1.36 — Editable Daily Data Layer

Added:
- manual editing for source daily data
- editable taxi totals and targets
- editable Drivee rate
- editable fuel planned/paid
- editable active/full shift hours
- editable task/expense records
- delete task/expense
- clear distinction: source data editable, analytics derived

Preserved:
- Quick Daily Input
- daily history
- save/restore snapshots
- daily analytics
- clean shift calculation
- private_raw_data isolation

## v1.37 — Daily Goal Allocation

Added:
- daily allocation model
- distribution buckets for obligations, funds, critical tasks and work reserve
- normal/recovery/emergency allocation modes
- allocation UI panel
- shortage and unallocated calculation

Preserved:
- editable source data
- derived analytics only
- quick input
- daily history
- private_raw_data isolation

## v1.38 — Editable Funds & Obligations UI

Added:
- create/edit/delete obligations
- create/edit/delete funds
- edit amount due, current saved, due day, priority
- edit fund target/current amount, priority, canReceiveToday
- allocation recalculates from edited source data

Preserved:
- editable daily data
- daily allocation
- daily history/analytics
- clean shift calculation
- private_raw_data isolation

## v1.39 — Project Context Memory Expansion

Added:
- dedicated project context folder
- chat chronicle
- user requirements ledger
- assistant response/decision log
- context update protocol
- live/demo reality register
- open context gaps
- next-step guardrails
- context source map

Locked:
- every future version must update context files
- exact old messages may only be claimed when exact text is available
- source data remains editable; final analytics remains derived

## v1.40 — Full Context Reanalysis & Memory Hardening

Added:
- full chat/archive reanalysis document
- requirement traceability matrix
- context memory operating system
- source recheck register

Updated:
- chat chronicle
- user requirements ledger
- assistant decision log
- context update protocol
- live/demo reality register
- source map
- next-step guardrails

Locked:
- every future version must start with memory/protocol preflight
- every future version must end with context updates
- exact old verbatim messages only when source text is available
- raw private data remains private

## v1.41 — Editable Income/Expense Records List

Added:
- daily records model
- editable records for taxi orders, fuel, expenses and income
- record add/edit/delete/toggle
- record summary
- Day Core derivation from records

Updated:
- context chronicle
- requirements ledger
- assistant decision log
- live reality register
- next-step guardrails
- current state
- project memory

Preserved:
- clean shift formula
- editable source data rule
- derived analytics rule
- funds/obligations editing
- daily allocation
- private_raw_data isolation

## v1.42 — Record Categories, Templates & Filters

Added:
- record templates
- record filters
- category labels
- quick creation buttons for common daily records

Preserved:
- editable records
- derived totals
- clean shift formula
- daily history/analytics/allocation
- context update rule
- private_raw_data isolation

## v1.43 — Custom Record Templates + Bank Source Position

Added:
- custom record templates
- create/edit/delete custom templates
- local custom template persistence
- template/bank recheck document

Clarified:
- records are daily facts
- funds are planning buckets
- bank file is candidate source, not final truth

## v1.44 — Bank Candidate Review → Records

Added:
- bank candidate review model
- redacted candidate preview panel
- approve candidate into editable records
- reject/postpone decisions

Preserved:
- no blind bank import
- editable records
- derived analytics
- custom templates
- private_raw_data isolation

## v1.45 — Full Bank Candidate Pagination & Filters

Added:
- larger redacted bank preview sample
- bank candidate total count
- bank category counts
- candidate filters
- pagination controls

Preserved:
- review-only bank pipeline
- no blind bank import
- editable records
- derived analytics
- private_raw_data isolation

## v1.46 — Full Chat Transcript Ledger

Added:
- full chat transcript ledger
- transcript ledger update protocol
- first available user text recorded

Locked:
- every future package must update transcript ledger
- exact/reconstructed text must be distinguished
- assistant summaries must not include hidden reasoning

## v1.47 — Drivee Commission vs Drivee Top-up Separation

Added:
- `drivee_topup` daily record type
- Drivee top-up summary
- Drivee separation UI explanation
- bank platform commission mapping to Drivee top-up review

Preserved:
- clean shift formula
- editable records
- bank review-only pipeline
- transcript ledger update rule
- private_raw_data isolation

## v1.48 — Supabase Schema for Records & Bank Review

Added:
- Supabase schema SQL
- profiles/days/records/templates/funds/obligations/bank candidates/snapshots tables
- RLS draft policies
- database documentation

Preserved:
- no secrets
- local app behavior
- review-only bank pipeline
- transcript ledger update rule
- private_raw_data isolation

## v1.49 — Supabase Client/Server Integration Plan

Added:
- Supabase client/server architecture plan
- persistence adapter types
- local adapter placeholder
- Supabase integration status/warnings

Preserved:
- no secrets
- local fallback
- v1.48 schema
- review-only bank pipeline
- transcript ledger update rule
- private_raw_data isolation

## v1.50 — Telegram initData Verification Server Route Draft

Added:
- Telegram initData validation helper
- `/api/telegram/verify` server route draft
- Telegram verification architecture docs

Preserved:
- no bot token in files
- no Supabase secrets
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.51 — FINFlow Profile Resolver for Telegram User

Added:
- draft server-side profile resolver
- safe draft profile context in Telegram verify route
- profile resolver architecture docs

Preserved:
- no secrets
- no Supabase write
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.52 — Server-only Supabase Profile Resolver Draft

Added:
- server-only Supabase profile resolver draft helper
- safe env readiness plan/status
- `supabaseProfilePlan` in Telegram verify response

Preserved:
- no Supabase dependency
- no DB writes
- no secrets
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.53 — Supabase Environment & Deployment Checklist

Added:
- deployment checklist
- environment variables documentation
- `.env.example` placeholder template

Preserved:
- no real secrets
- no database writes
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.54 — Supabase Server Client Wrapper Behind Env Checks

Added:
- Supabase server env guard
- `/api/supabase/readiness` route
- resolver draft connected to guard status

Preserved:
- no Supabase dependency
- no database writes
- no secrets
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.54 — Supabase Server Client Wrapper Behind Env Checks

Added:
- `@supabase/supabase-js`
- server-only Supabase wrapper
- safe server readiness status in Telegram verify route
- write feature flag gate

Preserved:
- no secrets
- no database writes
- local fallback
- transcript ledger update rule
- private_raw_data isolation

### v1.54 anti-regression fix

Fixed TypeScript config compatibility:
- changed `ignoreDeprecations` from `6.0` to `5.0` because the current TypeScript compiler rejects `6.0`.

## v1.55 — Supabase Profile Resolve/Create Dry-run API

Added:
- profile resolve/create dry-run helper
- dry-run output in Telegram verify route
- explicit Supabase readiness route
- status report: what is done and what remains

Preserved:
- no real DB writes
- no secrets
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.56 — Built-in AI Assistant Core

Added:
- local rule-based FINFlow assistant core
- assistant panel in Daily Quick Input
- advice modes: emergency/recovery/work_focus/allocation_focus/stable

Preserved:
- no OpenAI key
- no external AI call
- local fallback
- transcript ledger update rule
- private_raw_data isolation

## v1.57 — AI Assistant Prompt & Server-side External AI Bridge Draft

Added:
- assistant prompt builder
- minimized external assistant payload
- server-side external AI bridge dry-run
- `/api/assistant/dry-run`
- external bridge note in UI

Preserved:
- no OpenAI key
- no n8n secret
- no external API call
- local assistant
- private_raw_data isolation

## v1.58 — AI Assistant Chat UI Draft

Added:
- local assistant chat helper
- chat input/output in Daily Quick Input
- local answers for work, spending, fuel, Drivee and funds/obligations

Preserved:
- no external AI call
- no secrets
- local assistant base
- private_raw_data isolation

## v1.59 — Context/Protocol Self-Check Panel

Added:
- project self-check model
- readiness estimates in UI
- context/protocol/security/pending status panel
- readiness documentation

Preserved:
- no secrets
- no external API calls
- local assistant and all previous systems
- private_raw_data isolation

## v1.60 — Full Reanalysis: Car, Bank, AI Partner Memory Sync

Added:
- full reanalysis context document
- car/taxi cost status report
- bank statement status report
- AI partner/cross-dialogue context report
- typed reality context model
- self-check synced with car/bank/AI-partner reality

Preserved:
- no secrets
- no raw bank data exposed
- no private_raw_data exposure
- all previous systems

## v1.61 — Car Maintenance & Mileage Tracking Layer

Added:
- car maintenance model
- oil/spark plug/filter service event
- oil reminder/change odometer calculation
- mileage-based fuel estimate
- car maintenance UI panel
- maintenance log and fuel analysis docs

Preserved:
- all previous systems
- no secrets
- no private_raw_data exposure

## v1.62 — Full Turn Ledger & Interruption Recovery Protocol

Added:
- full turn ledger protocol
- turn-by-turn operation ledger
- active work state file
- interruption recovery queue
- strict future package capture rules

Preserved:
- previous systems
- no secrets
- no private_raw_data exposure

Deferred:
- Daily Fuel Budget From Odometer Layer moved to next product package.

## v1.63 — Full Project Reanalysis & Master Synchronization Audit

Added:
- master project reanalysis audit
- master step history index
- context file sync matrix
- master synchronization state
- updated active work state and interruption recovery queue

Preserved:
- no secrets
- no private_raw_data exposure
- no product feature regression

Deferred:
- Daily Fuel Budget From Odometer Layer remains queued for next product package.

## v1.64 — Origin-to-Current Full History & Ecosystem Master Plan

Added:
- origin-to-current full history audit
- available source coverage/gaps report
- error analyzing/tool interrupt report
- FINFlow ecosystem master plan
- typed ecosystem map

Preserved:
- no secrets
- no private_raw_data exposure
- deferred Daily Fuel Budget task

Note:
- current package contains version markers from v1.1 to v1.64.

## v1.65 — Daily Fuel Budget From Odometer Layer

Added:
- daily fuel budget model
- light/normal/fresh/heavy fuel scenarios
- recommended working fuel reserve
- fuel budget UI panel
- fuel budget status documentation

Preserved:
- car maintenance tracking
- oil reminder/change logic
- no secrets
- no private_raw_data exposure

## v1.66 — Editable Odometer/Fuel Inputs UI

Added:
- editable odometer/fuel input model
- manual previous/current odometer inputs
- manual fuel price and consumption inputs
- km/liters/fuel cost/cost per km calculation

Preserved:
- daily fuel budget scenarios
- car maintenance tracking
- no secrets
- no private_raw_data exposure

## v1.67 — Persist Editable Odometer/Fuel Inputs Locally

Added:
- editable fuel input persistence helper
- localStorage hydration/save
- UI storage note

Preserved:
- editable odometer/fuel inputs
- daily fuel budget scenarios
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.68 — Odometer/Fuel Daily History Log

Added:
- fuel/odometer history model
- localStorage persistence for history
- save current calculation to history
- delete history entry
- totals and averages summary
- recent entries UI

Preserved:
- editable fuel input persistence
- daily fuel budget scenarios
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.69 — Fuel/Odometer Export & Reset Controls

Added:
- fuel/odometer JSON export
- fuel/odometer CSV export
- export preview textarea
- safe clear-history control

Preserved:
- fuel/odometer history
- local-only data handling
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.70 — Fuel/Odometer Charts & Trend Signals

Added:
- fuel/odometer trend model
- local mini chart
- cost per km signals
- rising/falling cost signals
- heavy mileage signal

Preserved:
- fuel/odometer history
- JSON/CSV export
- reset controls
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.71 — Fuel/Odometer Integration Into Net Calculation

Added:
- fuel-to-net integration model
- odometer-adjusted clean money
- odometer-adjusted free money
- fuel plan delta warnings
- apply odometer fuel to day plan action

Preserved:
- fuel history
- trend signals
- export/reset controls
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.72 — Fuel/Odometer Integration Into AI Assistant Advice

Added:
- fuel/odometer assistant advice model
- local AI fuel advice panel
- signals for fuel above plan, clean target risk, expensive km and missing history

Preserved:
- main assistant core
- fuel-to-net integration
- no external AI calls
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.73 — Assistant Chat Uses Fuel/Odometer Context In Answers

Added:
- fuel/odometer chat context
- fuel-aware assistant chat answers
- optional fuel context passed into local assistant chat

Preserved:
- separate fuel AI advice block
- fuel-to-net integration
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.74 — Assistant Chat Uses Car Maintenance Context

Added:
- car maintenance chat context
- car-aware assistant chat answers
- optional car context passed into local assistant chat

Preserved:
- fuel/odometer chat context
- fuel-to-net integration
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.75 — Car Maintenance Repair Fund Integration Into Allocation

Added:
- car repair allocation model
- repair fund target/current/suggested today
- repair fund warnings
- strengthen repair fund action

Preserved:
- existing allocation model
- car maintenance chat context
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.76 — Car Repair Fund Integration Into Assistant Chat Advice

Added:
- car repair allocation chat context
- repair-aware assistant chat answers
- optional repair context passed into local assistant chat

Preserved:
- car maintenance chat context
- fuel/odometer chat context
- repair allocation panel
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.77 — Codex Sync + Live State Stabilization

Added / merged:
- Codex next.config Turbopack root fix
- webpack dev server script
- typecheck/check scripts
- pinned runtime/dev dependencies
- synchronized package-lock
- live Day Core state shared between Dashboard, Quick Input and Net Calculation
- hydration-safe initial history/time handling
- Codex completion report stored in project docs

Preserved:
- v1.73 fuel/odometer chat context
- v1.74 car maintenance chat context
- v1.75 car repair allocation
- v1.76 repair-aware assistant chat
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

v1.77 security adjustment:
- Codex Supabase pin `2.49.1` upgraded to pinned `2.108.2`.
- Reason: local npm audit reported low severity vulnerabilities on the older pin.
- Result: audit after upgrade reported `0 vulnerabilities`.

## v1.78 — Daily Decision Summary: Work, Fuel, Car, Allocation

Added:
- daily decision summary model
- central daily decision UI block
- work/fuel/car/allocation/spending decisions
- combined signal list
- updated Quick Input header after Codex sync

Preserved:
- v1.77 Codex live-state stabilization
- v1.73–v1.76 assistant/fuel/car/repair layers
- no external AI call
- no Supabase writes
- no secrets
- no private_raw_data exposure

## v1.79 — Telegram + Supabase Cloud Day Sync Merge

Merged from corrected Codex v1.73:
- Telegram request auth wrapper
- stronger Telegram initData validation
- Supabase profile resolve/create repository
- cloud day document model
- cloud day repository
- `/api/sync/day` GET/PUT
- CloudDaySyncPanel
- Supabase migration for cloud day documents
- cloud sync env template additions
- Codex handoff/privacy/implementation docs

Preserved:
- v1.78 Daily Decision Summary
- v1.77 live-state stabilization
- v1.76 repair-aware assistant chat
- v1.75 car repair allocation
- v1.74 car maintenance chat context
- v1.73 fuel/odometer chat context
- local-first fallback
- no secrets
- no private_raw_data exposure

## v1.80 — Private Deployment + Real Secrets Environment Wiring

Added:
- deployment readiness server model
- `/api/deployment/readiness`
- Private Deployment UI panel
- deployment runbook
- hardcoded-secret refusal documented
- safe env variable architecture

Preserved:
- v1.79 cloud sync
- v1.78 daily decision summary
- local-first fallback
- no hardcoded secrets
- no private_raw_data exposure

## v1.81 — Real Telegram/Supabase Verification Checklist UI

Added:
- Telegram/Supabase verification checklist model
- readiness percentage cards
- verification stage list
- critical path to real daily Mini App
- dashboard integration

Preserved:
- v1.80 private deployment readiness
- v1.79 cloud sync foundation
- v1.78 daily decision summary
- no hardcoded secrets
- no private_raw_data exposure

## v1.82 — Daily Decision Summary Into Assistant Chat

Added:
- daily decision chat context
- unified day-summary answers in local assistant chat
- broad question routing for work/fuel/car/spending/global day decisions

Preserved:
- v1.81 verification checklist
- v1.80 private deployment readiness
- v1.79 cloud sync foundation
- v1.78 daily decision summary UI
- no external AI call
- no hardcoded secrets
- no private_raw_data exposure

## v1.83 — Cloud Sync Verification State Persistence

Added:
- verification checklist progress model
- localStorage persistence
- stage status controls
- stage notes
- progress percent and next-stage hint
- reset local marks action

Preserved:
- v1.82 Daily Decision Chat
- v1.81 verification checklist
- v1.80 private deployment readiness
- v1.79 cloud sync foundation
- no hardcoded secrets
- no Supabase writes
- no private_raw_data exposure

## v1.84 — Cloud Sync Verification Export / Handoff Report

Added:
- verification handoff report model
- Markdown export
- JSON export
- copy-to-clipboard action
- secret-like note sanitization

Preserved:
- v1.83 persistent checklist progress
- v1.82 Daily Decision Chat
- v1.79 cloud sync foundation
- no hardcoded secrets
- no Supabase writes
- no private_raw_data exposure

## v1.85 — Deployment Acceptance Test Runner Draft

Added:
- acceptance test runner model
- acceptance test runner UI
- safe checks for readiness routes
- Telegram verify test when Mini App initData exists
- cloud read-preview GET test
- manual guarded statuses for cloud save/conflict/RLS

Preserved:
- v1.84 handoff export
- v1.83 verification persistence
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

## v1.86 — Manual Cloud Save/Conflict Test Wizard

Added:
- manual cloud test wizard model
- manual cloud test wizard UI
- persistent wizard state
- save/load/apply/conflict/rollback steps
- gate for real data readiness

Preserved:
- v1.85 acceptance runner
- v1.84 handoff export
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

## v1.87 — Local Backup / Restore Safety Layer

Added:
- local backup model
- local backup/restore UI
- backup JSON export
- backup JSON import
- restore through existing day document loader

Preserved:
- v1.86 manual cloud wizard
- v1.85 acceptance runner
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

## v1.88 — Backup-Aware Cloud Test Flow

Added:
- backup-aware cloud test gate
- local backup state reading in Manual Cloud Wizard
- create local backup step in wizard
- manual cloud write/conflict status blocking without backup
- backup refresh event from Local Backup panel

Preserved:
- v1.87 local backup/restore
- v1.86 manual cloud wizard
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

## v1.89 — Local Backup Diff / Restore Preview

Added:
- local backup diff model
- restore preview before confirm restore
- current vs backup field comparison
- severity levels for restore changes

Preserved:
- v1.88 backup-aware cloud test gate
- v1.87 local backup/restore
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

## v1.90 — Codex v1.87 Synchronization

Added / merged:
- Codex context/completion docs under `docs/project/codex`
- Codex browser localStorage backup/restore tool
- strict cloud document validation
- cloud load pending reset
- hardened deployment acceptance predicates
- hardened Supabase readiness route
- optional anon-key semantics for server-only cloud bridge
- improved profile fallback warning
- stronger Supabase migration revokes/grants
- manual cloud wizard legacy storage + skipped status + RLS review step

Preserved:
- v1.89 local backup diff/restore preview
- v1.88 backup-aware cloud test flow
- v1.87 local day document backup/restore
- no automatic cloud writes
- no hardcoded secrets
- no private_raw_data exposure

Excluded:
- Codex `private_raw_data`
- raw bank PDF/CSV
- `.env.local`
- tokens and service-role keys

## v1.92 — Claude v1.73 Synchronization

Added:
- full Claude v1.73 package preserved in `private_vault`
- Telegram WebApp client bridge
- Telegram session hook
- Telegram session pill in dashboard
- Telegram SDK script in layout

Preserved:
- v1.91 MASTER PRIVATE FULL structure
- v1.90 Codex sync hardening
- v1.89 backup diff/restore preview
- v1.88 backup-aware cloud test flow
- no automatic cloud writes
- private vault separation

## v1.93 — Cloud Restore Preview Diff

Added:
- cloud restore diff model
- cloud preview diff UI
- local vs cloud field comparison
- manual confirm before cloud preview apply

Preserved:
- v1.92 Claude sync
- v1.91 MASTER PRIVATE FULL structure
- private_vault
- no automatic cloud writes

## v1.94 — Cloud Apply Rollback Snapshot

Added:
- cloud apply rollback model
- snapshot before cloud preview apply
- sessionStorage rollback persistence
- rollback local apply button
- clear rollback snapshot button

Preserved:
- v1.93 cloud restore preview diff
- MASTER PRIVATE FULL structure
- private_vault
- no automatic cloud writes

## v1.95 — Cloud Save Preflight Backup Gate

Added:
- cloud save preflight model
- save preflight UI
- local backup metadata reading in CloudDaySyncPanel
- save blocking without safety net
- save warning confirmation for partial safety state

Preserved:
- v1.94 cloud apply rollback
- v1.93 cloud restore preview diff
- MASTER PRIVATE FULL structure
- private_vault
- no automatic cloud writes

## v1.96 — Full Audit, UX Readiness Board and Build Fixes

Added:
- ecosystem readiness audit model
- dashboard readiness board
- full system audit report
- user requirements coverage report
- stable build script

Fixed:
- Next build/page-data worker instability
- app root clutter from historical manifests

Preserved:
- MASTER PRIVATE FULL structure
- private_vault
- cloud safety systems
- no automatic cloud writes

## v1.97 — Claude Nav Review Sync

Added:
- functional bottom navigation tabs
- daily/money/system grouping
- system panels hidden from default daily flow
- full Claude nav-review package in private_vault

Preserved:
- v1.96 audit board
- v1.95 cloud save preflight
- v1.94 rollback
- v1.93 cloud restore diff
- MASTER PRIVATE FULL structure

## v1.98 — Daily Mode Polish / Evening Summary Flow

Added:
- morning plan / work quick-flow / evening summary daily mode
- dedicated view modes for Day, Money, Work, Funds, AI and System
- System/Dev isolation for cloud sync, backups, deployment and verification tools
- responsive daily phase cards and evening summary UI
- uploaded new-chat handoff files preserved in private_vault

Improved:
- default daily screen is less cluttered
- bottom navigation tabs now map to clearer product areas
- daily UX convenience readiness estimate improved

Preserved:
- v1.97 navigation
- v1.96 audit/readiness board
- v1.95 cloud save preflight
- v1.94 rollback
- v1.93 cloud restore diff
- MASTER PRIVATE FULL and private_vault separation

## v1.99 — Claude Optimized Sync / Deploy Footprint Hardening

Date: 2026-06-20

Synchronized uploaded Claude v1.94 Optimized package with current v1.98 master.

Added:
- `.dockerignore` in `finflow_app`.
- `.vercelignore` in `finflow_app`.
- `output: 'standalone'`, `poweredByHeader: false`, `compress: true`, `productionBrowserSourceMaps: false` in `next.config.js`.
- `docs/project/audits/CLAUDE_OPTIMIZED_SYNC_AUDIT_v1_99.md`.
- `docs/project/implementation/V1_99_CLAUDE_OPTIMIZED_SYNC_AND_DEPLOY_FOOTPRINT_HARDENING.md`.
- `docs/project/security/SECURITY_REVIEW_v1_99_CLAUDE_OPTIMIZED_SYNC.md`.
- `docs/project/validation/VALIDATION_PLAN_v1_99.md`.
- `docs/project/status/CLAUDE_OPTIMIZED_SYNC_STATUS_v1_99.md`.
- Full external Claude upload preserved in `private_vault/claude_optimized_v1_94_uploaded_2026_06_20/`.

Preserved:
- v1.95 Cloud Save Preflight Backup Gate.
- v1.96 Ecosystem Readiness Board and full audit layer.
- v1.97 six-tab navigation.
- v1.98 Daily Mode Polish: morning plan, working quick-flow and evening summary.

Not merged:
- Older Claude runtime components that would regress current v1.98 systems.

Validation:
- npm ci, lint, build and npm audit passed; see MASTER_PRIVATE_DOCS build report for final command results.

## v2.00 — Daily Persistence / Cross-tab State Hardening

Date: 2026-06-20

Added:
- `src/lib/day-core/dailyLiveStatePersistence.ts`.
- Unified active-day local snapshot: `finflow.dailyLiveState.v2_00`.
- Same-tab daily state notification via CustomEvent.
- Cross-tab daily state notification via BroadcastChannel.
- Browser storage event fallback.
- State signature and origin tab loop protection.
- DashboardShell live-state hydration/subscription.
- DailyQuickInputPanel live-state hydration/write/subscription.
- Live-state status UI in shell and daily/work/system views.
- `docs/project/implementation/V2_00_DAILY_PERSISTENCE_CROSS_TAB_STATE_HARDENING.md`.
- `docs/project/security/SECURITY_REVIEW_v2_00_DAILY_LIVE_STATE.md`.
- `docs/project/validation/VALIDATION_PLAN_v2_00.md`.
- `docs/project/status/DAILY_LIVE_STATE_STATUS_v2_00.md`.
- `docs/project/audits/V2_00_CROSS_TAB_STATE_AUDIT.md`.

Improved:
- Daily tabs now share one browser-local active-day model.
- Switching between Day / Money / Work / Funds / AI / System is less likely to show stale state.
- Another browser tab can receive active-day updates.

Preserved:
- Legacy v1.47 localStorage keys.
- v1.98 Daily Mode Polish.
- v1.97 navigation.
- v1.95+ cloud safety and backup systems.
- private_vault separation.

Validation:
- npm ci, lint, build and npm audit passed; see MASTER_PRIVATE_DOCS build report.

## v2.01 — Active Day Session Controls / New Day Roll-over

Date: 2026-06-20

Added:
- `src/lib/day-core/activeDaySessionModel.ts`.
- Active day session key: `finflow.activeDaySession.v2_01`.
- Rollover archive key: `finflow.activeDayRolloverArchive.v2_01`.
- Daily Mode card for active-day controls.
- “Закрыть день → новый день” flow.
- Automatic Daily History snapshot before new-day rollover.
- Full previous-day live-state archive before reset.
- One-click restore of latest rollover archive.
- Fuel odometer day rollover: previous odometer becomes current odometer.
- `docs/project/implementation/V2_01_ACTIVE_DAY_SESSION_CONTROLS.md`.
- `docs/project/security/SECURITY_REVIEW_v2_01_ACTIVE_DAY_SESSION.md`.
- `docs/project/validation/VALIDATION_PLAN_v2_01.md`.
- `docs/project/status/ACTIVE_DAY_SESSION_STATUS_v2_01.md`.
- `docs/project/audits/V2_01_NEW_DAY_ROLLOVER_AUDIT.md`.

Improved:
- Daily use is safer because starting a new day no longer means destructive reset.
- Previous day is saved to history and rollback archive before a clean active day is created.
- The app is closer to Telegram daily usage because day boundaries are now explicit.

Preserved:
- v2.00 unified live-state/cross-tab sync.
- v1.98 Daily Mode Polish.
- v1.97 navigation.
- v1.95+ cloud safety and backup systems.
- private_vault separation.

Validation:
- npm ci, lint, build and npm audit passed; see MASTER_PRIVATE_DOCS build report.

## v2.02 — Claude Audit Sync / Static Shell & Server Cleanup

- Analyzed uploaded Claude v1.99.1 audited package against current v2.01 master.
- Preserved full external Claude package in `private_vault/claude_audited_v1_99_1_uploaded_2026_06_20/`.
- Merged non-regressive static shell optimization by removing unnecessary `force-dynamic` from `app/page.tsx`.
- Removed dead Supabase profile draft/dry-run runtime files.
- Removed obsolete profile resolver placeholder exports and documented the current server-only path.
- Rejected older Claude UI/app files that would roll back v2.00 shared live-state and v2.01 New Day rollover.
- Updated package version to `0.2.2`.
- Added implementation, audit, security, validation and status docs for v2.02.


## v2.03 — Telegram Mini App Staging Deploy Package / BotFather Runbook

- Added Telegram staging runbook model and System tab panel.
- Added deploy-safe package generator script.
- Added `vercel.json` for staging build/security headers.
- Generated `exports/FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_v2_03.zip`.
- Added BotFather/Vercel staging runbooks, security review, validation plan and status doc.
- Updated readiness board to show `было → стало` percentages per user instruction.
- Preserved v2.00 live-state, v2.01 New Day rollover, v2.02 static shell/server cleanup and all cloud safety gates.

## v2.04 — Real Telegram Device Test / initData + viewport + cloud dry-run checklist

- Added `src/lib/deployment/telegramDeviceTestModel.ts`.
- Added `src/components/deployment/TelegramDeviceTestPanel.tsx`.
- Added real Telegram device diagnostics in System tab: bridge, initData presence, safe user presence, platform, version, theme, viewport and expanded state.
- Added safe runtime checks for `/api/telegram/verify`, `/api/deployment/readiness`, `/api/supabase/readiness` and read-only `GET /api/sync/day` cloud dry-run.
- Kept v2.04 no-write: no `PUT /api/sync/day` is called by the new panel.
- Updated Telegram WebApp bridge typing with `viewportStableHeight`.
- Updated deploy-safe package generator to v2.04.
- Updated readiness board and project docs with `было → стало` percentage format.
- Preserved all v2.03/v2.02/v2.01/v2.00 systems and safety gates.

## v2.04.1 — Vercel Install Hotfix
- Fixed first Vercel staging deployment failure at `npm ci --ignore-scripts`.
- Removed deploy lockfile from staging package because it was generated in an internal package mirror environment.
- Switched Vercel install to `npm install --ignore-scripts --no-audit`.
- Added `.npmrc` with public npm registry.
- Pinned public npm-compatible dependency versions.
- Preserved v2.04 Telegram Device Test, v2.03 staging runbook, v2.01 day rollover, and v2.00 live-state.
