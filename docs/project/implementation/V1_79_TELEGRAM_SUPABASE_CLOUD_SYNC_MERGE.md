# v1.79 — Telegram + Supabase Cloud Day Sync Merge

## Added / merged

- `src/components/cloud/CloudDaySyncPanel.tsx`
- `src/lib/cloud/finflowCloudDayDocument.ts`
- `src/lib/server/finflowCloudDayRepository.ts`
- `src/lib/server/finflowProfileRepository.ts`
- `src/lib/server/telegramRequestAuth.ts`
- `app/api/sync/day/route.ts`
- updated `app/api/telegram/verify/route.ts`
- updated Telegram initData validation
- updated Supabase server client status for cloud sync flag
- `supabase/migration_v1_73_telegram_cloud_day.sql`
- cloud sync env template values
- Codex handoff/privacy/implementation docs preserved under `docs/project/codex/`

## UI integration

`DailyQuickInputPanel` now creates a versioned cloud day document from:
- day input;
- records;
- custom templates;
- bank review decisions;
- editable fuel input;
- fuel/odometer history.

Cloud loading is preview-first and only applies after user confirmation.
