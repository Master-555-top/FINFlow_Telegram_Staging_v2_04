# 02 — User Requirements Ledger

## Highest-level requirement

FINFlow must become a long-term personal financial operating system for the user, centered on the day and grounded in real life.

## Product identity

FINFlow is not:
- a simple expense tracker
- a static spreadsheet
- only taxi accounting
- only a UI demo
- a project that forgets past context

FINFlow is:
- a daily decision system
- a taxi income and cost planner
- a personal finance dispatcher
- a goals/funds allocator
- a car-cost-aware planner
- a context-preserving AI partner system

## Locked requirements

### Context and continuity

- The project must preserve context inside files.
- Requirements must not live only in chat memory.
- Every future development step must update context files.
- New features must be checked against old requirements.
- User messages and assistant responses/actions must be logged as available.
- Do not pretend unavailable exact old text is available; preserve structured summaries instead.

### Editable data

- All source/base data must be manually editable.
- Final analytics must not be manually editable.
- Final analytics must be derived and recalculated.
- User must be able to correct AI/app assumptions.

### Taxi money model

- Gross income = turnover from orders before costs.
- Clean shift income = gross - Drivee/commission - fuel.
- Free after plan = clean shift income - daily tasks/food/meetings/obligations/funds.
- User thinks in daily gross but needs clean and allocation guidance.

### Daily planning

- Day Core is central.
- Current time must matter.
- Sleep, food, errands, girlfriend meetings, car repairs, taxi hours and physical limits must affect plan.
- Unrealistic targets must be flagged.

### Allocation

- After clean calculation, FINFlow must recommend where money goes.
- Allocation must cover obligations, car, working fund, cushion, girlfriend-related costs, meetings, repairs and mini-goals.
- Allocation should be smart, not equal tiny splits by default.

### Data reality

- Demo values must be labeled as demo/local.
- Real data must be distinguished from mock values.
- Imported bank/chat/archive data must go through review.
- No blind import of raw personal data.

### Security

- `private_raw_data` must never be uploaded to GitHub/public cloud/public archives.
- `.env`, tokens, keys, bank PDFs and raw private archives must not be exposed.
- Supabase/Vercel/GitHub usage must be security-first.

### Anti-regression

- Existing systems must not be broken by new features.
- Each package must include validation docs, build report, security scan, changelog and manifest.
- Build must pass before packaging.

## Current required next direction after v1.39

Once the context system is in place:
- continue with editable records for income/expense/order/fuel lists
- keep context files updated every step
- move toward real production storage only after local daily MVP is coherent

### v1.40 locked context-memory requirement

The user requires persistent project memory, not only chat memory.

Mandatory:
- keep updating memory files;
- recheck all project files and protocols step by step;
- preserve requirements from the first available chat source;
- use the 7z archive and prior chat file as context sources;
- improve without losing previous systems;
- do not rely on isolated latest messages;
- update context after each new user message and assistant response/action.

This requirement is P0 and affects every future version.

### v1.41 continuation requirement

The user confirmed that all future work must rely on the prior context-memory rule.

Implication:
- every "continue" means context-aware continuation, not isolated coding;
- all new features must use memory preflight;
- all packages must update context files.

### v1.43 template and bank clarification

User wants:
- order entry templates to match real taxi workflow;
- expense templates to match real daily spending;
- funds to remain planning/allocation targets;
- bank file status to be clear.

Locked clarification:
- records are daily facts;
- funds are planning buckets;
- bank PDF is review source, not automatic truth.

### v1.44 bank review requirement

Bank file use must remain safe:

- bank operations are candidates;
- user must review and approve;
- approved candidates become editable records;
- rejected/postponed candidates must not affect analytics;
- no automatic final accounting from bank PDF.

### v1.46 full transcript ledger requirement

User requires the chat transcript to be stored and continuously updated from the first available message.

Locked:
- `13_FULL_CHAT_TRANSCRIPT_LEDGER.md` must be updated in every future package.
- Exact user messages should be stored when available.
- Reconstructed summaries must be labeled as reconstructed, not exact.
- Assistant final/action summaries must be stored without hidden reasoning.

### v1.47 Drivee clarification

Locked:
- Drivee commission is a calculated work cost from gross orders.
- Drivee top-up is an editable money movement/cashflow record.
- Clean shift income must not double-count Drivee top-ups as commission.

### v1.48 Supabase persistence requirement

Persistent storage must be security-first:
- user-owned records;
- RLS enabled;
- no service_role key in frontend;
- raw private data not stored in public tables;
- bank candidates stay redacted/review-only.

### v1.49 Supabase integration requirement

Before production DB connection:
- keep local fallback;
- verify Telegram initData on server;
- never expose service_role key on frontend;
- use RLS/user ownership;
- keep bank import review-only.

### v1.50 Telegram auth requirement

Before production Supabase identity:
- Telegram initData must be verified on the server.
- TELEGRAM_BOT_TOKEN must remain server-only.
- Frontend must not receive bot token or service_role key.
- Profile resolution should happen only after verification.

### v1.51 profile resolver requirement

After Telegram initData verification:
- server should resolve FINFlow profile;
- frontend must receive only safe profile context;
- profile creation must not expose service_role key;
- local fallback remains until cloud persistence is tested.

### v1.52 server-only Supabase profile resolver requirement

Profile resolver must:
- run server-side only;
- never expose service_role key;
- check env readiness safely;
- avoid DB writes until env/RLS/auth are tested;
- keep local fallback.

### v1.53 deployment safety requirement

Before deployment:
- repo must be private;
- `.env.local` must not be committed;
- `private_raw_data/` must not be committed;
- raw bank PDFs/CSVs must not be public;
- service_role key must never be frontend-exposed;
- RLS and Telegram verification must be tested before writes.

### v1.54 Supabase env guard requirement

Before any real Supabase write:
- server env readiness must be checked;
- writes must require `FINFLOW_ENABLE_SUPABASE_WRITES=true`;
- readiness routes must not return secret values;
- service_role key must never be exposed to frontend.

### v1.54 Supabase server wrapper requirement

Supabase server client may exist only behind env checks and write feature flag.

Locked:
- no service_role in frontend;
- no DB writes unless `FINFLOW_ENABLE_SUPABASE_WRITES=true`;
- no env values returned in API responses.

### v1.56 built-in AI assistant requirement

FINFlow must include an embedded assistant that:
- acts as daily dispatcher;
- reads day state, net, allocation and records;
- advises next best action;
- protects from impossible plans;
- connects to external AI only server-side later.

### v1.57 external AI bridge requirement

External AI assistant must:
- run server-side only;
- never expose OpenAI/n8n keys on frontend;
- use minimized payload;
- avoid raw bank data/private_raw_data;
- stay disabled unless explicitly enabled by env flag.

### v1.58 context discipline reminder

User explicitly reminded that assistant must:
- rely on context/protocol files;
- check them before work;
- update them after work;
- remember project decisions and progress.

### v1.60 reanalysis requirement

User explicitly asked to reanalyze full correspondence and verify:
- car characteristics and taxi costs;
- bank statement status;
- assistant as long-term AI partner;
- cross-dialogue continuity.

These must remain first-class context for future FINFlow work.

### v1.61 car maintenance tracking requirement

User confirmed:
- oil, spark plugs, oil filter and air filter changed on 16.06.2026;
- odometer after service: 280,041 km;
- current odometer on 18.06.2026: 280,420 km;
- oil change plan: every 7,000 km;
- reminder: every 5,000 km;
- future oil brand/spec will be provided later.

FINFlow must use mileage to forecast:
- next oil reminder;
- next oil change;
- daily km;
- daily fuel cost;
- taxi operating costs.

### v1.62 full-turn capture requirement

User requires:
- every user message to be fixed in files;
- every assistant answer/action to be fixed at least as action summary/final summary;
- all chat/context to be file-backed;
- context/protocol files checked and updated at every step;
- user interruptions not to cause lost steps;
- active/deferred work to be tracked explicitly.

This is now a locked process requirement.

### v1.63 master synchronization requirement

User requires:
- full analysis of all work;
- full synchronization with all files;
- all steps from the beginning of development to be indexed/summarized;
- maximum responsible and serious approach;
- no continuation of product work until trust/process sync is refreshed.

This requirement supersedes the previously deferred fuel-budget product task for this package.

### v1.64 origin-to-current ecosystem requirement

User clarified:
- analysis must cover all available project history from earliest version, not only recent steps;
- technical `error analyzing` issues must be explained and distinguished from project code errors;
- FINFlow must become a full ecosystem, not just a mini app.

This supersedes the deferred fuel-budget product task for this package.

### v1.65 daily fuel budget requirement

FINFlow must calculate daily fuel budget using:
- odometer-derived daily km;
- fuel consumption range 11–13 L/100 km;
- AI-92 price 75.51 ₽/liter;
- recent actual post-service mileage;
- fuel as taxi operating cost, not personal spending.

### v1.66 editable odometer/fuel requirement

FINFlow must allow user-editable:
- previous odometer;
- current odometer;
- fuel price;
- consumption L/100 km.

Calculated values:
- km driven;
- liters needed;
- fuel cost;
- cost per km.

### v1.67 editable odometer/fuel persistence requirement

User-entered operational fuel values should persist locally:
- previous odometer;
- current odometer;
- fuel price;
- consumption.

They should not reset on page reload.

### v1.68 fuel/odometer history requirement

FINFlow should preserve odometer/fuel calculations as history records:
- save current calculation;
- show recent entries;
- calculate totals and averages;
- keep local persistence.

### v1.69 fuel/odometer export/reset requirement

FINFlow should allow:
- local JSON export of odometer/fuel history;
- local CSV export of odometer/fuel history;
- safe reset/clear control with confirmation;
- no network transfer by default.

### v1.70 fuel/odometer trend requirement

FINFlow should show trend signals from fuel/odometer history:
- cost per km;
- rising/falling cost;
- heavy mileage warning;
- local mini chart.

### v1.71 fuel-to-net integration requirement

Fuel calculated from odometer should affect daily money decisions:
- compare planned fuel vs odometer fuel;
- show adjusted clean money;
- show adjusted free money;
- allow applying odometer fuel to the day plan.

### v1.72 fuel AI advice requirement

The built-in assistant should consider fuel/odometer data when advising about:
- clean money;
- free money;
- fuel above plan;
- expensive kilometer;
- whether spending is safe.

### v1.73 assistant chat fuel context requirement

Assistant chat must answer with fuel/odometer context when user asks about:
- fuel;
- odometer/probeg;
- spending;
- clean money;
- how much to work.

### v1.74 assistant chat car context requirement

Assistant chat must answer with car maintenance context when user asks about:
- machine/car;
- oil;
- odometer/probeg;
- service/TO;
- repairs;
- suspension;
- wear/risk.

### v1.75 car repair allocation requirement

Car repair risk must influence money allocation:
- protect repair fund;
- show target/current/suggested today;
- warn if underfunded;
- allow strengthening repair fund in the day plan.

### v1.76 assistant chat repair fund requirement

Assistant chat must account for repair fund allocation when user asks about:
- spending;
- distribution;
- repair;
- car fund;
- how much to leave for car.

### v1.77 Codex synchronization requirement

When user provides a corrected external/Codex package:
- fully analyze it;
- compare against latest actual project package;
- merge fixes selectively;
- preserve newer features;
- output one unified current package;
- continue protocol-led development after synchronization.

### v1.78 daily decision summary requirement

FINFlow should provide one unified daily command block that answers:
- how much/why to work;
- what fuel does to clean money;
- whether car repair risk is protected;
- whether spending is allowed;
- where money should go next.

### v1.79 Codex cloud-sync synchronization requirement

When user provides corrected Codex package with cloud sync:
- analyze all package/report/privacy files;
- merge with latest actual project;
- preserve newer features;
- maintain local-first fallback;
- prevent silent cloud overwrite;
- keep secrets out of source and chat;
- output one unified current package before continuing.

### v1.80 real deployment and secrets requirement

FINFlow must become a real daily Telegram Mini App ecosystem, but personal data protection requires:
- secrets in hosting/server env variables;
- no hardcoded bot token/service role/OpenAI key;
- server-only use of sensitive credentials;
- browser-safe readiness display only;
- private deployment and security verification before real data sync.

### v1.81 readiness requirement

FINFlow readiness must be reported by layers:
- local foundation;
- daily local use;
- cloud foundation;
- production ecosystem.

The app should show a real verification checklist for Telegram/Supabase deployment rather than vague status.

### v1.82 global assistant requirement

Assistant chat should answer global day questions through the unified Daily Decision Summary, combining work, fuel, car, repair fund, allocation and spending safety.

### v1.83 verification persistence requirement

The Telegram/Supabase verification checklist should be a working operational tool:
- statuses can be changed;
- notes can be stored;
- progress persists locally;
- secrets must not be stored in notes.

### v1.84 verification handoff requirement

Verification checklist state must be portable:
- export Markdown for chat/developer handoff;
- export JSON for structured tool/Codex handoff;
- no secrets or private raw data in exported reports.

### v1.85 deployment acceptance runner requirement

Real deployment readiness should be testable from the app:
- safe automated readiness checks;
- Telegram verify when in Mini App;
- cloud read-preview without writes;
- manual cloud save/conflict/RLS tests to avoid accidental overwrite.

### v1.86 manual cloud verification requirement

Real cloud save/load/conflict testing must be guided, manual and anti-silent-overwrite:
- no automatic cloud writes;
- use test day/marker first;
- load into preview before apply;
- two-session conflict must return conflict and not overwrite silently.

### v1.87 local backup requirement

Before real cloud sync tests, FINFlow must support local backup/restore:
- save full current day document locally;
- restore locally without Supabase write;
- export/import backup JSON;
- never store secrets or raw bank/private data in backup notes.

### v1.88 backup-aware cloud test requirement

Manual cloud save/apply/conflict verification must require a local backup first. The app should show backup readiness and block risky status progression without backup.

### v1.89 backup restore preview requirement

Before restoring a local backup, FINFlow should show a diff/preview of key changes and require explicit confirmation. Restore remains local-only.

### v1.90 Codex synchronization requirement

When user uploads a corrected Codex package, FINFlow must:
- analyze it fully;
- compare with latest current package;
- avoid wholesale overwrite when Codex is older;
- merge useful fixes;
- preserve newer work;
- exclude private_raw_data and secrets;
- output one unified ready package.

### v1.92 Claude synchronization requirement

Corrected Claude package must be fully preserved in MASTER PRIVATE FULL package and selectively synchronized into current working app without regressing newer systems.

### v1.93 cloud restore preview requirement

Before applying a loaded cloud day, FINFlow must show a diff/preview of key fields and require explicit confirmation. Apply remains local-only and must not write to Supabase.

### v1.94 cloud apply rollback requirement

Before applying loaded cloud preview, FINFlow must create a local rollback snapshot. User must be able to undo local cloud apply without Supabase writes.

### v1.95 readiness and cloud save gate requirement

User asked for readiness percentage and how much remains until full mini app daily use. Also continued work. FINFlow should block risky cloud save unless local backup/rollback safety exists.

### v1.96 full audit requirement

User requested a full recheck of latest file: bugs, underdeveloped areas, UX convenience, garbage files, systems working, checklist against desired requirements, what is 100% implemented, what remains, and memory/project docs updates.

### v1.97 Claude nav-review synchronization requirement

Corrected Claude nav-review package must be fully preserved in MASTER PRIVATE FULL and useful UX/navigation changes must be merged without regressing newer FINFlow systems.

### v1.98 daily mode polish requirement

User continued from MASTER PRIVATE FULL v1.97 and explicitly required v1.98 Daily Mode Polish / Evening Summary Flow:
- daily mode must become more convenient;
- morning flow should show the plan of the day;
- work flow should be a quick input flow for taxi orders/fuel/expenses;
- evening flow should summarize the day and support saving the day result;
- developer/system panels must stay separate in System/Dev;
- MASTER PRIVATE FULL remains local source of truth;
- `private_vault` must stay preserved but out of runtime/client bundle, GitHub public, Vercel root and public cloud.

### v1.99 Claude external sync requirement

User requires that corrected Claude/Codex/other-model files are never blindly used as a new base.

Locked:
- Analyze the external file fully.
- Compare it with the latest current master.
- Identify useful fixes.
- Preserve all current functions, logic and decisions.
- Merge only non-regressive improvements.
- Preserve the full external package in `private_vault`.
- Update changelog/update notes, dependency checks, anti-regression checks and validation docs.
- Output one unified current package before continuing.

For v1.99, Claude v1.94 Optimized was older than the v1.98 master, so it was treated only as a source of deploy-footprint improvements.

### v2.00 daily persistence / cross-tab state requirement

After v1.99, FINFlow must harden the active day state so product tabs do not behave like isolated panels.

Locked:
- Day, Money, Work, Funds, AI and System should reference one current active-day model.
- Switching tabs should not lose or stale the current daily state.
- Another browser tab/window should be able to receive active-day updates.
- Legacy storage should be preserved for compatibility.
- This must be implemented without regressing v1.98 Daily Mode, v1.97 navigation or cloud/backup safety systems.

## v2.01 requirement — Active day and Telegram readiness

User wants to continue development and know when Telegram Mini App work can begin.

Resolution:
- Active Day Session/New Day flow implemented first because Telegram daily usage requires safe day boundaries.
- Telegram Mini App staging is the next recommended step, but production Telegram usage still requires deploy-safe package, BotFather URL, hosting, env vars, Supabase readiness and acceptance tests.

## v2.02 requirement — external Claude fixes must be synchronized, not used as base reset

User explicitly required that the corrected Claude file be fully analyzed and compared with the latest current project file. The file must be treated as a source of fixes, not a new base from scratch. The output must be one unified current project file, with anti-regression, locked decisions, dependency check, changelog/update notes, and confirmation that old working systems remain intact.


## v2.03 requirement update

- User requested continued work from v2.02 into the next protocol step.
- User requested that readiness percentages always show both previous and current values (`было → стало`).
- Requirement accepted and implemented in readiness board and final reporting style.

## Requirement update — v2.04 Telegram device testing

- The project should continue from Telegram staging into a real Telegram Mini App device-test flow.
- The test flow must check real initData, viewport and server readiness.
- The test flow must avoid dangerous cloud writes until backup/checklist/manual safety are completed.
- Readiness percentages must always be written as previous → current.

## Requirement update — v2.05 System UX

User reported that the `Система` tab is too hard to use because everything scrolls far down and goes one after another. Requirement: split System into buttons/sections, improve the interface, and make technical tools easier to find before continuing Telegram testing. This is now implemented as sectioned System UX with Telegram, Аудит, Cloud, Backup, Deploy and Dev sections.
