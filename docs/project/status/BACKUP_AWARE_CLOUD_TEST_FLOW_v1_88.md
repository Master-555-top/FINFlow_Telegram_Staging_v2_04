# Backup-Aware Cloud Test Flow — v1.88

## Purpose

After v1.87 added Local Backup / Restore, v1.88 connects that safety layer to the Manual Cloud Test Wizard.

## Added

- backup-aware gate model;
- wizard reads local backup state;
- manual cloud write/conflict steps are blocked from being marked as `passed` or `in_progress` until a backup exists;
- backup gate panel shows backup count, latest backup label and manual-write permission;
- Local Backup panel dispatches a refresh event after create/delete/import.

## Safety

This package adds no automatic Supabase writes.
It only prevents risky manual verification steps from being marked complete without a local backup.
