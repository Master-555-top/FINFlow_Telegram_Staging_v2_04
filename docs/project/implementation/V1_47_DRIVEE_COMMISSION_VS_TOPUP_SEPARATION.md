# v1.47 — Drivee Commission vs Drivee Top-up Separation

## Memory preflight

Before implementation, context, transcript ledger and protocols were checked.

## Goal

Separate two different concepts:

1. Drivee/platform commission:
   - calculated from gross taxi orders;
   - affects clean shift income formula.

2. Drivee top-up:
   - actual payment/cashflow to replenish platform balance;
   - editable record;
   - should not be confused with calculated commission.

## Added

- `drivee_topup` record type.
- Drivee top-up template uses `drivee_topup`, not generic expense.
- Bank category `work_platform_commission` maps to `drivee_topup`.
- Net calculation exposes `driveeTopupCashflow`.
- UI explanation panel: `Drivee: комиссия ≠ пополнение`.

## Preserved

Clean shift formula remains:

```text
чистые со смены = грязными - комиссия Drivee - бензин
```

Drivee top-up is tracked separately as movement/cashflow.
