# Car Fuel and Mileage Analysis — v1.61

## Current fresh mileage

```text
280,420 km − 280,041 km = 379 km
379 km / 2 days = 189.5 km/day
```

## Fuel estimate at 12 L/100 km and 75.51 ₽/L

```text
189.5 km × 12 / 100 = 22.74 L/day
22.74 L × 75.51 ₽ = ~1,717 ₽/day
```

## Fuel estimate range using 11–13 L/100 km

```text
11 L/100 km → ~1,574 ₽/day
12 L/100 km → ~1,717 ₽/day
13 L/100 km → ~1,860 ₽/day
```

## Product implication

FINFlow should calculate fuel from:
- actual km;
- selected consumption;
- fuel price;
- taxi work intensity;
- cash available today.

Fuel must be part of work cost, not personal spending.
