# Requirements Coverage Audit — v1.5 Pre-Start

Дата: 2026-06-15

## Назначение

Этот файл нужен, чтобы перед началом разработки проверить: ничего ли глобального не упущено из чата, загруженных файлов и протоколов.

## Статус

- Концепция покрыта: ДА
- Протоколы разработки покрыты: ДА
- Безопасность `private_raw_data`: ДА
- Исторические данные не забыты: ДА
- Все старые строки превращены в финальные записи БД: НЕТ, но создан review-layer и план Import Center
- Первый рабочий модуль определён: ДА, Daily Money Planner

## Покрытые блоки

### Product / смысл
- FinFlow OS, не простой трекер.
- День = диагностика, неделя = управление, месяц = стратегия.
- Личный диспетчер денег, времени, такси, машины и решений.

### Dashboard
- Живое время, дата, время суток, погода.
- Сейчас денег.
- Нужно грязными сегодня.
- Реалистичность дня.
- AI-рекомендация.

### Money Core
- Доходы, расходы, остатки.
- Категории/подкатегории.
- Статистика день/неделя/месяц/год.
- Полное редактирование, soft delete, restore.

### Funds / Stability
- Рабочий, встречи, база, машина, банк, личное.
- ДР Ульяны, переезд, подушка, подарок/мини-цели.
- Все фонды стартуют с 0 ₽.
- Smart allocation, не равномерное размазывание всегда.

### Taxi / Work
- Грязными, чистыми, активное время, полная смена.
- Заказы, простои, зоны, ₽/час.
- KPI 11 000 грязными / 8 500 чистыми; 59 500 неделя; 212 500 месяц.

### Vehicle / Costs
- Toyota Premio 2007, 1.8.
- АИ-92 75,51 ₽/л.
- Расход 11–13 л/100 км, 80–150 км/день.
- Drivee planning fee 13%.
- Масло overdue, 6–7 тыс. ₽, менять 5–6 тыс. км.
- Долив масла 1 л/неделю.
- Ходовая примерно 50 000 ₽ и критична.

### Calendar / Time
- Личный календарь дел.
- Дела занимают время и влияют на доход.
- 24 часа суток, сон, еда, дорога, отдых.
- Реалистичный максимум около 10 000 ₽ чистыми в день.

### Dynamic Goals
- Мини-цели: колготки 2 500, продукты 5 000, подарки и т.д.
- Цели влияют на дневной gross target.
- AI должен предлагать перенос/разделение/приоритет.

### AI / n8n
- Daily Planner.
- Evening Review.
- Weekly Review.
- Goal Risk Monitor.
- Car Assistant.
- Allocation Advisor.
- AI Memory & Learning.

### Import / Export
- Telegram history.
- Banking PDF.
- Manual entries.
- Normalized candidates + review queue.
- Export CSV/Excel/JSON/PDF в будущем.

### Security
- `private_raw_data` не загружать в GitHub/облако/публичные архивы.
- `.env`, токены, пароли, банковские данные не коммитить.
- Перед деплоем security cleanup.

### Development Protocol
- Не переписывать каждый раз.
- Локальные правки.
- Anti-regression после каждого шага.
- Обновлять docs/project, changelog, current state, backlog.

## Что ещё требует отдельного этапа

1. Реальный Import Center в интерфейсе.
2. Подтверждение машинно найденных исторических кандидатов.
3. Расчёт точных средних по бензину/Drivee из подтверждённых данных.
4. Supabase schema и RLS.
5. n8n workflows.
6. Экспорт и backup.

## Вывод

Для начала разработки Foundation + Daily Money Planner покрытие требований достаточное. Исторические данные сохранены как обязательный слой импорта и уже имеют candidate/review files для будущей обработки.

---

## v1.6 Coverage Additions

Covered:
- exact allocation recommendations by amount;
- correct gross calculation with Drivee as percentage;
- 15.06.26 concrete daily needs example;
- late-day infeasibility at 16:07;
- recommendation modes: Emergency / Recovery / Smart Allocation;
- rule: show what to pay first, what to postpone, and where surplus goes.

Still future implementation:
- UI component for Real-Time Allocation Advisor;
- form/input for current balances and daily needs;
- automatic learning from historical outcomes;
- persistence in Supabase.

## v1.7 Coverage Update — Live current-day orders

Covered requirement: FinFlow must consider how many orders have already been completed today and how much gross turnover has already been made. This affects the Daily Money Planner, Real-Time Allocation Advisor, Taxi/Work Core, current-day feasibility, Drivee commission estimate, and AI recommendations.

Status: documented / pending implementation.
Files updated:
- docs/project/data/LIVE_SHIFT_PROGRESS_AND_ORDER_TRACKING_SPEC.md
- docs/project/data/REAL_TIME_ALLOCATION_ADVISOR_SPEC.md
- docs/project/data/DAILY_MONEY_PLANNER_SPEC.md
- docs/project/protocols/LOCKED_DECISIONS.md

## v1.8 Coverage Addition — Incremental updates only

Covered requirement: project files and code must not be rewritten from scratch each time. All future changes must be local, compatible, anti-regression checked, and integrated into the current system.

Status: COVERED in v1.8.

Files:
- `docs/project/protocols/INCREMENTAL_FILE_AND_CODE_UPDATE_PROTOCOL.md`
- `docs/project/protocols/CODE_CHANGE_PROTOCOL.md`
- `docs/project/protocols/PROJECT_UPDATE_PROTOCOL.md`


## v1.9 requirement added
- [x] Money Allocation Recommendation Engine: exact recommended sums for each destination, live recalculation, priority-based allocation, and Recovery/Emergency modes.

## v1.10 coverage additions

- [x] Context-aware answers across chat, files, docs, protocols, changelog, current archive state.
- [x] Meetings Fund as recurring turnover/flexible fund.
- [x] 2,000–3,000 ₽ recommended relationship buffer.
- [x] Track average days per week spent together.
- [x] Relationship time affects calendar and work availability.
- [x] Relationship spending affects daily gross target and allocation recommendation.

## v1.11 correction and additions

- [x] Corrected average meetings frequency to 5 times/week.
- [x] Marked older 2–3/week default as obsolete.
- [x] Added Master Requirements Index.
- [x] Expanded dated chat/decision timeline.
- [x] Strengthened requirement that assistant must use project files, not memory only.

## v1.12 provenance correction

- [x] Added distinction between current active chat, previous imported conversations, historical source data, and generated artifacts.
- [x] Corrected possible confusion: 03.06.2026 is prior/imported Taxi Income Bot context, not current chat start.
- [x] Current active working chat/archive sequence is treated as 15.06.2026.

## v1.13 imported project sources

- [x] Previous imported project files/conversations must be treated as project memory.
- [x] External ChatGPT share links must be registered and classified.
- [x] Shared link added as pending full extraction source.
- [x] Project docs must not pretend inaccessible external content has been fully analyzed.

## v1.14 response integrity coverage

- [x] Added mandatory response integrity/check protocol.
- [x] Important answers must state whether anything was deleted/lost/changed.
- [x] Assistant must rely on project files, not latest message only.
- [x] "Fixed/added/updated" must correspond to actual file updates or be clearly labeled as chat-only.

## v1.15 full context audit coverage

- [x] Added full context audit report.
- [x] Added source-to-requirement map.
- [x] Added lost requirements recovery report.
- [x] Added context control dashboard.
- [x] Identified remaining risk: inaccessible shared chat and hidden details inside old raw text.

## v1.16 implementation coverage

- [x] Day Core visible in UI.
- [x] Orders completed today visible as mock.
- [x] Gross done today visible as mock.
- [x] Remaining gross target visible.
- [x] Drivee 13% visible.
- [x] Meetings 5/week visible.
- [x] Meetings fund 2,000–3,000 ₽ target visible.
- [x] Allocation recommendation buckets visible.
- [x] Recovery Mode visible.
- [ ] Real CRUD order entry.
- [ ] Real current money input.
- [ ] Supabase persistence.
- [ ] n8n AI integration.
- [ ] Import Center UI.

## v1.16 implementation coverage

- [x] Day Core visible in UI.
- [x] Orders completed today visible as mock.
- [x] Gross done today visible as mock.
- [x] Remaining gross target visible.
- [x] Drivee 13% visible.
- [x] Meetings 5/week visible.
- [x] Meetings fund 2,000–3,000 ₽ target visible.
- [x] Allocation recommendation buckets visible.
- [x] Recovery Mode visible.
- [ ] Real CRUD order entry.
- [ ] Real current money input.
- [ ] Supabase persistence.
- [ ] n8n AI integration.
- [ ] Import Center UI.

## v1.17 source intake coverage

- [x] Added source intake/canonization protocol.
- [x] Added source intake queue.
- [x] Added source review template.
- [x] Defined one-file-at-a-time process.
- [x] Coding paused to protect current v1.16 app code while sources are consolidated.

## v1.18 Source 01 coverage

- [x] Source 01 current chat text read and reviewed.
- [x] Source review file created.
- [x] Source inventory created/updated.
- [x] Current chat canonical requirements created.
- [x] Source intake queue updated: Source 01 processed, Source 02 waiting.
- [x] Raw source stored under private_raw_data/source_intake.
- [x] No code changes made; v1.16 code preserved.

## v1.19 combined transcript coverage

- [x] User and assistant messages no longer need to be separated manually.
- [x] Combined transcript processing protocol added.
- [x] Queue adjusted to Source 02 combined transcript.
- [x] User corrections are explicitly higher priority than assistant assumptions.

## v1.20 bank import coverage

- [x] Bank PDF processed as Source 03.
- [x] Bank transactions extracted into candidates.
- [x] Redacted review CSV created.
- [x] Bank import/review queue spec added.
- [x] Category mapping draft added.
- [x] Sensitive raw bank data kept under private_raw_data.
- [x] Transfers/replenishments marked as requiring review before final accounting.

## v1.21 Source 04 and session tracking coverage

- [x] Verified `Все файлы.rar` directly.
- [x] Confirmed it is a 24-byte RAR5 archive with zero files.
- [x] Closed Source 04 as processed_empty_archive.
- [x] Added Agent Session Tracker.
- [x] Added rule not to repeat the same archive extraction attempt.

## v1.22 Source 05 coverage

- [x] Verified archive identity and hash.
- [x] Extracted real context archive.
- [x] Created file inventory.
- [x] Created keyword scan.
- [x] Identified key FinFlow docs and raw context files.
- [x] Preserved raw archive in private_raw_data.
- [x] Confirmed Source 05 is context/source material, not a blind code replacement.
- [ ] Deep semantic review of each pasted text export.
- [ ] Convert spending/taxi logs into import candidates.
- [ ] Compare app snapshot in Source 05 against latest current code before any code replacement.


<!-- v1.24 root mirror update -->


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

## v1.25 coverage

- [x] Review action layer added.
- [x] Approve/reject/edit/attach/merge actions represented in UI.
- [x] Audit event preview added.
- [x] Sensitive candidates blocked from approval.
- [x] Day Core application guard documented.
- [x] Build passed.

## v1.28 coverage

- [x] Persistent applied patch state.
- [x] Rollback command.
- [x] Patch audit.
- [x] No raw/private data in UI.
- [x] Anti-regression protocol maintained.

## v1.31 alignment audit coverage

- [x] Rechecked current chat canonical requirements.
- [x] Confirmed gross/clean/free money terminology.
- [x] Classified real/live vs demo/mock data.
- [x] Confirmed templates are documented but not all implemented.
- [x] Identified next priority: Quick Daily Input.
