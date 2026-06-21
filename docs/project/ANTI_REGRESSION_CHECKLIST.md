# Anti-Regression Checklist

Перед каждым изменением:

- Что меняем?
- Какие файлы затрагиваем?
- Что нельзя ломать?
- Какие расчёты зависят?
- Как проверить?

После каждого изменения:

- npm run build проходит;
- приложение запускается;
- нет Hydration failed;
- живое время работает;
- время суток работает;
- Error Log работает;
- Dashboard открывается;
- нижнее меню видно;
- стили не развалились;
- существующая логика не удалена;
- Change Log обновлён при необходимости.

Правило:

Новая функция не имеет права ломать старую.

## v2.35 Work / Taxi anti-regression notes

Do not break:
- `taxi_order`, `fuel`, `drivee_topup` record types;
- Money Engine reads of the same Daily Records;
- Sleep storage keys and 3-tab Sleep UX;
- section-scoped history rule;
- visual baseline screens locked from screenshots;
- deploy-safe exclusion of private vault/raw data/env/secrets.

When changing Work:
- keep Work → Money bridge through Daily Records;
- keep active hours separate from full shift hours;
- keep fuel and Drivee as work costs, not personal expenses;
- do not turn Work into a dev/status panel.

## v2.38 anti-regression additions

- Template Apply Engine must never write automatically without preview/confirm semantics.
- Rollback snapshots may remove only records created by the current apply operation.
- Recurring occurrence preview is not the same as scheduled cloud automation; Supabase/n8n writes remain safe-off.
- Work Shift Lifecycle must not double-count a shift aggregate as income when order-level taxi records exist.
- Work close preview must keep fuel/Drivee as work costs, not personal expenses.
- Visual baseline locked by the user remains protected: Sleep History list, 7-day Sleep chart, System grid.
