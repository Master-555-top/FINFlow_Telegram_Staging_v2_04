# v1.37 — Daily Goal Allocation

## Goal

After calculating clean shift income, FinFlow should tell the user how to distribute money.

## Added

- `src/lib/day-core/dailyAllocationModel.ts`
- allocation buckets
- critical-first strategy
- mode: normal / recovery / emergency
- allocation summary:
  - available to allocate
  - allocated
  - shortage
  - unallocated
- UI allocation panel

## Product rule

Source data is editable. Allocation is derived.

Editable:
- obligations
- funds
- tasks
- goals
- work/taxi values

Derived:
- available to allocate
- recommended distribution
- shortage
- strategy
- mode

## Safety

Allocation does not move real money. It is a planning recommendation.
