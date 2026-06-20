# Daily Decision Summary Into Assistant Chat — v1.82

## Purpose

After v1.78, FINFlow had a unified daily decision summary block.
After v1.81, production-readiness checklist existed.

v1.82 connects the unified daily decision summary into the local assistant chat.

## Chat now answers through

- work decision;
- fuel decision;
- car decision;
- allocation decision;
- spending decision;
- daily mode: normal / recovery / emergency;
- primary action.

## Example user questions

```text
Что делать сейчас?
Можно тратить?
Сколько ещё работать?
Что с бензином?
Что с машиной?
Куда распределить деньги?
Какой итог дня?
```

## Local-first note

This is still local rule-based logic. No external AI call is added.
