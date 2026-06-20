# v1.25 Implementation Notes

## Added

- `src/lib/import-review/importReviewActions.ts`
- interactive candidate review actions inside `ImportReviewQueuePanel`
- editable fields for selected candidate
- audit log preview for actions
- apply-state indicator showing whether candidate can affect Day Core

## Changed

- `package.json` version updated to `0.1.25`
- `app/globals.css` extended with action-layer UI styles

## Preserved

- Day Core model
- v2.0 UI Safe visual direction
- Import Review Queue v1.24 model
- private raw data boundaries
- existing documents and source reports

## Not implemented yet

- persistent database storage;
- Supabase schema and RLS;
- real import parser UI;
- applying approved candidates to actual day records;
- real duplicate detection algorithm;
- user authentication.

Those should be implemented after the action model is stable.
