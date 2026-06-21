# FINFlow v2.35 — Work / Taxi Engine

Date: 2026-06-22

## Purpose

v2.35 moves FINFlow forward from local UI edits to a real Work/Taxi layer. The goal is to make the Work section understand a taxi shift as a connected system:

- orders;
- gross turnover;
- active hours and full shift hours;
- active ₽/hour and shift ₽/hour;
- fuel and Drivee/commission as work costs;
- remaining gross to target;
- Work → Money → Day → Sleep bridge.

This keeps the current visual baseline and does not redesign the app.

## New files

- `src/lib/work/workTaxiEngine.ts`
- `src/components/work/WorkTaxiEnginePanel.tsx`

## Updated files

- `src/components/day-core/DailyQuickInputPanel.tsx`
- `src/lib/project/miniAppDeliveryPlan.ts`
- `src/lib/project/ecosystemReadinessAudit.ts`
- `src/components/dashboard/DashboardShell.tsx`
- `app/finflow-ui-overrides.css`
- `package.json`

## Engine inputs

The Work/Taxi engine reads:

- `DayCoreInputModel.taxi`
- enabled `DailyRecord[]`
- records of type `taxi_order`, `fuel`, and `drivee_topup`

It does not write to Sleep storage and does not change locked localStorage keys.

## Engine outputs

`buildWorkTaxiShiftSnapshot()` returns:

- shift metrics;
- work cost metrics;
- record references;
- bridge text for Money, Day and Sleep;
- template foundation;
- operational signals.

## Locked decisions preserved

- No global History tab.
- Work history remains section-scoped inside Work.
- Sleep remains Обзор / История / Редактор.
- Sleep localStorage keys remain unchanged.
- Cloud writes remain safe-off.
- MASTER/private separation remains unchanged.
- Visual baseline screens remain protected.

## What is still missing

- Full shift lifecycle: start / pause / resume / end.
- Zone and point analytics.
- True work history by periods.
- CSV/JSON import confirmation into work shifts.
- Supabase persistence with RLS.
- n8n automation after stable API layer.

## Verification

v2.35 passed:

- `npm ci --ignore-scripts --no-audit --prefer-offline`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`

Only sandbox engine warning remains: current sandbox uses Node 22/npm 10 while project targets Node 24/npm 11+.
