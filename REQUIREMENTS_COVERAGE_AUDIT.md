

## v1.23 coverage update
Covered in v1.23:
- Source 05 semantic review;
- extracted requirements;
- import candidates;
- conflicts and locked decisions;
- next implementation phases.

Not yet implemented:
- import review queue UI/model;
- actual historical import;
- allocation engine;
- AI planner implementation.


## v1.24 Coverage Update

Covered now:

- Source 05 review queue requirement: partially implemented in code and docs.
- Day Core as central input model: partially implemented in code and docs.
- Anti-blind-import rule: implemented as architecture and mock UI.
- Sensitive data protection: preserved; no real private raw data exposed in UI.

Still pending:

- Real approve/reject/edit/merge actions.
- Persistent database tables.
- Audit log integration for import actions.
- Real Day Core recalculation from confirmed input records.


## v1.26 — Persistent Review State + Supabase-ready Schema

- Added persistent browser-local review state for Import Review Queue.
- Added Supabase-ready SQL schema for import_review_queues, import_review_candidates and import_review_audit_events.
- Updated Import Review UI with persistence status and reset demo action.
- No raw private data is shown in UI.
- No real database connection or secrets were added.

## v1.27 coverage

- [x] Approved candidates can be previewed before Day Core application.
- [x] Sensitive/high-risk candidates are blocked.
- [x] Day Core patch model exists.
- [x] Apply history exists in demo UI.
- [x] Audit event created without sensitive source data.
- [x] No blind import into calculations.
