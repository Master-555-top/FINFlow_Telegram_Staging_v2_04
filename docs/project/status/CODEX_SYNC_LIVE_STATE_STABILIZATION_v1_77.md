# Codex Sync + Live State Stabilization — v1.77

## Purpose

User provided a corrected Codex package based on v1.72 and asked to fully analyze it, synchronize with the latest active branch and output one unified ready package.

## Source branches

- Latest active ChatGPT branch: `FINFlow_v3_Latest_Working_Package_v1_76.zip`
- Corrected Codex branch: `FINFlow_v3_completed_from_v1_72.zip`
- Codex report: `FINFlow_COMPLETION_REPORT.md`

## Codex fixes accepted into v1.77

- `next.config.js` now explicitly sets `turbopack.root = __dirname`.
- `npm run dev` uses `next dev --webpack`.
- `npm run lint` now runs real TypeScript checking instead of deprecated `next lint`.
- Added `typecheck` and `check` scripts.
- Runtime/dev dependency versions are pinned.
- `package-lock.json` synchronized to pinned dependencies and version bumped to v1.77.
- Top `DayCoreDashboard` now receives live `DayCoreInputModel`.
- `NetCalculationPanel` now receives live `DayCoreInputModel`.
- `DashboardShell` holds one live `DayCoreInputModel` state and passes it to dashboard, quick input and net panel.
- `DailyQuickInputPanel` now reports day input changes upward.
- Hydration-sensitive history and assistant current-hour logic are guarded.

## v1.73–v1.76 preserved

- fuel/odometer chat context;
- car maintenance chat context;
- car repair allocation panel;
- repair-aware assistant chat answers;
- repair fund allocation model;
- all current context/protocol ledgers.

## Security adjustment after Codex sync

Codex package pinned `@supabase/supabase-js` to `2.49.1`. Local `npm audit` reported two low severity advisories through that dependency. During v1.77 synchronization, Supabase was upgraded and pinned to `2.108.2`, after which audit reported `0 vulnerabilities`.
