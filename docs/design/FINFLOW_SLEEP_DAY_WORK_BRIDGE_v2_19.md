# FINFlow v2.19 — Sleep → Day → Work Bridge

Date: 2026-06-21

## Purpose

Turn morning sleep decisions into a real day picture:
- whether to get up now or sleep more;
- when work can start;
- how much active day remains;
- how many taxi work hours are realistic;
- potential gross turnover;
- what planned tasks can fit;
- what plan is safe based on sleep status.

## Rules

No point scores are used. The system remains status-based:
- critical short sleep: safety first;
- low sleep: light/medium day;
- normal 6–8h: normal plan;
- recovery: medium plan;
- long sleep: soft/reset plan;
- 10h+ oversleep: red critical reset.

## Implementation

New model:
- `src/lib/day-core/morningPlanModel.ts`

Updated UI:
- `src/components/sleep/SleepDashboard.tsx`
- `app/globals.css`

The UI now shows a `День после подъёма` card inside `Сон → Сейчас`, with:
- start time;
- recommended work hours;
- potential gross turnover;
- option cards for `Сейчас`, `+30м`, `+60м`, `+90м`;
- task fit chips.

## Anti-regression

- Existing live sleep session flow remains.
- Manual editor remains.
- History edit/delete/statistics remain.
- v2.17.2 duration fix remains.
- Storage keys remain stable.

## Next

v2.20 should start rolling the unified design system into the main `День` tab, using Claude's imported design contract.
