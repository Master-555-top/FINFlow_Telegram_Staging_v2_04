# Local Backup Diff / Restore Preview — v1.89

## Purpose

After v1.87 added backup/restore and v1.88 connected backup to cloud test safety, restore still needed a preview.

v1.89 adds restore preview / diff before local restore.

## Preview compares

- Day Core local date;
- cash;
- card;
- gross done;
- orders done;
- records count;
- custom templates count;
- bank review decisions count;
- previous odometer;
- current odometer;
- fuel history entries.

## Safety

Restore remains local-only and does not write to Supabase.
