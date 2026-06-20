# DAILY MONEY PLANNER SPEC

## Purpose
First useful MVP screen. It answers: how much gross money must be made today, what will really remain, and where the money should go.

## Inputs
- current money: cash/card/Drivee/funds
- current date/time
- available work window
- expected gross income or target gross
- fuel plan
- Drivee percentage
- obligations
- funds
- mini-goals
- calendar/tasks
- realistic daily net cap

## Outputs
- gross target today
- estimated Drivee fee
- estimated fuel
- other work costs
- real net
- free cash
- required allocation
- AI recommendation text
- risk level

## Required default vehicle settings
Use TAXI_VEHICLE_COST_MODEL.md until user updates values.

## First MVP calculations
Drivee = gross * 0.13
Fuel = configurable default 1500 ₽
Oil/TO reserve = configurable default 200 ₽
Chassis reserve = configurable default 1000–1500 ₽
Working fund target = 7000–10000 ₽
Realistic daily net warning if plan requires >10000 ₽ net.

---

## v1.6 Addition — exact allocation recommendations

Daily Money Planner must recommend **where money goes and in what amount**, not only show totals.

Required outputs:
- required gross target;
- non-commission needs;
- estimated Drivee fee;
- required fuel/top-up;
- current-money offset;
- realistic forecast based on current time;
- exact allocation list;
- postpone/reduce list;
- mode: Normal / Recovery / Emergency / Goal Sprint.

Important example: 15.06.26 at 16:07.
The user needed fuel, Drivee/top-up, food, meeting, products and bankruptcy remainder. Required gross was about 14,400 ₽ if Drivee is 13% of gross. But at 16:07 the plan became unrealistic, so the app must recommend priorities and postponements rather than simply displaying the target.

## v1.7 Addition — Daily plan must recalculate from actual orders

Daily Money Planner must treat today's orders as live inputs.

Required state:

```
gross_target_today
actual_gross_done_today
actual_order_count_today
actual_drivee_paid_today
actual_fuel_paid_today
remaining_required_today
current_time
remaining_work_window
```

Every new income/order entry must instantly update all dependent values:

- remaining gross target;
- Drivee estimate;
- work cost progress;
- available money;
- allocations paid/remaining;
- feasibility of today's plan;
- AI recommendation.

This is part of the Live Reactive System locked decision.
