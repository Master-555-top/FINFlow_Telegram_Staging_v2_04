# FinFlow v3.0 — Current Context v0.3

## Главный смысл

FinFlow — это личный AI-диспетчер денег, времени, такси, машины, фондов и целей.

Главный вопрос:

> Что мне делать сегодня, чтобы не начинать завтра с нуля, закрывать обязательства, сохранять машину, создавать подушку, помогать близким и постепенно выходить в более сильную жизнь?

## Главные модули конечной версии

1. Dashboard
2. Money Core
3. Daily Money Planner
4. Taxi / Work Core
5. Taxi Cost Model
6. Vehicle / Car Assistant
7. Funds / Stability Core
8. Dynamic Goals / Mini-goals
9. Calendar / Time Planner
10. AI Core via n8n
11. Import Center
12. Export Center
13. Settings
14. Error Log / Dev Tools

## Текущие реальные параметры такси

- Машина: Toyota Premio 2007
- Двигатель: 1.8
- Топливо: АИ-92
- Цена литра: 75,51 ₽
- Расход: 11–13 л / 100 км
- Пробег в день: 80–150 км
- Drivee: примерно 13% от грязного дохода по примерам пользователя
- Обычно пополнение Drivee: 350 ₽, минимум 120 ₽
- Масло: замена просрочена, 12 000+ км
- Желательный интервал масла: каждые 5 000–6 000 км
- Замена масла: 6 000–7 000 ₽
- Долив масла: около 1 л в неделю
- Ходовая: плохое состояние, требуется ремонт примерно 50 000 ₽
- Нужны: линьки, передние колодки, задние стойки, возможно шаровые, развал, летняя резина

## Текущие фонды и цели

Стартовая ситуация: фонды по 0 ₽.

Фонды и цели:

- Рабочий фонд
- Фонд встреч
- База для работы девушки
- Машина / платёж
- Банк / банкротство
- Личное
- Подушка
- Переезд 300 000 ₽
- ДР Ульяны 50 000 ₽
- Ремонт ходовой 50 000 ₽
- Масло 6 000–7 000 ₽
- Временные мини-цели

## Главная формула дня

Нужно грязными сегодня = рабочие издержки + обязательства + фонды + цели + мини-цели + еда/личное - текущие доступные деньги.

## Реалистичность дня

FinFlow должен учитывать 24 часа, текущее время, сон, еду, дела, дорогу, отдых и физический дневной предел.

Пользователь считает реалистичным максимумом около 10 000 ₽ чистыми в день. Если план выше, система должна предлагать перераспределение, а не давить.

## Smart Allocation

FinFlow не должен всегда распределять деньги равными маленькими суммами во все фонды. Иногда лучше направить 3 000–5 000 ₽ в критичную цель, чем размазать по 250 ₽.

Режимы:

- Equal / равномерный
- Priority / по дедлайнам
- Recovery Mode
- Emergency Mode
- Buffer Build Mode
- Goal Sprint Mode

## AI

AI должен не просто отвечать, а анализировать историю, текущие деньги, фонды, такси, машину, календарь, цели и выдавать решение дня.

AI работает через n8n после появления стабильного Data Core.

## Current context update — v2.35

FINFlow now has a Work / Taxi Engine foundation.

Implemented:
- `src/lib/work/workTaxiEngine.ts`
- `src/components/work/WorkTaxiEnginePanel.tsx`
- Work section now shows shift snapshot, active/shift ₽ per hour, fuel, Drivee commission estimate, remaining gross to target, and Work → Money → Day → Sleep bridge.

The ideal visual baseline from the user's previous screenshots remains locked:
- Sleep History list;
- Sleep 7-day chart;
- System grid.

Current progress estimate after v2.35:
- about 59% ready;
- about 41% remaining before a strong fully working mini app.

Next recommended build:
v2.36 — Templates Engine for money, work, funds, day and recurring actions.
