# TAXI / VEHICLE COST MODEL

## Vehicle profile
- Toyota Premio 2007
- Engine volume: 1.8L
- Fuel: AI-92 gasoline
- Fuel price: 75.51 ₽/liter
- Average consumption: 11–13 L/100 km
- Typical daily distance: 80–150 km

## Fuel planning
Estimated fuel range:
- Low day: about 700–1,000 ₽
- Normal day: about 1,200–1,600 ₽
- Heavy day: about 1,800 ₽+

## Drivee commission
User examples:
- 300 ₽ order -> 31.45 ₽ Drivee + 6.90 ₽ VAT = 38.35 ₽ ≈ 12.8%
- 700 ₽ order -> 73.45 ₽ + 16.15 ₽ = 89.60 ₽ ≈ 12.8%
- 1,800 ₽ order -> 188.80 ₽ + 41.55 ₽ = 230.35 ₽ ≈ 12.8%

Planning rule:
- Use 13% of gross orders as Drivee total fee until more precise model exists.
- User often tops up 350 ₽ when balance runs out; minimum payment 120 ₽.
- For 11,000–13,000 ₽ gross days, recommended Drivee planning reserve is roughly 1,500–2,000 ₽.

## Maintenance
- Oil change overdue after 12,000+ km.
- Future oil change interval target: 5,000–6,000 km.
- Current cheap oil change cost: 6,000–7,000 ₽.
- Car burns oil heavily: about 1 liter/week.
- Suspension/chassis is in poor condition: stabilizer links, front brake pads, rear struts, possibly ball joints, alignment, and ideally summer tires.

## Daily real cost formula
Gross income - Drivee - fuel - oil reserve - oil top-up reserve - repair/chassis reserve - depreciation = real taxi profit.

## App requirement
FinFlow must calculate gross target, not only net target. It must show working costs, hidden car costs, and what really remains after protecting the car as the income engine.
