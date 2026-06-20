# Master Requirements Index

Version: v1.11  
Updated: 2026-06-15 04:22

## Purpose

Single high-level index of what must exist in final FinFlow.

## Core identity

- FinFlow OS, not a simple expense tracker.
- Personal AI dispatcher for money, time, taxi, car, funds, goals, and growth.
- Daily question: what should I do today, how much gross do I need, where should money go, and what is realistic?

## Required modules

1. Live Dashboard
2. Daily Money Planner
3. Real Current Balance
4. Gross Target Calculator
5. Money Allocation Recommendation Engine
6. Money Core: income/expenses/statistics
7. Taxi/Work Core: shifts/orders/KPI/zones/progress
8. Taxi Cost Model
9. Vehicle/Car Assistant
10. Funds/Stability Core
11. Dynamic Goals/Mini Goals
12. Meetings Fund
13. Calendar/Time Planner
14. 24-Hour Realism Engine
15. AI Core via n8n
16. Import Center
17. Export/Backup Center
18. Error Log
19. AI Memory/Learning
20. Security/Private Data Rules
21. Anti-Regression Development Protocol

## Important fixed values and defaults

- Taxi day gross target baseline: 11,000 ₽.
- Taxi day net target baseline: 8,500 ₽.
- Weekly net target baseline: 59,500 ₽.
- Monthly target baseline: 212,500 ₽.
- Drivee planning commission: ~13%.
- Vehicle: Toyota Premio 2007, 1.8L, AI-92.
- Fuel price: 75.51 ₽/liter.
- Fuel consumption: 11–13 L/100 km.
- Daily driving: 80–150 km.
- Oil is overdue after 12,000+ km; desired interval 5,000–6,000 km.
- Oil change cost: ~6,000–7,000 ₽.
- Car burns oil: ~1 liter/week.
- Chassis/suspension repair goal: ~50,000 ₽.
- Meetings Fund: keep ~2,000–3,000 ₽ available.
- Average meetings with girlfriend: 5 times/week.
- Realistic daily net upper planning cap: ~10,000 ₽.

## Funds

- Working fund
- Meetings fund
- Girlfriend work base
- Car payment/obligation
- Bankruptcy/bank payment
- Personal/living
- Girlfriend birthday
- Flight/relocation
- Safety cushion
- Car repair/chassis
- Mini-goals/gifts/products

## Rules

- Week is more important than a single day.
- Not every fund gets money every day.
- Smart allocation beats equal distribution.
- Protect working fund and vehicle before flexible goals.
- Current time and remaining work window always matter.
- App updates live after each income/expense/order.
- Old data must be normalized and reviewed, not ignored.
- Files/docs must be updated continuously.
- Code/docs are changed incrementally, not rewritten each time.

## Response/process requirements

- Important answers must include integrity check.
- Assistant must explicitly state whether anything was deleted/lost/changed.
- New requirements are integrated into current system, not used to rewrite everything.
- Project files must be used as source of truth.
