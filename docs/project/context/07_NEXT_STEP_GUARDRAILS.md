# 07 — Next Step Guardrails

Before continuing development, check:

## Always preserve

- clean shift formula
- free after plan formula
- editable source data rule
- derived analytics rule
- private_raw_data isolation
- daily history and restore
- allocation
- funds/obligations editing

## Do not break

- Quick Daily Input
- Net Calculation Panel
- Import Review Queue
- patch rollback layer
- local history
- build process

## Next likely feature

v1.40 or next:
- Editable Income/Expense Records List
- separate records for orders, fuel, expenses, other income
- edit/delete each record
- totals derived from record list
- preserve manual override option

## Later

- Supabase schema
- Telegram Mini App auth
- production persistence
- export/import UI
- AI recommendation layer

## v1.40 added guardrail

Before implementing the next feature, perform a memory preflight:
- read context ledger;
- read latest chat chronicle entries;
- check live/demo register;
- check next-step guardrails;
- check protocols;
- then implement.

After implementation:
- update context files before packaging.

## v1.41 guardrail update

Record-level source data now exists.

Protect:
- records as source data;
- totals derived from enabled records;
- clean shift formula;
- final analytics derived only.

Next likely step:
- add record categories/templates and quick filters;
- then prepare Supabase schema for records.

## v1.42 guardrail update

Record templates and filters exist.

Protect:
- record list as source data;
- enabled/disabled filtering;
- derived totals;
- clean shift formula.

Next likely step:
- add record category settings / custom templates;
- or start Supabase schema for daily records.

## v1.43 guardrail update

Protect distinction:
- records = facts of the day;
- funds = planning/allocation buckets;
- bank candidates = review items, not final data.

Next likely step:
- connect bank candidate review to record creation;
- or improve Drivee commission vs top-up model.

## v1.44 guardrail update

Protect:
- bank candidates are not final truth;
- only approved candidates become records;
- raw bank files stay private;
- records remain editable source data.

Next likely step:
- full bank candidate pagination/search/filter;
- or Drivee commission/top-up separation.

## v1.45 guardrail update

Protect:
- bank candidates remain review-only;
- approved candidates become editable records;
- filters must not imply automatic correctness.

Next likely step:
- Drivee commission vs Drivee top-up separation;
- or Supabase schema for records/bank review decisions.

## v1.46 guardrail update

Before packaging any future version:
- update `13_FULL_CHAT_TRANSCRIPT_LEDGER.md`;
- update context files;
- update changelog/current state/project memory;
- do not claim reconstructed text is exact.

## v1.47 guardrail update

Protect:
- Drivee commission and Drivee top-up must remain separate.
- Clean shift formula must not double-count Drivee.
- Bank work_platform_commission candidates need review before becoming records.

Next likely step:
- Supabase schema for daily records/bank review decisions;
- or Drivee balance ledger.

## v1.48 guardrail update

Before connecting Supabase:
- validate Telegram/Supabase auth strategy;
- never expose service_role key;
- decide migration flow;
- keep local demo fallback until production persistence is confirmed.

Next likely step:
- Supabase client/server integration plan;
- Telegram initData verification architecture.

## v1.49 guardrail update

Before real Supabase connection:
- implement Telegram initData verification architecture;
- test RLS;
- avoid service_role in frontend;
- keep local fallback.

Next likely step:
- Telegram initData verification server route draft;
- or Supabase adapter implementation behind feature flag.

## v1.50 guardrail update

Before production:
- test Telegram initData verification with real Telegram WebApp initData.
- do not expose TELEGRAM_BOT_TOKEN.
- add profile resolver only server-side.
- keep local fallback until persistence is tested.

Next likely step:
- FINFlow profile resolver for Telegram user.

## v1.51 guardrail update

Before production:
- implement server-only Supabase profile resolver;
- test RLS and environment;
- do not expose service_role key;
- keep local fallback.

Next likely step:
- server-only Supabase profile resolver implementation behind safe env checks.

## v1.52 guardrail update

Before real Supabase writes:
- add Supabase client only if env strategy is clear;
- keep service_role server-only;
- test RLS;
- preserve local fallback.

Next likely step:
- install/use Supabase server client behind env checks;
- or add a full deployment/env checklist before integration.

## v1.53 guardrail update

Before real integration:
- verify env values locally only;
- keep `.env.local` out of repo;
- confirm RLS;
- confirm Telegram initData verification;
- keep local fallback.

Next likely step:
- add Supabase server client dependency and wrapper behind env checks.

## v1.54 guardrail update

Before real Supabase client:
- keep readiness route secret-safe;
- use feature flag;
- keep local fallback;
- do not add writes until Telegram auth/profile/RLS tests are ready.

Next likely step:
- add Supabase server client dependency behind guard;
- or create RLS test checklist/fixtures.

## v1.54 guardrail update

Before any DB write:
- confirm env in deployment;
- confirm RLS;
- keep write flag false until tests pass;
- never return env values.

Next likely step:
- profile select/create dry-run API behind write flag.

## v1.60 guardrail update

Future financial calculations must include:
- fuel;
- Drivee commission;
- Drivee top-up separation;
- oil/maintenance reserve;
- car repair fund;
- bank candidate review status;
- realistic daily cap and fatigue.

## v1.61 guardrail update

Future car/taxi calculations must include:
- odometer tracking;
- oil service event history;
- reminder at +5,000 km;
- planned oil change at +7,000 km;
- fuel estimate from daily km and consumption range;
- service items: oil, spark plugs, oil filter, air filter.

## v1.62 guardrail update

Before every future package:
- read ACTIVE_WORK_STATE;
- read INTERRUPTION_RECOVERY_QUEUE;
- read FULL_TURN_CAPTURE_AND_INTERRUPTION_PROTOCOL;
- record exact user text;
- preserve interrupted tasks.

## v1.63 guardrail update

After master synchronization, future steps must:
- first check ACTIVE_WORK_STATE and INTERRUPTION_RECOVERY_QUEUE;
- avoid losing deferred Daily Fuel Budget task;
- continue with v1.64 fuel budget unless user sets a new priority;
- maintain full turn ledger discipline.

## v1.65 guardrail update

Future taxi net calculations must distinguish:
- planned fuel reserve;
- actual fuel paid;
- odometer-derived expected fuel cost;
- Drivee commission;
- Drivee top-up cashflow;
- free money after plan.
