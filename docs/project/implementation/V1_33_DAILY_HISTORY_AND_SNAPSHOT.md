# v1.33 — Daily History + Save Day Snapshot

## Goal

Quick Daily Input should not only change the current demo day. The user needs to preserve each day as a history record.

## Added

- `src/lib/day-core/dailyHistoryModel.ts`
- local browser storage for saved day snapshots
- save current day snapshot
- lock/unlock snapshot
- delete unlocked snapshot
- history summary: total gross, total clean, average clean, saved days

## Important distinction

This is still local daily history, not production backend history.

Current storage:

```text
browser localStorage
```

Future storage:

```text
Supabase tables with RLS and user ownership
```

## Snapshot includes

- structured Day Core input
- net calculation result
- summary: gross, orders, shift clean, free after plan, Drivee, fuel
- sensitiveDataIncluded: false

## Security

Saved snapshots do not include raw bank PDF, raw chat exports, `.env`, tokens, or private_raw_data.
