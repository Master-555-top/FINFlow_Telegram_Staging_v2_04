# Codex Branch Sync Audit — v1.77

## What was compared

The corrected Codex archive was compared against latest v1.76 by normalized file paths.

## Important accepted Codex differences

1. Infrastructure:
   - package scripts;
   - pinned dependencies;
   - package-lock synchronization;
   - Turbopack root.

2. Hydration/live state:
   - dashboard/net panel connected to one live Day Core input;
   - Quick Input propagates state to parent;
   - first render avoids browser-only localStorage/time differences.

3. Checks:
   - Codex report states `npm ci`, `npm run lint`, `npm run check`, production build and browser smoke tests passed in its branch.

## Important v1.76 differences preserved

Codex was based on v1.72, so it did not contain later v1.73–v1.76 product work. These were intentionally preserved from v1.76:

- assistant chat uses fuel/odometer context;
- assistant chat uses car maintenance context;
- repair fund allocation panel;
- repair-aware assistant chat;
- all v1.73–v1.76 docs, security scans, state and changelog entries.

## Merge decision

The unified v1.77 package is based on v1.76 plus selected Codex stabilization patches. Codex did not replace the latest branch wholesale because that would regress product features added after v1.72.

## Security adjustment

Codex dependency pinning was accepted in principle, but `@supabase/supabase-js@2.49.1` was upgraded to `2.108.2` because audit reported low severity vulnerabilities in the older pin. This keeps dependencies pinned while satisfying security-first rules.
