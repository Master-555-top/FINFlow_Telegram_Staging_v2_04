# v2.02 — Claude Audit Sync / Static Shell & Server Cleanup

Date: 2026-06-20
Base: v2.01 Active Day Session Controls / New Day Roll-over
External patch source: `FINFlow_v3_MASTER_PRIVATE_FULL_v1_99_1_Audited.zip`

## Purpose

Synchronize the corrected Claude v1.99.1 audit package without replacing the newer v2.01 master.

Claude v1.99.1 contained useful audit findings, but it was older than the current project state. The merge strategy was therefore selective:

1. preserve the external package in `private_vault`;
2. compare app/runtime files against v2.01;
3. merge only fixes that do not remove newer functionality;
4. document all accepted/rejected changes;
5. run anti-regression checks before packaging.

## Accepted fixes

### 1. Static home shell

`app/page.tsx` no longer exports `dynamic = 'force-dynamic'`.

Reason: the home route is a client-side app shell. Runtime-specific work is performed by client hydration and API routes. Static prerendering improves Telegram/Vercel first paint without changing daily state, Telegram verification, cloud sync, backups, or active day rollover.

### 2. Dead Supabase profile draft cleanup

Removed from runtime source:

- `src/lib/server/supabaseProfileDryRun.ts`
- `src/lib/server/supabaseProfileResolverDraft.ts`

Reason: real guarded server-only profile logic now lives in `src/lib/server/finflowProfileRepository.ts`; the removed files had no active TypeScript imports.

### 3. Resolver note cleanup

`src/lib/server/finflowProfileResolver.ts` no longer exports obsolete draft placeholders. It now documents the current live path:

```text
API route → authenticateTelegramInitData → finflowProfileRepository
```

## Rejected changes from Claude v1.99.1

The following Claude files were intentionally not copied over v2.01:

- `src/components/dashboard/DashboardShell.tsx`
- `src/components/day-core/DailyQuickInputPanel.tsx`
- `src/lib/day-core/dayCoreModel.ts`
- `src/lib/project/ecosystemReadinessAudit.ts`
- `package.json` / `package-lock.json`
- v1.99.1 docs as authoritative current state

Reason: those files came from an older version and would roll back v2.00/v2.01 systems.

## Anti-regression result

No current systems were replaced by older Claude code. v2.00 live-state and v2.01 New Day rollover remain the active source of truth.
