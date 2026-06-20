# LOCKED DECISIONS

1. FinFlow is a Telegram Mini App / web mini app, not just a command bot.
2. Supabase is planned as the main persistence layer.
3. n8n is planned as the AI workflow/orchestration layer.
4. Day Core is the main object: day links money, work, time, goals, and AI.
5. Week is more important than a single day for compensation and planning.
6. The app must always show live date, time, day, and time of day.
7. The app must be live reactive: any new/edit/delete/import updates all dependent screens.
8. Full editing is required for all records.
9. Soft delete / archive / restore is required; avoid destructive deletion.
10. Export/backup must exist for all data by category and period.
11. Error Log must exist in the app for dev/debug and later persisted logs.
12. Anti-regression is mandatory after every change.
13. Greenfield rebuild is allowed only for code implementation, not product logic.
14. UI direction: premium dark glass/neon/cyber/iOS-like dashboard.
15. Taxi is a freedom/cashflow system, not only an income line.
16. Taxi operating costs must include fuel, Drivee, oil, repairs, depreciation, and reserves.
17. FinFlow must support dynamic goals and mini-goals.
18. FinFlow must include personal calendar/time impact planner.
19. FinFlow must respect realistic 24-hour day limits.
20. FinFlow must know real current money balances.
21. Smart allocation beats equal distribution: do not spread tiny amounts everywhere if one critical target needs focused funding.
22. All funds currently start from 0 ₽.
23. Car Assistant / Maintenance Planner must exist in final system.
24. Security-first: no secrets/tokens/passwords/connection strings in committed files.

---

## LOCKED DECISION v1.6 — Real-Time Allocation Advisor

FinFlow must show exact recommended allocations, not only totals. When the user enters real daily needs, the app must calculate required gross, compare it with remaining realistic day capacity, then recommend what to pay first, what to reduce, what to postpone, and where extra money should go.

Drivee commission must be calculated as a percentage of gross when appropriate, not mistakenly added as a fixed line unless the user explicitly treats it as a top-up cashflow need.

## LOCKED DECISION v1.6 — Late-Day Feasibility Check

Current time must change the plan. A target that is realistic in the morning may become unrealistic at 16:07. FinFlow must detect this and switch to Recovery/Emergency mode.

## LOCKED DECISION №24 — Live Shift Progress & Orders Affect Daily Plan

FinFlow must account for completed orders and already-earned gross income during the current day. The app must recalculate the daily plan after each added order/income/expense: how much has already been made, how much remains, whether the plan is still realistic with the current time, and where the next money should go. Morning targets must not remain static if the day has changed.


## Locked Decision v1.9 — Concrete Money Allocation Recommendations
FinFlow must recommend exact allocation amounts for current money and today's income. It must show what to pay first, what to fund, what to reduce, and what to postpone. Recommendations must update live after orders, income, expenses, balance changes, tasks, time changes, and mini-goals.

## LD — Context-Aware Responses

The assistant must always interpret FinFlow requests through the full project context: chat history, uploaded files, project memory, locked decisions, protocols, changelog, current archive state, and existing implementation. Responses must not be based only on the latest message.

## LD — Meetings Fund & Relationship Time

FinFlow must include a recurring Meetings Fund. The user should usually have approximately 2,000–3,000 ₽ available for meetings. The app must track how many days per week the user usually spends with his girlfriend and use this to recommend weekly/daily relationship spending buffers, without confusing this fund with birthday, gifts, girlfriend work base, or emergency mini-goals.

## LD — Response Integrity Check

Every important FinFlow/project answer must include a short integrity check: whether anything was deleted, lost, contradicted, or needs document/changelog update. The assistant must explicitly preserve previous systems and integrate new requirements locally.

## LD — File-backed project guidance

The assistant must rely on project files, protocols, memory docs, history, audit files, changelog, and imported sources when giving project guidance. It must not behave as if only the latest message exists.

## v1.99 locked decision — external optimized packages are patch sources, not base resets

When a corrected/optimized Claude/Codex/other-model package is uploaded and it is older than the current master, it must not replace the project wholesale. The package must be preserved in `private_vault`, compared against the current master, and only useful non-regressive fixes may be merged.

For v1.99, Claude v1.94 Optimized was treated as a patch source. Current v1.95–v1.98 systems remained authoritative.

## v2.00 locked decision — one active day live-state across tabs

FINFlow must maintain one current active-day model across Day, Money, Work, Funds, AI and System views.

The app must not depend only on component remounts or isolated per-panel state for the active day. Browser-local MVP state should use the v2.00 shared live-state snapshot while preserving legacy keys for compatibility.

Any future change to daily records, funds, taxi work, fuel, cloud restore or backup restore must update the shared active-day model or explicitly document why it is not part of the active-day state.

## Locked decision — v2.01 Active Day Session

- “New Day” must never be a blind destructive reset.
- Before creating a new active day, FINFlow must preserve the current day in Daily History and a rollback-capable rollover archive.
- New active day should reset daily records/orders/fuel paid but preserve balances, obligations, funds, templates, bank review decisions and relevant taxi/fuel settings.
- Telegram Mini App work should proceed via staging/deploy-safe package, not by uploading MASTER PRIVATE FULL.

## Locked decision — v2.02 Claude audited patch sync

Claude/Codex audited packages that are older than the current master may still contain useful fixes, but they must not overwrite newer FINFlow systems. For v2.02, Claude v1.99.1 was allowed to contribute static shell optimization and dead-code cleanup only. v2.00 live-state and v2.01 New Day rollover remain authoritative.


## Locked decision — readiness percentages must show delta

When reporting FINFlow readiness percentages, always show previous and current value, e.g. `Telegram Mini App layer: 81% → 84%`, not only the current percentage.

## LOCKED DECISION v2.04 — Telegram Device Test Is Read-only Until Real Test Passes

The built-in Telegram Device Test flow must remain read-only until the user completes a real Telegram phone test and confirms results.

Rules:
- Do not call cloud PUT/save from the v2.04 device-test panel.
- Use `GET /api/sync/day` only for cloud dry-run.
- Never display raw Telegram `initData` or `hash` in UI.
- Do not generate fake initData to simulate success.
- Cloud writes require local backup, guarded wizard/checklist, and explicit user intent.
- Readiness percentages must be reported as `previous → current`.
