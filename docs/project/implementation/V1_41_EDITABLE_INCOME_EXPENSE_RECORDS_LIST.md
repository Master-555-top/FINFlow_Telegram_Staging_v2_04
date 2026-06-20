# v1.41 — Editable Income/Expense Records List

## Memory preflight

Before implementation, the following files were checked:

- `docs/project/context/02_USER_REQUIREMENTS_LEDGER.md`
- `docs/project/context/04_CONTEXT_UPDATE_PROTOCOL.md`
- `docs/project/context/05_LIVE_REALITY_REGISTER.md`
- `docs/project/context/07_NEXT_STEP_GUARDRAILS.md`
- `docs/project/context/11_CONTEXT_MEMORY_OPERATING_SYSTEM_v1_40.md`
- `docs/project/protocols/CONTEXT_AWARE_RESPONSE_PROTOCOL.md`
- `docs/project/protocols/RESPONSE_INTEGRITY_AND_CONTEXT_CHECK_PROTOCOL.md`
- `CHANGELOG_LATEST.md`
- `docs/project/state/CURRENT_STATE.md`
- `docs/project/memory/PROJECT_MEMORY.md`

## Goal

Make daily values come from editable records, not only aggregate fields.

## Added

- `src/lib/day-core/dailyRecordsModel.ts`
- editable record list inside Quick Daily Input
- record types:
  - taxi order
  - fuel
  - expense
  - income
- add/edit/delete/toggle records
- record summary
- derivation from records into Day Core:
  - orders count
  - taxi gross
  - fuel paid
  - expense tasks

## Product rule

Records are source data. Totals, clean shift income, free after plan, analytics and allocation are derived.

## Important

Other income is tracked as a record category but is not yet merged into taxi clean income. Taxi clean remains based on taxi gross minus commission and fuel.
