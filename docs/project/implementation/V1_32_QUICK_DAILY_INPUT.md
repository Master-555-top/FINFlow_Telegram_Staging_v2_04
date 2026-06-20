# v1.32 — Quick Daily Input

## Goal

Make FinFlow start feeling like a daily-use mini app, not only architecture.

The user can now quickly change the current day demo state:

- update cash/card/Drivee balance
- add taxi order
- add fuel payment
- add food/meeting/products/car expense
- add custom order/expense
- reset demo day

## Calculation rule

Quick Daily Input follows the locked clean-money terminology:

```text
Грязными = all taxi orders before costs
Чистые со смены = грязными - Drivee/commission - бензин
Свободно после плана = чистые со смены - еда - встреча - обязательства - задачи/фонды
```

## Persistence

For now this is browser-local demo persistence:

```text
localStorage key: finflow.dailyQuickInput.v1_32
```

This is not production storage. Real financial records must later move to Supabase with RLS and audit.

## Safety

No raw bank data is used.
No private_raw_data is displayed.
No imports are applied blindly.
