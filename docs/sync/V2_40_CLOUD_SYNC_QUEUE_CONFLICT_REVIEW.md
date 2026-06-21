# V2.40 Anti-regression — Cloud Sync Queue + Conflict Review

## Checked decisions

- No global visual redesign.
- No global History tab.
- Sleep remains Обзор / История / Редактор.
- Sleep storage keys are untouched.
- Cloud writes remain safe-off unless server flags are explicitly enabled.
- Conflict review is manual, not automatic.
- Queue state stores compact preview metadata only.
- Deploy-safe must not include private_vault, private_raw_data, MASTER_PRIVATE_DOCS, .env, node_modules or .next.

## New regression risks

- Cloud queue should never block local app usage if localStorage is unavailable.
- Conflict cards should not expose secrets or raw private data.
- Save/load/apply should continue to work if queue storage fails.
- v2.40 staging migration only expands queue action vocabulary; it must not enable production writes.

## Manual checks for real Telegram staging

1. Launch from Telegram Mini App.
2. Create local backup.
3. Load cloud preview for a day.
4. Apply cloud preview and verify rollback snapshot.
5. Save day with known revision.
6. Force expectedRevision conflict and verify conflict card appears.
7. Resolve/dismiss conflict card manually.
