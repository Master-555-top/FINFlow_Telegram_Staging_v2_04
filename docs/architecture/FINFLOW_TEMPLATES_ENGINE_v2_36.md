# FINFlow v2.36 — Templates Engine

Date: 2026-06-22

## Goal

v2.36 stops treating templates as scattered UI buttons. It introduces a single Templates Engine registry for:

- День;
- Деньги;
- Работа / такси;
- Фонды / обязательства;
- System import rules;
- future recurring actions.

This is not a visual redesign. The locked visual baseline remains: Sleep History list, weekly Sleep chart and System grid.

## What was added

- `src/lib/templates/finflowTemplatesEngine.ts`
  - canonical template type;
  - section grouping;
  - user-locked template seeds from known FINFlow context;
  - adapters from existing Daily Record templates;
  - adapters from Money Engine suggestions;
  - adapters from Work Taxi templates;
  - adapters from live obligations, funds and tasks;
  - readiness/recommendation snapshot.

- `src/components/templates/TemplatesEnginePanel.tsx`
  - compact card for Money/Work context;
  - full card for System → Data → Шаблоны;
  - no destructive writes;
  - no Supabase writes;
  - no private data export.

## User-known templates preserved as seeds

- Смена такси.
- Заправка 1800.
- Drivee / комиссия 1000.
- Продукты / еда.
- Машина / ремонт.
- Встреча / личное.
- Платёж за машину 45 000 ₽, due day 6.
- Банкротство / банк 15 000 ₽, due day 15.
- Рабочий фонд завтра.
- Свобода.
- Компьютер.
- Великобритания.
- Старт дня: рабочий фокус на цель.
- Импорт исторических данных через preview/dedupe/confirm/rollback.

## Anti-regression

- Existing `DAILY_RECORD_TEMPLATES` are not removed.
- Existing custom templates are still stored through the current localStorage flow.
- Sleep storage keys are untouched.
- History remains section-scoped.
- System remains a tools area, not a global history screen.
- MASTER/private/deploy-safe separation is preserved.

## Next

v2.37 should implement recurring/apply foundations:

1. enable/disable state for templates;
2. recurrence preview;
3. apply-to-record draft;
4. rollback-safe write;
5. import template sync from old user documents.
