# v1.28 — Persistent Applied Patch Storage + Rollback Commands

## Goal

v1.28 turns the v1.27 Apply-to-Day Core layer into a safer local persistence system.

The app now treats every explicit Day Core application as an `AppliedPatchRecord`:

```text
approved candidate
→ dry-run preview
→ explicit apply
→ afterDayCore snapshot
→ applied patch record
→ local audit record
→ rollback command
```

## What changed

Added:

- `src/lib/day-core/dayCorePatchPersistence.ts`
- persistent browser-local applied patch records
- rollback command per applied record
- patch audit preview
- reset demo state now clears both import review state and Day Core patch state

## Safety rule

Old imports still do not directly change the user's real financial state.

They must pass:

```text
ImportCandidate
→ review
→ approve
→ dry-run preview
→ explicit apply
→ applied patch record
```

## Rollback model

Rollback in v1.28 restores the Day Core snapshot that existed immediately before the applied candidate.

This is safer than trying to guess inverse operations for all future entity types.

## Privacy

The patch record stores structured Day Core snapshots only.

It does not store:

- raw bank statement lines
- raw chat exports
- PDF contents
- private_raw_data
- tokens
- `.env`
- unredacted personal source excerpts

## Limitations

This is still browser-local demo persistence.

Supabase synchronization should be added later with RLS and user ownership checks.
