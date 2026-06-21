# FINFlow v2.42 — Real Local Apply UI + Import/Template Confirm

Date: 2026-06-22

## Goal

v2.42 turns the previous preview/apply foundation into a practical local workflow:

`template/import candidate -> preview -> user selection -> confirm -> Daily Records write -> Money/Work recalculation -> rollback batch`

This is still local-first and safe. It does not enable Supabase writes and does not call external n8n webhooks.

## Implemented

- `src/lib/apply/localApplyEngine.ts`
  - builds Local Apply drafts from template preview and import-review queue;
  - separates ready, review-needed, duplicate and blocked drafts;
  - applies only selected `ready_after_confirm` drafts;
  - creates `DailyRecord` entries using the existing Daily Records schema;
  - creates rollback batches and audit events.

- `src/lib/apply/localApplyPersistence.ts`
  - stores Local Apply state in `finflow.localApply.v2_42`;
  - preserves batches, audit events and records;
  - does not store private raw excerpts or secrets.

- `src/components/apply/LocalApplyCenterPanel.tsx`
  - new System -> Data -> Apply screen;
  - shows ready/review/duplicate/batch counts;
  - lets the user select ready drafts;
  - confirms records into Daily Records;
  - publishes updated records into Daily Live State;
  - supports rollback of the latest batch.

- `src/components/dashboard/DashboardShell.tsx`
  - adds Data -> Apply subsection without changing the System grid baseline.

## Safety rules preserved

- No global History tab was added.
- Section-scoped history remains the rule.
- Sleep tabs and localStorage keys were not touched.
- Supabase writes remain safe-off.
- External n8n calls remain disabled.
- MASTER/private/raw data/secrets remain excluded from Deploy-safe.

## What this unlocks

FINFlow can now begin using imported/template-derived money and work records in the same daily record stream that Money Engine and Work/Taxi Engine read. This is a major step toward real daily use.

## Remaining

- CSV/JSON import mapper and column matching.
- Full funds/tasks write adapters.
- Larger import batch review UI.
- Real Telegram device QA with several days of data.
