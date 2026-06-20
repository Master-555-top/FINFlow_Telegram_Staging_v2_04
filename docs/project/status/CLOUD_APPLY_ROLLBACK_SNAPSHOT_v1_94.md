# Cloud Apply Rollback Snapshot — v1.94

## Purpose

v1.93 added cloud restore preview diff.  
v1.94 adds automatic local rollback snapshot before applying a loaded cloud day.

## Behavior

When user clicks `применить после preview`:
1. FINFlow creates a local rollback snapshot of the current day document.
2. Snapshot is stored in React state and sessionStorage.
3. Loaded cloud document is applied locally.
4. User can click `откатить cloud apply` to restore the pre-apply local document.

## Safety

- Rollback is local-only.
- Rollback does not write to Supabase.
- Apply remains manual and confirmed.
- Snapshot is session-scoped.
