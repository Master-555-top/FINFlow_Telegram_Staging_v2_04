export type TimeOfDay = 'утро' | 'день' | 'вечер' | 'ночь';

export function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'утро';
  if (hour >= 12 && hour < 17) return 'день';
  if (hour >= 17 && hour < 22) return 'вечер';
  return 'ночь';
}

export function formatRussianDateTime(date: Date) {
  const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);

  return { weekday, day, month, time, timeOfDay: getTimeOfDay(date) };
}
