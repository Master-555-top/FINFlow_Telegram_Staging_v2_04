# FINFlow v2.18.1 — Sleep/System Stabilization + Safe Optimization

Date: 2026-06-21

## Base

Started from `v2.17.2 Claude Synced`, not from a fresh rewrite.

## Preserved locked decisions

- FINFlow remains a full personal operating ecosystem, not a simple finance tracker.
- Sleep system uses B + D logic without score points.
- Sleep longer than 10 hours is critical / overslept / red, not a positive status.
- Manual editor is secondary and exists for forgotten/old records.
- Main sleep flow is live `Лёг` → `Встал`.
- Storage keys remain `finflow_sleep_records_v2_17` and `finflow_sleep_live_session_v2_17` to protect existing local history.
- `private_vault`, `private_raw_data`, MASTER docs and secrets must not enter deploy-safe.
- Telegram/Supabase safe-off logic stays protected.

## Implemented

- Added `Статистика` view to Sleep.
- Added edit/delete actions for sleep history.
- Added calmer status badges and reduced active/pressed brightness jumps.
- Added wake decision cards: `Сейчас`, `+30м`, `+60м`, `+90м`.
- Added projected work time estimates after wake + one hour.
- Stabilized manual editor to preserve existing record id when editing.
- Updated visible project versions to v2.18.1.
- Removed one confirmed unused demo mock file: `src/lib/mock/finflowMock.ts`.
- Updated old visible staging/version strings that could confuse the user.

## Anti-regression checks

- Live sleep session preserved.
- Manual editor preserved.
- History preserved and now editable.
- Seed sleep calculation from Claude fix preserved.
- 10+ hour rule preserved.
- Recovery-after-debt rule preserved.
- Premium System UI preserved.
- Deploy-safe forbidden scan must pass before release.

## Next

v2.19 should connect Sleep → Day → Work → potential earnings and planned tasks.
