# Fuel/Odometer Charts & Trend Signals — v1.70

## Purpose

After v1.69 added export/reset for odometer/fuel history, v1.70 adds trend visibility.

## Added

- mini chart for recent fuel cost entries;
- trend signals for:
  - high ₽/km;
  - rising ₽/km;
  - falling ₽/km;
  - heavy mileage day;
  - no history yet.

## Signals

```text
>= 11 ₽/km → warning
>= 9 ₽/km → watch
< 9 ₽/km → good
+1 ₽/km vs previous entry → warning
-1 ₽/km vs previous entry → good
>= 220 km entry → watch for wear/fatigue
```

## Current limits

- no external chart library;
- no Supabase sync;
- chart uses local history only;
- visual bars compare recent fuel costs, not full analytics yet.
