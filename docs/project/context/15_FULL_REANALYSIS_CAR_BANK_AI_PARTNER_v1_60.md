# v1.60 — Full Reanalysis: Car Costs, Bank Statement, AI Partner Memory Sync

## Purpose

User explicitly asked to re-check:
- car characteristics and operating costs;
- bank statement status;
- user's understanding of the assistant as a long-term AI partner;
- cross-dialogue continuity;
- full correspondence/project memory discipline.

## 1. Car and taxi operating-cost context

Locked current car context:

```text
Toyota Premio 2007
Engine: 1.8L
Fuel: AI-92
Fuel price: 75.51 ₽/liter
Average fuel consumption: 11–13 L/100 km
Typical daily distance: 80–150 km
Drivee total commission/top-up planning: approximately 12.8–13%
Oil is overdue after 12,000+ km
Desired oil interval: 5,000–6,000 km
Cheap oil change: approximately 6,000–7,000 ₽
Heavy oil burn: about 1 liter/week
Suspension/chassis condition: poor
Known repair needs: stabilizer links, front brake pads, rear struts, possibly ball joints, alignment, ideally summer tires
Repair fund target: approximately 50,000 ₽
```

## 2. Taxi money formula

Locked formula:

```text
Чистые со смены = грязный оборот − Drivee/комиссия − бензин
```

Important distinction:

```text
Свободно после плана = чистые со смены − еда − встреча − обязательства − задачи/фонды
```

Drivee must stay separated:

```text
Drivee commission ≠ Drivee balance top-up
```

## 3. Bank statement status

Source 03 bank statement has been processed as review candidates, not final accounting.

Current known status:

```text
Source: T-Bank statement
Period: 01.12.2025–06.06.2026
Pages: 105
Candidate operations extracted: 2,766
Expense candidates: 1,631
Income/replenishment candidates: 1,135
All candidates status: needs_review
```

Important accounting rule:

```text
Пополнения/internal transfers must not be blindly counted as income.
Bank rows are candidates only until manually reviewed.
```

Current safe pipeline:

```text
bank PDF → redacted candidates → manual review → confirmed records/funds/expenses/income → analytics
```

## 4. User's AI-partner expectation

User does not want a one-off code helper.

Locked interpretation:

```text
Assistant should act as long-term AI partner / system architect.
Assistant should connect money, work, learning, projects, habits, relationships, health, car and long-term life goals.
Assistant should preserve context across old/new/current dialogues.
Assistant should enforce anti-regression and security-first protocols without the user reminding it.
```

## 5. Cross-dialogue continuity

Current FINFlow must remain connected with:
- taxi reality;
- car maintenance reality;
- bank statement review;
- learning/skill growth;
- transition away from taxi long-term;
- project security/IP protection;
- AI assistant as decision system, not generic chatbot.

## 6. Action impact for future development

Future packages must not treat FINFlow as a generic finance app.

FINFlow is:

```text
personal taxi + money + car + daily planning + AI decision system
```

Next implementation priorities should reflect this:
1. car cost model;
2. real daily cost recalculation;
3. bank candidates review flow;
4. daily assistant advice;
5. Supabase safe persistence;
6. Telegram production testing.
