# FINFLOW PROJECT MEMORY

Version: v1.2
Status: living project memory inside repository/archive.

## Product identity
FinFlow is not just an expense tracker. It is a personal AI operating system for daily money, taxi work, time, car costs, goals, funds, and decisions.

Main question:
> What should I do today so I do not start from zero tomorrow, can close obligations, protect the car, build a cushion, support close people, and gradually move toward stronger income?

## Core chain
Current time -> calendar/tasks/sleep/food -> available work window -> gross taxi target -> work costs -> real net -> allocation -> funds/goals -> AI recommendation.

## Global user principles
- Work step by step.
- Preserve old working systems.
- Never let improvements break existing systems.
- Check dependencies before changing code.
- Use locked decisions and project documents as source of truth.
- Update changelog after meaningful changes.
- Prefer a quick daily-usable MVP first, then improve.
- Security-first: no secrets in GitHub or public files.

## Current development strategy
Greenfield rebuild is allowed for implementation, but not for meaning. New code may be built cleanly, but all logic, rules, project history, data concepts, and locked decisions must be preserved.

## Immediate build focus
Step 1: Foundation launch.
Step 2: Daily Money Planner.
Step 3: Manual input.
Step 4: Persistence/Supabase.
Step 5: Taxi/Work Core.
Step 6: n8n AI.

## v1.3 memory additions
- Project must contain its own structured memory files so context is not only in chat.
- `private_raw_data` must never be uploaded to GitHub/cloud/public archives.
- All important future changes must update docs/changelog/backlog/specs without waiting for user reminders.
- Historical data sent in files must eventually be normalized into one template before production import.
- Development must proceed via local changes, not repeated full rewrites.

---

## v1.6 Memory — exact daily allocation thinking

The user clarified that daily taxi planning should start from concrete needs, not abstract targets. Example: fuel, Drivee, food, meeting, products, bankruptcy remainder. FinFlow must calculate gross needed, show exact allocations, and use current time to decide whether the plan is realistic. If it is already late, the app must recommend what to prioritize/postpone, not just display an impossible target.

## v1.7 Memory Update — Orders already done today must change the plan

User clarified that FinFlow must account for how many orders have already been completed today and how much gross turnover has already been made. Daily recommendations must be live: after every order/income/expense entry, the app recalculates remaining gross target, Drivee fee estimate, feasibility based on current time, and recommended allocation priorities. This is essential for practical taxi use during the day.

## 2026-06-15 — Incremental update principle strengthened

The user explicitly clarified that project files and code must not be rewritten from scratch each time. All improvements must be integrated harmoniously into the current system. This applies to documentation, code, data specs, protocols, changelog, normalized historical data, and future Codex/Cursor work.

Operational rule: every meaningful change must update only the necessary files/sections, preserve existing decisions, run anti-regression checks, and update memory/changelog/audit if needed.


## v1.9 Memory: Allocation Recommendations
FinFlow must recommend exactly how much money to allocate and where. It must not only show totals or abstract advice. After every order, income, expense, balance change, task, time change, or mini-goal, it must recalculate the plan and say what to pay first, what to reduce, and what to postpone.

## v1.10 additions

- Added Context-Aware Response Protocol: every project response must consider full chat history, files, docs, protocols, changelog, and current archive state.
- Added Meetings Fund & Relationship Time Spec.
- Meetings Fund target: usually 2,000–3,000 ₽ available.
- FinFlow must track average days per week spent with girlfriend and estimate weekly relationship budget/time impact.
- Relationship time/spending must affect daily gross target, calendar availability, and smart allocation recommendations.

## v1.11 correction

Correction:
- Average meetings with girlfriend is 5 times per week.
- The earlier 2–3/week assumption is obsolete.
- Meetings Fund should usually have 2,000–3,000 ₽ available and must be treated as a recurring turnover buffer.

Process strengthening:
- For important project answers, rely on project files and protocols, not only memory.
- Maintain dated history and master requirements index.

## v1.12 provenance correction

Do not treat 03.06.2026 as the start of the current active conversation. It is earlier Taxi Income Bot / FinFlow context from previous conversation or uploaded historical material.

The current active working conversation for FinFlow v3 archive/rebuild sequence is treated as 15.06.2026.

Always distinguish:
- current chat;
- previous/imported chat context;
- historical financial data;
- generated project artifacts.

## v1.13 imported project context rule

Previous imported project files and conversations are part of FinFlow memory and must be analyzed as valid project sources.

A shared ChatGPT link was provided:
https://chatgpt.com/share/6a2c2a25-1b00-83eb-932a-90dcd35cdd86

Observed title: "ChatGPT - Анализ проекта учёта".

Current status: pending full extraction, because the browser-accessible content showed only the ChatGPT login/shell, not the full conversation.

Do not claim this shared chat has been fully analyzed until the content is available as text/export/screenshots.

## v1.14 response integrity rule

For important FinFlow/project responses, assistant must include a short integrity check:
- nothing deleted;
- nothing replaced silently;
- affected files/modules;
- what changed;
- what remains;
- next verification step.

Assistant must use project files and previous imported context, not latest message only.

## v1.15 full context audit

A full context audit pass was added based on currently accessible conversation, uploaded files, v1.14 package docs, and project memory.

New audit files:
- FULL_CONTEXT_AUDIT_REPORT_v1_15.md
- SOURCE_TO_REQUIREMENT_MAP_v1_15.md
- LOST_REQUIREMENTS_RECOVERY_REPORT_v1_15.md
- CONTEXT_CONTROL_DASHBOARD_v1_15.md

Important limitation:
The external ChatGPT share link remains pending full extraction because full conversation text was not available through browsing.

## v1.17 source intake phase

The user decided that before continuing direct application development, the project should process all major source files one by one and convert them into clean canonical project memory.

Planned sources:
1. Archive of current chat.
2. All user messages as text.
3. All assistant messages as text.
4. Bank document.
5. Previous chats and Telegram channel documents.

Coding is paused unless explicitly approved. Current v1.16 code remains preserved.

## v1.18 Source 01 processed

Processed Source 01: current chat text file `Вставленный текст(16).txt`.

Key confirmed points:
- FinFlow is a live personal operating system, not static accounting.
- Live dashboard must include date/time/time-of-day/weather/auto-refresh.
- Statistics must exist in every core section.
- Import must include Telegram, bank, manual records, screenshots/notes, and future app data.
- Current v1.16 code remains preserved while source intake proceeds.
- Source intake continues with Source 02: all user messages text document.

## v1.19 source intake adjustment

The user clarified that they will not split user and assistant messages into separate documents.

The intake process now accepts combined mixed transcripts.

Old plan:
- Source 02 — all user messages;
- Source 03 — all assistant messages.

New plan:
- Source 02 — combined transcript / mixed user + assistant messages;
- Source 03 — bank document;
- Source 04 — previous chats and Telegram channel documents.

## v1.20 bank document intake

Source 03 bank statement processed.

Extracted:
- 105 PDF pages;
- 2766 transaction candidates;
- incoming/replenishment total: 1 486 492.27 ₽;
- outgoing total: -1 484 097.64 ₽.

Important:
Bank rows are candidates  not final accounting. Incoming replenishments and internal/person transfers require review before being counted as income/expenses.

New docs:
- SOURCE_REVIEW_03_BANK_STATEMENT.md
- BANK_IMPORT_AND_REVIEW_QUEUE_SPEC.md
- BANK_CATEGORY_MAPPING_DRAFT_v1_20.md
- BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv

## v1.21 Source 04 correction

Important correction:
The uploaded archive `Все файлы.rar` was not a large data archive. It is 24 bytes, has a RAR5 signature, and contains zero files.

Status:
Source 04 is processed as `processed_empty_archive`.

Future sessions must not repeat extraction attempts on this same archive. Continue with standalone uploaded text/project files and already available sources, or request a new non-empty archive if needed.

## v1.22 Source 05 context archive intake

The real context archive has been processed successfully. It contains FinFlow project docs, static/app snapshot, raw Telegram/spending/taxi text exports, screenshots, one bank/person PDF, and current-chat DOCX.

Confirmed project rules from Source 05:
- FinFlow is a daily operating system, not just an expense tracker.
- Day Core remains central: sleep → shift → income → expenses → net → funds → goals → tomorrow.
- Time Core remains required: date, weekday, current time, day part.
- UI Safe v2.0 remains canonical.
- Historical import must go through review queue.
- Full editing, soft delete, audit log, restore, and export remain required.
- Development must be incremental and anti-regression-first.

Source 05 should be integrated as context and historical import material, not used to overwrite the latest working package blindly.


<!-- v1.24 root mirror update -->


## v1.23 memory update — Source 05 semantic review
Source 05 confirms that FinFlow must remain a personal operating system for day, taxi work, money, car, goals, sleep, time and AI decisions.

Do not reduce FinFlow to a simple finance tracker.

Source 05 import rule:
- old taxi/expense/bank/chat data must be parsed as candidates;
- the user must review and approve before it becomes live data;
- raw private data must remain private.


## Memory Update — v1.24

Import Review Queue is now a locked architectural path: Source 05 and all historical/private sources must be normalized into candidates first. Candidates with `sensitive` or `high` risk must not be auto-applied. Day Core input must come through a unified model before calculation. This protects against confusing goals with facts, plans with transactions, and bank transfers with income.

## v1.28 memory

Day Core changes from import review are now tracked as persistent applied patch records.

Core safety principle:
A candidate must never become a real Day Core fact without review, explicit apply, audit, and rollback-ready state.

## v1.29 memory

User explicitly required clean-money calculation.

Locked principle:
FinFlow must always show gross and net together. Gross alone is not enough because taxi work has Drivee, fuel, car, food, meeting and obligation costs.

## v1.30 memory

User's clean income definition is correct for taxi:
чистые со смены = грязными - комиссия - бензин.

FinFlow must not mix this with free money after obligations and personal spending.

## v1.31 memory

The user requested a reality check: whether the app matches current chat requests and whether data/templates are live and real.

Locked finding:
- Requirements and code foundation are real.
- UI financial values are still demo/mock.
- Final templates are documented and partially modeled, but not fully implemented as daily user-facing forms.
- Next priority is Quick Daily Input.

## v1.32 memory

User wants a usable daily mini app as soon as possible.
Quick Daily Input is the first practical step toward replacing mock values with user-entered live day values.

## v1.33 memory

User needs the app to become real and daily-useful. Saving day snapshots is the bridge from demo input to real history.

## v1.34 memory

The user wants live and real daily usage. History detail + restore makes daily records usable instead of just stored.

## v1.35 memory

The daily MVP now starts answering whether taxi work is becoming stable enough, not just recording numbers.

## v1.36 memory

User explicitly required: all data except final analytics must be easily and manually editable. This is now a locked product rule.

## v1.37 memory

User needs exact money distribution after clean calculation. Allocation is a recommendation derived from editable source data, not a real money movement.

## v1.38 memory

User wants all base data editable except final analytics. Funds and obligations are now editable in UI and feed allocation automatically.

## v1.39 memory

User explicitly requires project-level context memory:
all future user requests and assistant actions must be reflected in project context files so development relies on concrete requirements, not only chat memory.

## v1.40 memory

User corrected the context approach: the assistant must constantly update and hold project memory, recheck all files/protocols step by step, improve without losing context, and reanalyze the full available chat and 7z archive sources.

This is now a P0 rule for all future work.

## v1.41 memory

User confirmed that future work must always rely on the context-memory rule. v1.41 followed memory preflight and updated context files before packaging.

Editable records are now source data for daily calculations.

## v1.42 memory

Record entry must be fast in real daily use. Templates and filters reduce friction while preserving editable source-data and derived analytics rules.

## v1.43 memory

User asked to recheck how templates match his planned daily input: orders, expenses and funds. The correct model is records for facts, funds for allocation targets, bank PDF as review source.

## v1.44 memory

Bank file is now connected conceptually to daily records through review. The user must approve candidates before they affect records/analytics.

## v1.45 memory

Bank review is becoming usable step by step: first preview, then approve-to-record, now filtering and pagination. It must remain review-based.

## v1.46 memory

User requires the conversation transcript to be preserved and updated from the first available message. First available user text in Source 01 is: “Нужно изучить и проанализировать”.

## v1.47 memory

Drivee must be modeled carefully: commission is not the same as topping up Drivee balance. This distinction is now locked.

## v1.48 memory

Persistent storage must be security-first. Supabase schema exists as a draft with RLS, but production connection/auth is not implemented yet.

## v1.49 memory

Supabase must be connected only through a safe client/server architecture: no service_role in frontend, Telegram initData verified server-side, RLS tested, local fallback preserved.

## v1.50 memory

Telegram identity must be verified server-side before Supabase profile persistence. Bot token must never be exposed to frontend.

## v1.51 memory

Profile resolution must happen server-side after Telegram verification. Draft resolver exists, but production Supabase profile persistence is still pending.

## v1.52 memory

Supabase profile resolver must stay server-only. v1.52 adds only a safe draft/status plan; production DB writes remain pending.

## v1.53 memory

Before deployment or Supabase writes, env/RLS/Telegram verification must be checked. Real secrets and private_raw_data must never be committed or uploaded publicly.

## v1.54 memory

Real Supabase writes must be gated by server env readiness and `FINFLOW_ENABLE_SUPABASE_WRITES=true`, with no secret values exposed.

## v1.54 memory

Supabase writes must remain gated by `FINFLOW_ENABLE_SUPABASE_WRITES=true`. Server status can expose readiness only, never secret values.

## v1.55 memory

User asked what is done and how much remains. Current estimate: private daily-usable MVP needs roughly 8–15 focused steps; more production-ready Telegram Mini App needs roughly 20–35 focused steps.

## v1.56 memory

The built-in AI assistant should be a daily decision dispatcher. Start local/rule-based; external AI must be server-side only.

## v1.57 memory

Future external AI must be server-side and minimized. The local assistant remains the safe base.

## v1.58 memory

User asked whether assistant can do everything and when VS Code is needed. Answer: assistant can build packages and code; user is needed for local run, credentials, accounts, visual testing and deployment.

## v1.58 continuation memory

User reminded to keep relying on, checking and updating all context/protocol files. This remains a locked working rule for all future packages.

## v1.59 memory

Readiness estimate:
- foundation/MVP inside project: 60–65%;
- private daily-usable MVP: 40–50%;
- production-ready Telegram Mini App: 25–35%.

## v1.60 memory

User asked to reanalyze full correspondence and verify car costs, bank statement and AI-partner continuity. These are now synced into dedicated project files and typed context.

Locked car context:
Toyota Premio 2007, 1.8L, AI-92 75.51 ₽/l, 11–13 L/100 km, 80–150 km/day, Drivee ~13%, repair fund ~50,000 ₽.

Locked bank context:
T-Bank 01.12.2025–06.06.2026, 105 pages, 2,766 review candidates, not final accounting.

## v1.61 memory

User changed oil, spark plugs, oil filter and air filter on 16.06.2026 at 280,041 km. On 18.06.2026 odometer was 280,420 km. Oil change plan is 7,000 km, reminder at 5,000 km. Future oil brand/spec will be provided later.

## v1.62 memory

User strongly required every user message and every assistant action/answer to be file-fixed, and interruptions to be handled without losing the current step. This is now a locked workflow protocol.

Previous planned next step, Daily Fuel Budget From Odometer Layer, is deferred to v1.63 unless user changes priority.

## v1.63 memory

User required full reanalysis and synchronization after the new full-turn ledger protocol. v1.63 performs a master audit of development history, context files, current state and deferred work.

Next product task remains Daily Fuel Budget From Odometer Layer unless user changes priority.

## v1.64 memory

User corrected the audit scope: not only recent steps, but all available history from the earliest version. User also asked why `error analyzing` keeps happening and stated that the result must be a whole ecosystem.

Current package adds origin-to-current audit and ecosystem master plan. Deferred product task remains Daily Fuel Budget From Odometer Layer.

## v1.65 memory

Deferred Daily Fuel Budget From Odometer Layer was resumed and implemented. Recommended temporary fuel reserve is about 1,900 ₽/day based on fresh average 189.5 km/day and 13 L/100 km high estimate.

## v1.66 memory

Editable odometer/fuel input layer added after daily fuel budget scenarios. Next logical step is local persistence for these editable values.

## v1.67 memory

Editable odometer/fuel input values now persist locally via `finflow.editableFuelInputs.v1_67`. Next logical step is a daily odometer/fuel history log.

## v1.68 memory

Odometer/fuel history log added with localStorage key `finflow.fuelOdometerHistory.v1_68`. Next logical step is export/reset controls.

## v1.69 memory

Fuel/odometer export and reset controls added. Export is local only and does not send data outside the browser.

## v1.70 memory

Fuel/odometer trend signals added. Next logical step is to integrate actual odometer-derived fuel cost into daily net calculation.

## v1.71 memory

Odometer-derived fuel cost now connects to daily net calculation. Next logical step is connecting fuel/odometer signals into the local AI assistant advice.

## v1.72 memory

Fuel/odometer cost now feeds a local AI assistant advice layer. Next logical step is making assistant chat answers use this fuel context directly.

## v1.73 memory

Fuel/odometer context is now integrated into the local assistant chat. Next logical step is car maintenance context in chat.

## v1.74 memory

Car maintenance context is now integrated into the local assistant chat. Next logical step is tying car repair fund risk into allocation.

## v1.75 memory

Car repair fund is now integrated into daily allocation. Next logical step is making assistant chat explicitly account for repair fund allocation risk when answering spending/work questions.

## v1.76 memory

Car repair allocation is now integrated into local assistant chat. Next logical step is a unified Daily Decision Summary combining work, fuel, car and allocation.

## v1.77 memory

External Codex branch synchronization completed. Important rule reinforced: corrected older branches are never copied over newer work wholesale; they are analyzed and merged selectively to prevent regression.

## v1.78 memory

Daily Decision Summary added after Codex sync. This becomes the central command block for daily actions across work, fuel, car, allocation and spending safety.

## v1.79 memory

Codex v1.73 cloud sync has been merged into latest v1.78 without removing current systems. Future cloud work must remain local-first, manual-review, feature-flagged, server-only for secrets, and preview-before-apply.

## v1.80 memory

User wants real daily FINFlow ecosystem in Telegram Mini App. Important correction stored: secrets are required but must never be hardcoded; they belong in server/hosting environment variables only.

## v1.81 memory

Readiness estimate formalized: local foundation ~82%, daily local use ~70%, cloud foundation ~62%, production ecosystem ~42%. Production depends on external Supabase/Telegram/deployment/phone/RLS/backup verification.

## v1.82 memory

Global assistant behavior improved: local chat now uses the unified daily decision summary before isolated module contexts for broad day/work/money questions.

## v1.83 memory

Verification checklist is now operational and persistent in localStorage. Reminder: checklist notes must not contain tokens, service keys, bank raw data or private_raw_data.

## v1.84 memory

Verification handoff export added. Use it before switching chats/tools so deployment progress is not lost. Do not include real secrets in notes or exported text.

## v1.85 memory

Acceptance test runner exists. It must never auto-write cloud data. Cloud save/conflict/RLS tests remain manual guarded until real deployment is verified.

## v1.86 memory

Manual cloud test wizard exists. Real cloud save/load/conflict testing should use a harmless test marker and never include tokens, .env.local, bank raw data or private_raw_data in notes.

## v1.87 memory

Local backup/restore exists. Before real cloud save/load/conflict tests, create a local backup. Backups must not include secrets, .env.local, private_raw_data or raw bank files.

## v1.88 memory

Backup-aware cloud test flow added. Before marking manual cloud write/conflict steps as passed/in progress, a local backup must exist.

## v1.89 memory

Local backup restore now has preview/diff. Do not restore blindly before cloud sync tests.

## v1.90 memory

Codex v1.87 sync completed on top of v1.89. Codex private_raw_data is not included. Useful Codex hardening merged: strict cloud document validation, readiness hardening, acceptance runner predicates, migration security, manual wizard legacy/skipped handling and browser localStorage backup.

## v1.92 memory

Claude sync completed: keep full Claude package in private_vault and use its Telegram WebApp client bridge in working app. Do not downgrade current API/cloud/day systems to older v1.73 code.

## v1.93 memory

Cloud restore preview diff is now active. Cloud apply is not blind: preview shows key differences and asks confirmation before local apply.

## v1.94 memory

Cloud apply rollback exists. Applying loaded cloud preview creates a session rollback snapshot and user can restore pre-apply local document.

## v1.95 memory

Current readiness estimate: local mini app ~90%, daily local use ~85%, Telegram Mini App layer ~76%, cloud sync foundation ~78%, safe launch readiness ~74%, production ecosystem ~64%. Cloud save now requires safety preflight.

## v1.96 memory

Full audit completed on latest MASTER PRIVATE FULL. Build instability fixed with dynamic page + Next one-worker config + scripts/build-next.mjs. Root FILE_MANIFEST clutter moved to docs/project/manifests/archive. Added EcosystemReadinessBoard. Current readiness: local Day Core 91%, daily local use 86%, Telegram 77%, cloud foundation 79%, safety 82%, UX daily convenience 72%, production ecosystem 66%. Next recommended task: Daily Mode / Dev Mode Split.

## v1.97 memory

Claude nav-review sync completed. Functional 6-tab navigation is active in DashboardShell. Do not downgrade cloud preflight/rollback/audit systems when syncing older packages.

## v1.98 memory

Daily Mode Polish completed. Default daily use should stay simple: morning plan, work quick-flow and evening summary. Do not put cloud sync, deployment, verification, backup, project self-check or dev panels back into the default Day flow. System/Dev tools belong in the System tab. Future work should harden shared active-day state across tabs so all views use one live model without relying only on remount + localStorage hydration.

## v1.99 Memory Update — Claude Optimized Sync

User uploaded a corrected Claude package and explicitly required full synchronization, not replacement. The rule is reinforced: external Claude/Codex/model packages are sources of fixes, not new bases, unless they are proven newer and compatible.

For this package:
- Current v1.98 master stayed authoritative.
- Claude v1.94 Optimized was preserved in `private_vault`.
- Only safe deploy-footprint improvements were merged.
- Later systems from v1.95–v1.98 were preserved, especially Daily Mode Polish, cloud save preflight, ecosystem readiness, backup/restore and six-tab navigation.

Operational memory:
`private_raw_data` and `private_vault` must never be uploaded to GitHub public repos, Vercel root, Supabase Storage or public cloud archives. Runtime/deploy work uses `finflow_app` only.

## v2.00 Memory Update — Daily Live-State Hardening

FINFlow now has a unified local active-day snapshot under `finflow.dailyLiveState.v2_00`.

Important behavior:
- The app reads the v2.00 live-state snapshot before falling back to older v1.47 localStorage keys.
- The older keys remain preserved for compatibility and anti-regression.
- Day, Money, Work, Funds, AI and System should represent one active daily state.
- Same-tab sync uses a CustomEvent.
- Cross-tab sync uses BroadcastChannel with storage-event fallback.
- The app must not regress back to isolated tab states or blind remount-only hydration.

Next product memory:
The next step should be active day session control: start a new day safely, archive yesterday, prevent accidental deletion, and keep current-day records recoverable.

Security reminder:
`private_vault` and `private_raw_data` remain private MASTER-only material and must not enter runtime, GitHub public, Vercel root, Supabase Storage or public cloud.

## v2.01 memory update — Active Day Session Controls

- New active day session model added in `src/lib/day-core/activeDaySessionModel.ts`.
- Active session storage key: `finflow.activeDaySession.v2_01`.
- Rollover archive key: `finflow.activeDayRolloverArchive.v2_01`.
- New Day must not be destructive: before creating a clean day, FINFlow saves Daily History and a full rollover archive.
- New day keeps balances, obligations, funds, templates, bank-review decisions and fuel settings, but resets daily orders/records/fuel paid.
- Latest rollover can be restored locally.
- This strengthens Telegram Mini App readiness because daily boundaries are now explicit.
- Still do not upload `private_vault` or `private_raw_data` to GitHub public, Vercel root, Supabase Storage or public cloud.

## v2.02 memory — Claude v1.99.1 audit sync

Claude v1.99.1 audited package was older than the current v2.01 master. It was preserved in `private_vault` and used only for non-regressive fixes: static shell optimization and dead Supabase profile draft cleanup. Do not use it to roll back v2.00 live-state or v2.01 New Day rollover.


## v2.03 memory update — Telegram staging + readiness delta rule

- User requested that readiness percentages must show previous and current values (`было → стало`).
- Telegram Mini App staging package is now prepared via deploy-safe allowlist.
- MASTER PRIVATE FULL remains local source of truth; only `finflow_app` or deploy-safe package may be used for Vercel/Telegram staging.
- Next work should move into real Telegram device testing, not more abstract local-only polish, unless a safety issue appears.

## v2.04 memory update — Real Telegram Device Test

The project now has a built-in System-tab Real Telegram Device Test flow. It checks the real Telegram WebApp bridge, initData presence, safe profile diagnostics, viewport, `/api/telegram/verify`, deployment readiness, Supabase readiness, and a read-only cloud GET dry-run.

Locked safety note:
- v2.04 must not perform cloud writes.
- Raw initData/hash must not be displayed in UI.
- Fake initData must not be generated for tests.
- `private_vault` and `private_raw_data` must never be uploaded to GitHub public, Vercel root, Supabase Storage, or public cloud.

Readiness percentages must be reported as `было → стало`.
