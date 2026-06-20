# FINFlow v1.73 — handoff для синхронизации в GPT-чате

## Канонический статус

FINFlow — личная операционная экосистема для денег, такси, машины, фондов, обязательств, времени и AI-поддержки решений.

Текущая версия: `v1.73 — Telegram + Supabase Cloud Day Sync Foundation`.

Локальное приложение стабильно: чистая установка, TypeScript, production build и browser smoke-test проходят. Quick Input, верхний Dashboard и Net Calculation используют единое живое состояние.

## Что реализовано в v1.73

- Серверная проверка подписи Telegram Mini App `initData`.
- Защита от просроченного и будущего `auth_date`.
- Реальный server-only resolve/create профиля в Supabase.
- Версионный cloud-документ дня: Day Core, записи, шаблоны, решения по банку и данные топлива/пробега.
- API `GET/PUT /api/sync/day`.
- Ограничение payload, runtime-валидация документа и отсутствие cache.
- Optimistic concurrency через `revision`.
- Облачная загрузка не применяется автоматически: сначала preview, затем отдельное подтверждение.
- `localStorage` остаётся безопасным fallback.
- Production dependency audit: 0 известных уязвимостей; Supabase SDK закреплён на 2.108.2.
- Миграция `supabase/migration_v1_73_telegram_cloud_day.sql`.
- Для браузера нет прямого доступа к cloud-таблицам; bridge работает только через сервер и service role.

## Заблокировано только внешней настройкой

1. Создать приватный Supabase-проект.
2. Применить SQL migration v1.73.
3. Создать Telegram-бота и Mini App URL.
4. Развернуть приложение с HTTPS.
5. Добавить server-only env и включить два feature flag.
6. Проверить на реальном телефоне: новый профиль, первый save, load-preview, apply, conflict.
7. Провести отдельный RLS/security review перед импортом банка.

## Следующий рекомендуемый пакет

`v1.74 — Private Deployment + Real Telegram/Supabase Verification`.

После него:

- нормализованная облачная синхронизация фондов/обязательств/истории;
- backup/restore;
- bank review persistence;
- календарь и задачи;
- AI planner server-side.

## Текст для продолжения в GPT-чате

> Продолжаем FINFlow с канонической версии v1.73. Не упрощай проект до финансового трекера. Сохраняй local-first, manual-review и anti-silent-overwrite принципы. Следующая задача: приватный deployment, применение migration v1.73, реальные Telegram/Supabase проверки и документирование результатов. Не проси и не публикуй секреты в чате; ключи должны храниться только в environment variables хостинга.

Не прикладывать к публичному чату `private_raw_data`, банковские CSV/PDF, токены и `.env.local`.
