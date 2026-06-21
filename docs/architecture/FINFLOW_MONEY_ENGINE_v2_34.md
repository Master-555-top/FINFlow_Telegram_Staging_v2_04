# FINFlow v2.34 — Money Engine

Date: 2026-06-22

## Purpose

v2.34 moves FINFlow from a generic money input area toward a real daily Money Engine. This is not a visual redesign. It keeps the current dark/glass interface direction and adds a stronger data layer for income, expenses, sources, obligations and template suggestions.

## What changed

Added:
- `src/lib/money/moneyEngine.ts`.
- `src/components/money/MoneyEnginePanel.tsx`.
- Money Engine block inside the existing Деньги flow.
- Progress model update: strong mini app readiness is now about 52% complete / 48% remaining.

Money Engine reads:
- Day Core balances: cash, card, Drivee, reserved money.
- Daily Records: taxi orders, fuel, Drivee top-up, expenses and other income.
- Day Core obligations: car payment, bankruptcy/bank and future obligations.
- Existing user category logic: work/fuel/commission, products/food, car, meetings/life, other, taxi income.

Money Engine outputs:
- total income;
- work costs;
- personal expenses;
- tracked net after outflow;
- safe-to-spend estimate;
- sources summary;
- categories summary;
- obligations summary;
- template suggestions;
- short safety signals.

## Locked UX decisions preserved

- No global visual redesign.
- Sleep History list, Sleep weekly chart and System grid remain locked visual baselines.
- Section-scoped history remains locked: Money history belongs inside Деньги, not a global History tab.
- System remains tools/storage/reset/backup/cloud/QA/dev.
- Cloud writes remain safe-off.
- MASTER/private/deploy-safe split remains mandatory.

## Current limitations

- Money Engine is local and reads current local daily records.
- Period history by week/month/year is not final yet.
- Recurring payments are represented through obligation/template foundation, but full recurring engine is not implemented yet.
- Historical import is still preview/foundation; confirmed local write UI and rollback UX remain next steps.
- Supabase writes are not enabled.

## Next recommended build

v2.35 — Work/Taxi Engine:
- shift lifecycle;
- orders/fuel/commission split;
- ₽/hour analytics;
- work history by day/week/month;
- link Work Engine output into Money Engine.
