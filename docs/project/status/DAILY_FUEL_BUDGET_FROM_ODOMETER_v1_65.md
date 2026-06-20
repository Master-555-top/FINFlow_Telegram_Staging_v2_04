# Daily Fuel Budget From Odometer — v1.65

## Inputs used

```text
Fuel: AI-92
Fuel price: 75.51 ₽/liter
Consumption range: 11–13 L/100 km
Base consumption: 12 L/100 km
Service date: 16.06.2026
Odometer after service: 280,041 km
Current known odometer on 18.06.2026: 280,420 km
Fresh distance: 379 km
Fresh average: ~189.5 km/day
```

## Fuel budget scenarios

| Scenario | Km/day | Fuel cost range |
|---|---:|---:|
| Light day | 80 km | ~664–785 ₽ |
| Normal day | 150 km | ~1,246–1,473 ₽ |
| Fresh average after service | 189.5 km | ~1,574–1,860 ₽ |
| Heavy day | 220 km | ~1,828–2,159 ₽ |

## Recommendation

Until more odometer readings are collected, FINFlow should keep a working fuel reserve of about:

```text
1,900 ₽/day
```

This is based on the fresh average of ~189.5 km/day and high consumption estimate of 13 L/100 km.

## Important accounting rule

Fuel is a taxi operating cost.

It must be subtracted before free money calculation:

```text
gross turnover − Drivee commission − fuel = clean shift money
```
