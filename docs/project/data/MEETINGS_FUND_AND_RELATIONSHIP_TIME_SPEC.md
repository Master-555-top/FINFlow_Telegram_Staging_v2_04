# Meetings Fund & Relationship Time Spec

Version: v1.11  
Updated: 2026-06-15 04:22

## Status

This file corrects and strengthens the relationship/time requirement.

The average meeting frequency is **5 times per week**.

The earlier wording "2–3 days per week" is obsolete and must not be used as the default planning assumption.

## Purpose

FinFlow must treat relationship spending and time with the user's girlfriend as a recurring real-life system that affects:

- daily available work hours;
- daily gross target;
- expense planning;
- Meetings Fund balance;
- mini-goals;
- weekly planning;
- fatigue and time realism.

## Locked concept

The user should usually have approximately **2,000–3,000 ₽ available for meetings** as a practical relationship buffer.

This is not the same as:

- girlfriend birthday fund;
- girlfriend work base;
- gifts;
- emergency help;
- products/food mini-goals;
- ordinary personal food.

## Fund

`❤️ Meetings Fund`

Type: turnover / flexible relationship buffer  
Target: 2,000–3,000 ₽ available  
Default average frequency: **5 meetings per week**  
Purpose: dates, cafes, small shared expenses, ordinary relationship spending, joint rides/activities.

## Required fields

FinFlow must store and analyze:

- planned_meetings_per_week = 5 by default;
- actual_meetings_this_week;
- average_meeting_cost;
- average_meeting_duration;
- weekly_meetings_budget;
- upcoming_meeting_tasks;
- meeting_impact_on_work_hours;
- meeting_impact_on_daily_gross_target.

## Planning logic

Because meetings happen frequently, FinFlow must not treat relationship spending as rare.

It must calculate a recurring weekly buffer.

Example:

```text
Average meetings: 5 times/week
Recommended available buffer: 2,000–3,000 ₽
If meeting planned today:
- recommend exact amount to reserve;
- check if today's work window can support it;
- if day is weak, suggest reducing or moving spending, not ignoring the plan.
```

## Daily recommendation behavior

When meeting is planned today, FinFlow must show:

```text
❤️ Встречи

Фонд: 800 / 3 000 ₽
Частота: 5 раз в неделю
Сегодня встреча: да

Рекомендация:
заложить 1 500–2 000 ₽

Риск:
если не заложить, встреча ударит по рабочему фонду или банкротству.
```

## Smart allocation rule

FinFlow must not spread money blindly across every fund.

If meeting is today, it may recommend:

- 2,000–3,000 ₽ into Meetings Fund today,

instead of:

- 250 ₽ into many funds.

If Emergency/Recovery Mode is active, it may recommend:

- reduce meeting spending;
- use existing Meetings Fund only;
- postpone products/gifts;
- protect fuel, Drivee, bankruptcy, vehicle repair, and work fund first.

## Calendar integration

Meetings are also time blocks.

Each meeting must affect:

- available taxi work hours;
- realistic gross forecast;
- daily feasibility;
- fatigue/rest planning.

## AI behavior

When the user says:

- "сегодня встреча";
- "нужно девушке продукты";
- "мы будем вместе";
- "нужно 2 000 на встречу";

AI must decide whether it is:

- Meetings Fund;
- mini-goal;
- product support;
- gift;
- girlfriend work base;
- calendar event;
- or a combination.

Then it must recalculate:

- gross target;
- allocation;
- available work time;
- feasibility;
- recommendation by scenario.
