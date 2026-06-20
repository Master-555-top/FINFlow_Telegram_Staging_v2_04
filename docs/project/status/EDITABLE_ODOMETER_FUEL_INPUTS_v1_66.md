# Editable Odometer & Fuel Inputs — v1.66

## Purpose

FINFlow must not only show fixed fuel scenarios. The user must be able to manually enter:
- previous odometer;
- current odometer;
- AI-92 price;
- fuel consumption L/100 km.

## Added calculation

```text
km driven = current odometer − previous odometer
liters needed = km driven × consumption / 100
fuel cost = liters needed × fuel price
cost per km = fuel cost / km driven
```

## Default values

```text
previous odometer: 280,041 km
current odometer: 280,420 km
AI-92: 75.51 ₽/L
consumption: 12 L/100 km
```

## Result with defaults

```text
km: 379
liters: ~45.5 L
fuel cost: ~3,435 ₽
cost per km: ~9.1 ₽/km
```

## Important

The default editable calculation is for the whole 379 km period since service, not per single day.

The daily scenario panel still shows approximate daily budgets.
