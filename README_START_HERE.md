# FinFlow v3.0 — Latest Working Package v1.1

Это самый актуальный рабочий пакет на текущий этап.

## Что это за пакет

Это не финальная версия FinFlow. Это чистый Foundation-пакет для запуска нового Mini App без хаоса старой реализации.

Цель текущего шага: запустить основу, проверить, что нет Hydration failed, что работает живое время, время суток, dark/glass UI, Error Log и базовый Dashboard.

После успешного запуска следующий шаг — Step 2: Daily Money Planner.

## Что уже учтено в контексте проекта

FinFlow должен стать личной AI-системой управления днём, деньгами, такси, машиной, фондами, целями и решениями.

Ключевые требования:

- живой Dashboard;
- дата, время, день недели, время суток;
- реальное текущее количество денег;
- расчёт «сколько нужно сделать грязными сегодня»;
- рабочие расходы такси;
- бензин;
- Drivee комиссия;
- рабочий фонд;
- фонд встреч;
- подушка;
- переезд;
- ДР Ульяны;
- база для работы девушки;
- банк / банкротство;
- машина / ремонт / ходовая;
- масло и ТО;
- мини-цели;
- календарь дел;
- реалистичный лимит 24 часов;
- AI через n8n;
- импорт Telegram / банка;
- экспорт данных;
- полное редактирование;
- soft delete;
- error log;
- anti-regression protocol.

## Как открыть

1. Распакуй архив.
2. Открой в VS Code именно папку, где сразу виден `package.json`.
3. Открой терминал в VS Code.
4. Выполни:

```bash
npm install
npm run dev
```

5. Открой:

```bash
http://localhost:3000
```

## Что проверить

- приложение открылось;
- нет Hydration failed;
- живое время отображается;
- время суток меняется на клиенте;
- Error Log работает;
- интерфейс не развалился;
- нижнее меню видно.

После этого написать в чат: `Step 1 запустился`.

## Важно

Не добавляй пока Supabase, n8n, импорт банка и всю историю. Сначала запускаем Foundation. Потом делаем Daily Money Planner.

## Project memory files added in v1.2

This package now contains structured project memory in `docs/project/`:

- `memory/PROJECT_MEMORY.md`
- `memory/USER_AND_FINANCIAL_CONTEXT.md`
- `protocols/LOCKED_DECISIONS.md`
- `protocols/AI_DEVELOPMENT_PROTOCOL.md`
- `protocols/ANTI_REGRESSION_CHECKLIST.md`
- `data/TAXI_VEHICLE_COST_MODEL.md`
- `data/FUNDS_AND_ALLOCATION_MODEL.md`
- `data/DAILY_MONEY_PLANNER_SPEC.md`
- `data/CALENDAR_TIME_PLANNER_SPEC.md`
- `data/AI_MEMORY_AND_LEARNING_SPEC.md`
- `backlog/FEATURE_BACKLOG.md`
- `backlog/ERROR_LOG_SYSTEM_SPEC.md`

Treat these files as the project source of truth together with the app code. Update them when a durable requirement, locked decision, bug, or architecture rule changes.

## v1.3 safety update
Before any GitHub/cloud/deploy step, read:
- `docs/project/security/SECURITY_AND_PRIVATE_DATA_RULES.md`
- `private_raw_data/README_PRIVATE.md`

Project memory must be updated as development progresses. Start each major work session from:
- `docs/project/state/CURRENT_STATE.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- `docs/project/protocols/PROJECT_UPDATE_PROTOCOL.md`
- `docs/project/protocols/CODE_CHANGE_PROTOCOL.md`

Current practical next step: run Foundation locally, then implement Step 2 Daily Money Planner.


## v1.4 safety note

Before starting development, read:

- `docs/project/audit/PRE_START_FULL_REVIEW_STATUS.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- `docs/project/import/HISTORICAL_DATA_NORMALIZATION_PLAN.md`
- `docs/project/import/HISTORICAL_SOURCE_INDEX.md`
- `docs/project/security/SECURITY_AND_PRIVATE_DATA_RULES.md`

Historical Telegram/bank data must be normalized later through Import Center. Do not paste raw private files into public repo.


## v1.5 Pre-Start Review

Перед началом разработки обязательно посмотри:

- `docs/project/state/CURRENT_STATE.md`
- `docs/project/history/CHAT_TIMELINE_AND_DECISION_HISTORY.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- `docs/project/import/reports/HISTORICAL_NORMALIZATION_REPORT.md`

Исторические данные уже предварительно разложены в candidate/review CSV, но не считаются подтверждённой бухгалтерией до этапа Import Center.

Напоминание: `private_raw_data` нельзя загружать в GitHub/облако/деплой.

## v1.7 note

The latest planning logic includes live current-day order progress. When the user adds orders or income during the day, FinFlow must update remaining gross target, Drivee estimate, feasibility, and allocation advice instantly.
