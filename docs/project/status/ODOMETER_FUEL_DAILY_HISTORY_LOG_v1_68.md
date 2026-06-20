# Odometer/Fuel Daily History Log — v1.68

## Purpose

After v1.67, FINFlow persisted the latest editable odometer/fuel input.

v1.68 adds a local history log so the user can save daily/shift fuel calculations.

## Storage key

```text
finflow.fuelOdometerHistory.v1_68
```

## Saved entry fields

```text
date
previousOdometerKm
currentOdometerKm
kmDriven
fuelPriceRubPerLiter
consumptionLitersPer100Km
litersNeeded
fuelCostRub
costPerKmRub
note
```

## Summary calculated from history

```text
entries count
total km
total liters
total fuel cost
average cost per km
average consumption L/100 km
```

## Current limits

- localStorage only;
- no Supabase sync yet;
- no export yet;
- no chart yet.
