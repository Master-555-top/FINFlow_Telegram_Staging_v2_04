export type ParsedDateInput = {
  ok: true;
  iso: string;
  display: string;
  year: number;
  month: number;
  day: number;
} | {
  ok: false;
  error: string;
};

export function parseRussianDateInput(value: string): ParsedDateInput {
  const clean = value.trim();
  const match = clean.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (!match) {
    return { ok: false, error: 'Введите дату как 05.06.26 или 05.06.2026.' };
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = match[3].length === 2 ? 2000 + rawYear : rawYear;
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return { ok: false, error: 'Дата должна состоять из чисел: день.месяц.год.' };
  if (year < 2000 || year > 2099) return { ok: false, error: 'Год должен быть в диапазоне 2000–2099.' };
  if (month < 1 || month > 12) return { ok: false, error: 'Месяц должен быть от 1 до 12. Формат: день.месяц.год.' };
  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return { ok: false, error: `В этом месяце нет дня ${day}.` };
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { ok: true, iso, display: formatIsoDateShort(iso), year, month, day };
}

export function formatIsoDateShort(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  return `${match[3]}.${match[2]}.${match[1].slice(2)}`;
}

export function getDateYear(iso: string) {
  return iso.slice(0, 4) || 'Без года';
}

export function getDateMonthKey(iso: string) {
  return iso.slice(0, 7) || 'unknown';
}

export function getDateDayKey(iso: string) {
  return iso.slice(0, 10) || 'unknown';
}

export function getMonthLabel(monthKey: string) {
  const [yearRaw, monthRaw] = monthKey.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return monthKey;
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getDayLabel(iso: string) {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return formatIsoDateShort(iso);
  const weekday = parsed.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
  return `${formatIsoDateShort(iso)} · ${weekday}`;
}
