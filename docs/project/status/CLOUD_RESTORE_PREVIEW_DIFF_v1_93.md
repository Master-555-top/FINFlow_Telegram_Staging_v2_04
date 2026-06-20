# Cloud Restore Preview Diff — v1.93

## Purpose

After local backup restore got a diff preview in v1.89, cloud restore/apply needed the same safety.

v1.93 adds a diff preview before applying a loaded Supabase/cloud day document.

## What is compared

The cloud preview compares the current local day with the loaded cloud document:
- local date;
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

- Cloud load remains preview-first.
- Apply still requires a manual button click.
- Apply now also asks for confirmation.
- Apply changes local state only.
- Apply does not write to Supabase.
