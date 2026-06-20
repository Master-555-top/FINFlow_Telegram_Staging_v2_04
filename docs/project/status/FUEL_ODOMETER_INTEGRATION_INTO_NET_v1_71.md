# Fuel/Odometer Integration Into Net Calculation — v1.71

## Purpose

After v1.70, FINFlow could show fuel/odometer trends. v1.71 connects odometer-derived fuel cost to the daily net calculation.

## Added logic

The integration compares:

```text
fuel planned in day core
vs
fuel calculated from odometer
```

It then calculates:

```text
fuel delta vs plan
fuel still needed by odometer
shift clean using odometer fuel
free money using odometer fuel
gross needed for target net using odometer fuel
```

## UI action

The user can press:

```text
применить бензин по пробегу в план дня
```

This updates the daily fuel plan to the odometer-derived fuel cost.

## Safety

This does not:
- change bank history;
- delete fuel history;
- write to Supabase;
- call an external API.

It only updates local Day Core input state.
