# v1.27 — Apply-to-Day Core Layer

Updated: 2026-06-17 22:52

## Purpose

v1.27 adds the first safe bridge between the Import Review Queue and Day Core.

The rule is strict:

```text
approved candidate -> dry-run preview -> explicit apply -> Day Core patch -> audit event -> rollback-ready history
```

No imported source can silently change calculations.

## Added code

- `src/lib/day-core/dayCoreApplyLayer.ts`
- updated `src/components/import-review/ImportReviewQueuePanel.tsx`
- updated persistence version to `import_review_persistence_v1_27`

## Safety rules

- Only `approved` candidates can apply.
- `sensitive` and `high` risk candidates are blocked.
- Candidate must be attached to the active Day Core day.
- Raw excerpts are never copied into Day Core.
- Every patch has a rollback hint.
- Every apply creates an audit event without sensitive data.

## Supported entity mappings

- `expense` -> fuel already paid or reviewed expense task
- `income` -> taxi gross done
- `taxi_order` -> taxi gross done + orders count
- `taxi_shift` -> expected gross by evening
- `fund` -> funds upsert
- `obligation` -> obligations upsert
- `day_note` -> review notes

## Not implemented yet

- Real Supabase persistence for applied Day Core patches.
- Real historical rollback command.
- Real bank statement ingestion pipeline.
- Multi-day application.

Those are intentionally deferred to avoid regressions.
