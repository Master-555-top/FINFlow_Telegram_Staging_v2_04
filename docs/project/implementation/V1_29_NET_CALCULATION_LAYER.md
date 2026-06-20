# v1.29 — Daily Use MVP: Net Calculation Layer

## Goal

FinFlow must calculate clean money, not only gross taxi turnover.

The user thinks in daily gross turnover, but the app must always show what remains after:

- Drivee/platform commission
- fuel
- work costs
- food
- meeting money
- obligations
- planned day tasks

## Core rule

```text
gross turnover is not real money
real plan = gross - Drivee - fuel - required day costs
```

## Added

- `src/lib/day-core/netCalculationModel.ts`
- `src/components/day-core/NetCalculationPanel.tsx`
- UI block: "Чистыми, а не только грязными"

## Main calculations

```text
driveeExpected = grossExpected * driveeRate
fuelStillNeeded = max(0, fuelPlanned - fuelAlreadyPaid)
netExpectedAfterDrivee = grossExpected - driveeExpected
netExpectedAfterWorkCosts = grossExpected - driveeExpected - fuelStillNeeded
realFreeExpectedAfterDayPlan = netExpectedAfterWorkCosts - nonFuelPlannedTaskCosts
grossNeededForTargetNet = (targetNet + fuelPlanned) / (1 - driveeRate)
```

## Why this matters

If the user targets 8,500 ₽ clean, then 11,000 ₽ gross may not always be enough when fuel and other costs are high.

The app must warn when the gross target is lower than the real gross needed for the clean target.

## Preserved

- Day Core
- Import Review Queue
- Review actions
- Apply-to-Day Core
- Persistent patch rollback
- Source 05
- private_raw_data isolation
