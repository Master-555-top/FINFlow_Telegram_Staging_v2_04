# FinFlow v3 — Real-Time Allocation Advisor Spec

Version: v1.6
Status: LOCKED REQUIREMENT / CORE MVP TARGET

## Purpose
FinFlow must not only calculate a total daily target. It must recommend **where exactly money should go right now**, with amounts, priorities, and realistic feasibility based on current time and current money.

The core question is:

> Given current time, current money, obligations, work costs, errands, human limits, and taxi earning capacity — what should I pay/fund first today, what should I postpone, and how much gross turnover do I realistically need?

## Why this exists
The user moved from abstract thinking:

- “I need 5,000–10,000 ₽ today”

To operational thinking:

- “Today I need 2,000 fuel, 1,500 Drivee, 500 food, 2,000 meeting, 2,000 products, 6,000 bankruptcy; what gross turnover is needed, and what is realistic at 16:07?”

This module is mandatory because FinFlow must be a live decision system, not a static tracker.

## Required inputs

### 1. Current context
- current date;
- current time;
- time of day: morning/day/evening/night;
- remaining realistic work window;
- sleep/rest/food requirements;
- calendar tasks/errands;
- physical daily cap.

### 2. Current money
- cash;
- card;
- Drivee balance;
- fund balances;
- reserved money;
- truly free money.

### 3. Taxi operating costs
Current baseline:
- Vehicle: Toyota Premio 2007, 1.8L;
- Fuel: AI-92, 75.51 ₽/liter;
- Fuel consumption: 11–13 L/100 km;
- Daily distance: 80–150 km;
- Drivee planning fee: about 13% of gross;
- usual Drivee top-up: 350 ₽, minimum payment 120 ₽;
- oil change overdue after 12,000+ km;
- desired oil interval: 5,000–6,000 km;
- oil change cost: 6,000–7,000 ₽;
- oil burn: about 1 liter/week;
- chassis/suspension repair goal: about 50,000 ₽.

### 4. Required daily items
Examples:
- fuel;
- Drivee;
- food;
- meeting fund;
- products;
- bankruptcy payment;
- working fund;
- oil;
- car repair;
- cushion;
- dynamic mini-goals.

## Correct gross calculation
If Drivee commission is percentage-based, it must not be simply added as a fixed line unless the user explicitly treats it as a fixed deposit requirement.

If non-commission needs are `N`, and Drivee rate is `r`, then:

```text
required_gross = N / (1 - r)
```

Example from 15.06.26:

```text
Fuel: 2,000
Food: 500
Meeting: 2,000
Products: 2,000
Bankruptcy remainder: 6,000
Non-commission needs: 12,500
Drivee planning rate: 13%
Required gross = 12,500 / 0.87 ≈ 14,368 ₽
Recommended displayed target: 14,400 ₽ gross
Estimated Drivee fee: ~1,870 ₽
```

If the user says “I need to top up Drivee 1,500 ₽ today”, the app should treat it as a **cashflow top-up need**, but still explain whether it is enough for the target gross.

## Real-time feasibility check
FinFlow must compare required gross with realistic earning capacity remaining today.

Example at 16:07:

```text
Required gross: ~14,400 ₽
Current time: 16:07
Remaining realistic work window: limited
Expected gross from now: about 5,000–9,000 ₽ depending on hours and density
Status: not realistic without overload
```

The app must not say “just work more”. It must recommend a recovery strategy.

## Recommendation output format
The app should show:

```text
Status: OK / Tight / Not realistic / Emergency

Recommended allocation now:
1. Critical item — amount — reason
2. Work capability item — amount — reason
3. Flexible item — amount/postpone — reason

What to postpone:
- item — reason

Gross target:
- minimum survival gross
- realistic target gross
- ideal gross

If income exceeds target:
- first extra 1,000–3,000 ₽ → working fund
- then car/oil/chassis depending on urgency
```

## Allocation modes

### Emergency Mode
Used when current time/money makes full plan impossible.
Priority:
1. keep ability to work today/tomorrow;
2. critical payment;
3. food;
4. minimum Drivee/fuel;
5. postpone flexible items.

### Recovery Mode
Used after big payment/oil/repair or when funds are 0.
Priority:
1. working fund;
2. critical obligations;
3. oil/vehicle safety;
4. small cushion;
5. then flexible goals.

### Smart Allocation Mode
Do not spread 250 ₽ across all funds by default. Sometimes better:
- 3,000–5,000 ₽ into urgent oil/repair/payment;
- then rebuild working fund;
- flexible funds pause temporarily.

### Normal Mode
When obligations and working fund are stable, distribute across:
- cushion;
- car repair;
- meeting fund;
- birthday;
- relocation;
- growth/capital.

## 15.06.26 live example
User-provided plan:
- fuel: 2,000;
- Drivee/commission/top-up expectation: 1,500;
- food: 500;
- meeting with girlfriend: 2,000;
- products: 2,000;
- bankruptcy remainder: 6,000;
- funds/goals not counted today.

Correct logic:
- non-commission needs: 12,500;
- required gross with 13% Drivee: ~14,400;
- at 16:07 this is probably unrealistic;
- FinFlow should switch to Emergency/Recovery Mode and recommend specific reductions/postponements.

Possible recommendation:

```text
At 16:07, full target ~14,400 ₽ gross is not realistic.
Recommended plan:
1. Bankruptcy remainder: target as much as possible, max priority.
2. Fuel/Drivee: only minimum needed to work today and tomorrow.
3. Food: keep 500 ₽.
4. Meeting/products: reduce or postpone; if unavoidable, set cap.
5. Any surplus above minimum → working fund first, not relocation/birthday today.
```

## UI requirements
Dashboard must show:
- required gross now;
- realistic gross from remaining day;
- difference/shortage;
- exact allocation recommendations;
- postpone list;
- recovery plan for next days.

## Data model suggestions
- daily_plan_items;
- allocation_recommendations;
- allocation_modes;
- current_balances;
- goal_allocations;
- work_cost_settings;
- day_feasibility_snapshots.

## Acceptance criteria
- The app never treats the day as infinite.
- The app never hides that a plan is unrealistic.
- The app shows exact amounts, not only general advice.
- The app distinguishes required gross from net/free money.
- Drivee percent is calculated correctly.
- Flexible goals can be postponed/reduced.
- The app learns from actual outcomes.

## v1.7 Addition — Account for orders already completed today

The allocation advisor must always use actual progress from the current day. It must never only show the original morning plan.

When the user enters each completed order, FinFlow must update:

- gross_done_today;
- estimated/actual Drivee fee;
- remaining gross target;
- realistic remaining work time;
- feasibility status;
- recommended allocation priority.

The advisor must answer: "given what has already happened today, what should I do next?"

Required example behavior:

```
Initial target: 14,400 ₽ gross
Already done: 4,000 ₽ gross
Remaining: 10,400 ₽ gross
Current time: 16:07
Realistic remaining forecast: 5,000–8,000 ₽ gross

AI decision:
The full plan is no longer realistic. Prioritize bankruptcy + work minimum. Reduce/postpone meeting/products. Do not allocate to long-term funds unless target is exceeded.
```
