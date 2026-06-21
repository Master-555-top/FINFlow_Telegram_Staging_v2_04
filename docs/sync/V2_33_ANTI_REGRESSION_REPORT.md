# V2.33 Anti-regression Report — Visual Baseline + Import Write Adapters

Date: 2026-06-22

## Scope

Large product step after v2.32. The goal was to continue global data work, not UI redesign.

## Preserved

- Sleep tabs remain: Обзор / История / Редактор.
- No global History screen was added.
- Section-scoped history remains locked.
- Sleep localStorage keys remain unchanged:
  - `finflow_sleep_records_v2_17`
  - `finflow_sleep_live_session_v2_17`
- System remains a tools area, not a primary history screen.
- MASTER/private/deploy-safe separation remains required.

## Added

- Visual baseline lock for the user-approved Sleep History list, Sleep weekly chart and System grid.
- Canonical write adapter layer for historical import preview.
- Money/work candidate mapping for future confirmed imports.
- Duplicate hints and blocked-state safety for risky import rows.
- Updated strong mini app progress model.

## Not changed

- No Supabase writes enabled.
- No n8n runtime/webhooks added.
- No global visual redesign.
- No automatic historical data import into production state.

## Verification target

- TypeScript check.
- Next build.
- npm audit moderate.
- Deploy-safe forbidden scan.
