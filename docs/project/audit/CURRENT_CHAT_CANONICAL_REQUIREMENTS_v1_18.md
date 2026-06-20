# Current Chat Canonical Requirements

Version: v1.18  
Updated: 2026-06-17 11:28

## Source

Derived from Source 01: `Вставленный текст(16).txt`.

## Product identity

FinFlow is a live personal operating system for:
- money;
- taxi work;
- time;
- vehicle;
- funds;
- goals;
- relationship/life planning;
- AI decisions.

## Core question

What should the user do today to:
- stop living from zero;
- close obligations;
- preserve the car;
- build safety cushion;
- help close people;
- move toward stronger life and future income?

## Must-have live dashboard

- Current date.
- Weekday.
- Current time.
- Time of day.
- Current period: day/week/month.
- Weather.
- Auto-refresh.
- Current money.
- Gross needed today.
- Net needed today.
- Work costs.
- Remaining realistic work window.
- AI recommendation.
- Error Log.

## Must-have statistics

Every core section must have period statistics:
- day;
- week;
- month;
- year.

Sections:
- income;
- expenses;
- shifts/work;
- funds;
- goals;
- car/vehicle;
- growth/capital later.

## Import pipeline

```text
Telegram expenses
Telegram shifts
Bank statement
Manual records
Screenshots/notes
Future app data
        ↓
raw_import
        ↓
normalization
        ↓
review queue
        ↓
production data
        ↓
statistics / AI / Dashboard
```

## Core calculations

### Gross needed today

```text
needed_gross_today =
work costs
+ obligations
+ funds
+ goals
+ mini-goals
+ food/personal
- money already available
```

If Drivee is percentage-based, solve gross with percentage formula.

### Real taxi profit

```text
gross income
- Drivee
- fuel
- oil/maintenance
- oil top-up
- repair reserve
- amortization
= real profit
```

### Available work time

```text
24 hours
- elapsed time
- sleep
- food
- tasks
- road
- rest
= work window
```

### Feasibility

```text
work window × average ₽/hour = realistic income
```

If target is higher than realistic income, use Recovery/Emergency Mode.

### Funds daily norm

```text
remaining amount ÷ remaining days = daily required amount
```

## Must-not-lose checklist

- Live time/date/day/time-of-day.
- Weather.
- Current money/free money/reserved money.
- Gross/net target today.
- Fuel, Drivee, oil, chassis, working fund.
- Meetings fund.
- Girlfriend work base.
- Bank/bankruptcy.
- Car payment.
- Safety cushion.
- Relocation.
- Girlfriend birthday.
- Mini-goals.
- Calendar and time realism.
- Shifts/orders/active time/idle time/zones.
- Statistics by period.
- Full editing/soft delete/history.
- Import Telegram/bank/manual.
- Export Excel/CSV/JSON/PDF.
- n8n AI and AI memory.
- Error Log.
- Security cleanup.
- Anti-regression.

## Implementation sequence confirmed by Source 01

1. Foundation / launch / no hydration errors / error log.
2. Daily Money Planner.
3. Manual input.
4. Persistence/Supabase.
5. Shifts/orders/KPI.
6. AI via n8n.

Current adjusted process:
Before continuing code, process source files one by one.
