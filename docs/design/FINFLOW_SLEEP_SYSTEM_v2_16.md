# FINFlow Sleep System v2.16

## Chosen logic
The user selected B + D: smart statuses plus work/day readiness. No score/points.

## Status rules
- `<4h`: red critical short sleep.
- `4–6h`: orange low sleep.
- `6–8h`: green norm.
- `8–10h`: cyan recovery only after recent sleep debt; otherwise yellow long sleep/control.
- `>10h`: red overslept/schedule failure.

## Adaptive work rules
When a shift is marked closed and shift end time is entered, the system suggests sleep/wake timing. Work recommendation changes according to sleep status:
- Critical/low: safe rest or light shift.
- Normal: normal shift.
- Recovery: medium shift, not max.
- Overslept: soft reset day.

## Persistence
Sleep history is stored locally under `finflow_sleep_records_v2_16`. This is designed to be cloud-syncable later but v2.16 does not enable cloud writes.
