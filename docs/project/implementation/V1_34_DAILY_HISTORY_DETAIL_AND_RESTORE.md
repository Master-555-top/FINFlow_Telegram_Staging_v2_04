# v1.34 — Daily History Detail + Restore Snapshot

## Goal

Daily history should be usable, not only stored.

The user must be able to:
- open a saved day
- inspect the saved snapshot
- compare it with the current Quick Input state
- restore a saved snapshot back into Quick Input
- lock snapshots from accidental deletion

## Added

- snapshot detail panel
- restore snapshot action
- comparison against current input
- daily history helpers:
  - `getDailyHistorySnapshotById`
  - `buildDailyHistoryComparison`
  - `restoreSnapshotToDayInput`

## Important

Restore does not import raw/private data. It restores structured Day Core input that was already saved as a local snapshot.

## Still local

This is still browser localStorage. Supabase persistence will be a later production layer.
