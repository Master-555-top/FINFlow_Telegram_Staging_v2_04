import { normalizeHistoryDate } from '@/lib/data/finflowHistoryEngine';
import { parseManualTaxiOrderLog, type ParsedTaxiOrderLogShift } from '@/lib/work/taxiOrderLogParser';

export const HISTORICAL_IMPORT_DRAFT_VERSION = 'historical_import_draft_v2_37' as const;

export type HistoricalImportTargetSection = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'unknown';

export type HistoricalImportDraftItemMetadata = {
  importKind?: 'generic_line' | 'manual_taxi_shift' | 'manual_taxi_order';
  sourceFormat?: string;
  orderIndex?: number;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  activeMinutes?: number | null;
  fullShiftMinutes?: number | null;
  idleMinutes?: number | null;
  routeRaw?: string;
  fromRaw?: string;
  toRaw?: string;
  grossFromOrders?: number | null;
  grossDeclared?: number | null;
  targetGrossMin?: number | null;
  netDeclared?: number | null;
  netNeedsCalculation?: boolean;
  activeRubPerHour?: number | null;
  shiftRubPerHour?: number | null;
};

export type HistoricalImportDraftItem = {
  id: string;
  lineNumber: number;
  raw: string;
  dateIso: string | null;
  occurredAtIso?: string | null;
  amount: number | null;
  targetSection: HistoricalImportTargetSection;
  confidence: 'high' | 'medium' | 'low';
  reviewReasons: string[];
  metadata?: HistoricalImportDraftItemMetadata;
};

export type HistoricalImportDraft = {
  version: typeof HISTORICAL_IMPORT_DRAFT_VERSION;
  createdAtIso: string;
  totalLines: number;
  acceptedByParser: number;
  needsReview: number;
  items: HistoricalImportDraftItem[];
  detectedFormats: string[];
};

export function parseHistoricalImportDraft(text: string, now = new Date().toISOString()): HistoricalImportDraft {
  const taxiLog = parseManualTaxiOrderLog(text);
  if (taxiLog) return buildTaxiOrderLogDraft(text, taxiLog, now);

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const items = lines.map((line, index) => parseLine(line, index + 1));
  return buildDraft({ now, totalLines: lines.length, items, detectedFormats: ['generic_line_v2_37'] });
}

function buildTaxiOrderLogDraft(text: string, taxiLog: ParsedTaxiOrderLogShift, now: string): HistoricalImportDraft {
  const shiftItem: HistoricalImportDraftItem = {
    id: `manual-taxi-shift-${taxiLog.dateIso ?? 'unknown'}-${stableHash(taxiLog.summary)}`,
    lineNumber: 1,
    raw: `Смена такси ${taxiLog.dateIso ?? 'дата?'}: ${taxiLog.summary}`,
    dateIso: taxiLog.dateIso,
    occurredAtIso: buildLocalDateTime(taxiLog.dateIso, taxiLog.startedAt),
    amount: null,
    targetSection: 'work',
    confidence: taxiLog.dateIso && taxiLog.ordersCountParsed > 0 ? 'medium' : 'low',
    reviewReasons: [
      'агрегат смены не пишется как доход, чтобы не задублировать отдельные заказы',
      ...taxiLog.reviewReasons
    ],
    metadata: {
      importKind: 'manual_taxi_shift',
      sourceFormat: taxiLog.sourceFormat,
      startTime: taxiLog.startedAt,
      endTime: taxiLog.endedAt,
      activeMinutes: taxiLog.activeMinutes,
      fullShiftMinutes: taxiLog.fullShiftMinutes,
      idleMinutes: taxiLog.idleMinutes,
      grossFromOrders: taxiLog.grossFromOrders,
      grossDeclared: taxiLog.grossDeclared,
      targetGrossMin: taxiLog.targetGrossMin,
      netDeclared: taxiLog.netDeclared,
      netNeedsCalculation: taxiLog.netNeedsCalculation,
      activeRubPerHour: taxiLog.activeRubPerHour,
      shiftRubPerHour: taxiLog.shiftRubPerHour
    }
  };

  const orderItems: HistoricalImportDraftItem[] = taxiLog.orders.map(order => ({
    id: `manual-taxi-order-${order.dateIso}-${order.index}-${stableHash(`${order.startedAt}-${order.amount}-${order.routeRaw}`)}`,
    lineNumber: order.index,
    raw: `Заказ такси №${order.index} ${order.startedAt}–${order.endedAt}; ${order.durationMinutes} мин; ${order.amount} ₽; ${order.routeRaw}`,
    dateIso: order.dateIso,
    occurredAtIso: buildLocalDateTime(order.dateIso, order.startedAt),
    amount: order.amount,
    targetSection: 'work',
    confidence: order.reviewReasons.length === 0 ? 'high' : 'medium',
    reviewReasons: order.reviewReasons,
    metadata: {
      importKind: 'manual_taxi_order',
      sourceFormat: taxiLog.sourceFormat,
      orderIndex: order.index,
      startTime: order.startedAt,
      endTime: order.endedAt,
      durationMinutes: order.durationMinutes,
      routeRaw: order.routeRaw,
      fromRaw: order.fromRaw,
      toRaw: order.toRaw
    }
  }));

  const totalLines = text.split(/\r?\n/).filter(line => line.trim()).length;
  return buildDraft({ now, totalLines, items: [shiftItem, ...orderItems], detectedFormats: ['manual_taxi_order_log_v2_37'] });
}

function buildDraft(input: { now: string; totalLines: number; items: HistoricalImportDraftItem[]; detectedFormats: string[] }): HistoricalImportDraft {
  return {
    version: HISTORICAL_IMPORT_DRAFT_VERSION,
    createdAtIso: input.now,
    totalLines: input.totalLines,
    acceptedByParser: input.items.filter(item => item.confidence !== 'low').length,
    needsReview: input.items.filter(item => item.reviewReasons.length > 0).length,
    items: input.items,
    detectedFormats: input.detectedFormats
  };
}

function parseLine(raw: string, lineNumber: number): HistoricalImportDraftItem {
  const dateIso = detectDate(raw);
  const amount = detectAmount(raw);
  const targetSection = detectSection(raw);
  const reviewReasons: string[] = [];
  if (!dateIso) reviewReasons.push('не найдена дата');
  if (amount === null && targetSection !== 'sleep') reviewReasons.push('не найдена сумма');
  if (targetSection === 'unknown') reviewReasons.push('непонятный раздел');
  const confidence = reviewReasons.length === 0 ? 'high' : reviewReasons.length <= 1 ? 'medium' : 'low';
  return {
    id: `historical-import-line-${lineNumber}`,
    lineNumber,
    raw,
    dateIso,
    occurredAtIso: dateIso ? `${dateIso}T12:00:00.000+12:00` : null,
    amount,
    targetSection,
    confidence,
    reviewReasons,
    metadata: { importKind: 'generic_line' }
  };
}

function detectDate(raw: string) {
  const iso = raw.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (iso) return normalizeHistoryDate(iso);
  const ru = raw.match(/\b\d{1,2}\.\d{1,2}\.(?:\d{2}|\d{4})\b/)?.[0];
  if (ru) return normalizeHistoryDate(ru);
  return null;
}

function detectAmount(raw: string) {
  const normalized = raw.replace(/\s+/g, ' ');
  const match = normalized.match(/(?:^|\s)([-+]?\d{2,7})(?:\s?₽|\sруб|\s|$)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function detectSection(raw: string): HistoricalImportTargetSection {
  const value = raw.toLowerCase();
  if (/сон|уснул|встал|спал|sleep/.test(value)) return 'sleep';
  if (/такси|смен|заказ|drivee|работ/.test(value)) return 'work';
  if (/доход|расход|трата|еда|продукт|машин|бензин|комисс|руб|₽/.test(value)) return 'money';
  if (/фонд|накоп|обяз|плат[её]ж|машин|банкрот/.test(value)) return 'funds';
  if (/дел[ао]|задач|день/.test(value)) return 'day';
  return 'unknown';
}

function buildLocalDateTime(dateIso: string | null, time: string | null) {
  if (!dateIso || !time) return null;
  return `${dateIso}T${time}:00.000+12:00`;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(16);
}
