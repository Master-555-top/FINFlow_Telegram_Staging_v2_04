# Claude Audit Sync v2.17.2

Date: 2026-06-21

## Input
- Current base: FINFlow v2.17 Live Sleep Session.
- Claude source: `FINFlow_v3_MASTER_PRIVATE_FULL_v2_17_1_Audited.zip` and deploy-safe sibling from uploaded `files.zip`.

## Diff summary
Claude changed only four app files compared with our latest v2.17:
- `CHANGELOG_LATEST.md`
- `src/lib/sleep/sleepModel.ts`
- `src/lib/day-core/dayCoreModel.ts`
- `src/components/dashboard/DashboardShell.tsx`

## Accepted fixes
- Sleep duration calculation now treats `fromDate`/`toDate` as night labels for manual entries and derives duration from clock times.
- Day Core version drift corrected and advanced to `v2.17.2`.
- Topbar subtitle simplified so Daily chrome does not duplicate version strings.

## Preserved locked behavior
- Sleep B+D status model without score points.
- `>10h` remains critical oversleep, red status.
- `6–8h` remains normal green.
- `8–10h` becomes recovery only when recent sleep debt allows it; otherwise it is long/control status.
- Live `Лёг` / `Встал` flow remains the main daily input mode.
- Manual editor remains secondary but fully available for old/forgotten/editable entries.
- Existing localStorage keys remain unchanged to preserve history.
- Deploy-safe package excludes private vault, private raw data, MASTER_PRIVATE_DOCS, node_modules, `.next`, and real env files.

## Manual duration verification
- 05:10 → 16:00 = 10ч50м
- 11:00 → 15:00 = 4ч
- 04:30 → 07:45 = 3ч15м
- 04:30 → 14:00 = 9ч30м
- 05:00 → 13:00 = 8ч
- 04:20 → 14:20 = 10ч

## Next work
Continue from this synchronized base. Next UI/product step can safely continue visual polish and richer morning work planner without reintroducing duration inflation.
