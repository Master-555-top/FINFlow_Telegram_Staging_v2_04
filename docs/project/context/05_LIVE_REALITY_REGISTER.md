# 05 — Live Reality Register

This file distinguishes live/real, local/demo and not-yet-implemented parts.

## Real/current in code

- Next.js app builds successfully.
- Day Core model exists.
- Quick Daily Input exists.
- Net calculation exists.
- Clean shift income formula exists.
- Local daily history exists.
- Snapshot detail/restore exists.
- Daily analytics over local snapshots exists.
- Editable daily source data exists.
- Editable funds and obligations exist.
- Daily allocation recommendation exists.

## Local/demo, not production-live

- Current day data is local browser state.
- History is localStorage.
- Snapshots are localStorage.
- Funds/obligations edited in UI are local current-day model values.
- Analytics is based on saved local snapshots only.
- Demo/mock data may still initialize the day.

## Not yet production-live

- Supabase persistent database.
- Telegram Mini App auth.
- Real user account ownership.
- Real multi-day backend history.
- Real import-to-database flow.
- n8n AI agent.
- Production weather/time integrations.
- Real bank transaction classification in UI.
- Real CSV/Excel/PDF export UI.
- Full income/expense/order record list.

## Data reality rule

Do not tell the user that demo/local data is real production data.

## Security status

- private raw data is not displayed.
- secrets are not intentionally included.
- `.env` and raw private archives must not be uploaded publicly.

## v1.40 context reality status

Context system is now real project documentation.

Still not automatic:
- the app does not automatically capture future ChatGPT messages by itself;
- the assistant must explicitly update context files during each packaged development step;
- raw full private transcript is not copied into public docs.

Real:
- Source 01 raw chat text is present in private_raw_data.
- Source 05 7z archive is present in private_raw_data.
- Prior Source 05 extraction/semantic reports are present.
- Context operating protocol now exists.

## v1.41 live/demo status update

Real in local UI:
- editable records for taxi orders, fuel, expenses and income;
- enabled/disabled records;
- daily totals derived from records.

Still local/demo:
- records are browser-local state;
- no Supabase persistence yet;
- no Telegram user ownership yet;
- other income is tracked but not yet fully integrated into financial allocation logic.

## v1.42 live/demo status update

Real in local UI:
- record templates;
- record filters;
- category labels;
- quick creation of common taxi/expense records.

Still local/demo:
- records and filters are browser-local;
- no Supabase persistence yet.

## v1.43 live/demo status update

Real in local UI:
- custom record templates can be created/edited/deleted locally.

Bank file:
- extracted to candidates;
- redacted candidate CSV exists;
- not imported as final truth;
- no production bank-review UI yet.

## v1.44 live/demo status update

Real in local UI:
- bank candidate preview panel;
- approve redacted candidate into editable records;
- reject/postpone local decision.

Still local/demo:
- only sample redacted candidates are embedded;
- no full paginated bank review UI yet;
- no Supabase persistence;
- no production import pipeline.

## v1.45 live/demo status update

Real in local UI:
- bank candidate filters;
- bank candidate pagination;
- larger redacted preview sample;
- review decisions still local.

Still local/demo:
- full 2766 candidate backend pagination not implemented;
- no Supabase persistence;
- no production import pipeline.

## v1.46 context reality update

Real in project docs:
- dedicated full chat transcript ledger exists;
- transcript ledger update protocol exists;
- first available user text from SOURCE_01 is recorded.

Still not automatic:
- the app cannot automatically capture future ChatGPT messages by itself;
- assistant must update the ledger during each packaged development step.

## v1.47 live/demo status update

Real in local UI:
- Drivee top-up is now its own record type.
- UI explains commission vs top-up.

Still local/demo:
- no production Drivee balance ledger;
- no Supabase persistence.

## v1.48 live/demo status update

Real in project:
- Supabase schema draft exists.
- RLS draft policies exist.

Still not live:
- schema has not been applied to a real Supabase project by this package;
- frontend is not connected to Supabase;
- Telegram auth bridge is not implemented.

## v1.49 live/demo status update

Real in project:
- Supabase integration plan exists.
- Persistence adapter contracts exist.

Still not live:
- no real Supabase client connection;
- no Telegram auth verification route;
- no cloud persistence.

## v1.50 live/demo status update

Real in code:
- Telegram initData verification helper exists.
- `/api/telegram/verify` route draft exists.

Still not live:
- no bot token is configured in package;
- no real Telegram request tested here;
- no Supabase profile resolver yet.

## v1.51 live/demo status update

Real in code:
- Telegram verify route now builds safe draft FINFlow profile context.

Still not live:
- no Supabase profile lookup;
- no profile creation in DB;
- no production session.

## v1.52 live/demo status update

Real in code:
- server-only Supabase profile resolver draft exists;
- Telegram verify route returns safe Supabase profile plan/status.

Still not live:
- no Supabase client package;
- no Supabase write;
- no production profile creation.

## v1.53 live/demo status update

Real in project:
- deployment checklist exists;
- environment documentation exists;
- `.env.example` exists with placeholders only.

Still not live:
- no real Supabase connection;
- no real env values;
- no DB writes.

## v1.54 live/demo status update

Real in code:
- Supabase readiness guard exists.
- `/api/supabase/readiness` route exists.

Still not live:
- no Supabase dependency;
- no Supabase client;
- no DB writes.

## v1.54 live/demo status update

Real in code:
- Supabase package is added.
- Server-only wrapper exists.
- Telegram verify route returns safe server readiness status.

Still not live:
- no Supabase writes;
- no profile creation;
- no record sync.

## v1.60 live reality update

Car/taxi context is synced as project reality:
- Toyota Premio 2007, 1.8L, AI-92 75.51 ₽/liter, 11–13 L/100 km, 80–150 km/day.
- Drivee about 13%.
- Maintenance/oil/suspension risks are real planning constraints.

Bank status:
- 2,766 candidates from T-Bank statement, all need review.

## v1.61 live reality update — car service

16.06.2026:
- oil changed;
- spark plugs changed;
- oil filter changed;
- air filter changed;
- odometer: 280,041 km.

18.06.2026:
- odometer: 280,420 km;
- 379 km driven since service;
- short-period average: ~189.5 km/day.

Next reminder: 285,041 km.
Next planned oil change: 287,041 km.

## v1.63 synchronization status

The project has been re-centered around:
- taxi/day planning;
- car/fuel/maintenance;
- bank review candidates;
- local AI assistant;
- Telegram/Supabase security;
- full turn ledger and interruption recovery.

## v1.65 live reality update — fuel budget

Fresh average after 16.06.2026 service:
- 379 km over 2 days;
- ~189.5 km/day.

At 75.51 ₽/liter:
- 11 L/100 km → ~1,574 ₽/day;
- 12 L/100 km → ~1,717 ₽/day;
- 13 L/100 km → ~1,860 ₽/day.

Recommended temporary working fuel reserve: ~1,900 ₽/day.
