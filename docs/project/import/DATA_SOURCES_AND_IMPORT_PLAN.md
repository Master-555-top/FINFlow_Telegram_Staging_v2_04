# DATA SOURCES AND IMPORT PLAN — FinFlow v3.0

## Purpose
FinFlow must learn from real historical data, not only from manual assumptions.

## Known data sources
1. Telegram history / pasted text files:
   - income;
   - taxi shifts;
   - orders;
   - expenses;
   - daily totals;
   - funds;
   - goals;
   - old AI analyses;
   - user strategy notes.

2. Bank PDF statements:
   - actual card expenses;
   - transfers;
   - Drivee payments;
   - fuel payments;
   - food/personal expenses;
   - merchant descriptions.

3. Manual current inputs:
   - current cash/card/Drivee balance;
   - current fund balances;
   - goals;
   - mini-goals;
   - errands/calendar tasks;
   - car condition updates.

4. Future app data:
   - income entries;
   - expense entries;
   - shift records;
   - orders;
   - fuel logs;
   - commission logs;
   - fund operations;
   - AI reports.

## Import architecture
Raw source data must not go directly into production tables.

Flow:
`raw_import` → `parse` → `normalize` → `review_queue` → `confirmed production tables`.

## Why review queue is required
A number such as `8500` may mean:
- target;
- income;
- example;
- expense;
- debt;
- comment.

AI/parser must provide confidence and allow user review before final import.

## Production categories to learn
- Work / fuel;
- Work / Drivee commission;
- Work / car maintenance;
- Food/products;
- Personal;
- Girlfriend / meetings;
- Girlfriend work base;
- Car payment;
- Bankruptcy/bank;
- Repair/chassis;
- Safety cushion;
- Relocation;
- Birthday/gifts;
- Entertainment;
- Health;
- Unknown/review.

## Import MVP priority
1. Manual current balances and current goals.
2. Manual daily income/expenses.
3. Historical Telegram expense templates.
4. Bank PDF import/reconciliation.
5. Taxi shift/order import.
6. AI learning from confirmed history.

## v1.13 imported project conversations

External/previous ChatGPT conversations are also data sources.

They are not financial production records, but they may contain:
- project decisions;
- specifications;
- mistakes;
- architecture;
- prompts;
- UX requirements;
- data templates;
- old implementation details.

Shared link registered:
https://chatgpt.com/share/6a2c2a25-1b00-83eb-932a-90dcd35cdd86

Status:
pending_full_extraction.
