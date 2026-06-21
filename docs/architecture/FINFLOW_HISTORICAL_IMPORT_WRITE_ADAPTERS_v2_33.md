# FINFlow v2.33 — Historical Import Write Adapters

Date: 2026-06-22

## Goal

Move from a passive historical import draft toward a safe pipeline that can later write reviewed data into FINFlow without corrupting existing local state.

## Added in v2.33

- `src/lib/data/canonicalWriteAdapters.ts`.
- Canonical write preview for historical import lines.
- Mapping from import draft rows to canonical candidates.
- Duplicate hints inside the current import batch.
- Preview-only money/work adapter that targets `finflow.dailyRecords.v1_47` through `DailyRecord` creation logic.
- Apply function for approved candidates, but no automatic UI/cloud write yet.

## Pipeline

```text
raw text/table
  -> historical import draft
  -> canonical write preview
  -> duplicate/risk review
  -> user approval
  -> local write adapter
  -> audit event + rollback hint
  -> later Supabase sync queue
```

## Safety rules

- No direct cloud write in v2.33.
- Sensitive/raw excerpts are redacted and not copied into daily records.
- Candidates are blocked when date/amount/section confidence is weak.
- Duplicate candidates are blocked until manual review.
- Approved money/work candidates can be converted into `DailyRecord` objects, but caller must still explicitly persist them.

## What remains

- Real UI confirmation flow.
- CSV/JSON table import.
- Field-mapping editor.
- Local rollback UI for applied imports.
- Supabase import batch tables after RLS verification.
