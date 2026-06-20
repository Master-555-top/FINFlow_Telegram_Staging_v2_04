# v1.44 — Bank Candidate Review → Records

## Memory preflight

Before implementation, context and protocol files were checked under v1.40 rules.

## Goal

Bank statement candidates should not be imported automatically. They should be reviewed and converted into daily records only after manual confirmation.

## Added

- `src/lib/day-core/bankCandidateReviewModel.ts`
- redacted bank candidate sample from existing review CSV
- bank review UI panel
- editable decision per candidate:
  - record type
  - title
  - category
  - amount
- actions:
  - approve into records
  - postpone
  - reject

## Bank candidate source

Source file:

```text
docs/project/import/normalized/BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv
```

Rows counted during v1.44: 2766

## Important

Only a small redacted preview sample is embedded in the UI for now.

Full import should later use paginated review, not direct raw bank import.

## Locked rule

```text
Bank PDF → candidates → review → approved records
```

Never:

```text
Bank PDF → automatic final accounting
```
