# FINFlow — единый мастер-контекст v1.87

> СТРОГО ПРИВАТНО. Полный мастер-пакет сохраняет `private_raw_data`, банковские PDF/CSV, нормализованные финансовые данные и локальные архивы. Не публиковать.

## Каноническая версия

`FINFlow v3.0 Foundation v1.87 — Local Backup / Restore Safety Layer + Cloud Verification Hardening`.

FINFlow — личная операционная экосистема, а не только трекер расходов. Она объединяет деньги, такси, автомобиль, фонды, обязательства, банковский review, время и AI-поддержку решений.

## Неприкосновенные принципы

- local-first;
- manual review;
- preview-before-apply;
- запрет silent overwrite;
- server-only привилегированные ключи;
- Telegram initData verification перед cloud API;
- приватные исходники не попадают в публичный repo/deployment;
- каждый следующий пакет сохраняет рабочие функции предыдущего.

## Реализованный контур

- единый Day Core и Quick Input;
- Dashboard и Net Calculation из живого состояния;
- доходы, расходы, заказы, банк, топливо и пробег;
- локальная история, review queue и assistant context;
- Telegram verification route;
- server-only Supabase profile resolver;
- versioned cloud day document;
- ручной cloud save/load-preview/apply;
- optimistic revision conflict/HTTP 409;
- deployment readiness и persistent verification checklist;
- safe acceptance runner;
- manual cloud save/conflict wizard;
- v1.87 local backup/restore с checksum, preview и rollback.

## Исправления v1.87

- production build на Windows использует webpack и проходит на длинном пути;
- real-data gate требует прохождения всех 11 verification steps;
- RLS review стал обязательным шагом;
- wizard-state v1.86 мигрируется в v1.87;
- acceptance runner отличает HTTP 200 от фактической cloud readiness;
- Telegram test требует `profileReady=true`;
- Supabase readiness показывает cloud/write flags;
- anon key не блокирует server-only cloud bridge;
- права `public`, `anon`, `authenticated` на profile/day/audit tables отозваны;
- stale pending cloud preview очищается перед новой загрузкой;
- cloud document parser валидирует вложенные records/templates/decisions/fuel/day fields.

## Backup / Restore v1.87

Backup экспортирует только browser localStorage keys с префиксами `finflow.` и `finflow_`.

Защита:

- versioned schema;
- лимит 5 МБ на файл;
- лимит количества и суммарного размера записей;
- deterministic checksum;
- reject неизвестных/дублирующихся ключей;
- preview новых и заменяемых значений;
- typed confirmation `ВОССТАНОВИТЬ`;
- merge-only без скрытого удаления;
- автоматический rollback при ошибке записи;
- ручной rollback последнего restore.

## Проверки

- чистый `npm ci`;
- TypeScript strict check;
- Next.js production build;
- dependency audit: 0 известных уязвимостей;
- API readiness local-only contract;
- browser render v1.87;
- backup parser/checksum/tamper/apply/rollback tests.

## Что нельзя завершить локально

Для v1.88 нужны внешние ресурсы владельца:

1. приватный Supabase project;
2. применённая migration;
3. Telegram Bot/Mini App;
4. HTTPS deployment;
5. реальные server-only env secrets;
6. тест с телефона;
7. две реальные сессии для revision conflict;
8. RLS isolation evidence.

## Секреты

В корне пакета обнаружен только `.env.example`; отдельного `.env.local` нет. Секреты, существующие только в BotFather, Supabase/Vercel dashboard или другом vault, невозможно включить без их локального файла. Не переносить их в чат.

## Команда продолжения

> Продолжаем FINFlow с канонической версии v1.87. Сначала прочитай `00_FINFLOW_MASTER_CONTEXT_v1_87.md`, `CURRENT_STATE.md`, `docs/project/state/ACTIVE_WORK_STATE.md` и `README_START_HERE.md`. Не упрощай систему до трекера расходов. Сохраняй local-first, manual-review, preview-before-apply и anti-silent-overwrite. Следующая задача — v1.88: приватный deployment и реальные Telegram/Supabase/RLS acceptance results. Не выводи банковские строки и секреты без прямой необходимости.
