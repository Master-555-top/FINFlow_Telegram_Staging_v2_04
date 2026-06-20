# NORMALIZED DATA TEMPLATE — FinFlow v3.0

## Purpose
All raw historical data must eventually be converted into a consistent template so FinFlow can calculate and learn reliably.

## Universal normalized record
Each imported/created record should have:

```json
{
  "id": "uuid",
  "user_id": "telegram_or_internal_user_id",
  "date": "YYYY-MM-DD",
  "time": "HH:mm or null",
  "type": "income | expense | fund_operation | shift | order | task | goal | vehicle_event | note",
  "amount": 0,
  "currency": "RUB",
  "category": "string",
  "subcategory": "string",
  "source": "manual | telegram | bank_pdf | import | ai_suggestion",
  "raw_text": "original source line",
  "confidence": 0.0,
  "status": "draft | review | confirmed | archived",
  "comment": "optional",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "deleted_at": null
}
```

## Expense-specific fields
```json
{
  "merchant": "string or null",
  "payment_account": "cash | card | drivee | other",
  "is_work_cost": true,
  "linked_shift_id": "uuid or null",
  "linked_goal_id": "uuid or null",
  "linked_fund_id": "uuid or null"
}
```

## Income-specific fields
```json
{
  "income_source": "taxi | transfer | other",
  "gross_amount": 0,
  "net_amount": 0,
  "platform": "Drivee | cash | other",
  "linked_shift_id": "uuid or null"
}
```

## Shift-specific fields
```json
{
  "start_time": "HH:mm",
  "end_time": "HH:mm",
  "gross_income": 0,
  "drivee_fee": 0,
  "fuel_cost": 0,
  "real_net": 0,
  "orders_count": 0,
  "active_minutes": 0,
  "shift_minutes": 0,
  "idle_minutes": 0,
  "sleep_hours": 0,
  "energy": 0,
  "notes": "string"
}
```

## Task/calendar-specific fields
```json
{
  "duration_minutes": 0,
  "flexibility": "fixed | flexible | optional",
  "money_impact": 0,
  "energy_impact": "low | medium | high",
  "deadline": "YYYY-MM-DD or null"
}
```

## Review principles
- Keep raw text.
- Never overwrite user-confirmed data silently.
- Use confidence score.
- Ask for review when confidence is low.
- All imported data must be editable, archivable, restorable, and exportable.
