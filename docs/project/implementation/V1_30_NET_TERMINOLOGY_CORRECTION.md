# v1.30 — Net Terminology Correction

## User clarification

The user said:

```text
Чистые в день = минус комиссия за день и бензин, остальное чистое.
```

This is correct for taxi shift accounting.

## Locked terminology

FinFlow must separate two concepts:

```text
1. Чистые со смены / рабочие чистые
   = грязный оборот - Drivee/комиссия - бензин

2. Свободные после дневного плана
   = чистые со смены - еда - встреча - обязательства - дневные задачи
```

## Why this matters

If food, girlfriend meeting, products, bankruptcy payment or car obligations are subtracted from "чистые", the app may confuse work profitability with life allocation.

Correct model:

```text
Работа показывает: сколько я реально заработал.
План дня показывает: куда эти чистые деньги нужно распределить.
```

## v1.30 change

The UI and calculation model now explicitly label:

- `Чистые со смены`
- `Свободные деньги`
- `Грязными для рабочих чистых`
- difference between clean shift income and free cash after day plan
