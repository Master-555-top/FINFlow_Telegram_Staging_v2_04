# FINFlow v2.38 — Recurring Apply + Work Shift Lifecycle

Date: 2026-06-22

## Purpose

v2.38 moves FINFlow from passive template/import previews toward a usable local-first action pipeline:

`template/import → preview → confirm/apply → local record → rollback snapshot`

It also turns taxi work into a lifecycle concept:

`open shift → add orders/work costs → close shift preview → Money/Day/Sleep bridge`

This is a global system step, not a visual redesign.

## Added

### Template Apply Engine

File: `src/lib/templates/templateApplyEngine.ts`

Capabilities:
- Builds apply drafts from the unified Templates Engine registry.
- Detects direct Daily Record targets: taxi order, fuel, Drivee, personal expense, income.
- Creates recurring occurrence previews for daily, weekly, monthly and deadline templates.
- Blocks planned/unsupported templates from accidental writes.
- Detects same-day duplicate-like templates/records.
- Applies only approved ready drafts to Daily Records.
- Produces rollback snapshots that remove only records created by the current apply operation.

Safety rules:
- No direct Supabase writes.
- No private data exposure.
- No hidden writes without user confirmation model.
- Fund/task/obligation writes remain preview/review until their adapters are implemented.

### Work Shift Lifecycle

File: `src/lib/work/workShiftLifecycle.ts`

Capabilities:
- Infers current shift state from Day Core + Daily Records.
- Statuses: empty, needs_orders, open, ready_to_close, closed_preview.
- Calculates gross, remaining target, active hours, full shift window, idle hours, active ₽/h and shift ₽/h.
- Builds close preview: fuel, Drivee estimate, work costs, net after work costs.
- Emits checkpoints for orders, pace, costs and close readiness.

### UI integration

Updated:
- `src/components/templates/TemplatesEnginePanel.tsx`
- `src/components/work/WorkTaxiEnginePanel.tsx`
- `src/components/system/GlobalDataBackbonePanel.tsx`

The UI remains in the existing visual style. No global redesign was introduced.

## Preserved locked decisions

- Section-scoped history only; no global History tab.
- Sleep remains `Обзор / История / Редактор`.
- Sleep localStorage keys are unchanged.
- Visual baseline stays locked: Sleep History list, 7-day Sleep chart, System grid.
- MASTER/private/secrets remain private.
- Deploy-safe excludes private vault/raw data/env/secrets.
- Supabase/cloud writes remain safe-off.

## Progress impact

Strong mini app readiness moves from about 65% to about 68%.
Remaining estimate: about 32%.

Next build: `v2.39 — Supabase Staging Foundation`.
