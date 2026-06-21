# FINFlow v2.32 — Global Data Backbone

Date: 2026-06-22

## Why this step exists

The project is moving away from tiny UI polish and toward a strong working Telegram Mini App. The next layers require one data backbone before historical imports, Supabase, templates, money/work engines and n8n can be built safely.

## Locked decisions preserved

- No standalone global History tab.
- History remains section-scoped: Деньги, Работа, Фонды, Сон, AI.
- System remains tools/storage/reset/backup/cloud/QA, not a main user-history screen.
- Sleep storage keys remain locked: `finflow_sleep_records_v2_17`, `finflow_sleep_live_session_v2_17`.
- Cloud writes remain safe-off until backup, migration, RLS and conflict tests pass.
- MASTER/private/secrets never go to GitHub/Vercel/public cloud.

## Added in v2.32

- `src/lib/project/miniAppDeliveryPlan.ts` — honest strong-mini-app progress model.
- `src/lib/data/finflowCanonicalDataModel.ts` — canonical section/entity map.
- `src/lib/data/historicalImportDraft.ts` — first safe parser for manual historical import drafts.
- `src/components/system/GlobalDataBackbonePanel.tsx` — System → Data → Backbone screen.
- `supabase/migrations/202606220232_finflow_v3_data_backbone_draft.sql` — draft private migration with RLS pattern.
- `docs/automation/FINFLOW_N8N_AUTOMATION_PLAN_v2_32.md` — n8n staging/security plan.

## Current honest readiness

Strong fully working mini app: about 42–45% complete depending on how strict production readiness is counted.

Remaining: about 55–58%.

This is not a failure: the app has a strong local foundation, but the full product still needs real data import, money/work engines, Supabase verification, n8n automation and real Telegram QA.

## Critical path after v2.32

1. v2.33 — Money/Work canonical write adapters + Historical Import preview.
2. v2.34 — Money engine: income sources, expenses, categories, recurring charges.
3. v2.35 — Work/taxi engine: shifts, orders, fuel, ₽/hour, work history.
4. v2.36 — Templates engine across money/work/funds/tasks.
5. v2.37 — Supabase private staging migration + RLS manual test.
6. v2.38 — Sync queue + conflict handling + backup-first cloud writes.
7. v2.39 — n8n webhook contract + daily reports/backup workflow draft.
8. v2.40+ — Telegram real-device QA and final UI polish by screenshots.
