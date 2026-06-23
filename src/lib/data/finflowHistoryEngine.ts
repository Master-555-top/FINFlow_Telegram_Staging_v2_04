import { formatIsoDateShort, getDateDayKey, getDateMonthKey, getDateYear } from '@/lib/data/dateInput';
import { formatLocalIsoDate } from '@/lib/time/localDate';

export type FinflowHistoryCategory =
  | 'day'
  | 'record'
  | 'sleep'
  | 'snapshot'
  | 'rollover'
  | 'fuel'
  | 'bank'
  | 'template'
  | 'unknown';

export type FinflowHistoryPeriod = 'all' | 'year' | 'month' | 'week' | 'day';

export type FinflowHistoryScope = {
  period: FinflowHistoryPeriod;
  anchorDateIso: string;
};

export type FinflowHistoryEntry = {
  id: string;
  sourceKey: string;
  sourceLabel: string;
  section: string;
  category: FinflowHistoryCategory;
  dateIso: string;
  title: string;
  summary: string;
  amount?: number;
};

type SourceMeta = {
  key: string;
  label: string;
  section: string;
};

type MutableJson = Record<string, unknown>;

export function normalizeHistoryDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const ruMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (ruMatch) {
    const day = Number(ruMatch[1]);
    const month = Number(ruMatch[2]);
    const rawYear = Number(ruMatch[3]);
    const year = ruMatch[3].length === 2 ? 2000 + rawYear : rawYear;
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
}

export function isDateInHistoryScope(dateIso: string | null, scope: FinflowHistoryScope) {
  if (scope.period === 'all') return true;
  if (!dateIso) return false;
  const date = normalizeHistoryDate(dateIso);
  if (!date) return false;
  const anchor = normalizeHistoryDate(scope.anchorDateIso) ?? formatLocalIsoDate();
  if (scope.period === 'day') return getDateDayKey(date) === getDateDayKey(anchor);
  if (scope.period === 'month') return getDateMonthKey(date) === getDateMonthKey(anchor);
  if (scope.period === 'year') return getDateYear(date) === getDateYear(anchor);
  if (scope.period === 'week') return getWeekKey(date) === getWeekKey(anchor);
  return false;
}

export function getWeekKey(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function extractHistoryEntriesFromRaw(meta: SourceMeta, raw: string | null): FinflowHistoryEntry[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [{
      id: `${meta.key}:raw`,
      sourceKey: meta.key,
      sourceLabel: meta.label,
      section: meta.section,
      category: 'unknown',
      dateIso: formatLocalIsoDate(),
      title: meta.label,
      summary: 'Неструктурированный текстовый блок',
    }];
  }
  return extractEntriesFromValue(meta, parsed);
}

export function filterHistoryEntries(entries: FinflowHistoryEntry[], scope: FinflowHistoryScope) {
  return entries.filter(entry => isDateInHistoryScope(entry.dateIso, scope));
}

export function filterRawValueByHistoryScope(meta: SourceMeta, raw: string | null, scope: FinflowHistoryScope) {
  if (!raw) return { changed: false, nextRaw: raw, removedCount: 0 };
  if (scope.period === 'all') return { changed: true, nextRaw: null, removedCount: extractHistoryEntriesFromRaw(meta, raw).length || 1 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { changed: false, nextRaw: raw, removedCount: 0 };
  }

  const result = removeScopedEntriesFromValue(parsed, scope);
  if (!result.changed) return { changed: false, nextRaw: raw, removedCount: 0 };
  return {
    changed: true,
    nextRaw: shouldDropWholeValue(result.value) ? null : JSON.stringify(result.value),
    removedCount: result.removedCount
  };
}

export function buildHistoryTree(entries: FinflowHistoryEntry[]) {
  const years = new Map<string, Map<string, Map<string, FinflowHistoryEntry[]>>>();
  for (const entry of entries) {
    const date = normalizeHistoryDate(entry.dateIso) ?? 'unknown';
    const year = getDateYear(date);
    const month = getDateMonthKey(date);
    const day = getDateDayKey(date);
    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year)!;
    if (!months.has(month)) months.set(month, new Map());
    const days = months.get(month)!;
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(entry);
  }

  return [...years.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      count: countNested(months),
      months: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, days]) => ({
          month,
          label: month,
          count: [...days.values()].reduce((sum, items) => sum + items.length, 0),
          days: [...days.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([day, items]) => ({
              day,
              label: formatIsoDateShort(day),
              count: items.length,
              entries: [...items].sort((a, b) => b.id.localeCompare(a.id))
            }))
        }))
    }));
}

function extractEntriesFromValue(meta: SourceMeta, parsed: unknown): FinflowHistoryEntry[] {
  const entries: FinflowHistoryEntry[] = [];

  if (Array.isArray(parsed)) {
    parsed.forEach((item, index) => {
      const entry = makeEntry(meta, item, index);
      if (entry) entries.push(entry);
    });
    return entries;
  }

  if (!isObject(parsed)) return entries;

  const rootEntry = makeEntry(meta, parsed, 0);
  if (rootEntry && !hasKnownCollection(parsed)) entries.push(rootEntry);

  for (const key of ['records', 'snapshots', 'entries', 'tasks', 'funds', 'obligations']) {
    const collection = parsed[key];
    if (!Array.isArray(collection)) continue;
    collection.forEach((item, index) => {
      const entry = makeEntry({ ...meta, section: categorySectionFromKey(meta.section, key) }, item, index, key);
      if (entry) entries.push(entry);
    });
  }

  const snapshot = parsed.snapshot;
  if (isObject(snapshot)) {
    for (const key of ['records']) {
      const collection = snapshot[key];
      if (!Array.isArray(collection)) continue;
      collection.forEach((item, index) => {
        const entry = makeEntry({ ...meta, section: 'history' }, item, index, `snapshot.${key}`);
        if (entry) entries.push(entry);
      });
    }
  }

  return entries;
}

function makeEntry(meta: SourceMeta, value: unknown, index: number, collectionKey?: string): FinflowHistoryEntry | null {
  if (!isObject(value)) return null;
  const dateIso = detectDateIso(value);
  if (!dateIso) return null;
  const id = typeof value.id === 'string' ? value.id : `${meta.key}:${collectionKey ?? 'item'}:${index}`;
  const category = detectCategory(meta, value, collectionKey);
  const amount = typeof value.amount === 'number'
    ? value.amount
    : typeof value.gross === 'number'
      ? value.gross
      : undefined;
  return {
    id: `${meta.key}:${id}`,
    sourceKey: meta.key,
    sourceLabel: meta.label,
    section: meta.section,
    category,
    dateIso,
    title: detectTitle(meta, value, category),
    summary: detectSummary(value, category, amount),
    amount
  };
}

function detectDateIso(value: MutableJson) {
  for (const key of ['localDate', 'toDate', 'fromDate', 'createdAtIso', 'createdAt', 'savedAt', 'date', 'previousLocalDate', 'nextLocalDate', 'closedAtIso', 'activeLocalDate']) {
    const normalized = normalizeHistoryDate(value[key]);
    if (normalized) return normalized;
  }
  return null;
}

function detectCategory(meta: SourceMeta, value: MutableJson, collectionKey?: string): FinflowHistoryCategory {
  if (meta.section === 'sleep') return 'sleep';
  if (meta.section === 'fuel') return 'fuel';
  if (collectionKey === 'snapshots' || meta.section === 'history') return 'snapshot';
  if (meta.key.includes('Rollover')) return 'rollover';
  if (meta.section === 'templates') return 'template';
  if (meta.section === 'bank') return 'bank';
  if (typeof value.type === 'string') return 'record';
  if (collectionKey === 'tasks') return 'day';
  return meta.section === 'records' ? 'record' : 'day';
}

function detectTitle(meta: SourceMeta, value: MutableJson, category: FinflowHistoryCategory) {
  if (typeof value.title === 'string' && value.title.trim()) return value.title;
  if (typeof value.label === 'string' && value.label.trim()) return value.label;
  if (category === 'sleep') return 'Сон';
  if (category === 'fuel') return 'Топливо / пробег';
  if (category === 'snapshot') return 'Снимок дня';
  if (category === 'rollover') return 'Rollover дня';
  return meta.label;
}

function detectSummary(value: MutableJson, category: FinflowHistoryCategory, amount?: number) {
  if (category === 'sleep') {
    const slept = typeof value.sleptAt === 'string' ? value.sleptAt : '—';
    const woke = typeof value.wokeAt === 'string' ? value.wokeAt : '—';
    const minutes = typeof value.minutes === 'number' ? ` · ${Math.floor(value.minutes / 60)}ч ${value.minutes % 60}м` : '';
    return `уснул ${slept}, встал ${woke}${minutes}`;
  }
  if (amount !== undefined) return `${amount.toLocaleString('ru-RU')} ₽`;
  if (typeof value.note === 'string' && value.note.trim()) return value.note;
  if (category === 'snapshot') return 'Сохранённое состояние дня';
  return 'Запись FINFlow';
}

function removeScopedEntriesFromValue(parsed: unknown, scope: FinflowHistoryScope): { changed: boolean; value: unknown; removedCount: number } {
  if (Array.isArray(parsed)) return filterArray(parsed, scope);

  if (!isObject(parsed)) return { changed: false, value: parsed, removedCount: 0 };

  let changed = false;
  let removedCount = 0;
  const next: MutableJson = { ...parsed };

  const rootDate = detectDateIso(next);
  if (rootDate && isDateInHistoryScope(rootDate, scope) && !hasKnownCollection(next)) {
    return { changed: true, value: null, removedCount: 1 };
  }

  for (const key of ['records', 'snapshots', 'entries', 'tasks', 'funds', 'obligations']) {
    if (!Array.isArray(next[key])) continue;
    const result = filterArray(next[key], scope);
    if (result.changed) {
      next[key] = result.value;
      changed = true;
      removedCount += result.removedCount;
    }
  }

  if (isObject(next.snapshot)) {
    const snapshot = { ...next.snapshot };
    if (Array.isArray(snapshot.records)) {
      const result = filterArray(snapshot.records, scope);
      if (result.changed) {
        snapshot.records = result.value;
        next.snapshot = snapshot;
        changed = true;
        removedCount += result.removedCount;
      }
    }
  }

  return { changed, value: next, removedCount };
}

function filterArray(items: unknown[], scope: FinflowHistoryScope) {
  let removedCount = 0;
  const kept = items.filter(item => {
    if (!isObject(item)) return true;
    const date = detectDateIso(item);
    const remove = isDateInHistoryScope(date, scope);
    if (remove) removedCount += 1;
    return !remove;
  });
  return { changed: removedCount > 0, value: kept, removedCount };
}

function shouldDropWholeValue(value: unknown) {
  if (value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (!isObject(value)) return false;
  const collectionKeys = ['records', 'snapshots', 'entries'];
  const hasCollection = collectionKeys.some(key => Array.isArray(value[key]));
  if (!hasCollection) return false;
  return collectionKeys.every(key => !Array.isArray(value[key]) || value[key].length === 0);
}

function hasKnownCollection(value: MutableJson) {
  return ['records', 'snapshots', 'entries', 'tasks', 'funds', 'obligations'].some(key => Array.isArray(value[key]));
}

function categorySectionFromKey(section: string, key: string) {
  if (key === 'tasks') return 'tasks';
  if (key === 'funds') return 'funds';
  if (key === 'obligations') return 'day';
  return section;
}

function countNested(months: Map<string, Map<string, FinflowHistoryEntry[]>>) {
  let total = 0;
  for (const days of months.values()) for (const items of days.values()) total += items.length;
  return total;
}

function isObject(value: unknown): value is MutableJson {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
