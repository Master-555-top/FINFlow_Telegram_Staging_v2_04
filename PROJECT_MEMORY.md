

## v1.23 memory update — Source 05 semantic review
Source 05 confirms that FinFlow must remain a personal operating system for day, taxi work, money, car, goals, sleep, time and AI decisions.

Do not reduce FinFlow to a simple finance tracker.

Source 05 import rule:
- old taxi/expense/bank/chat data must be parsed as candidates;
- the user must review and approve before it becomes live data;
- raw private data must remain private.


## Memory Update — v1.24

Import Review Queue is now a locked architectural path: Source 05 and all historical/private sources must be normalized into candidates first. Candidates with `sensitive` or `high` risk must not be auto-applied. Day Core input must come through a unified model before calculation. This protects against confusing goals with facts, plans with transactions, and bank transfers with income.

## v1.25 memory update

FinFlow import safety principle is now implemented in code:

Raw source → ImportCandidate → Review Action → Audit Event → safe Day Core application.

Old data must not affect money, funds, taxi analytics or AI recommendations until reviewed. Sensitive candidates stay blocked from demo approval.


## v1.26 — Persistent Review State + Supabase-ready Schema

- Added persistent browser-local review state for Import Review Queue.
- Added Supabase-ready SQL schema for import_review_queues, import_review_candidates and import_review_audit_events.
- Updated Import Review UI with persistence status and reset demo action.
- No raw private data is shown in UI.
- No real database connection or secrets were added.

## v1.27 project memory

Important architecture rule:
Imported data must pass review, then dry-run preview, then explicit apply. Day Core must never be changed silently by old chats, bank statements, or AI guesses.

The apply layer is rollback-ready by design: every patch contains a target path, operation, amount delta where relevant, description, and rollback hint.

## v1.98 memory

Keep daily flow clean: morning plan, work quick-flow, evening summary. System/Dev panels must remain separate in System. Uploaded handoff/protocol files are preserved in private_vault and must not enter runtime/deploy.

## v2.00 memory

One active-day live-state now exists under `finflow.dailyLiveState.v2_00`. Preserve this layer in future work and do not regress back to isolated per-tab daily state. Legacy localStorage keys remain for compatibility.

## v2.01 memory update — Active Day Session Controls

Active Day Session / New Day rollover is implemented. Starting a new day now preserves the old day in history and rollback archive instead of acting like a destructive reset. Telegram staging can be the next project step.

## v2.02 memory — Claude v1.99.1 audit sync

When the user uploads a corrected Claude/Codex package that is older than current master, treat it as a patch source only. For v2.02, Claude v1.99.1 was useful for a static shell/dead-code cleanup audit, but it was not allowed to overwrite v2.00/v2.01 systems.

Accepted fixes:
- app shell can be static because runtime state hydrates client-side and server work is in API routes;
- obsolete Supabase profile draft/dry-run runtime files can be removed after real guarded repository path exists.

Preserve this decision before Telegram staging work.


## v2.03 memory update — Telegram staging + readiness delta rule

- User requested that readiness percentages must show previous and current values (`было → стало`).
- Telegram Mini App staging package is now prepared via deploy-safe allowlist.
- MASTER PRIVATE FULL remains local source of truth; only `finflow_app` or deploy-safe package may be used for Vercel/Telegram staging.
- Next work should move into real Telegram device testing, not more abstract local-only polish, unless a safety issue appears.
