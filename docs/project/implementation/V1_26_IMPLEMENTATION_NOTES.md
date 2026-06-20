# FINFlow v1.26 — Persistent Review State + Supabase-ready Schema

## Цель

v1.26 превращает Review Actions Layer из одноразового состояния React в устойчивую модель:

- действия approve / reject / edit / attach / merge больше не теряются после перезагрузки страницы;
- состояние очереди сохраняется локально в браузере как безопасный demo-персистентный слой;
- добавлена Supabase-ready SQL-схема для будущего backend-хранения;
- сырые банковские данные, PDF, .env и private_raw_data не выводятся в UI и не попадают в публичную часть проекта.

## Добавлено

- `src/lib/import-review/importReviewPersistence.ts`
- `docs/project/database/IMPORT_REVIEW_SUPABASE_SCHEMA_v1_26.sql`
- `docs/project/implementation/V1_26_IMPLEMENTATION_NOTES.md`
- `docs/project/validation/REGRESSION_CHECK_v1_26.md`
- `docs/project/security/SECURITY_SCAN_v1_26.md`

## Изменено

- `ImportReviewQueuePanel.tsx` теперь читает/пишет состояние через adapter.
- `importReviewQueueModel.ts` получил schemaVersion `import_review_queue_v1_26`.
- `dayCoreModel.ts` обновлён до версии UI `v1.26`.
- `package.json` обновлён до `0.1.26`.

## Анти-регрессия

v1.26 не импортирует реальные данные в Day Core автоматически. Даже approved-кандидат остаётся только кандидатом, пока не появится отдельный apply-layer с audit trail и reverse operation.
