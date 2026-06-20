# Car Repair Fund Integration Into Assistant Chat Advice — v1.76

## Purpose

After v1.75, repair fund risk affected the allocation panel.

v1.76 connects repair fund allocation into the local assistant chat.

## Chat now considers

- repair fund target;
- current repair fund amount;
- remaining repair need;
- today suggested repair allocation;
- today actual repair allocation;
- protection gap;
- known repair risks.

## Example questions

```text
Можно тратить?
Куда распределить деньги?
Сколько оставить на машину?
Что с ремонтом?
Можно ли купить что-то или лучше в ремонт?
```

## Safety

Local rule-based logic only.

No OpenAI call.
No n8n call.
No Supabase write.
No external API.
