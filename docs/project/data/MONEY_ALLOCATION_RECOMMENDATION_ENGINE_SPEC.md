# MONEY ALLOCATION RECOMMENDATION ENGINE SPEC

Version: v1.9
Status: locked requirement

## Purpose

FinFlow must not only show totals. It must recommend exactly how much money to allocate, where to allocate it, and what to postpone when the day is constrained.

The system must answer:

- how much gross taxi turnover is needed today;
- how much has already been made;
- how much remains;
- how much must be reserved for fuel, Drivee, food, obligations, working fund, meetings, car maintenance, repair, cushion, and mini-goals;
- which allocation mode should be active: normal, recovery, emergency, buffer build, goal sprint;
- which payments are mandatory today;
- which goals should be paused or postponed;
- what exact recommended distribution should be shown after each new order, income, expense, task, or balance update.

## Core principle

The user does not need abstract advice like “earn more” or “save money”. The app must give a concrete distribution plan.

Example:

```text
Available / earned today: 8,000 ₽ gross
Recommended allocation:
- Drivee reserve: 1,040 ₽
- Fuel: 2,000 ₽
- Food: 500 ₽
- Bankruptcy payment: 4,000 ₽
- Meeting fund: 0 ₽ today
- Cushion: 0 ₽ today
- Car repair: 0 ₽ today

Reason:
The day is already late and the original plan is unrealistic. Priority is keeping work possible and closing the critical payment.
```

## Required inputs

The allocation engine uses:

- current date and time;
- current balances: card, cash, Drivee, funds;
- planned gross target;
- live shift progress: completed orders and gross made;
- fuel plan;
- Drivee fee model, currently planning at about 13%;
- fixed obligations and deadlines;
- working fund status;
- all funds and their balances;
- temporary goals and mini-goals;
- calendar/tasks and remaining working window;
- realistic daily cap and fatigue/load status;
- car/maintenance priority.

## Allocation priority model

Default priority order:

1. Work continuity: minimum fuel + minimum Drivee + ability to work today/tomorrow.
2. Critical same-day obligations: bankruptcy, car payment, other must-pay deadlines.
3. Food/basic daily survival.
4. Vehicle safety and maintenance: oil, brakes, suspension/chassis, tires if unsafe.
5. Working fund rebuild.
6. Cushion/safety reserve.
7. Relationship/life funds: meeting fund, girlfriend products, gifts, temporary mini-goals.
8. Medium/long-term goals: relocation, birthday, capital/growth.

Priority can be adjusted by urgency and user decision, but the app must show the risk.

## Smart allocation, not equal spreading

The app must not automatically put small equal amounts into every fund. Sometimes the best decision is to put a larger amount into one urgent target.

Examples:

- Oil change tomorrow: allocate 3,000–6,500 ₽ to oil instead of 250 ₽ to many funds.
- Bankruptcy due today: allocation mode becomes critical/recovery.
- Working fund is 0 ₽: rebuild fuel/Drivee first before relocation or birthday goals.

## Real-time recalculation

Every new event must recalculate the recommendation:

- new order completed;
- income added;
- expense added;
- balance changed;
- task added;
- time passes;
- mini-goal added;
- fund edited.

The app must show:

```text
Plan gross: X
Done gross: Y
Remaining gross: X - Y
Realistic remaining forecast: A–B
Status: on track / risk / unrealistic
Recommended allocation now: ...
```

## Example: 15.06.26 current-day thinking

User plan excluding funds/goals:

- fuel: 2,000 ₽
- Drivee commission: percentage-based, around 13%
- food: 500 ₽
- meeting with girlfriend: 2,000 ₽
- products: 2,000 ₽
- bankruptcy remaining: 6,000 ₽

Non-commission needs = 12,500 ₽.

Gross target using Drivee 13%:

```text
gross * 0.87 = 12,500
gross ≈ 14,400 ₽
```

At 16:07 this target is likely unrealistic. The app must switch to Recovery/Emergency mode and recommend concrete cuts/postponements.

Example recommendation:

```text
Status: unrealistic today
Mode: Recovery / Emergency

Allocate first:
1. Bankruptcy: maximum possible
2. Fuel/Drivee: minimum needed to work today and tomorrow
3. Food: 500 ₽

Postpone/reduce:
- meeting fund: reduce or postpone
- products: reduce or postpone
- cushion/relocation/birthday: pause today

If extra money appears:
1. working fund
2. critical obligation
3. oil/car maintenance
```

## UI requirement

Dashboard must include a block like:

```text
🧠 Allocation Advisor

Mode: Recovery
Recommended distribution from current money / today's income:
- Fuel: ...
- Drivee: ...
- Food: ...
- Bankruptcy: ...
- Working fund: ...
- Meeting: ...
- Postpone: ...

Why: ...
```

## Acceptance criteria

- The app always recommends exact amounts, not only categories.
- The app recalculates after every order and money change.
- The app can say “this plan is unrealistic now”.
- The app suggests what to reduce/postpone.
- The app protects work continuity and critical obligations before flexible goals.
- The app explains the reason for the recommendation.
