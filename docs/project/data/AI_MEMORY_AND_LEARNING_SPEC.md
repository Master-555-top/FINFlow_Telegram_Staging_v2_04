# AI MEMORY AND LEARNING SPEC

## Purpose
FinFlow must learn from history and not only calculate fixed templates.

## What to learn
- real fuel spending by day/km/gross income
- real Drivee commission patterns
- real gross/net by day and week
- best hours and zones
- order count and active time
- impact of sleep, late start, errands, fatigue
- recurring expenses
- relationship/meeting spending patterns
- car repair and oil usage patterns
- when user starts from zero and why

## AI outputs
- morning/day planner
- evening review
- weekly CEO review
- fund allocation recommendation
- car maintenance advice
- risk warnings
- learning/career balance recommendations

## AI source of truth
AI must read structured data from Supabase and project settings, not hallucinate. Imported historical data goes through review queue before becoming confirmed production data.
