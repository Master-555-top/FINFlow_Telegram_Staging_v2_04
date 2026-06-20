# PROJECT UPDATE PROTOCOL — v1.4

## Правило

Каждое значимое изменение проекта должно обновлять не только код, но и документы проекта.

## Перед изменением

1. Проверить `docs/project/memory/PROJECT_MEMORY.md`.
2. Проверить `docs/project/protocols/LOCKED_DECISIONS.md`.
3. Проверить `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`.
4. Проверить, затрагивает ли изменение данные, фонды, Dashboard, AI, импорт/экспорт, безопасность.
5. Сформировать маленький локальный шаг.

## После изменения

Обновить при необходимости:

- `CHANGELOG_LATEST.md`
- `docs/project/state/CURRENT_STATE.md`
- `docs/project/memory/PROJECT_MEMORY.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- relevant spec в `docs/project/data/` или `docs/project/import/`
- `docs/project/backlog/FEATURE_BACKLOG.md`

## Запрещено

- Переписывать проект целиком без отдельного решения.
- Удалять работающие системы ради новой функции.
- Загружать `private_raw_data` в GitHub/cloud.
- Вносить правки без anti-regression проверки.
- Считать новые сообщения важнее старых автоматически: ранние locked decisions сохраняются, пока явно не отменены.

## Формат работы

```text
локальная правка
→ запуск
→ проверка
→ regression checklist
→ обновление docs
→ следующий шаг
```

## v1.8 Addition — no full rewrites during normal work

Project documents and code must evolve cumulatively. When a new requirement appears, update the current files by targeted edits and add a changelog entry. Do not regenerate or replace the whole documentation set in a way that may drop prior requirements.

## v1.14 response discipline

When the assistant writes "fixed", "added", or "updated", it must mean:
- project files were actually updated, or
- the assistant clearly says it is only a chat-level note.

For project-critical requirements, update files and changelog immediately.
