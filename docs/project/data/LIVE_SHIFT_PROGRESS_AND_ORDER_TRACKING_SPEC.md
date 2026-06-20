# LIVE SHIFT PROGRESS & ORDER TRACKING SPEC

Version: v1.7
Date: 2026-06-15
Status: LOCKED REQUIREMENT / MUST IMPLEMENT

## 1. Core idea

FinFlow must not plan the day only once at the beginning. It must constantly account for what has already happened today: completed orders, gross turnover already earned, Drivee commission already spent, fuel already purchased, current cash/card/Drivee balance, and remaining available time.

The daily plan is a live-progress system:

```
initial_day_plan
+ actual_orders_completed
+ actual_income_received
+ actual_expenses_paid
+ current_time
= updated_recommendation_now
```

## 2. Why this exists

The user thinks in gross daily taxi turnover ("грязными") and needs practical decisions during the shift. If at 09:00 the plan is 14,400 ₽ gross, but by 16:07 only 3,000 ₽ has been made, FinFlow must not keep showing the morning plan as if nothing changed. It must recalculate:

- how much gross is already done;
- how much is still needed;
- how much time is left;
- whether the remaining target is realistic;
- which goals/payments must be reduced, postponed, or prioritized;
- where the next money should go.

## 3. Required tracked fields for today

### Shift progress

- shift_start_time
- current_time
- planned_finish_time
- actual_finish_time
- gross_target_today
- gross_done_today
- gross_remaining_today
- order_count_today
- active_minutes_today
- idle_minutes_today
- average_gross_per_hour
- average_gross_per_active_hour
- realistic_remaining_work_window
- projected_gross_by_finish

### Order fields

Each order must support:

- order_time_start
- order_time_end
- amount_gross
- estimated_drivee_fee
- actual_drivee_fee if known
- duration_minutes
- from_location
- to_location
- zone/district/point if known
- notes

### Work cost progress

- fuel_planned_today
- fuel_paid_today
- fuel_remaining_needed
- drivee_fee_planned_today
- drivee_fee_paid_today
- drivee_balance_current
- work_fund_current
- maintenance_reserve_today

### Allocation progress

- required_today_total
- paid_today_total
- remaining_required_today
- bankruptcy_paid_today / remaining
- food_paid_today / remaining
- meeting_paid_today / remaining
- products_paid_today / remaining
- mini_goals_paid_today / remaining
- working_fund_added_today

## 4. Live formulas

### Gross remaining

```
gross_remaining_today = gross_target_today - gross_done_today
```

### Realistic gross projection

```
projected_gross_by_finish = gross_done_today + (remaining_real_work_hours × current_or_typical_gross_per_hour)
```

### Status

```
if projected_gross_by_finish >= gross_target_today:
    status = on_track
elif projected_gross_by_finish >= minimum_survival_target:
    status = recovery_possible
else:
    status = impossible_today
```

### Drivee fee

If actual commission is not manually entered, default planning formula:

```
drivee_fee_estimated = gross_done_today × 0.13
```

The app must also allow actual Drivee payments/top-ups to be entered separately, because the user often tops up 350 ₽ and Drivee balance can differ from theoretical fee.

## 5. Real-time AI behavior

FinFlow AI must update recommendations when the user adds an order or expense.

Example:

```
Plan: 14,400 ₽ gross
Done by 16:07: 3,200 ₽ gross
Remaining: 11,200 ₽ gross
Realistic by 22:30: 6,000–8,000 ₽ gross
Status: impossible_today

Recommendation:
1. Focus on bankruptcy payment first.
2. Keep minimum fuel/Drivee for work.
3. Reduce or postpone meeting/products.
4. No fund allocations today unless gross exceeds recovery threshold.
```

## 6. Dashboard block

The Dashboard must include:

```
🚕 Today Progress
Done: 3,200 / 14,400 ₽ gross
Remaining: 11,200 ₽
Orders: 5
Avg: 900 ₽/h
Realistic by finish: 7,500 ₽
Status: not enough time

AI:
Switch to Recovery Mode.
```

## 7. Anti-regression requirement

Adding order tracking must not break:

- live time widget;
- Daily Money Planner;
- Real-Time Allocation Advisor;
- current balance logic;
- funds model;
- export/import model;
- error log.

Any code implementation must be local and incremental.
