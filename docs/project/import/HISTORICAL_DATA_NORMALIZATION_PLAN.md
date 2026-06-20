# HISTORICAL DATA NORMALIZATION PLAN

Цель: привести старые данные по доходам, расходам, сменам, фондам, задачам и банковским операциям к единому шаблону FinFlow.

## Источники

1. Telegram-история расходов: My spends / My spends daily.
2. Telegram-история доходов и смен: Indriver / Drivee / Work.
3. Банковская выписка Т-Банк.
4. Ручные заметки из чата.
5. Старые документы проекта.

## Pipeline

```text
raw_source
→ import_batch
→ raw_record
→ parser_result
→ normalized_candidate
→ review_queue
→ user_confirmed_record
→ production tables
→ statistics / AI memory
```

## Почему нужна очередь проверки

Старые записи смешивают:
- реальные траты;
- промежуточные суммы;
- итоги дня;
- комментарии;
- цели;
- примеры расчётов;
- личные данные;
- банковские переводы;
- рабочие расходы;
- помощь девушке;
- фонды.

Поэтому приложение не должно автоматически доверять каждому числу. Оно должно показывать кандидаты и confidence.

## Единый шаблон расхода

```json
{
  "type": "expense",
  "date": "YYYY-MM-DD",
  "time": "HH:mm|null",
  "amount": 0,
  "currency": "RUB",
  "category": "Работа|Продукты|Машина|Ульяна|Встречи|База|Личное|Банк|Прочее",
  "subcategory": "Заправка|Drivee|Комиссия|Еда|Ремонт|...",
  "source": "telegram|bank_pdf|manual",
  "raw_name": "original text",
  "linked_fund": "optional",
  "confidence": 0.0,
  "needs_review": true
}
```

## Единый шаблон дохода

```json
{
  "type": "income",
  "date": "YYYY-MM-DD",
  "time": "HH:mm|null",
  "amount_gross": 0,
  "amount_net": null,
  "source": "taxi|transfer|other|bank_transfer|manual",
  "orders_count": null,
  "shift_id": null,
  "confidence": 0.0,
  "needs_review": true
}
```

## Единый шаблон смены

```json
{
  "type": "shift",
  "date": "YYYY-MM-DD",
  "start_time": "HH:mm|null",
  "end_time": "HH:mm|null",
  "gross": 0,
  "net": null,
  "fuel_cost": null,
  "commission_cost": null,
  "orders": [],
  "active_minutes": null,
  "shift_minutes": null,
  "sleep_hours": null,
  "energy": null,
  "notes": ""
}
```

## Обязательные категории для старых расходов

- 🔰 Работа / Заправка
- 🔰 Работа / Drivee или Indriver комиссия
- 🍕 Продукты
- 🚗 Машина / ремонт / масло / шиномонтаж / запчасти
- ❤️ Встречи
- 🎂 База
- 💟 Ульяна / помощь / подарки
- 🏦 Банк / банкротство
- 👤 Личное
- 🛒 Прочее

## Исторические рабочие расходы

Все записи вида `Indriver`, `Drivee`, `🔰 Indriver`, `🔰 Заправка`, `АЗС`, `FILIAL AZS`, `SP_AVTO`, `комиссия` должны попадать в рабочие расходы и влиять на Taxi Cost Model.

## Правило

Исторические данные — не просто архив. Они нужны, чтобы FinFlow учился:
- средний бензин в день;
- средняя комиссия;
- сильные/слабые дни;
- реальный дневной лимит;
- реальные расходы на отношения, еду, машину;
- риск кассового разрыва;
- зависимость режима и дохода.
