# v2.05 — System Menu Polish / Sectioned System UX

## Goal

Make the `Система` tab usable during real Telegram staging by replacing the long sequential technical feed with explicit buttons and sections.

## Implemented

- Added internal System section state in `DashboardShell`.
- Added System hub card with mobile-friendly section buttons.
- Added sections:
  - Telegram — Real Telegram Device Test, Telegram staging runbook, Telegram/Supabase checklist.
  - Аудит — Ecosystem readiness board.
  - Cloud — system cloud sync/day state tools and manual cloud test wizard.
  - Backup — browser/local backup restore panel.
  - Deploy — private deployment and acceptance runner.
  - Dev — dev error log.
- Preserved all existing imported panels and their behavior.
- Set Telegram as default System section because the active manual work is BotFather + Telegram runtime testing.
- Added v2.05 CSS for section grid, active section, and current section summary.
- Updated readiness audit to `ecosystem_readiness_audit_v2_05`.

## Non-goals

- No Supabase writes.
- No cloud save pilot.
- No data model rewrite.
- No removal of old System safety panels.
