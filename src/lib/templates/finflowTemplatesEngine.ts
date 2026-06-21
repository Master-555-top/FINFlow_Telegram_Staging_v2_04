import type { DayCoreFundInput, DayCoreInputModel, DayCoreObligationInput, DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import { DAILY_RECORD_TEMPLATES, type CustomDailyRecordTemplate, type DailyRecord, type DailyRecordCategoryTemplate, type DailyRecordType } from '@/lib/day-core/dailyRecordsModel';
import { MONEY_TEMPLATE_SUGGESTIONS, type MoneyDirection } from '@/lib/money/moneyEngine';
import { WORK_TAXI_TEMPLATES } from '@/lib/work/workTaxiEngine';

export const FINFLOW_TEMPLATES_ENGINE_VERSION = 'templates_engine_v2_38' as const;

export type FinflowTemplateSection = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system';
export type FinflowTemplateKind = 'quick_record' | 'shift' | 'expense' | 'income' | 'obligation' | 'fund' | 'task' | 'recurring' | 'import_rule';
export type FinflowTemplatePriority = 'critical' | 'high' | 'normal' | 'flexible';
export type FinflowTemplateCadence = 'manual' | 'daily' | 'weekly' | 'monthly' | 'deadline' | 'contextual';
export type FinflowTemplateReadiness = 'ready_local' | 'needs_confirmation' | 'planned';

export type FinflowTemplateDefinition = {
  id: string;
  label: string;
  section: FinflowTemplateSection;
  kind: FinflowTemplateKind;
  priority: FinflowTemplatePriority;
  cadence: FinflowTemplateCadence;
  defaultAmount?: number;
  defaultTitle?: string;
  category?: string;
  recordType?: DailyRecordType;
  direction?: MoneyDirection;
  dueDayOfMonth?: number;
  targetAmount?: number;
  action: string;
  reason: string;
  readiness: FinflowTemplateReadiness;
  userLocked?: boolean;
};

export type FinflowTemplateGroup = {
  id: FinflowTemplateSection | 'recurring';
  title: string;
  summary: string;
  templates: FinflowTemplateDefinition[];
  readyCount: number;
  needsConfirmationCount: number;
  plannedCount: number;
};

export type FinflowTemplateRecommendation = {
  id: string;
  level: 'green' | 'amber' | 'red';
  title: string;
  message: string;
};

export type FinflowTemplatesSnapshot = {
  version: typeof FINFLOW_TEMPLATES_ENGINE_VERSION;
  generatedAtIso: string;
  totalTemplates: number;
  readyLocalTemplates: number;
  customTemplates: number;
  recurringTemplates: number;
  percentReady: number;
  nextAction: string;
  groups: FinflowTemplateGroup[];
  recommendations: FinflowTemplateRecommendation[];
  quickRecordTemplates: FinflowTemplateDefinition[];
  allTemplates: FinflowTemplateDefinition[];
  syncNotes: string[];
};

export const USER_LOCKED_TEMPLATE_SEEDS: FinflowTemplateDefinition[] = [
  {
    id: 'tpl-work-shift-taxi-day',
    label: 'Смена такси',
    section: 'work',
    kind: 'shift',
    priority: 'critical',
    cadence: 'daily',
    defaultAmount: 8500,
    defaultTitle: 'Смена такси',
    category: 'taxi',
    recordType: 'taxi_order',
    direction: 'income',
    action: 'Создать рабочий день/смену и связать её с Деньгами и Днём.',
    reason: 'Главный ежедневный источник дохода и база для расчёта целей.',
    readiness: 'needs_confirmation',
    userLocked: true
  },
  {
    id: 'tpl-work-fuel-1800',
    label: 'Заправка 1800',
    section: 'work',
    kind: 'expense',
    priority: 'critical',
    cadence: 'daily',
    defaultAmount: 1800,
    defaultTitle: 'Заправка',
    category: 'fuel',
    recordType: 'fuel',
    direction: 'work_cost',
    action: 'Добавить рабочую издержку, а не личную трату.',
    reason: 'Бензин влияет на чистый доход такси и не должен смешиваться с бытовыми расходами.',
    readiness: 'ready_local',
    userLocked: true
  },
  {
    id: 'tpl-work-drivee-1000',
    label: 'Drivee / комиссия 1000',
    section: 'work',
    kind: 'expense',
    priority: 'critical',
    cadence: 'daily',
    defaultAmount: 1000,
    defaultTitle: 'Drivee / комиссия',
    category: 'drivee_topup',
    recordType: 'drivee_topup',
    direction: 'work_cost',
    action: 'Зафиксировать рабочее движение Drivee отдельно от личных расходов.',
    reason: 'Комиссию/пополнение нужно отделять, чтобы чистые деньги считались честно.',
    readiness: 'ready_local',
    userLocked: true
  },
  {
    id: 'tpl-money-products',
    label: 'Продукты / еда',
    section: 'money',
    kind: 'expense',
    priority: 'high',
    cadence: 'daily',
    defaultAmount: 700,
    defaultTitle: 'Продукты / еда',
    category: 'products',
    recordType: 'expense',
    direction: 'personal_expense',
    action: 'Быстро добавить ежедневный расход на еду.',
    reason: 'Пользователь просил отдельную категорию продуктов и ежедневный контроль трат.',
    readiness: 'ready_local',
    userLocked: true
  },
  {
    id: 'tpl-money-car',
    label: 'Машина / ремонт',
    section: 'money',
    kind: 'expense',
    priority: 'high',
    cadence: 'contextual',
    defaultAmount: 1000,
    defaultTitle: 'Машина',
    category: 'car',
    recordType: 'expense',
    direction: 'personal_expense',
    action: 'Фиксировать траты на машину отдельно от работы.',
    reason: 'Машина является рабочим активом и личной зоной риска одновременно.',
    readiness: 'ready_local',
    userLocked: true
  },
  {
    id: 'tpl-money-meeting',
    label: 'Встреча / личное',
    section: 'money',
    kind: 'expense',
    priority: 'high',
    cadence: 'contextual',
    defaultAmount: 1500,
    defaultTitle: 'Встреча',
    category: 'meeting',
    recordType: 'expense',
    direction: 'personal_expense',
    action: 'Добавить личный расход и учесть его в дневном плане.',
    reason: 'Личные встречи не должны незаметно съедать рабочий результат дня.',
    readiness: 'ready_local',
    userLocked: true
  },
  {
    id: 'tpl-obligation-car-payment',
    label: 'Платёж за машину',
    section: 'funds',
    kind: 'obligation',
    priority: 'critical',
    cadence: 'monthly',
    defaultAmount: 45000,
    defaultTitle: 'Платёж за машину',
    dueDayOfMonth: 6,
    action: 'Держать обязательство в Фондах/Деньгах и считать давление до 6 числа.',
    reason: 'Фиксированное обязательство пользователя: 45 000 ₽ каждый месяц 6 числа.',
    readiness: 'needs_confirmation',
    userLocked: true
  },
  {
    id: 'tpl-obligation-bankruptcy',
    label: 'Банкротство / банк',
    section: 'funds',
    kind: 'obligation',
    priority: 'critical',
    cadence: 'monthly',
    defaultAmount: 15000,
    defaultTitle: 'Банкротство / банк',
    dueDayOfMonth: 15,
    action: 'Держать обязательство в Фондах/Деньгах и считать давление до 15 числа.',
    reason: 'Фиксированное обязательство пользователя: 15 000 ₽ каждый месяц 15 числа.',
    readiness: 'needs_confirmation',
    userLocked: true
  },
  {
    id: 'tpl-fund-working-tomorrow',
    label: 'Рабочий фонд завтра',
    section: 'funds',
    kind: 'fund',
    priority: 'critical',
    cadence: 'daily',
    defaultAmount: 3000,
    defaultTitle: 'Рабочий фонд завтра',
    targetAmount: 3000,
    action: 'Резервировать деньги на следующий рабочий день.',
    reason: 'Чтобы не начинать смену без топлива/еды/минимального резерва.',
    readiness: 'needs_confirmation',
    userLocked: true
  },
  {
    id: 'tpl-fund-freedom',
    label: 'Свобода',
    section: 'funds',
    kind: 'fund',
    priority: 'high',
    cadence: 'deadline',
    defaultTitle: 'Свобода',
    action: 'Копить деньги на свободу решений, переезд и запас манёвра.',
    reason: 'Один из пользовательских долгосрочных фондов.',
    readiness: 'planned',
    userLocked: true
  },
  {
    id: 'tpl-fund-computer',
    label: 'Компьютер',
    section: 'funds',
    kind: 'fund',
    priority: 'high',
    cadence: 'deadline',
    defaultTitle: 'Компьютер',
    action: 'Копить на сильный компьютер для проектов, обучения и дохода.',
    reason: 'Пользователь отдельно хочет крутой компьютер как инструмент роста.',
    readiness: 'planned',
    userLocked: true
  },
  {
    id: 'tpl-fund-uk',
    label: 'Великобритания',
    section: 'funds',
    kind: 'fund',
    priority: 'high',
    cadence: 'deadline',
    defaultTitle: 'Великобритания',
    action: 'Копить и планировать будущий переезд/полёт.',
    reason: 'Долгосрочная цель пользователя — улететь в Великобританию.',
    readiness: 'planned',
    userLocked: true
  },
  {
    id: 'tpl-day-start-focus',
    label: 'Старт дня: 10 000 ₽',
    section: 'day',
    kind: 'task',
    priority: 'critical',
    cadence: 'daily',
    defaultTitle: 'Рабочий фокус дня',
    action: 'Собрать день вокруг цели, смены, еды, отдыха и обязательств.',
    reason: 'Пользователь хочет меньше распыления и фокус на своей цели дня.',
    readiness: 'planned',
    userLocked: true
  },

  {
    id: 'tpl-import-manual-taxi-orders',
    label: 'Импорт: журнал заказов такси',
    section: 'work',
    kind: 'import_rule',
    priority: 'critical',
    cadence: 'manual',
    action: 'Принять ручной дневник заказов: дата → цель → начало/конец → заказы → грязный итог → preview/confirm/rollback.',
    reason: 'Пользователь показал свой основной формат заполнения заказов: FINFlow должен понимать его без ручного переписывания.',
    readiness: 'needs_confirmation',
    userLocked: true
  },
  {
    id: 'tpl-import-money-text',
    label: 'Импорт: деньги текстом',
    section: 'system',
    kind: 'import_rule',
    priority: 'high',
    cadence: 'manual',
    action: 'Принять исторический текст/таблицу в preview, dedupe и ручное подтверждение.',
    reason: 'Исторические данные нельзя писать напрямую без проверки и rollback.',
    readiness: 'needs_confirmation',
    userLocked: true
  }
];

export function buildTemplatesEngineSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  nowIso?: string;
}): FinflowTemplatesSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const derived = [
    ...USER_LOCKED_TEMPLATE_SEEDS,
    ...deriveDailyRecordTemplates(),
    ...deriveMoneyTemplates(),
    ...deriveWorkTemplates(),
    ...deriveCustomTemplates(input.customTemplates),
    ...deriveObligationTemplates(input.dayInput.obligations),
    ...deriveFundTemplates(input.dayInput.funds),
    ...deriveTaskTemplates(input.dayInput.tasks)
  ];

  const templates = uniqueTemplates(derived);
  const groups = buildGroups(templates);
  const readyLocalTemplates = templates.filter(template => template.readiness === 'ready_local').length;
  const customTemplates = input.customTemplates.length;
  const recurringTemplates = templates.filter(template => template.cadence !== 'manual' && template.cadence !== 'contextual').length;
  const percentReady = templates.length ? Math.round((readyLocalTemplates / templates.length) * 100) : 0;
  const recommendations = buildRecommendations({ templates, records: input.records, customTemplates, dayInput: input.dayInput });

  return {
    version: FINFLOW_TEMPLATES_ENGINE_VERSION,
    generatedAtIso: nowIso,
    totalTemplates: templates.length,
    readyLocalTemplates,
    customTemplates,
    recurringTemplates,
    percentReady,
    nextAction: buildNextAction(percentReady, customTemplates, input.records.length),
    groups,
    recommendations,
    quickRecordTemplates: templates.filter(template => template.recordType).slice(0, 12),
    allTemplates: templates,
    syncNotes: [
      'Templates Engine v2.38 не заменяет старые быстрые кнопки — он собирает их в единый registry и даёт apply preview.',
      'Пользовательские старые шаблоны можно досинхронизировать из документов без переписывания модели.',
      'Повторения теперь имеют local-first preview/apply foundation; Supabase writes остаются safe-off до RLS-проверок.'
    ]
  };
}

function deriveDailyRecordTemplates(): FinflowTemplateDefinition[] {
  return DAILY_RECORD_TEMPLATES.map(template => ({
    id: `daily-record-${template.id}`,
    label: template.label,
    section: template.type === 'taxi_order' || template.type === 'fuel' || template.type === 'drivee_topup' ? 'work' : 'money',
    kind: template.type === 'income' ? 'income' : template.type === 'taxi_order' ? 'quick_record' : 'expense',
    priority: template.priority,
    cadence: 'manual',
    defaultAmount: template.defaultAmount,
    defaultTitle: template.defaultTitle,
    category: template.category,
    recordType: template.type,
    direction: mapRecordTypeToDirection(template.type),
    action: `Создать запись: ${template.defaultTitle} ${template.defaultAmount.toLocaleString('ru-RU')} ₽.`,
    reason: 'Существующая быстрая кнопка Daily Records, сохранена без регрессии.',
    readiness: 'ready_local'
  }));
}

function deriveMoneyTemplates(): FinflowTemplateDefinition[] {
  return MONEY_TEMPLATE_SUGGESTIONS.map(template => ({
    id: `money-${template.id}`,
    label: template.label,
    section: template.direction === 'income' || template.direction === 'work_cost' ? 'work' : 'money',
    kind: template.direction === 'income' ? 'income' : 'expense',
    priority: template.direction === 'work_cost' ? 'critical' : 'normal',
    cadence: 'manual',
    defaultAmount: template.defaultAmount,
    defaultTitle: template.label,
    category: template.category,
    recordType: mapDirectionToRecordType(template.direction),
    direction: template.direction,
    action: `Подготовить запись из Money Engine: ${template.label}.`,
    reason: template.reason,
    readiness: 'ready_local'
  }));
}

function deriveWorkTemplates(): FinflowTemplateDefinition[] {
  return WORK_TAXI_TEMPLATES.map(template => ({
    id: `work-${template.id}`,
    label: template.label,
    section: 'work',
    kind: template.kind === 'shift' ? 'shift' : template.kind === 'order' ? 'quick_record' : 'expense',
    priority: template.kind === 'fuel' || template.kind === 'commission' ? 'critical' : 'normal',
    cadence: 'manual',
    defaultAmount: template.amount,
    defaultTitle: template.label,
    category: template.kind === 'fuel' ? 'fuel' : template.kind === 'commission' ? 'drivee_topup' : 'taxi',
    recordType: template.kind === 'fuel' ? 'fuel' : template.kind === 'commission' ? 'drivee_topup' : 'taxi_order',
    direction: template.kind === 'order' || template.kind === 'shift' ? 'income' : 'work_cost',
    action: `Быстрый ввод работы: ${template.label}.`,
    reason: template.reason,
    readiness: 'ready_local'
  }));
}

function deriveCustomTemplates(templates: CustomDailyRecordTemplate[]): FinflowTemplateDefinition[] {
  return templates.map(template => ({
    id: `custom-${template.id}`,
    label: template.label,
    section: template.type === 'taxi_order' || template.type === 'fuel' || template.type === 'drivee_topup' ? 'work' : 'money',
    kind: template.type === 'income' ? 'income' : template.type === 'taxi_order' ? 'quick_record' : 'expense',
    priority: template.priority,
    cadence: 'manual',
    defaultAmount: template.defaultAmount,
    defaultTitle: template.defaultTitle,
    category: template.category,
    recordType: template.type,
    direction: mapRecordTypeToDirection(template.type),
    action: `Пользовательский шаблон: ${template.defaultTitle}.`,
    reason: `Создан пользователем ${new Date(template.createdAt).toLocaleDateString('ru-RU')}.`,
    readiness: 'ready_local',
    userLocked: true
  }));
}

function deriveObligationTemplates(obligations: DayCoreObligationInput[]): FinflowTemplateDefinition[] {
  return obligations.map(obligation => ({
    id: `obligation-live-${obligation.id}`,
    label: obligation.title,
    section: 'funds',
    kind: 'obligation',
    priority: obligation.priority,
    cadence: 'monthly',
    defaultAmount: obligation.amountDue,
    defaultTitle: obligation.title,
    dueDayOfMonth: obligation.dueDayOfMonth,
    action: `Контролировать обязательство до ${obligation.dueDayOfMonth} числа.`,
    reason: `Осталось ${(Math.max(0, obligation.amountDue - obligation.currentSaved)).toLocaleString('ru-RU')} ₽.`,
    readiness: obligation.currentSaved >= obligation.amountDue ? 'ready_local' : 'needs_confirmation'
  }));
}

function deriveFundTemplates(funds: DayCoreFundInput[]): FinflowTemplateDefinition[] {
  return funds.map(fund => ({
    id: `fund-live-${fund.id}`,
    label: fund.title,
    section: 'funds',
    kind: 'fund',
    priority: fund.priority,
    cadence: fund.deadline ? 'deadline' : 'contextual',
    targetAmount: fund.targetAmount,
    defaultTitle: fund.title,
    action: fund.canReceiveToday ? 'Может получить распределение сегодня.' : 'Пока не основной получатель денег сегодня.',
    reason: `${fund.currentAmount.toLocaleString('ru-RU')} ₽ из ${fund.targetAmount.toLocaleString('ru-RU')} ₽.`,
    readiness: fund.canReceiveToday ? 'needs_confirmation' : 'planned'
  }));
}

function deriveTaskTemplates(tasks: DayCoreTaskInput[]): FinflowTemplateDefinition[] {
  return tasks.map(task => ({
    id: `task-live-${task.id}`,
    label: task.title,
    section: 'day',
    kind: 'task',
    priority: task.priority,
    cadence: task.plannedToday ? 'daily' : 'contextual',
    defaultAmount: task.moneyCost,
    defaultTitle: task.title,
    category: task.type,
    action: task.plannedToday ? 'Учитывать в плане дня.' : 'Держать как контекстный сценарий.',
    reason: `${task.timeCostMinutes} мин · ${task.moneyCost.toLocaleString('ru-RU')} ₽.`,
    readiness: task.plannedToday ? 'ready_local' : 'planned'
  }));
}

function buildGroups(templates: FinflowTemplateDefinition[]): FinflowTemplateGroup[] {
  const groupMeta: Record<FinflowTemplateGroup['id'], { title: string; summary: string }> = {
    day: { title: 'День', summary: 'План, дела, еда, встречи и фокус дня.' },
    money: { title: 'Деньги', summary: 'Доходы, расходы, категории и быстрые траты.' },
    work: { title: 'Работа', summary: 'Такси, заказы, бензин, Drivee и смены.' },
    funds: { title: 'Фонды', summary: 'Обязательства, цели, резервы и дедлайны.' },
    sleep: { title: 'Сон', summary: 'Пока без отдельного template layer: sleep keys не меняем.' },
    ai: { title: 'AI', summary: 'Будущие шаблоны запросов и советов по контексту.' },
    system: { title: 'Система', summary: 'Импорт, backup, cloud и service-действия.' },
    recurring: { title: 'Повторения', summary: 'Ежедневные, еженедельные, ежемесячные и дедлайн-сценарии.' }
  };

  const sections: FinflowTemplateGroup['id'][] = ['day', 'money', 'work', 'funds', 'system', 'recurring'];
  return sections.map(section => {
    const sectionTemplates = section === 'recurring'
      ? templates.filter(template => template.cadence !== 'manual' && template.cadence !== 'contextual')
      : templates.filter(template => template.section === section);
    return {
      id: section,
      title: groupMeta[section].title,
      summary: groupMeta[section].summary,
      templates: sectionTemplates,
      readyCount: sectionTemplates.filter(template => template.readiness === 'ready_local').length,
      needsConfirmationCount: sectionTemplates.filter(template => template.readiness === 'needs_confirmation').length,
      plannedCount: sectionTemplates.filter(template => template.readiness === 'planned').length
    };
  }).filter(group => group.templates.length > 0);
}

function buildRecommendations(input: {
  templates: FinflowTemplateDefinition[];
  records: DailyRecord[];
  customTemplates: number;
  dayInput: DayCoreInputModel;
}): FinflowTemplateRecommendation[] {
  const recommendations: FinflowTemplateRecommendation[] = [];
  const hasFuelToday = input.records.some(record => record.enabled && record.type === 'fuel');
  const hasTaxiToday = input.records.some(record => record.enabled && record.type === 'taxi_order');
  const hasCustom = input.customTemplates > 0;
  const criticalRecurring = input.templates.filter(template => template.cadence === 'monthly' && template.priority === 'critical').length;

  recommendations.push({
    id: 'core-template-registry',
    level: 'green',
    title: 'Registry собран',
    message: `${input.templates.length} шаблон(ов): старые быстрые кнопки, деньги, работа, фонды и повторения теперь видны как единая система.`
  });

  if (!hasTaxiToday) {
    recommendations.push({ id: 'no-taxi-today', level: 'amber', title: 'Нет заказов сегодня', message: 'Шаблоны заказов готовы, но для сильной аналитики нужно вводить отдельные заказы или агрегат смены.' });
  }
  if (!hasFuelToday) {
    recommendations.push({ id: 'no-fuel-today', level: 'amber', title: 'Бензин не зафиксирован', message: 'Рабочая издержка бензина должна попадать в Работа/Деньги, а не в личные траты.' });
  }
  if (!hasCustom) {
    recommendations.push({ id: 'no-custom-templates', level: 'amber', title: 'Нет своих шаблонов', message: 'Когда пользователь пришлёт старые документы, их можно досинхронизировать без смены модели.' });
  }
  if (criticalRecurring >= 2) {
    recommendations.push({ id: 'critical-recurring', level: 'red', title: 'Обязательства', message: 'Машина и банкротство должны стать monthly templates с напоминанием, давлением по дням и rollback-safe записью.' });
  }

  return recommendations.slice(0, 5);
}

function buildNextAction(percentReady: number, customTemplates: number, recordsCount: number) {
  if (percentReady < 45) return 'Сначала подтвердить ключевые повторяющиеся шаблоны: машина, банкротство, рабочий фонд, бензин, Drivee.';
  if (customTemplates === 0) return 'Можно работать дальше на встроенных шаблонах, а старые документы подключить отдельным sync-проходом.';
  if (recordsCount < 3) return 'Начать применять шаблоны в реальные записи дня, чтобы Деньги/Работа считались живо.';
  return 'Следующий шаг: recurrence + подтверждённая запись шаблонов в local store, затем Supabase-safe sync.';
}

function uniqueTemplates(templates: FinflowTemplateDefinition[]) {
  const seen = new Set<string>();
  const result: FinflowTemplateDefinition[] = [];
  for (const template of templates) {
    const key = `${template.section}:${template.kind}:${template.label}:${template.defaultAmount ?? 0}:${template.category ?? ''}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(template);
  }
  return result;
}

function mapRecordTypeToDirection(type: DailyRecordType): MoneyDirection {
  if (type === 'taxi_order' || type === 'income') return 'income';
  if (type === 'fuel' || type === 'drivee_topup') return 'work_cost';
  return 'personal_expense';
}

function mapDirectionToRecordType(direction: MoneyDirection): DailyRecordType | undefined {
  if (direction === 'income') return 'income';
  if (direction === 'work_cost') return 'fuel';
  if (direction === 'personal_expense') return 'expense';
  return undefined;
}
