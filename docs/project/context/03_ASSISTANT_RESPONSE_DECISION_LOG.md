# 03 — Assistant Response and Decision Log

This file records assistant decisions and implementation responses.

## Decision format

Each entry should include:
- date/version
- user trigger
- assistant decision
- files changed/added
- validation result
- remaining risk

## v1.29

Decision:
- Add Net Calculation Layer.

Reason:
- User needed clean income, not only gross.

Result:
- Build passed.
- Clean calculation introduced.

## v1.30

Decision:
- Correct net terminology.

Reason:
- User clarified clean income as gross minus commission and fuel.

Result:
- `чистые со смены` separated from `свободные после плана`.

## v1.31

Decision:
- Audit direction and data reality.

Reason:
- User asked whether we are going correctly and whether data/templates are live/real.

Result:
- Clarified live/local/demo status.

## v1.32

Decision:
- Build Quick Daily Input.

Reason:
- Needed practical daily input layer.

Result:
- Add order/fuel/expense/money editing and recalculation.

## v1.33

Decision:
- Add daily history snapshots.

Reason:
- Daily input must be preservable.

Result:
- Save local day snapshot.

## v1.34

Decision:
- Add snapshot detail and restore.

Reason:
- History must be usable, not just stored.

Result:
- Open details, compare, restore.

## v1.35

Decision:
- Add daily analytics summary.

Reason:
- User needs to know whether work is becoming stable.

Result:
- Averages, target hit rate, best/worst day, trend recommendation.

## v1.36

Decision:
- Add Editable Daily Data Layer.

Reason:
- User explicitly required all data except final analytics to be manually editable.

Result:
- Day/taxi/task source data editable.

## v1.37

Decision:
- Add Daily Goal Allocation.

Reason:
- After clean income, the app must recommend exact distribution.

Result:
- Allocation buckets and strategy panel.

## v1.38

Decision:
- Add Editable Funds & Obligations UI.

Reason:
- Funds and obligations are base data and must be editable.

Result:
- Create/edit/delete funds and obligations.

## v1.39

Decision:
- Add Project Context Memory Expansion.

Reason:
- User explicitly required project files to preserve full context and be updated every future turn.

Result:
- New `docs/project/context/` folder.
- Context protocol established.
- Future updates must append user/assistant actions.

## v1.40

Decision:
- Harden the context system beyond the v1.39 folder structure.

Reason:
- User explicitly required persistent memory updates, full reanalysis from earliest available chat/files, and reliance on the 7z archive.

Result:
- Added full chat/archive reanalysis.
- Added traceability matrix.
- Added context memory operating system.
- Added source recheck register.
- Updated context chronicle, ledger, live reality, guardrails and memory docs.

Remaining limitation:
- Exact old verbatim messages can only be stored if their source text is available.
- Raw private data remains private and is not copied into public docs.

## v1.41

Decision:
- Implement editable source records for orders, fuel, expenses and income.

Reason:
- v1.38/v1.40 guardrails showed next step should make daily records individually editable and derive totals from records.

Result:
- Added daily records model.
- Added records panel.
- Quick buttons now add records.
- Day Core totals derive from enabled records.
- Context files updated as required by v1.40.

## v1.42

Decision:
- Add templates and filters for daily records.

Reason:
- v1.41 made records editable, but fast daily use requires quick templates and filtering.

Result:
- Added record template list.
- Added filter buttons.
- Added category labels.
- Preserved derived analytics and record-as-source-data rule.

## v1.43

Decision:
- Add custom record templates and document bank source status.

Reason:
- User asked to recheck templates and bank file role.

Result:
- Custom templates implemented.
- Bank file confirmed as extracted-to-candidates.
- Safe bank pipeline documented: PDF → candidates → review → approved records.

## v1.44

Decision:
- Add bank candidate review to records.

Reason:
- v1.43 clarified the bank file role and next safe step.

Result:
- Bank candidates can be reviewed in UI.
- User can approve a candidate into records.
- Rejected/postponed decisions are tracked locally.
- No blind bank import was introduced.

## v1.45

Decision:
- Add filters and pagination to bank candidate review.

Reason:
- v1.44 introduced review-to-record approval, but preview list needed browsing/filtering.

Result:
- 60 redacted candidates available in UI sample.
- Filters and pagination added.
- No blind import introduced.

## v1.46

Decision:
- Create a dedicated full chat transcript ledger.

Reason:
- User explicitly required that the project store and continuously update the chat transcript from the first message.

Result:
- Added `13_FULL_CHAT_TRANSCRIPT_LEDGER.md`.
- Added `14_TRANSCRIPT_LEDGER_UPDATE_PROTOCOL.md`.
- Recorded first available user text: `Нужно изучить и проанализировать`.

## v1.47

Decision:
- Separate Drivee commission from Drivee top-up.

Reason:
- Prior guardrails identified this as the next important accounting correction.

Result:
- Added `drivee_topup` record type.
- Added UI explanation.
- Preserved commission-based clean formula.

## v1.48

Decision:
- Add Supabase schema draft for records and bank review.

Reason:
- Local browser state is useful for MVP, but persistent production storage needs secure structure before integration.

Result:
- Added SQL schema with RLS.
- Added database documentation.
- Did not add secrets or connect frontend yet.

## v1.49

Decision:
- Add Supabase integration plan and persistence adapter boundary.

Reason:
- v1.48 prepared schema, but connecting without auth/RLS strategy would be unsafe.

Result:
- Added architecture plan.
- Added TypeScript persistence contracts.
- Added local adapter placeholder and Supabase status warnings.

## v1.50

Decision:
- Add Telegram initData server verification draft.

Reason:
- v1.49 required server-side Telegram identity verification before real Supabase persistence.

Result:
- Added helper and API route draft.
- No secrets added.
- Profile creation still deferred to next step.

## v1.51

Decision:
- Add draft FINFlow profile resolver for verified Telegram users.

Reason:
- v1.50 verified Telegram initData, but next step is safe profile resolution before Supabase persistence.

Result:
- Added resolver boundary.
- Updated route response.
- Kept Supabase write disabled.

## v1.52

Decision:
- Add server-only Supabase profile resolver draft rather than real DB write.

Reason:
- Jumping straight to production writes before env/RLS tests would violate security-first requirements.

Result:
- Added resolver draft/status helper.
- Updated Telegram verify route response.
- No secrets or database writes added.

## v1.53

Decision:
- Add deployment and environment checklist before real Supabase integration.

Reason:
- User requires security-first development and private data protection.

Result:
- Added deployment checklist.
- Added env docs and placeholder `.env.example`.
- No secrets added.

## v1.54

Decision:
- Add Supabase server env guard and readiness route.

Reason:
- Before installing/using Supabase client, the app needs a safe no-secret readiness boundary.

Result:
- Added guard and `/api/supabase/readiness`.
- No DB write or Supabase dependency added.

## v1.54

Decision:
- Add server-only Supabase wrapper behind env checks.

Reason:
- v1.53 added deployment checklist; next safe step is wrapper readiness without writes.

Result:
- Added wrapper and safe status.
- No DB writes added.
