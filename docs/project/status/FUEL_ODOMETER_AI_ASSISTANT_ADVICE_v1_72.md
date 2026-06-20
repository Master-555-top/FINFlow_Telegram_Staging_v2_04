# Fuel/Odometer Integration Into AI Assistant Advice — v1.72

## Purpose

After v1.71 connected odometer-derived fuel cost to daily net calculation, v1.72 connects that information to the built-in AI assistant.

## Added advice logic

The local assistant now considers:

```text
fuel above plan
clean target at risk because of fuel
expensive ₽/km
no free money after odometer fuel
missing fuel history
```

## Modes

```text
fuel_ok
fuel_watch
fuel_warning
fuel_no_history
```

## Important

This is still local rule-based AI advice.

No external AI call is made.
No OpenAI/n8n request is sent.
No Supabase write is made.
