export type ImportSourceType = 'bank_statement' | 'taxi_log' | 'expense_text' | 'income_text' | 'chat_context' | 'manual_backfill';

export type ImportCandidateStatus = 'new' | 'needs_review' | 'approved' | 'rejected' | 'merged' | 'archived';

export type ImportCandidateRisk = 'low' | 'medium' | 'high' | 'sensitive';

export type ImportCandidateEntity = 'expense' | 'income' | 'taxi_shift' | 'taxi_order' | 'fund' | 'obligation' | 'day_note' | 'unknown';

export type ImportCandidate = {
  id: string;
  sourceId: string;
  sourceType: ImportSourceType;
  entityType: ImportCandidateEntity;
  status: ImportCandidateStatus;
  risk: ImportCandidateRisk;
  confidence: number;
  date?: string;
  amount?: number;
  title: string;
  proposedCategory?: string;
  proposedDayId?: string;
  rawExcerptRedacted: string;
  reviewReason: string;
  duplicateCandidateIds: string[];
  targetAction: 'create' | 'update' | 'merge' | 'ignore' | 'needs_manual_decision';
};

export type ImportReviewQueue = {
  schemaVersion: 'import_review_queue_v1_24' | 'import_review_queue_v1_26' | 'import_review_queue_v1_27' | 'import_review_queue_v1_28';
  queueId: string;
  createdAt: string;
  sourcePackage: string;
  candidates: ImportCandidate[];
};

export type ImportReviewQueueSummary = {
  total: number;
  needsReview: number;
  approved: number;
  blockedSensitive: number;
  highRisk: number;
  byEntityType: Record<ImportCandidateEntity, number>;
};

export const importReviewQueueMock: ImportReviewQueue = {
  schemaVersion: 'import_review_queue_v1_28',
  queueId: 'source05-demo-review-queue',
  createdAt: '2026-06-17T00:00:00+12:00',
  sourcePackage: 'FINFlow_v3_Latest_Working_Package_v1_28.zip',
  candidates: [
    {
      id: 'candidate-bank-fuel-001',
      sourceId: 'source03-bank-statement',
      sourceType: 'bank_statement',
      entityType: 'expense',
      status: 'needs_review',
      risk: 'sensitive',
      confidence: 0.82,
      amount: 2000,
      title: 'АЗС / топливо',
      proposedCategory: 'Работа / Заправка',
      proposedDayId: 'demo-2026-06-17',
      rawExcerptRedacted: 'АЗС • сумма скрыта/округлена • персональные данные удалены',
      reviewReason: 'Банковская операция может быть рабочим топливом, но требует подтверждения дня и назначения.',
      duplicateCandidateIds: [],
      targetAction: 'needs_manual_decision'
    },
    {
      id: 'candidate-taxi-shift-001',
      sourceId: 'source05-text14',
      sourceType: 'taxi_log',
      entityType: 'taxi_shift',
      status: 'needs_review',
      risk: 'medium',
      confidence: 0.76,
      amount: 11000,
      title: 'Смена такси / грязный доход',
      proposedCategory: 'Такси / Смена',
      proposedDayId: 'demo-2026-06-17',
      rawExcerptRedacted: 'цель 11 000 грязными / 8 500 чистыми',
      reviewReason: 'Нужно отделить целевые значения от фактической смены.',
      duplicateCandidateIds: [],
      targetAction: 'needs_manual_decision'
    },
    {
      id: 'candidate-obligation-car-001',
      sourceId: 'source05-semantic-review',
      sourceType: 'chat_context',
      entityType: 'obligation',
      status: 'new',
      risk: 'low',
      confidence: 0.95,
      amount: 45000,
      title: 'Платёж за машину до 6 числа',
      proposedCategory: 'Обязательства',
      rawExcerptRedacted: '45 000 ₽ за машину к каждому 6 числу',
      reviewReason: 'Каноническое обязательство, но перед записью нужно подтвердить текущий статус оплаты.',
      duplicateCandidateIds: [],
      targetAction: 'create'
    },
    {
      id: 'candidate-fund-meetings-001',
      sourceId: 'source05-semantic-review',
      sourceType: 'chat_context',
      entityType: 'fund',
      status: 'new',
      risk: 'low',
      confidence: 0.9,
      amount: 3000,
      title: 'Фонд встреч 2 000–3 000 ₽',
      proposedCategory: 'Фонды / Отношения',
      rawExcerptRedacted: 'встречи примерно 5 раз в неделю, держать 2 000–3 000 ₽',
      reviewReason: 'Нужно подтвердить целевой баланс и режим пополнения.',
      duplicateCandidateIds: [],
      targetAction: 'create'
    }
  ]
};

export function summarizeImportReviewQueue(queue: ImportReviewQueue): ImportReviewQueueSummary {
  const byEntityType = queue.candidates.reduce((acc, candidate) => {
    acc[candidate.entityType] = (acc[candidate.entityType] ?? 0) + 1;
    return acc;
  }, {} as Record<ImportCandidateEntity, number>);

  return {
    total: queue.candidates.length,
    needsReview: queue.candidates.filter(candidate => candidate.status === 'needs_review' || candidate.targetAction === 'needs_manual_decision').length,
    approved: queue.candidates.filter(candidate => candidate.status === 'approved').length,
    blockedSensitive: queue.candidates.filter(candidate => candidate.risk === 'sensitive').length,
    highRisk: queue.candidates.filter(candidate => candidate.risk === 'high' || candidate.risk === 'sensitive').length,
    byEntityType
  };
}

export function canAutoApplyCandidate(candidate: ImportCandidate): boolean {
  if (candidate.risk === 'sensitive' || candidate.risk === 'high') return false;
  if (candidate.confidence < 0.9) return false;
  if (candidate.duplicateCandidateIds.length > 0) return false;
  return candidate.status === 'approved' && candidate.targetAction !== 'needs_manual_decision';
}

export function getRiskLabel(risk: ImportCandidateRisk): string {
  if (risk === 'sensitive') return 'личные/банковские данные';
  if (risk === 'high') return 'высокий риск ошибки';
  if (risk === 'medium') return 'нужна проверка';
  return 'низкий риск';
}
