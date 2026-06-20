# REGRESSION CHECK v1.26

## Проверено

- Day Core dashboard сохранён.
- Import Review Queue сохранена.
- Review Actions Layer сохранён.
- Добавлено локальное сохранение состояния кандидатов и audit events.
- Sensitive/high risk candidates не получили авто-применение к Day Core.
- private_raw_data не подключён к UI.
- Сырые банковские данные не выводятся.
- Supabase schema добавлена как документация, без подключения реальной базы и без секретов.

## Команды проверки

```bash
npm install --ignore-scripts
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Ожидаемый результат

Build должен пройти успешно. Возможный Next.js workspace-root warning не считается ошибкой приложения.
