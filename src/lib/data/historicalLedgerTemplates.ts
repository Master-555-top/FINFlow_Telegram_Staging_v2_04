import {
  createManualHistoricalRecord,
  type HistoricalLedgerEntityKind,
  type HistoricalLedgerRecord,
  type HistoricalLedgerSection
} from '@/lib/data/privateImportBundle';

export const HISTORICAL_LEDGER_TEMPLATES_VERSION = 'historical_ledger_templates_v2_55' as const;

export type HistoricalLedgerTemplate = {
  id: string;
  version: typeof HISTORICAL_LEDGER_TEMPLATES_VERSION;
  label: string;
  section: HistoricalLedgerSection;
  entityKind: HistoricalLedgerEntityKind;
  category: string;
  defaultTitle: string;
  defaultAmount: number;
  targetAmount?: number;
  priority: 'critical' | 'high' | 'normal' | 'flexible';
  source: 'system' | 'history';
  usageCount?: number;
  reason: string;
};

export const USER_HISTORICAL_LEDGER_TEMPLATES: HistoricalLedgerTemplate[] = [
  template('tpl-money-food-personal', 'Еда / личное', 'money', 'expense', 'food', 'Еда / личное', 500, 'high', 'Быстрый личный расход без набора текста.'),
  template('tpl-money-products', 'Продукты / дом', 'money', 'expense', 'products', 'Продукты', 1000, 'high', 'Ежедневные бытовые траты отдельно от рабочих расходов.'),
  template('tpl-money-cafe', 'Кофе / кафе', 'money', 'expense', 'food_cafe', 'Кофе / кафе', 350, 'normal', 'Частые мелкие траты удобно фиксировать одной кнопкой.'),
  template('tpl-money-meeting', '❤️ Встречи / досуг', 'money', 'expense', 'meeting', 'Встречи / досуг', 1500, 'high', 'Совместные и личные встречи не должны незаметно съедать результат смены.'),
  template('tpl-money-car', '🚗 Машина / ремонт', 'money', 'expense', 'car', 'Машина / ремонт', 1000, 'high', 'Машина остаётся отдельной зоной риска и не смешивается с едой/личным.'),
  template('tpl-money-income-other', 'Доп. доход', 'money', 'income', 'other_income', 'Доп. доход', 1000, 'normal', 'Доход вне такси можно внести без ручного описания.'),

  template('tpl-work-shift-taxi', 'Смена такси', 'work', 'taxi_shift', 'taxi', 'Смена такси', 8500, 'critical', 'Агрегат смены хранится отдельно и не задваивает доход, если есть отдельные заказы.'),
  template('tpl-work-order-taxi', 'Заказ такси', 'work', 'taxi_order', 'taxi', 'Заказ такси', 500, 'critical', 'Основной точный ввод работы: отдельные заказы дают честный темп и gross.'),
  template('tpl-work-fuel', 'Заправка', 'work', 'expense', 'fuel', 'Заправка', 1800, 'critical', 'Бензин влияет на чистые со смены и должен быть рабочей издержкой.'),
  template('tpl-work-drivee', 'Drivee / комиссия', 'work', 'expense', 'drivee_topup', 'Drivee / комиссия', 1000, 'critical', 'Комиссия/пополнение Drivee отделяются от личных расходов.'),
  template('tpl-work-operating', 'Оборотка / рабочее', 'work', 'expense', 'work_operating', 'Оборотка / рабочее', 500, 'high', 'Рабочие мелочи идут в работу, а не в личные деньги.'),

  fundTemplate('tpl-fund-working', '🔰 Рабочий', 'working_fund', 'Рабочий фонд', 2500, 2500, 'critical', 'Бензин, комиссия и оборотка: поддерживать стабильный остаток.'),
  fundTemplate('tpl-fund-meetings', '❤️ Встречи', 'meetings', 'Фонд встреч', 1500, 3000, 'high', 'Оборотный фонд для досуга и совместных трат.'),
  fundTemplate('tpl-fund-base', '🎂 База', 'base_business', 'База', 3000, 10000, 'normal', 'Торты, коробки и расходники: поддерживать рабочий запас.'),
  obligationTemplate('tpl-obligation-car-payment', '🚗 Машина', 'car_payment', 'Машина', 45000, 45000, 'critical', 'Обязательный платёж/резерв по машине.'),
  obligationTemplate('tpl-obligation-bank', '🏦 Банк', 'bank', 'Банк', 15000, 15000, 'critical', 'Обязательный банковский платёж/банкротство.'),
  fundTemplate('tpl-fund-personal', '👤 Личное', 'personal', 'Личное', 1000, 0, 'high', 'Еда, одежда и бытовые расходы по ситуации.'),
  fundTemplate('tpl-fund-ulyana-birthday', '🎁 ДР Ульяны', 'ulyana_birthday', 'ДР Ульяны', 1000, 50000, 'flexible', 'Накопительная цель 50 000 ₽.'),
  fundTemplate('tpl-fund-flight-move', '✈️ Полёт / переезд', 'flight_move', 'Полёт / переезд', 5000, 300000, 'flexible', 'Накопительная цель 300 000 ₽.'),
  fundTemplate('tpl-fund-safety-cushion', '🛟 Подушка', 'safety_cushion', 'Подушка', 1000, 50000, 'flexible', 'Резерв безопасности 50 000 ₽.'),
  fundTemplate('tpl-fund-ulyana-gift', '🎁 Подарок Ульяне', 'ulyana_gift', 'Подарок Ульяне', 1000, 0, 'flexible', 'Гибкая цель: сумма задаётся по ситуации.')
];

export function buildHistoricalTemplateCatalog(records: HistoricalLedgerRecord[] = []): HistoricalLedgerTemplate[] {
  const systemTemplates = USER_HISTORICAL_LEDGER_TEMPLATES;
  const systemKeys = new Set(systemTemplates.map(templateKey));
  const historyTemplates = deriveTemplatesFromHistory(records)
    .filter(item => !systemKeys.has(templateKey(item)))
    .slice(0, 36);
  return [...systemTemplates, ...historyTemplates].sort(sortTemplates);
}

export function createHistoricalRecordFromTemplate(template: HistoricalLedgerTemplate): HistoricalLedgerRecord {
  return applyHistoricalTemplateToRecord(createManualHistoricalRecord(template.section), template, { preserveAmount: false });
}

export function applyHistoricalTemplateToRecord(
  record: HistoricalLedgerRecord,
  template: HistoricalLedgerTemplate,
  options: { preserveAmount?: boolean } = {}
): HistoricalLedgerRecord {
  const preserveAmount = options.preserveAmount ?? record.amount > 0;
  const note = appendTemplateNote(record.note, template);
  return {
    ...record,
    section: template.section,
    entityKind: template.entityKind,
    title: template.defaultTitle,
    amount: preserveAmount ? record.amount : template.defaultAmount,
    category: template.category,
    note,
    confidence: Math.max(record.confidence, template.source === 'system' ? 0.95 : 0.85),
    status: record.status === 'rejected' ? 'needs_review' : record.status,
    reviewReasons: [
      `Применён шаблон: ${template.label}`,
      ...record.reviewReasons.filter(reason => !reason.startsWith('Применён шаблон:')).slice(0, 10)
    ],
    privateLocalOnly: true
  };
}

function deriveTemplatesFromHistory(records: HistoricalLedgerRecord[]): HistoricalLedgerTemplate[] {
  const groups = new Map<string, { record: HistoricalLedgerRecord; amounts: number[]; count: number }>();
  for (const record of records) {
    if (record.status === 'rejected' || record.amount <= 0) continue;
    const title = normalizeTitle(record.title);
    if (!title || title.length < 2) continue;
    const key = [record.section, record.entityKind, record.category, title].join('|');
    const current = groups.get(key) ?? { record: { ...record, title }, amounts: [], count: 0 };
    current.amounts.push(record.amount);
    current.count += 1;
    groups.set(key, current);
  }

  return [...groups.values()]
    .filter(group => group.count >= 2)
    .sort((a, b) => b.count - a.count || median(b.amounts) - median(a.amounts))
    .map(group => ({
      id: `history-template-${stableHash(`${group.record.section}:${group.record.entityKind}:${group.record.category}:${group.record.title}`)}`,
      version: HISTORICAL_LEDGER_TEMPLATES_VERSION,
      label: group.record.title,
      section: group.record.section,
      entityKind: group.record.entityKind,
      category: group.record.category,
      defaultTitle: group.record.title,
      defaultAmount: median(group.amounts),
      priority: group.count >= 8 ? 'high' : 'normal',
      source: 'history',
      usageCount: group.count,
      reason: `Собрано из истории: ${group.count} похожих записей, сумма по медиане.`
    }));
}

function template(
  id: string,
  label: string,
  section: HistoricalLedgerSection,
  entityKind: HistoricalLedgerEntityKind,
  category: string,
  defaultTitle: string,
  defaultAmount: number,
  priority: HistoricalLedgerTemplate['priority'],
  reason: string
): HistoricalLedgerTemplate {
  return {
    id,
    version: HISTORICAL_LEDGER_TEMPLATES_VERSION,
    label,
    section,
    entityKind,
    category,
    defaultTitle,
    defaultAmount,
    priority,
    source: 'system',
    reason
  };
}

function fundTemplate(
  id: string,
  label: string,
  category: string,
  defaultTitle: string,
  defaultAmount: number,
  targetAmount: number,
  priority: HistoricalLedgerTemplate['priority'],
  reason: string
) {
  return { ...template(id, label, 'funds', 'fund', category, defaultTitle, defaultAmount, priority, reason), targetAmount };
}

function obligationTemplate(
  id: string,
  label: string,
  category: string,
  defaultTitle: string,
  defaultAmount: number,
  targetAmount: number,
  priority: HistoricalLedgerTemplate['priority'],
  reason: string
) {
  return { ...template(id, label, 'funds', 'obligation', category, defaultTitle, defaultAmount, priority, reason), targetAmount };
}

function appendTemplateNote(note: string, template: HistoricalLedgerTemplate) {
  const marker = `Шаблон: ${template.label}`;
  if (note.includes(marker)) return note;
  return [note.trim(), marker, template.targetAmount ? `Цель: ${template.targetAmount.toLocaleString('ru-RU')} ₽` : '']
    .filter(Boolean)
    .join('\n');
}

function sortTemplates(a: HistoricalLedgerTemplate, b: HistoricalLedgerTemplate) {
  const sectionRank: Record<HistoricalLedgerSection, number> = { money: 1, work: 2, funds: 3 };
  const priorityRank: Record<HistoricalLedgerTemplate['priority'], number> = { critical: 1, high: 2, normal: 3, flexible: 4 };
  return sectionRank[a.section] - sectionRank[b.section]
    || priorityRank[a.priority] - priorityRank[b.priority]
    || (b.usageCount ?? 0) - (a.usageCount ?? 0)
    || a.label.localeCompare(b.label, 'ru');
}

function templateKey(template: HistoricalLedgerTemplate) {
  return [template.section, template.entityKind, template.category, normalizeTitle(template.defaultTitle)].join('|');
}

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 80);
}

function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return Math.max(1, Math.round(value));
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
