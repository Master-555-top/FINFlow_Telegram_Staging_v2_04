# Assistant Chat Uses Fuel/Odometer Context — v1.73

## Purpose

After v1.72, FINFlow had a separate AI block for fuel/odometer advice.

v1.73 connects this context to the assistant chat answers.

## Chat now considers

- fuel by odometer;
- planned fuel;
- fuel delta vs plan;
- clean money with odometer fuel;
- free money with odometer fuel;
- latest cost per km;
- fuel assistant advice.

## Example questions

```text
Что с бензином?
Можно тратить?
Сколько ещё работать?
Нормально ли по чистым?
Почему свободных денег мало?
```

## Safety

Local rule-based logic only.

No OpenAI call.
No n8n call.
No Supabase write.
No external API.
