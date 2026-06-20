# Assistant Chat Uses Car Maintenance Context — v1.74

## Purpose

After v1.73, assistant chat used fuel/odometer context.

v1.74 connects car maintenance context to assistant chat answers.

## Chat now considers

- Toyota Premio 2007 context;
- last service date;
- odometer after service;
- current known odometer;
- km since oil/spark/filter service;
- reminder odometer;
- planned oil change odometer;
- repair fund target;
- known repair needs.

## Example questions

```text
Что с машиной?
Когда масло менять?
Что с пробегом?
Что по ремонту?
Что с подвеской?
Можно ли тратить или лучше в ремонт?
```

## Safety

Local rule-based logic only.

No external AI call.
No Supabase write.
No network request.
