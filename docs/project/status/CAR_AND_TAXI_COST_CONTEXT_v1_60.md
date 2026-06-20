# Car and Taxi Cost Context — v1.60

## Locked car parameters

```text
Toyota Premio 2007
1.8L
AI-92
75.51 ₽/liter
11–13 L/100 km
80–150 km/day
Drivee approx 12.8–13%
```

## Maintenance context

```text
Oil overdue after 12,000+ km
Desired oil interval: 5,000–6,000 km
Cheap oil change: 6,000–7,000 ₽
Oil burn: ~1 liter/week
Suspension/chassis poor
Repair goal: ~50,000 ₽
```

## Known repair needs

- stabilizer links;
- front brake pads;
- rear struts;
- possibly ball joints;
- alignment;
- ideally summer tires.

## Locked formula

```text
Чистые со смены = грязный оборот − Drivee/комиссия − бензин
```

## Separate formula

```text
Свободно после плана = чистые со смены − еда − встреча − обязательства − задачи/фонды
```

## Product implication

FINFlow must not model taxi as just income.

It must model:
- gross turnover;
- Drivee commission;
- Drivee top-up/cashflow;
- fuel;
- oil reserve;
- maintenance reserve;
- repair fund;
- fatigue/time limits;
- realistic daily cap.

## v1.61 update — confirmed service event

```text
16.06.2026 — oil, spark plugs, oil filter and air filter changed.
Odometer after service: 280,041 km.
18.06.2026 current odometer: 280,420 km.
Distance since service: 379 km.
Oil change plan: every 7,000 km.
Reminder: every 5,000 km.
Next reminder: 285,041 km.
Next planned change: 287,041 km.
```
