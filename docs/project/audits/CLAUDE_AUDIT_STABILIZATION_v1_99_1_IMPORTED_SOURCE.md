# Claude Audit & Stabilization — v1.99.1

Date: 2026-06-20
Baseline: v1.99 (merged state = v1.98 Daily Mode Polish + v1.94 deploy-footprint hardening)

## Method

Full read-first audit, then only safe anti-regression-compliant fixes. Build/typecheck baseline established before any change; every change verified by build + live dev server, not just typecheck.

## 1. Architecture & logic — understood

- Next.js 16 (React 19) Telegram Mini App. Home route is a client-side app shell (`DashboardShell`, `'use client'`) that hydrates from localStorage / Telegram `initData`.
- Day Core is the central object (LOCKED_DECISIONS #4). Live time/date drives feasibility (LD v1.6 Late-Day Feasibility).
- Six-tab navigation (День/Деньги/Работа/Фонды/AI/Система); `DailyQuickInputPanel` renders a focused slice per `view` prop.
- Server side: HMAC validation of Telegram `initData` (`telegramInitData.ts` + `telegramRequestAuth.ts`), real Supabase profile + cloud-day repositories behind feature flags, deployment-readiness endpoint.
- Cloud sync is preview-before-apply with rollback snapshots and a save preflight gate (v1.93–v1.95).

## 2. Already implemented (confirmed working)

Functional navigation, all six focused views, morning plan / work quick-flow / evening summary (v1.98), real Supabase select/insert with optimistic-revision concurrency, Telegram identity verification, local backup/restore + diff, ecosystem readiness board, standalone build + deploy-ignore footprint hardening.

## 3. Problems found

| # | Severity | Issue |
|---|----------|-------|
| 1 | Medium | `app/page.tsx` forced `dynamic = 'force-dynamic'` → per-request SSR for a client-only shell (regressed the static optimization that existed in v1.94). |
| 2 | Low-Med | Version drift: in-app header badge showed `v1.97`; package.json `0.1.99`; docs `v1.99`. |
| 3 | Low | Two dead server files (`supabaseProfileDryRun.ts`, `supabaseProfileResolverDraft.ts`, 0 real imports) + dangling exports — resurrected by the v1.94→v1.98 merge. |
| 4 | Info | `scripts/build-next.mjs` two-phase build is redundant (standard `next build` is identical). |
| 5 | Info | Two same-named `LocalBackupRestorePanel.tsx` (different real purposes). |

## 4. Changes applied (all anti-regression-safe, no behavior change)

- **#1** Removed `force-dynamic`; home route is `○ Static` again. Page renders identically (client-side), just prerendered + CDN-served.
- **#2** Unified user-visible header badge to `v1.99` (kept section-kicker labels at the version each section actually landed in).
- **#3** Removed the two dead files + the dangling doc-string / `finflowProfileResolverNextSteps` export.
- **#4, #5** Deliberately left unchanged — they work; changing them is cosmetic risk.

## 5. Dependency impact check

- Removing `force-dynamic`: no importer or runtime depends on dynamic rendering; APIs (which are correctly `force-dynamic`) are unaffected. ✔
- Removing dead files: verified 0 real `import` statements reference them or the removed exports. ✔
- Version string: display-only; no logic keys off it. ✔

## 6. Verification

`npx tsc --noEmit` ✔ · `next build` ✔ · `npm run check` exit 0 ✔ · home route `○ Static` ✔ · dev server serves page + badge `v1.99` + 6 tabs + `/api/deployment/readiness` + `/api/telegram/verify` ✔ · standalone output intact (~35 MB traced node_modules) ✔

## 7. Still open (needs owner credentials / environment)

- Telegram bot token + public HTTPS deploy + BotFather Mini App registration.
- Supabase project + env + RLS review before enabling cloud-write flags.
- n8n / external AI bridge (still dry-run draft).

Next recommended engineering step (per nested CURRENT_STATE): `v2.00 — Daily Persistence / Cross-tab State Hardening`.
