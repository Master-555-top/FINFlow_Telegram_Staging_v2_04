# v1.35 — Daily Analytics Summary

## Goal

Daily history should answer:

```text
Я становлюсь стабильнее или нет?
```

## Added

- `analyzeDailyHistory`
- average gross
- average clean shift income
- average free after plan
- average orders
- best clean day
- worst clean day
- target hit rate
- trend delta vs previous saved day
- Recovery/Emergency recommendation

## Important

This is analytics over saved local snapshots only.

It does not yet read Supabase or production history.
