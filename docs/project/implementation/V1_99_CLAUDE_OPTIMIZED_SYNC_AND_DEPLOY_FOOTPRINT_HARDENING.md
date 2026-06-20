# v1.99 — Claude Optimized Sync and Deploy Footprint Hardening

Date: 2026-06-20

## Purpose

Synchronize the uploaded Claude v1.94 Optimized package with the current v1.98 master without regressing current FINFlow systems.

## Implemented

- Preserved the uploaded Claude optimized package in `private_vault`.
- Added `.dockerignore` to `finflow_app`.
- Added `.vercelignore` to `finflow_app`.
- Merged safe Next.js deploy-footprint settings:
  - `output: 'standalone'`
  - `poweredByHeader: false`
  - `compress: true`
  - `productionBrowserSourceMaps: false`
- Preserved v1.98 build-stability settings:
  - `turbopack.root`
  - `experimental.cpus = 1`
  - `experimental.workerThreads = false`
- Updated app version to `0.1.99`.

## Explicitly preserved

- Daily Mode Polish: morning plan, working quick-flow, evening summary.
- Six separate navigation tabs: Day, Money, Work, Funds, AI, System.
- Cloud save preflight backup gate.
- Cloud restore preview diff and rollback snapshot.
- Ecosystem readiness board.
- Local backup/restore safety.
- Telegram/Supabase verification and deployment acceptance panels.

## Not merged from Claude

Older runtime components were not copied because they would remove later FINFlow systems.
