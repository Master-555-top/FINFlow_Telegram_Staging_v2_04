import { normalizeHistoryDate } from '@/lib/data/finflowHistoryEngine';

export const TAXI_ORDER_LOG_PARSER_VERSION = 'taxi_order_log_parser_v2_37' as const;

export type ParsedTaxiOrderLogOrder = {
  id: string;
  index: number;
  dateIso: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  amount: number;
  routeRaw: string;
  fromRaw: string;
  toRaw: string;
  crossesMidnight: boolean;
  reviewReasons: string[];
};

export type ParsedTaxiOrderLogShift = {
  version: typeof TAXI_ORDER_LOG_PARSER_VERSION;
  sourceFormat: 'manual_taxi_order_log_v2_37';
  dateIso: string | null;
  weekdayLabel: string | null;
  targetGrossMin: number | null;
  plannedHoursMin: number | null;
  plannedHoursMax: number | null;
  startedAt: string | null;
  endedAt: string | null;
  declaredActiveHours: number | null;
  fullShiftMinutes: number | null;
  activeMinutes: number;
  idleMinutes: number | null;
  ordersCountDeclared: number | null;
  ordersCountParsed: number;
  grossDeclared: number | null;
  grossFromOrders: number;
  netDeclared: number | null;
  netNeedsCalculation: boolean;
  activeRubPerHour: number;
  shiftRubPerHour: number | null;
  orders: ParsedTaxiOrderLogOrder[];
  reviewReasons: string[];
  summary: string;
};

export function parseManualTaxiOrderLog(text: string): ParsedTaxiOrderLogShift | null {
  const normalizedText = normalizeText(text);
  const dateInfo = detectHeaderDate(normalizedText);
  const orders = parseOrders(normalizedText, dateInfo.dateIso);

  if (orders.length === 0) return null;

  const targetGrossMin = detectTargetGross(normalizedText);
  const plannedHours = detectPlannedHours(normalizedText);
  const shiftStart = detectTimeAfterLabel(normalizedText, 'Начал');
  const endedLine = detectEndedLine(normalizedText);
  const ordersCountDeclared = detectOrdersCount(normalizedText);
  const grossDeclared = detectRubAfterLabel(normalizedText, 'Грязными');
  const netDeclared = detectRubAfterLabel(normalizedText, 'Чистыми');
  const netNeedsCalculation = /Чистыми[\s\S]{0,60}(не успел|не посчитал|не считал)/i.test(normalizedText);

  const activeMinutes = orders.reduce((sum, order) => sum + order.durationMinutes, 0);
  const grossFromOrders = orders.reduce((sum, order) => sum + order.amount, 0);
  const fullShiftMinutes = calculateShiftMinutes(shiftStart, endedLine.endedAt, orders);
  const idleMinutes = fullShiftMinutes === null ? null : Math.max(0, fullShiftMinutes - activeMinutes);
  const activeRubPerHour = activeMinutes > 0 ? Math.round(grossFromOrders / (activeMinutes / 60)) : 0;
  const shiftRubPerHour = fullShiftMinutes && fullShiftMinutes > 0 ? Math.round(grossFromOrders / (fullShiftMinutes / 60)) : null;
  const reviewReasons = buildShiftReviewReasons({
    dateIso: dateInfo.dateIso,
    orders,
    ordersCountDeclared,
    grossDeclared,
    grossFromOrders,
    activeMinutes,
    declaredActiveHours: endedLine.declaredActiveHours,
    netDeclared,
    netNeedsCalculation
  });

  return {
    version: TAXI_ORDER_LOG_PARSER_VERSION,
    sourceFormat: 'manual_taxi_order_log_v2_37',
    dateIso: dateInfo.dateIso,
    weekdayLabel: dateInfo.weekdayLabel,
    targetGrossMin,
    plannedHoursMin: plannedHours.min,
    plannedHoursMax: plannedHours.max,
    startedAt: shiftStart,
    endedAt: endedLine.endedAt,
    declaredActiveHours: endedLine.declaredActiveHours,
    fullShiftMinutes,
    activeMinutes,
    idleMinutes,
    ordersCountDeclared,
    ordersCountParsed: orders.length,
    grossDeclared,
    grossFromOrders,
    netDeclared,
    netNeedsCalculation,
    activeRubPerHour,
    shiftRubPerHour,
    orders,
    reviewReasons,
    summary: buildShiftSummary({ ordersCount: orders.length, grossFromOrders, activeMinutes, fullShiftMinutes, activeRubPerHour, shiftRubPerHour })
  };
}

function parseOrders(text: string, dateIso: string | null): ParsedTaxiOrderLogOrder[] {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const orders: ParsedTaxiOrderLogOrder[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const timeLine = lines[index];
    const timeMatch = timeLine.match(/^(\d{1,2})\.\s*(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})$/);
    if (!timeMatch) continue;

    const metaLine = lines[index + 1] ?? '';
    const metaMatch = metaLine.match(/^\(?\s*(\d{1,3})\s*минут[аы]?\s*;\s*([\d\s]+)\s*₽\s*\)?$/i);
    if (!metaMatch) continue;

    const routeLine = lines[index + 2] ?? '';
    const amount = parseMoney(metaMatch[2]);
    const durationMinutes = Number(metaMatch[1]);
    const orderDateIso = dateIso ?? new Date().toISOString().slice(0, 10);
    const startedAt = normalizeClock(timeMatch[2]);
    const endedAt = normalizeClock(timeMatch[3]);
    const route = splitRoute(routeLine);
    const reviewReasons: string[] = [];
    const calculatedDuration = minutesBetween(startedAt, endedAt);

    if (!dateIso) reviewReasons.push('дата смены не распознана — проверь перед записью');
    if (Math.abs(calculatedDuration - durationMinutes) > 2) reviewReasons.push(`длительность по времени ${calculatedDuration} мин отличается от указанной ${durationMinutes} мин`);
    if (!routeLine) reviewReasons.push('маршрут заказа не найден');
    if (amount <= 0) reviewReasons.push('сумма заказа не распознана');

    orders.push({
      id: `taxi-order-log-${orderDateIso}-${timeMatch[1]}`,
      index: Number(timeMatch[1]),
      dateIso: orderDateIso,
      startedAt,
      endedAt,
      durationMinutes,
      amount,
      routeRaw: routeLine,
      fromRaw: route.from,
      toRaw: route.to,
      crossesMidnight: isEndBeforeStart(startedAt, endedAt),
      reviewReasons
    });
  }

  return orders;
}

function detectHeaderDate(text: string) {
  const match = text.match(/\b(\d{1,2}\.\d{1,2}\.(?:\d{2}|\d{4}))\b(?:\s*\(([^)]+)\))?/);
  const dateIso = match ? normalizeHistoryDate(match[1]) : null;
  return { dateIso, weekdayLabel: match?.[2]?.trim() ?? null };
}

function detectTargetGross(text: string) {
  const match = text.match(/Цель[^\n:]*грязн[^:]*:\s*([\d\s]+)\s*₽/i);
  return match ? parseMoney(match[1]) : null;
}

function detectPlannedHours(text: string) {
  const match = text.match(/\((\d+(?:[,.]\d+)?)\s*[-–—]\s*(\d+(?:[,.]\d+)?)\s*час/i);
  return {
    min: match ? parseDecimal(match[1]) : null,
    max: match ? parseDecimal(match[2]) : null
  };
}

function detectTimeAfterLabel(text: string, label: string) {
  const match = text.match(new RegExp(`${label}\\s+в\\s+(\\d{1,2}:\\d{2})`, 'i'));
  return match ? normalizeClock(match[1]) : null;
}

function detectEndedLine(text: string) {
  const match = text.match(/Закончил\s+в\s+(\d{1,2}:\d{2})(?:\s*\(([^)]*)\))?/i);
  const endedAt = match ? normalizeClock(match[1]) : null;
  const declaredActiveHours = match?.[2] ? parseDeclaredHours(match[2]) : null;
  return { endedAt, declaredActiveHours };
}

function detectOrdersCount(text: string) {
  const match = text.match(/\((\d+)\s+заказ/i);
  return match ? Number(match[1]) : null;
}

function detectRubAfterLabel(text: string, label: string) {
  const match = text.match(new RegExp(`${label}[^+\\d-]*[+]?\\s*([\\d\\s]+)\\s*₽`, 'i'));
  return match ? parseMoney(match[1]) : null;
}

function calculateShiftMinutes(startedAt: string | null, endedAt: string | null, orders: ParsedTaxiOrderLogOrder[]) {
  const start = startedAt ?? orders[0]?.startedAt ?? null;
  const end = endedAt ?? orders.at(-1)?.endedAt ?? null;
  if (!start || !end) return null;
  return minutesBetween(start, end);
}

function buildShiftReviewReasons(input: {
  dateIso: string | null;
  orders: ParsedTaxiOrderLogOrder[];
  ordersCountDeclared: number | null;
  grossDeclared: number | null;
  grossFromOrders: number;
  activeMinutes: number;
  declaredActiveHours: number | null;
  netDeclared: number | null;
  netNeedsCalculation: boolean;
}) {
  const reasons: string[] = [];
  if (!input.dateIso) reasons.push('дата смены не распознана');
  if (input.ordersCountDeclared !== null && input.ordersCountDeclared !== input.orders.length) reasons.push(`заявлено ${input.ordersCountDeclared} заказов, распознано ${input.orders.length}`);
  if (input.grossDeclared !== null && Math.abs(input.grossDeclared - input.grossFromOrders) > 1) reasons.push(`грязный итог ${input.grossDeclared} ₽ отличается от суммы заказов ${input.grossFromOrders} ₽`);
  if (input.declaredActiveHours !== null) {
    const declaredMinutes = Math.round(input.declaredActiveHours * 60);
    if (Math.abs(declaredMinutes - input.activeMinutes) > 8) reasons.push(`заявленная активность ${declaredMinutes} мин отличается от суммы заказов ${input.activeMinutes} мин`);
  }
  if (input.netDeclared === null && input.netNeedsCalculation) reasons.push('чистыми не посчитано — оставить preview и посчитать после бензина/комиссии');
  for (const order of input.orders) reasons.push(...order.reviewReasons.map(reason => `заказ ${order.index}: ${reason}`));
  return Array.from(new Set(reasons));
}

function buildShiftSummary(input: {
  ordersCount: number;
  grossFromOrders: number;
  activeMinutes: number;
  fullShiftMinutes: number | null;
  activeRubPerHour: number;
  shiftRubPerHour: number | null;
}) {
  const activeHours = formatHours(input.activeMinutes);
  const fullHours = input.fullShiftMinutes === null ? 'полное время не определено' : `${formatHours(input.fullShiftMinutes)} всего`;
  const shiftPace = input.shiftRubPerHour === null ? 'сменный темп не определён' : `${input.shiftRubPerHour.toLocaleString('ru-RU')} ₽/ч смены`;
  return `${input.ordersCount} заказов · ${input.grossFromOrders.toLocaleString('ru-RU')} ₽ грязными · ${activeHours} активно · ${input.activeRubPerHour.toLocaleString('ru-RU')} ₽/ч активно · ${fullHours} · ${shiftPace}`;
}

function splitRoute(routeLine: string) {
  const parts = routeLine.split(/\s+-\s+/);
  if (parts.length >= 2) return { from: parts[0].trim(), to: parts.slice(1).join(' - ').trim() };
  return { from: routeLine.trim(), to: '' };
}

function minutesBetween(start: string, end: string) {
  const startMinutes = clockToMinutes(start);
  let endMinutes = clockToMinutes(end);
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.max(0, endMinutes - startMinutes);
}

function isEndBeforeStart(start: string, end: string) {
  return clockToMinutes(end) < clockToMinutes(start);
}

function clockToMinutes(value: string) {
  const [hoursRaw, minutesRaw] = value.split(':');
  return Number(hoursRaw) * 60 + Number(minutesRaw);
}

function normalizeClock(value: string) {
  const [hoursRaw, minutesRaw] = value.split(':');
  return `${String(Number(hoursRaw)).padStart(2, '0')}:${String(Number(minutesRaw)).padStart(2, '0')}`;
}

function parseMoney(value: string) {
  const parsed = Number(value.replace(/\s+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDecimal(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDeclaredHours(value: string) {
  const match = value.match(/(\d+(?:[,.]\d+)?)\s*час/i);
  return match ? parseDecimal(match[1]) : null;
}

function formatHours(minutes: number) {
  const rounded = Math.round(minutes / 6) / 10;
  return `${rounded.toLocaleString('ru-RU')}ч`;
}

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}
