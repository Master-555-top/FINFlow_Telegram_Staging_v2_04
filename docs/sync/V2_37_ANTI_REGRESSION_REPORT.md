# FINFlow v2.37 Anti-Regression Report

## Scope

Large data-layer build: Manual Taxi Order Log Import.

## Preserved locked decisions

- FINFlow remains a personal operating ecosystem, not a generic tracker.
- History stays section-scoped; no global History tab added.
- Sleep visible tabs remain Overview / History / Editor.
- Sleep localStorage keys were not changed.
- System remains tools/storage/reset/backup/cloud/QA, not main history.
- Visual baseline from prior screenshots is preserved.
- MASTER/private/raw data/secrets are excluded from deploy-safe.

## Added safely

- Manual taxi log parser.
- Work import preview.
- Historical import draft specialization for taxi logs.
- Canonical write adapter v2.37 with order-level timestamps.
- Template rule for manual taxi order logs.

## Known limitations

- Route/address parsing is local and not yet a full zones/points engine.
- Shift aggregate is preview-only to prevent double-counting with order records.
- Real apply/rollback UI still needs the next build.
- Supabase writes remain off until RLS/backup/conflict tests.
