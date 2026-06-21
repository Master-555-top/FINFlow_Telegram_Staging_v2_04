# PROJECT MEMORY UPDATE — v2.26

User explicitly wants FINFlow to become a unified ecosystem where History → Date → Category → Editor → Analytics → Storage → Sync is one connected system.

Locked direction reinforced:
- No scattered independent copies of records.
- Storage is a live display/export layer, not a second database.
- Reset must be safe, previewed and undoable.
- Sleep is part of time/history/day/work/earnings logic, not an isolated note.
- Date input must support day.month.year and normalize to ISO.
- Bottom navigation must remain usable on Telegram/iPhone and not cover controls.

# PROJECT MEMORY UPDATE — v2.25

FINFlow optimization continues under anti-regression protocol. Do not rewrite the app from scratch.

Locked refactor approach:
- Split monoliths by stable responsibility boundaries.
- Keep existing UI behavior and storage keys during extraction.
- Run checks after every structural move.
- Remove only confirmed unused clutter.
- Do not move multiple high-risk systems at once.

v2.25 boundary decision:
- Record/template/bank actions are now in `useDailyQuickInputRecordActions`.
- Money/taxi/task/fund/obligation actions are now in `useDailyQuickInputDayActions`.
- Persistence/live-state remains in `useDailyQuickInputLiveState`.
- History/rollover/cloud/assistant/fuel-export remain for the next safe step.
