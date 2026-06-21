# FINFlow Sleep Live Session v2.17

## Decision
Sleep has two entry modes:

1. **Main live mode** — user presses `Лёг` before sleep and `Встал` after waking up. FINFlow records time automatically.
2. **Manual editor** — used for old data, missed days, corrections and full manual edits.

## Rules
- No score/points.
- Statuses are color-driven: critical short, low, normal, recovery, long, overslept.
- 10+ hours is always a red oversleep / regime failure state.
- 8–10 hours is recovery only when recent debt exists.
- Sleep recommendations adapt to active work/taxi context and expected remaining day window.

## Storage
- `finflow_sleep_records_v2_17`
- `finflow_sleep_live_session_v2_17`

## Next
v2.18 should connect wake decisions to Day planning, tasks and realistic taxi income windows.
