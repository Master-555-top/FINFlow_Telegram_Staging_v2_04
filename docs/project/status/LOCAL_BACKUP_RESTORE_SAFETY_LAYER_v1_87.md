# Local Backup / Restore Safety Layer — v1.87

## Purpose

Before real cloud sync tests, FINFlow needs a local rollback point.

v1.87 adds a local backup/restore layer for the full current day document:
- Day Core input;
- records;
- custom templates;
- bank review decisions;
- editable fuel input;
- fuel/odometer history.

## Safety

Restore changes only local state.
It does not write to Supabase.

Backups are stored in browser localStorage and can be exported/imported as JSON.
