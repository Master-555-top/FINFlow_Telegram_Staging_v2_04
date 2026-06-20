

## v1.23 current state
The project now has Source 05 semantic review completed.

Current safe base:
- v1.22 working package remains the base.
- v1.23 adds import-readiness documentation and semantic mapping.
- No code changes were made in v1.23.

Next recommended implementation:
1. Import Review Queue.
2. Day Core input model.
3. Allocation Engine.
4. AI Planner.
5. Full editing/export/audit hardening.


## Current State after v1.24

The project now has a safe architecture layer for importing historical data. Old transactions, taxi logs, expenses and context notes must first become review candidates before they can affect Day Core, funds, stats or AI decisions.

Implemented in code:

- `src/lib/import-review/importReviewQueueModel.ts`
- `src/lib/day-core/dayCoreInputModel.ts`
- `src/components/import-review/ImportReviewQueuePanel.tsx`

Build status: passed.

Next planned version: v1.25 — Review Actions Layer: approve, reject, edit, merge, attach to day, and audit log event.


## v1.26 — Persistent Review State + Supabase-ready Schema

- Added persistent browser-local review state for Import Review Queue.
- Added Supabase-ready SQL schema for import_review_queues, import_review_candidates and import_review_audit_events.
- Updated Import Review UI with persistence status and reset demo action.
- No raw private data is shown in UI.
- No real database connection or secrets were added.

## Current state update — v1.27

FinFlow now has a safe Apply-to-Day Core layer.

Approved candidates can be previewed as patches before applying. Sensitive/high-risk candidates remain blocked. Application produces rollback-ready history and audit events.

Next step: v1.28 — real local/Supabase-ready applied patch persistence and rollback commands.

## v1.77 Codex Sync

Unified current package includes Codex stabilization fixes merged into v1.76 without losing v1.73–v1.76 features.

## v1.78 Daily Decision Summary

Added central command block combining work, fuel, car, repair fund and allocation decisions.

## v1.79 Cloud Sync Merge

Telegram + Supabase Cloud Day Sync from Codex v1.73 merged into latest v1.78 without losing v1.73–v1.78 local systems.

## v1.80 Private Deployment

Added deployment readiness layer. Real secrets are required for production but must be stored in server/hosting environment variables, not source code.

## v1.81 Verification Checklist

Added readiness percentages and real Telegram/Supabase verification checklist UI.

## v1.82 Daily Decision Chat

Daily Decision Summary now feeds the local assistant chat for global day/work/money questions.

## v1.83 Verification Persistence

Telegram/Supabase verification checklist now stores local progress and notes without cloud writes.

## v1.84 Verification Handoff Export

Verification checklist progress can now be exported as safe Markdown/JSON handoff report.

## v1.85 Acceptance Runner

Added safe deployment acceptance runner draft. Automated checks are read-only/safe; cloud writes remain manual guarded.

## v1.86 Manual Cloud Test Wizard

Added guided manual save/load/conflict wizard. No automatic cloud writes.

## v1.87 Local Backup / Restore

Added local full-day backup/restore safety layer before real cloud sync tests. Restore is local-only.

## v1.88 Backup-Aware Cloud Test Flow

Manual Cloud Wizard now requires a local backup before risky manual cloud write/conflict progression.

## v1.89 Local Backup Diff / Restore Preview

Local backup restore now shows preview/diff before explicit confirm restore. Restore remains local-only.

## v1.90 Codex Sync

Codex v1.87 corrections synchronized onto current v1.89. Private raw data excluded; safety layers preserved.

## v1.92 Claude Sync

Claude v1.73 synchronized into MASTER PRIVATE FULL. Full Claude package is in private_vault; Telegram client bridge merged into app.

## v1.93 Cloud Restore Preview Diff

Cloud preview now shows local vs cloud diff before explicit local apply.

## v1.94 Cloud Apply Rollback Snapshot

Cloud preview apply now creates a session rollback snapshot before local replacement.

## v1.95 Cloud Save Preflight Backup Gate

Cloud save now checks local backup/rollback safety before allowing Supabase save.

## v1.96 Full Audit

Full audit and build fix completed. Ecosystem readiness board added; old manifests archived; current production readiness estimate is 66%.

## v1.97 Claude Nav Review Sync

Functional bottom navigation merged; daily flow is less cluttered, system checks are under System tab.

## v1.98 current state

Daily Mode Polish completed. The default Day tab is now morning plan, work quick-flow and evening summary. Money, Work, Funds, AI and System tabs are separated into focused product views. Cloud/backup/deployment/dev panels are isolated in System.

## v2.00 current state

Daily Persistence / Cross-tab State Hardening completed. FINFlow now has unified browser-local active-day live-state under `finflow.dailyLiveState.v2_00`, preserving legacy keys and reducing stale state across Day/Money/Work/Funds/AI/System views.

## Current state update — v2.01

Active Day Session Controls were added. Daily Mode now supports closing the current day, saving a history snapshot, archiving the full previous live-state, creating a clean new active day, and restoring the latest rollover archive if needed.

Telegram Mini App can move into staging/deploy preparation next, but real Telegram use still requires hosting, BotFather URL, env variables, Supabase checks and acceptance tests.


## Current state update — v2.03

FINFlow now has a Telegram Mini App staging preparation layer. A deploy-safe package can be generated from `finflow_app` without `private_vault`, `private_raw_data`, real env files, node_modules or build output. System tab includes a Telegram staging panel with environment, BotFather, first phone test and rollback steps. Readiness reporting now uses `было → стало` deltas.

Current next step: v2.04 — real Telegram device test with initData verification, viewport check and cloud dry-run checklist.
