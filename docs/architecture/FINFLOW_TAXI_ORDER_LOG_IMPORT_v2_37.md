# FINFlow v2.37 — Manual Taxi Order Log Import

## Goal

v2.37 teaches FINFlow the user's real manual taxi log format without changing the global visual style.

The supported structure is:

- date with weekday;
- minimum dirty/gross target;
- planned work window;
- shift start and finish;
- numbered orders with start/end time;
- duration and order amount;
- route text;
- declared order count;
- gross total;
- optional net total or "not calculated yet" note.

Private route/address text is parsed only locally from the user's pasted input. The deploy-safe package contains parser logic, not the user's real route history.

## Added

- `src/lib/work/taxiOrderLogParser.ts`
  - detects manual taxi order logs;
  - parses date, target, start/end, orders, durations, amounts, routes, gross/net summary;
  - calculates active minutes, full shift minutes, idle minutes, active ₽/h and shift ₽/h;
  - returns review reasons for mismatches.

- `src/lib/data/historicalImportDraft.ts`
  - upgraded to `historical_import_draft_v2_37`;
  - detects manual taxi logs before generic line parsing;
  - creates one shift aggregate draft item plus one draft item per order;
  - keeps the shift aggregate preview-only to avoid double-counting income;
  - lets order-level items become `taxi_order` candidates.

- `src/lib/data/canonicalWriteAdapters.ts`
  - upgraded to `canonical_write_adapters_v2_37`;
  - carries `occurredAtIso` for order-level time;
  - writes approved order candidates as Daily Records with original order time;
  - keeps preview/confirm/rollback discipline.

- `src/lib/work/workTaxiEngine.ts`
  - upgraded to `work_taxi_engine_v2_37`;
  - adds manual log import preview for Work/Taxi calculations.

- `src/lib/templates/finflowTemplatesEngine.ts`
  - adds a user-locked import-rule template: "Импорт: журнал заказов такси".

## Anti-regression

- Sleep keys remain unchanged: `finflow_sleep_records_v2_17`, `finflow_sleep_live_session_v2_17`.
- No global History screen was added.
- Visual baseline is preserved; no broad UI redesign.
- The shift aggregate is not auto-written as income when order-level records exist.
- Cloud/Supabase writes remain safe-off.
- MASTER/private/raw data are not included in Deploy-safe.

## Example calculation behavior

For a manual log with 8 orders, 5 850 ₽ gross and 213 active minutes, the parser can produce:

- orders: 8;
- gross from orders: 5 850 ₽;
- active time: about 3.6h;
- active pace: about 1 648 ₽/h;
- full shift pace only when shift start/end are present;
- net remains review-needed if the user wrote that net was not calculated.

## Next build

v2.38 should connect this to a more complete confirm/apply UI:

- approve selected order candidates;
- write them into local Daily Records;
- show rollback in UI;
- prepare the same path for recurring templates and Supabase-safe sync.
