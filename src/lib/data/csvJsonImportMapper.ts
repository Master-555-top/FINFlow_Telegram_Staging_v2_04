import { normalizeHistoryDate } from '@/lib/data/finflowHistoryEngine';
import type { ImportCandidate, ImportReviewQueue } from '@/lib/import-review/importReviewQueueModel';

export const CSV_JSON_IMPORT_MAPPER_VERSION = 'csv_json_import_mapper_v2_43' as const;

export type TabularImportFormat = 'csv' | 'tsv' | 'semicolon_csv' | 'json_array' | 'json_object_array' | 'unknown';
export type ImportColumnRole = 'date' | 'time' | 'amount' | 'title' | 'category' | 'section' | 'type' | 'note' | 'source' | 'ignore' | 'unknown';
export type MapperTargetSection = 'money' | 'work' | 'funds' | 'day' | 'sleep' | 'unknown';

export type CsvJsonImportColumn = {
  sourceKey: string;
  label: string;
  role: ImportColumnRole;
  confidence: number;
  examples: string[];
};

export type CsvJsonImportMappedRow = {
  id: string;
  rowIndex: number;
  sourceRawRedacted: Record<string, string>;
  dateIso: string | null;
  occurredAtIso: string | null;
  amount: number | null;
  title: string;
  category: string;
  targetSection: MapperTargetSection;
  confidence: 'high' | 'medium' | 'low';
  reviewReasons: string[];
  duplicateKey: string;
};

export type CsvJsonImportMapperPreview = {
  version: typeof CSV_JSON_IMPORT_MAPPER_VERSION;
  createdAtIso: string;
  format: TabularImportFormat;
  totalRows: number;
  mappedRows: number;
  readyAfterConfirm: number;
  needsReview: number;
  duplicateHints: number;
  columns: CsvJsonImportColumn[];
  rows: CsvJsonImportMappedRow[];
  rejectedLines: string[];
  nextAction: string;
};

export function buildCsvJsonImportMapperPreview(input: string, nowIso = new Date().toISOString()): CsvJsonImportMapperPreview {
  const parsed = parseTabularSource(input);
  const columns = inferColumns(parsed.rows);
  const mappedRows = parsed.rows.map((row, index) => mapRow(row, columns, index + 1));
  const rows = addDuplicateHints(mappedRows);
  const readyAfterConfirm = rows.filter(row => row.confidence !== 'low' && row.reviewReasons.length === 0).length;
  const needsReview = rows.filter(row => row.reviewReasons.length > 0 || row.confidence === 'low').length;
  const duplicateHints = rows.filter(row => row.reviewReasons.includes('возможный дубль в текущем табличном импорте')).length;

  return {
    version: CSV_JSON_IMPORT_MAPPER_VERSION,
    createdAtIso: nowIso,
    format: parsed.format,
    totalRows: parsed.rows.length,
    mappedRows: rows.filter(row => row.dateIso || row.amount !== null || row.title !== 'Строка импорта').length,
    readyAfterConfirm,
    needsReview,
    duplicateHints,
    columns,
    rows,
    rejectedLines: parsed.rejectedLines,
    nextAction: readyAfterConfirm > 0
      ? 'Проверить сопоставление колонок, дубли и review-строки, затем отправить ready rows в Import Review Queue / Local Apply.'
      : 'Нужно поправить названия колонок или формат: даты, суммы и разделы не распознаны достаточно надёжно.'
  };
}

export function buildImportReviewQueueFromCsvJsonPreview(
  preview: CsvJsonImportMapperPreview,
  sourcePackage = 'csv-json-import-mapper-v2.43'
): ImportReviewQueue {
  const candidates: ImportCandidate[] = preview.rows.map(row => ({
    id: `csv-json-candidate-${row.id}`,
    sourceId: `csv-json-row-${row.rowIndex}`,
    sourceType: row.targetSection === 'work' ? 'taxi_log' : row.targetSection === 'money' ? 'manual_backfill' : 'manual_backfill',
    entityType: mapRowToImportEntity(row),
    status: row.reviewReasons.length === 0 && row.confidence !== 'low' ? 'approved' : 'needs_review',
    risk: row.reviewReasons.some(reason => reason.includes('дубль')) ? 'medium' : 'low',
    confidence: row.confidence === 'high' ? 0.93 : row.confidence === 'medium' ? 0.74 : 0.42,
    date: row.occurredAtIso ?? row.dateIso ?? undefined,
    amount: row.amount ?? undefined,
    title: row.title,
    proposedCategory: row.category,
    proposedDayId: row.dateIso ? `day-${row.dateIso}` : undefined,
    rawExcerptRedacted: Object.entries(row.sourceRawRedacted).map(([key, value]) => `${key}: ${value}`).join(' · ').slice(0, 220),
    reviewReason: row.reviewReasons.join('; ') || 'Табличная строка распознана и готова к ручному подтверждению.',
    duplicateCandidateIds: [],
    targetAction: row.reviewReasons.length === 0 && row.confidence !== 'low' ? 'create' : 'needs_manual_decision'
  }));

  return {
    schemaVersion: 'import_review_queue_v2_33',
    queueId: `csv-json-import-${stableHash(`${preview.createdAtIso}:${preview.totalRows}:${preview.format}`)}`,
    createdAt: preview.createdAtIso,
    sourcePackage,
    candidates
  };
}

function parseTabularSource(input: string): { format: TabularImportFormat; rows: Record<string, string>[]; rejectedLines: string[] } {
  const trimmed = input.trim();
  if (!trimmed) return { format: 'unknown', rows: [], rejectedLines: [] };

  const jsonRows = parseJsonRows(trimmed);
  if (jsonRows) return jsonRows;

  const lines = trimmed.split(/\r?\n/).filter(line => line.trim());
  const delimiter = detectDelimiter(lines.slice(0, 3));
  const headers = splitDelimitedLine(lines[0] ?? '', delimiter).map(normalizeHeader).filter(Boolean);
  const rejectedLines: string[] = [];
  const rows: Record<string, string>[] = [];
  for (const [index, line] of lines.slice(1).entries()) {
    const cells = splitDelimitedLine(line, delimiter);
    if (cells.length < 2) {
      rejectedLines.push(`строка ${index + 2}: мало колонок`);
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      row[header] = (cells[headerIndex] ?? '').trim();
    });
    rows.push(row);
  }

  const format: TabularImportFormat = delimiter === '\t' ? 'tsv' : delimiter === ';' ? 'semicolon_csv' : 'csv';
  return { format, rows, rejectedLines };
}

function parseJsonRows(trimmed: string): { format: TabularImportFormat; rows: Record<string, string>[]; rejectedLines: string[] } | null {
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    const rawRows = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed && Array.isArray((parsed as { rows?: unknown }).rows)
        ? (parsed as { rows: unknown[] }).rows
        : null;
    if (!rawRows) return { format: 'json_array', rows: [], rejectedLines: ['JSON найден, но массив строк не найден'] };
    const rows = rawRows.filter(isObjectRecord).map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), stringifyCell(value)])));
    return { format: 'json_object_array', rows, rejectedLines: rawRows.length === rows.length ? [] : [`отброшено не-объектов: ${rawRows.length - rows.length}`] };
  } catch {
    return null;
  }
}

function inferColumns(rows: Record<string, string>[]): CsvJsonImportColumn[] {
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  return keys.map(key => {
    const examples = rows.map(row => row[key]).filter(Boolean).slice(0, 3);
    const role = inferRole(key, examples);
    return { sourceKey: key, label: key, role, confidence: role === 'unknown' ? 0.2 : 0.84, examples };
  });
}

function mapRow(row: Record<string, string>, columns: CsvJsonImportColumn[], rowIndex: number): CsvJsonImportMappedRow {
  const byRole = (role: ImportColumnRole) => columns.find(column => column.role === role)?.sourceKey;
  const dateRaw = valueByRole(row, byRole('date'));
  const timeRaw = valueByRole(row, byRole('time'));
  const amountRaw = valueByRole(row, byRole('amount'));
  const titleRaw = valueByRole(row, byRole('title'));
  const categoryRaw = valueByRole(row, byRole('category'));
  const sectionRaw = valueByRole(row, byRole('section')) || valueByRole(row, byRole('type'));
  const noteRaw = valueByRole(row, byRole('note'));
  const dateIso = parseDate(dateRaw);
  const amount = parseAmount(amountRaw);
  const targetSection = inferSection(`${sectionRaw} ${categoryRaw} ${titleRaw} ${noteRaw}`);
  const title = titleRaw || inferTitleFromRow(row) || 'Строка импорта';
  const category = normalizeCategory(categoryRaw || title);
  const reviewReasons: string[] = [];
  if (!dateIso) reviewReasons.push('не найдена дата');
  if (amount === null && targetSection !== 'sleep' && targetSection !== 'day') reviewReasons.push('не найдена сумма');
  if (targetSection === 'unknown') reviewReasons.push('не определён раздел');
  if (title === 'Строка импорта') reviewReasons.push('не найдено название/описание');
  const confidence = reviewReasons.length === 0 ? 'high' : reviewReasons.length <= 1 ? 'medium' : 'low';
  const occurredAtIso = dateIso ? `${dateIso}T${normalizeTime(timeRaw) ?? '12:00'}:00.000+12:00` : null;
  return {
    id: `csv-json-row-${rowIndex}-${stableHash(Object.values(row).join('|'))}`,
    rowIndex,
    sourceRawRedacted: redactRow(row),
    dateIso,
    occurredAtIso,
    amount,
    title,
    category,
    targetSection,
    confidence,
    reviewReasons,
    duplicateKey: [dateIso ?? 'no-date', targetSection, amount ?? 'no-amount', normalizeText(title), category].join('|')
  };
}

function addDuplicateHints(rows: CsvJsonImportMappedRow[]) {
  const seen = new Map<string, string>();
  return rows.map(row => {
    const previous = seen.get(row.duplicateKey);
    if (!previous) {
      seen.set(row.duplicateKey, row.id);
      return row;
    }
    return { ...row, reviewReasons: [...row.reviewReasons, 'возможный дубль в текущем табличном импорте'], confidence: 'medium' as const };
  });
}

function mapRowToImportEntity(row: CsvJsonImportMappedRow): ImportCandidate['entityType'] {
  if (row.targetSection === 'work' && /заказ|order/i.test(row.title)) return 'taxi_order';
  if (row.targetSection === 'work') return 'taxi_shift';
  if (row.targetSection === 'funds' && /обяз|плат|машин|банкрот/i.test(row.title)) return 'obligation';
  if (row.targetSection === 'funds') return 'fund';
  if (row.targetSection === 'day') return 'day_note';
  if (row.targetSection === 'sleep') return 'day_note';
  if (/доход|income|такси|заказ|смен/i.test(row.title) || row.category === 'taxi') return 'income';
  if (row.targetSection === 'money') return 'expense';
  return 'unknown';
}

function inferRole(header: string, examples: string[]): ImportColumnRole {
  const key = normalizeText(header);
  if (/^(date|дата|day|день)$/.test(key) || key.includes('дата')) return 'date';
  if (/^(time|время|start|начало)$/.test(key) || key.includes('время')) return 'time';
  if (key.includes('amount') || key.includes('sum') || key.includes('сумм') || key.includes('руб') || key.includes('₽')) return 'amount';
  if (key.includes('title') || key.includes('name') || key.includes('merchant') || key.includes('опис') || key.includes('назв')) return 'title';
  if (key.includes('category') || key.includes('катег')) return 'category';
  if (key.includes('section') || key.includes('раздел')) return 'section';
  if (key.includes('type') || key.includes('тип')) return 'type';
  if (key.includes('note') || key.includes('коммент') || key.includes('замет')) return 'note';
  if (key.includes('source') || key.includes('источник')) return 'source';
  if (examples.some(example => parseDate(example))) return 'date';
  if (examples.some(example => parseAmount(example) !== null)) return 'amount';
  return 'unknown';
}

function inferSection(value: string): MapperTargetSection {
  const text = value.toLowerCase();
  if (/сон|sleep|уснул|встал/.test(text)) return 'sleep';
  if (/такси|заказ|смен|drivee|работ|fuel|топлив|заправ/.test(text)) return 'work';
  if (/фонд|накоп|обяз|банкрот|цель/.test(text)) return 'funds';
  if (/задач|дел[ао]|план/.test(text)) return 'day';
  if (/доход|расход|трата|еда|продукт|машин|руб|₽|income|expense/.test(text)) return 'money';
  return 'unknown';
}

function normalizeCategory(value: string) {
  const text = value.toLowerCase();
  if (/заправ|топлив|азс|fuel/.test(text)) return 'fuel';
  if (/drivee|комисс/.test(text)) return 'drivee_topup';
  if (/такси|заказ|смен/.test(text)) return 'taxi';
  if (/еда|продукт|food/.test(text)) return 'products';
  if (/машин|ремонт|oil|масло|car/.test(text)) return 'car';
  if (/доход|income/.test(text)) return 'other_income';
  return value.trim() || 'other';
}

function parseDate(value: string) {
  const direct = normalizeHistoryDate(value);
  if (direct) return direct;
  const embedded = value.match(/\d{1,2}\.\d{1,2}\.(?:\d{2}|\d{4})|\d{4}-\d{2}-\d{2}/)?.[0];
  return embedded ? normalizeHistoryDate(embedded) : null;
}

function parseAmount(value: string) {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const match = cleaned.match(/[-+]?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function normalizeTime(value: string) {
  const match = value.match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function detectDelimiter(lines: string[]) {
  const joined = lines.join('\n');
  const semicolon = (joined.match(/;/g) ?? []).length;
  const comma = (joined.match(/,/g) ?? []).length;
  const tab = (joined.match(/\t/g) ?? []).length;
  if (tab >= semicolon && tab >= comma && tab > 0) return '\t';
  if (semicolon >= comma) return ';';
  return ',';
}

function splitDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.trim().replace(/^﻿/, '').replace(/\s+/g, ' ');
}

function inferTitleFromRow(row: Record<string, string>) {
  const candidates = Object.entries(row).filter(([key]) => !['date', 'дата', 'amount', 'сумма', 'руб'].includes(normalizeText(key))).map(([, value]) => value).filter(Boolean);
  return candidates.find(value => !parseDate(value) && parseAmount(value) === null) ?? candidates[0] ?? '';
}

function valueByRole(row: Record<string, string>, key: string | undefined) {
  return key ? row[key] ?? '' : '';
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringifyCell(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function redactRow(row: Record<string, string>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, redact(value)]));
}

function redact(value: string) {
  return value.replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone-redacted]').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email-redacted]').slice(0, 120);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim();
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}
