# Step 2 — Daily Money Planner Spec

## Цель Step 2

Добавить первый реально полезный экран, который отвечает:

- сколько денег есть сейчас;
- сколько нужно грязными сегодня;
- сколько уйдёт на бензин;
- сколько уйдёт на Drivee;
- сколько оставить в рабочий фонд;
- что критично сегодня;
- сколько реально свободно;
- какие мини-цели можно/нельзя добавить.

## Входные данные Step 2

- current cash
- current card balance
- current Drivee balance
- planned gross
- fuel price
- consumption
- daily km
- Drivee fee percent
- food/personal plan
- working fund target
- repair allocation
- cushion allocation
- meeting fund allocation
- mini-goals

## Базовые значения

- fuelPrice = 75.51
- fuelConsumptionMin = 11
- fuelConsumptionMax = 13
- dailyKmMin = 80
- dailyKmMax = 150
- driveeFeePercent = 13
- realisticNetDailyMax = 10000

## Выходные данные

- fuelCostEstimate
- driveeFeeEstimate
- workingCostsTotal
- realNetAfterTaxiCosts
- dailyDeficit
- recommendedGrossToday
- allocationPlan
- riskLevel
- AI-like recommendation text

## Проверка после реализации

- изменение plannedGross пересчитывает Drivee;
- изменение текущих денег пересчитывает дефицит;
- добавление mini-goal увеличивает план;
- если план выше реалистичного лимита, показывается предупреждение;
- данные обновляются без перезагрузки;
- Foundation UI не сломан.
