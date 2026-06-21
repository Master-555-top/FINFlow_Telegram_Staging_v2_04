# PROJECT MEMORY UPDATE — v2.41

v2.41 continues the faster global build mode. FINFlow now has an n8n automation contract layer, but external automation is still intentionally blocked until private staging, auth, redaction and backup gates are ready.

n8n decision:
- n8n is not allowed to perform blind writes into FINFlow.
- n8n cannot auto-apply historical imports or cloud conflicts.
- n8n payloads are compact, versioned and dry-run by default.
- No tokens, `.env`, service role, Telegram initData/hash, private_vault or private_raw_data may be returned to client/UI or sent to external automation.
- Sensitive raw logs/addresses/bank data require a future consent/redaction layer.

Progress update:
- Strong mini app readiness: about 74% complete.
- Remaining: about 26%.
- Next major build: Real Local Apply UI + Import/Template Confirm v2.42.

Visual baseline remains locked:
- Sleep History list, Sleep weekly 7-day chart and System grid are ideal current references.
- Do not globally redesign while building data/import/Supabase/templates/n8n.

Security remains locked:
- MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS, .env, tokens and secrets are local/private only.
- GitHub/Vercel/Telegram receive Deploy-safe only.

---

# PROJECT MEMORY UPDATE — v2.40

v2.40 continues the faster global build mode. The app now has a local Cloud Sync Queue and Conflict Review UI, so cloud actions are visible as safe states instead of hidden one-off button clicks.

Cloud sync decision:
- Cloud sync remains local-first and gated.
- Save/load/apply/rollback/conflict actions create safe local queue events.
- Revision conflicts create manual review cards and never auto-overwrite local data.
- Queue cards store compact metadata only; no secrets or private raw data.
- Supabase writes remain safe-off until real Telegram staging, RLS, backup and conflict tests pass.

Progress update:
- Strong mini app readiness: about 72% complete.
- Remaining: about 28%.
- Next major build: n8n Automation Contract + API Safety v2.41.

Visual baseline remains locked:
- Sleep History list, Sleep weekly 7-day chart and System grid are ideal current references.
- Do not globally redesign while building data/import/Supabase/templates/n8n.

Security remains locked:
- MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS, .env, tokens and secrets are local/private only.
- GitHub/Vercel/Telegram receive Deploy-safe only.

---



## v2.37 — Manual Taxi Order Log Import

- Added parser for the user's real manual taxi order journal format.
- Historical import now detects manual taxi logs and creates one shift preview plus order-level candidates.
- Order candidates preserve date/time and can become taxi_order Daily Records after confirmation.
- Work/Taxi Engine now has manual log import preview calculations: orders, gross, active time, full shift, idle time, active ₽/h, shift ₽/h.
- Templates Engine includes a user-locked import rule for taxi order journals.
- Visual baseline unchanged; no global UI redesign.
- Strong mini app readiness estimate: about 65% ready / 35% remaining.
# PROJECT MEMORY UPDATE — v2.34

v2.34 continues the user-requested faster global build mode. UI polish remains secondary. The accepted visual baseline is preserved and the product work moves into functional data engines.

Money Engine decision:
- Деньги should not be just a record list. It must answer: what came in, what went out, what is work cost vs personal spending, what obligations remain and how much is safely spendable today.
- User-relevant categories are locked as the initial money taxonomy: Такси / работа, Доп. доходы, Работа: заправка, Работа: комиссия, Продукты / еда, Машина, Встречи / личное, Прочее.
- Money Engine reads current Day Core + Daily Records and produces source summaries, category summaries, obligations and short safety signals.
- It does not enable Supabase writes and does not move history to a global tab.

Progress update:
- Strong mini app readiness: about 52% complete.
- Remaining: about 48%.
- Next major build: Work/Taxi Engine v2.35.

Visual baseline remains locked:
- Sleep History list, Sleep weekly 7-day chart and System grid are ideal current references.
- Do not globally redesign while building data/import/Supabase/templates/n8n.

Security remains locked:
- MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS, .env, tokens and secrets are local/private only.
- GitHub/Vercel/Telegram receive Deploy-safe only.

---

# PROJECT MEMORY UPDATE — v2.32

User corrected the development rhythm: UI screenshots and visual polishing should not consume the next cycles. FINFlow needs global product work now: historical data, Supabase, templates, expenses/income, work/taxi engine and n8n.

New operating mode:
- Prefer big build packages by system layer, not tiny 20-minute UI tweaks.
- Keep existing visual style unless user explicitly requests redesign.
- Use screenshots later for final UI polish.
- Always report how much remains until a strong fully working mini app.

v2.32 decision:
- Introduce Global Data Backbone as the next architectural layer.
- Add an honest readiness model: about 43% complete, 57% remaining.
- Track remaining work by large areas: local shell/UI, data backbone, historical import, money engine, work/taxi engine, templates, Supabase, n8n, security/backup/IP, QA/release.
- Add a safe historical import draft parser that previews and flags review issues but does not save automatically.
- Add Supabase schema draft with RLS pattern, but keep cloud writes safe-off.
- Add n8n automation plan only as a future layer after stable APIs and security review.

Next critical path:
1. v2.33 — canonical write adapters for Money/Work and import preview/dedupe/confirm/rollback.
2. v2.34 — Money engine with sources, categories, recurring payments and real history.
3. v2.35 — Work/taxi engine with shifts, orders, fuel, zones later and ₽/hour analytics.
4. v2.36 — Templates Engine across sections.
5. v2.37+ — Supabase staging, sync queue, RLS tests, n8n workflows and real Telegram QA.

Security remains locked:
- MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS, .env, tokens and secrets are local/private only.
- GitHub/Vercel/Telegram receive Deploy-safe only.

---

# PROJECT MEMORY UPDATE — v2.31

User clarified that assistant-generated visual concept images should not drive FINFlow direction. The accepted style is the previous FINFlow visual; when the user sends screenshots, changes must be local and preserve the existing visual language unless the user explicitly requests a global redesign.

Sleep Overview v2.31 decision:
- Keep top Sleep tabs as `Обзор / История / Редактор`.
- Keep the start card from v2.30 with `Основной режим`, `Во сколько лёг`, and `Засыпаю`.
- Simplify or remove unclear duplicate cards instead of adding new design concepts.
- The old `Контроль режима` card was too text-heavy and unclear; it is now a short `Последний сон` signal.
- The stat cards and chart must refer to the same weekly period (`ПН–ВС`) so the user understands where numbers come from.
- Remove duplicate Overview cards when the same information already belongs to History or Editor.

Workflow preference:
- User finds it hard to give detailed UI instructions. Future screenshot work should use a faster protocol: identify screen, block number/screenshot, action (`убрать`, `оставить`, `сократить`, `переименовать`, `перенести`, `сохранить логику`), then assistant converts it into an implementation checklist before coding.

Locked protections remain:
- Do not change sleep storage keys casually.
- Do not add global History.
- Do not upload MASTER/private/secrets to GitHub/Vercel/public cloud.


## v2.36 — Templates Engine

- Added canonical Templates Engine for day, money, work, funds, system import rules and future recurring actions.
- Added user-locked template seeds from known FINFlow context: taxi shift, fuel, Drivee, products, car, meeting, car payment, bankruptcy, working fund, freedom, computer, UK, day focus and historical import.
- Added adapters from existing Daily Record templates, Money Engine suggestions, Work Taxi templates, live obligations, live funds, live tasks and custom templates.
- Added System → Data → Шаблоны panel.
- Added compact template snapshot cards to Money/Work context.
- Updated strong mini app progress model: templates moved from scattered foundation to usable local registry.
- Preserved visual baseline, section-scoped history, Sleep keys, MASTER/deploy-safe separation and cloud safe-off state.


## v2.38 memory — Recurring Apply + Work Shift Lifecycle

- FINFlow now has a Template Apply Engine foundation: templates produce apply drafts, recurring previews, duplicate hints, confirm/apply results and rollback snapshots.
- Work/Taxi now has a lifecycle snapshot: open shift, add orders/costs, close preview, bridge to Money/Day/Sleep.
- Visual baseline remains locked and must not be redesigned during global build steps.
- Supabase/cloud writes remain safe-off until v2.39+ RLS/backup/conflict testing.


## v2.39 memory — Supabase Staging Foundation

- Supabase is now a staged foundation, not just a future plan.
- System → Cloud → Staging shows cloud gates, migrations, RLS checklist and next actions.
- `/api/supabase/readiness` returns readiness/guard information without exposing secrets.
- New migration draft prepares sync queue, import batches, template instances and conflict review tables.
- Cloud writes stay safe-off until server env, Telegram identity, RLS/cross-user test, backup gate and revision conflict test pass.
- Strong mini app progress is now about 70% complete / 30% remaining.
- Visual baseline remains locked; no global redesign during data/cloud/n8n builds.
